'use client'

import { Briefcase } from 'lucide-react'

type ExperienceEntry = {
  title: string
  employment_type?: string
  company: string
  location?: string
  location_type?: string
  start_month?: string
  start_year?: string
  is_current?: boolean
  end_month?: string
  end_year?: string
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

export function ProfileExperience({ experiences }: { experiences?: any }) {
  const items: ExperienceEntry[] = parseMaybeJson(experiences)

  if (items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border">
        <h2 className="text-xl font-semibold mb-4">Experience</h2>
        <p className="text-gray-400 text-sm">No experience added yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl border">
      <h2 className="text-xl font-semibold mb-6">Experience</h2>
      <div className="space-y-6">
        {items.map((exp, index) => {
          const startLabel = [exp.start_month, exp.start_year].filter(Boolean).join(' ')
          const endLabel = exp.is_current ? 'Present' : [exp.end_month, exp.end_year].filter(Boolean).join(' ')
          const duration = [startLabel, endLabel].filter(Boolean).join(' – ')

          return (
            <div key={index} className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{exp.title}</h3>
                <p className="text-gray-600">
                  {exp.company}{exp.employment_type ? ` · ${exp.employment_type}` : ''}
                </p>
                {(duration || exp.location) && (
                  <div className="text-sm text-gray-400 mb-2">
                    {[duration, exp.location].filter(Boolean).join(' · ')}
                  </div>
                )}
                {exp.description && (
                  <p className="text-sm text-gray-600">{exp.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}