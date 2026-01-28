#!/usr/bin/env node
/*
Usage:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/delete-supabase-users.js [--yes] email1@example.com email2@example.com

This script locates auth users by email using the Supabase Admin API and (optionally)
deletes the auth user and associated `profiles` row. It's destructive — use with care.
*/

const { createClient } = require('@supabase/supabase-js')

async function main() {
  const argv = process.argv.slice(2)
  if (argv.length === 0) {
    console.error('Provide at least one email to delete.');
    process.exit(1)
  }

  const confirmFlagIndex = argv.indexOf('--yes')
  const confirmed = confirmFlagIndex !== -1
  const emails = argv.filter(a => a !== '--yes')

  let SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_FALLBACK = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Prefer an explicit SUPABASE_URL, but fall back to NEXT_PUBLIC_SUPABASE_URL
  if (!SUPABASE_URL || !/^https?:\/\//i.test(SUPABASE_URL)) {
    SUPABASE_URL = SUPABASE_FALLBACK
  }
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  for (const email of emails) {
    console.log(`\nLooking up: ${email}`)

    // Try to list users and find by email. This uses the Admin auth API.
    try {
      const listRes = await supabase.auth.admin.listUsers()
      if (listRes.error) {
        console.error('Failed to list users:', listRes.error.message)
        continue
      }

      // `listRes.data` may be an object like { users: [...] } or an array depending on SDK version.
      const users = (listRes.data && listRes.data.users) || listRes.data || []
      const match = Array.isArray(users) ? users.find(u => (u.email || '').toLowerCase() === email.toLowerCase()) : null

      if (!match) {
        console.log(`No auth user found with that email (auth list).\nYou may need to check the Supabase Dashboard -> Authentication -> Users or run a SQL query to inspect auth.users`)
        continue
      }

      console.log('Found auth user id:', match.id)
      console.log('User metadata:', { email: match.email, created_at: match.created_at })

      // Find profile row if present
      const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', match.id).maybeSingle()
      if (profileErr) {
        console.warn('Profiles lookup error:', profileErr.message)
      } else if (profile) {
        console.log('Found profile row for this user (profiles.id = match.id)')
      } else {
        console.log('No profiles row found for this user')
      }

      if (!confirmed) {
        console.log('DRY RUN: to delete this user run this script with --yes')
        continue
      }

      // Delete auth user
      const delRes = await supabase.auth.admin.deleteUser(match.id)
      if (delRes.error) {
        console.error('Failed to delete auth user:', delRes.error.message)
      } else {
        console.log('Deleted auth user:', match.id)
      }

      // Delete profile row if exists
      if (profile) {
        const { error: delProfileErr } = await supabase.from('profiles').delete().eq('id', match.id)
        if (delProfileErr) {
          console.warn('Failed to delete profile:', delProfileErr.message)
        } else {
          console.log('Deleted profile row')
        }
      }

    } catch (e) {
      console.error('Error processing', email, e)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
