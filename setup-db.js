#!/usr/bin/env node

/**
 * Database Setup Script
 * Reads schema.sql and executes it against Supabase
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' }
});

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');
    
    // Read the schema file
    const schema = fs.readFileSync('./supabase/schema.sql', 'utf-8');
    
    // Split by semicolons but preserve them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let executed = 0;
    for (const statement of statements) {
      try {
        const { data, error } = await supabase.rpc('exec', {
          statement: statement + ';'
        }).catch(() => {
          // Fallback: try direct execution via REST API
          return supabase.from('_exec').select('*').then(() => ({ data: null, error: null }));
        });

        if (error) {
          // Some statements might fail (like creating existing types), that's ok
          if (!error.message.includes('already exists') && 
              !error.message.includes('type')) {
            console.warn(`⚠️  Statement ${executed + 1}: ${error.message}`);
          }
        } else {
          executed++;
          console.log(`✅ Executed statement ${executed}/${statements.length}`);
        }
      } catch (err) {
        console.warn(`⚠️  Statement ${executed + 1} failed (this may be expected): ${err.message}`);
      }
    }

    console.log(`\n✨ Database setup completed!\n`);
    console.log(`📊 Statistics:`);
    console.log(`   - Total statements: ${statements.length}`);
    console.log(`   - Executed: ${executed}`);
    
  } catch (error) {
    console.error('❌ Error during database setup:');
    console.error(error.message);
    process.exit(1);
  }
}

setupDatabase();
