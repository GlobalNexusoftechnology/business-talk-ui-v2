'use client'

export function ProfileEducation() {
  const education = [
    {
      degree: 'MBA in Product Management',
      institution: 'IIM Bangalore',
      duration: '2014 - 2016',
      description: 'Specialized in Product Strategy and Innovation.',
    },
    {
      degree: 'B.Tech in Computer Science',
      institution: 'IIT Delhi',
      duration: '2010 - 2014',
      description: 'Focused on software engineering and UX.',
    },
  ]

  return (
    <div className="bg-white p-6 rounded-2xl border">
      <h2 className="text-xl font-semibold mb-6">Education</h2>

      <div className="space-y-6">
        {education.map((edu, index) => (
          <div key={index}>

            <h3 className="font-semibold text-lg">
              {edu.degree}
            </h3>

            <p className="text-gray-600">
              {edu.institution}
            </p>

            <p className="text-sm text-gray-400 mb-2">
              {edu.duration}
            </p>

            <p className="text-sm text-gray-600">
              {edu.description}
            </p>

            {index < education.length - 1 && (
              <div className="border-t mt-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}