'use client'

import { useState } from 'react'
import { ChevronDown, Lock, Play, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/database.types'

type Module = Database['public']['Tables']['modules']['Row']
type Lesson = Database['public']['Tables']['lessons']['Row']

interface ModulesListProps {
  modules: (Module & { lessons: Lesson[] })[]
  courseId: string
}

export function ModulesList({ modules, courseId }: ModulesListProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(
    modules[0]?.id || null
  )

  return (
    <div className="space-y-4">
      {modules.map((module, index) => (
        <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Module Header */}
          <button
            onClick={() =>
              setExpandedModule(expandedModule === module.id ? null : module.id)
            }
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-600">Module {index + 1}</span>
              <h3 className="text-lg font-semibold text-dark-charcoal">{module.title}</h3>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-600 transition-transform ${
                expandedModule === module.id ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Lessons List */}
          {expandedModule === module.id && (
            <div className="bg-white border-t border-gray-200 divide-y divide-gray-200">
              {module.lessons && module.lessons.length > 0 ? (
                module.lessons.map((lesson, lessonIndex) => (
                  <Link
                    key={lesson.id}
                    href={`/courses/${courseId}/lessons/${lesson.id}`}
                    className="flex items-center justify-between p-4 hover:bg-blue-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-8">
                        {lessonIndex + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {lesson.type === 'video' ? (
                          <Play size={18} className="text-bright-teal" />
                        ) : (
                          <FileText size={18} className="text-bright-teal" />
                        )}
                        <span className="group-hover:text-bright-teal transition">
                          {lesson.title}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.duration && (
                        <span className="text-sm text-gray-500">{lesson.duration} min</span>
                      )}
                      {lesson.is_completed && (
                        <CheckCircle size={18} className="text-green-500" />
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-gray-500 text-center">No lessons yet</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
