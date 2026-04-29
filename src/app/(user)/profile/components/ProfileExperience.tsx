'use client'

export function ProfileExperience() {
  const experience = [
    {
      title: 'Senior Product Manager',
      company: 'TechCorp Solutions',
      duration: 'Jan 2022 - Present',
      location: 'Bangalore, India',
      description:
        'Leading product strategy for enterprise SaaS platform. Improved engagement by 45% and revenue by 60%.',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    },
    {
      title: 'Product Manager',
      company: 'StartupXYZ',
      duration: 'Jun 2019 - Dec 2021',
      location: 'Mumbai, India',
      description:
        'Built and launched multiple product features from scratch. Achieved 100K+ users.',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100',
    },
  ]

  return (
    <div className="bg-white p-6 rounded-2xl border">
      <h2 className="text-xl font-semibold mb-6">Experience</h2>

      <div className="space-y-6">
        {experience.map((exp, index) => (
          <div key={index} className="flex gap-4">

            <img
              src={exp.logo}
              alt={exp.company}
              className="w-12 h-12 rounded-lg object-cover"
            />

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{exp.title}</h3>
              <p className="text-gray-600">{exp.company}</p>

              <div className="text-sm text-gray-400 mb-2">
                {exp.duration} · {exp.location}
              </div>

              <p className="text-sm text-gray-600">
                {exp.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}