'use client'

import { GraduationCap } from 'lucide-react'

type EducationEntry = {
  school: string
  degree?: string
  field_of_study?: string
  start_year?: string
  end_year?: string
  grade?: string
  activities?: string
  description?: string
}

function parseMaybeJson(val: any): any[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    try { return JSON.parse(val) } catch { return [] }
  }
  return []
}

export function ProfileEducation({ educations }: { educations?: any }) {
  const items: EducationEntry[] = parseMaybeJson(educations)

  if (items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border">
        <h2 className="text-xl font-semibold mb-4">Education</h2>
        <p className="text-gray-400 text-sm">No education added yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl border">
      <h2 className="text-xl font-semibold mb-6">Education</h2>
      <div className="space-y-6">
        {items.map((edu, index) => {
          const duration = [edu.start_year, edu.end_year].filter(Boolean).join(' - ')
          return (
            <div key={index}>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {edu.degree ? `${edu.degree}${edu.field_of_study ? ` in ${edu.field_of_study}` : ''}` : edu.school}
                  </h3>
                  {edu.degree && <p className="text-gray-600">{edu.school}</p>}
                  {duration && <p className="text-sm text-gray-400 mb-1">{duration}</p>}
                  {edu.grade && <p className="text-sm text-gray-500">Grade: {edu.grade}</p>}
                  {edu.activities && (
                    <p className="text-sm text-gray-500 mt-1">{edu.activities}</p>
                  )}
                  {edu.description && (
                    <p className="text-sm text-gray-600 mt-1">{edu.description}</p>
                  )}
                </div>
              </div>
              {index < items.length - 1 && <div className="border-t mt-6" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}