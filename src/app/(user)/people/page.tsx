
'use client'
import Link from 'next/link'

import { Search, Users, Filter, MapPin, Briefcase, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const categories = [
  'All',
  'Entrepreneurs',
  'Investors',
  'Marketing',
  'Technology',
  'Finance',
  'Consulting',
]

const basePeople = [
  {
    name: 'Amit Patel',
    title: 'Venture Capitalist at Sequoia Capital',
    location: 'Mumbai, India',
    avatar: 'https://images.unsplash.com/photo-1621610085923-4e8234a10784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjB3b3JraW5nfGVufDF8fHx8MTc3MjI5MDcxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    mutualConnections: 12,
    expertise: ['Startups', 'Funding', 'Growth'],
  },
  {
    name: 'Sneha Gupta',
    title: 'Growth Strategist at TechCorp',
    location: 'Bangalore, India',
    avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjE4Mjg0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    mutualConnections: 24,
    expertise: ['Marketing', 'Analytics', 'Strategy'],
  },
  {
    name: 'Vikram Singh',
    title: 'Serial Entrepreneur & Angel Investor',
    location: 'Delhi, India',
    avatar: 'https://images.unsplash.com/photo-1615702669705-0d3002c6801c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzIyNzA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    mutualConnections: 8,
    expertise: ['E-commerce', 'SaaS', 'Leadership'],
  },
  {
    name: 'Priya Sharma',
    title: 'Marketing Director at GrowthLabs',
    location: 'Pune, India',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzQwNzUxMDE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    mutualConnections: 15,
    expertise: ['Digital Marketing', 'Content', 'Branding'],
  },
  {
    name: 'Rahul Mehta',
    title: 'CTO at CloudTech Solutions',
    location: 'Hyderabad, India',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NDA3NTEwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    mutualConnections: 32,
    expertise: ['Cloud', 'DevOps', 'AI/ML'],
  },
  {
    name: 'Anjali Reddy',
    title: 'Product Manager at FinTech Innovations',
    location: 'Chennai, India',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc0MDc1MTAxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    mutualConnections: 19,
    expertise: ['Product Strategy', 'UX', 'Fintech'],
  },
  {
    name: 'Karan Desai',
    title: 'Business Development Lead at StartupHub',
    location: 'Ahmedabad, India',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc0MDc1MTAxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    mutualConnections: 11,
    expertise: ['Sales', 'Partnerships', 'B2B'],
  },
  {
    name: 'Divya Kapoor',
    title: 'HR Director & Culture Strategist',
    location: 'Gurgaon, India',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NDA3NTEwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    mutualConnections: 27,
    expertise: ['Talent', 'Culture', 'Leadership'],
  },
];

const suggestedPeople = basePeople.map(person => ({
  ...person,
  id: person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
}));

export default function PeoplePage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#212529' }}>
            Discover People
          </h1>
          <p style={{ color: '#5F6368' }}>Connect with professionals and expand your network</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6" style={{ border: '1px solid #E8E8E8' }}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#5F6368' }} />
              <input
                type="text"
                placeholder="Search by name, title, company, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: '#F8F9FA',
                  border: '1px solid #E8E8E8',
                  color: '#212529',
                }}
                onFocus={(e) => (e.currentTarget.style.outlineColor = '#212529')}
              />
            </div>

            {/* Filter Button */}
            <button
              className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all"
              style={{
                borderColor: '#E8E8E8',
                color: '#5F6368',
                border: '2px solid #E8E8E8',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
                style={{
                  backgroundColor: selectedCategory === category ? '#212529' : '#F8F9FA',
                  color: selectedCategory === category ? '#FFFFFF' : '#5F6368',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = '#E8E8E8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = '#F8F9FA'
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4" style={{ border: '1px solid #E8E8E8' }}>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#F8F9FA' }}>
              <Users className="w-6 h-6" style={{ color: '#212529' }} />
            </div>
            <div>
              <p className="text-2xl font-semibold" style={{ color: '#212529' }}>
                2,547
              </p>
              <p className="text-sm" style={{ color: '#5F6368' }}>
                People to discover
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4" style={{ border: '1px solid #E8E8E8' }}>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#E8F5E9' }}>
              <TrendingUp className="w-6 h-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-2xl font-semibold" style={{ color: '#212529' }}>
                342
              </p>
              <p className="text-sm" style={{ color: '#5F6368' }}>
                Mutual connections
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4" style={{ border: '1px solid #E8E8E8' }}>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#F3E5F5' }}>
              <Briefcase className="w-6 h-6" style={{ color: '#7B1FA2' }} />
            </div>
            <div>
              <p className="text-2xl font-semibold" style={{ color: '#212529' }}>
                128
              </p>
              <p className="text-sm" style={{ color: '#5F6368' }}>
                In your industry
              </p>
            </div>
          </div>
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedPeople.map((person) => (
            <Link
              key={person.id}
              href={`/profile/${person.id}`}
              className="block group"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all group-hover:scale-[1.025] group-hover:border-blue-400"
                style={{ border: '1px solid #E8E8E8' }}
              >
                {/* Avatar and Info */}
                <div className="flex flex-col items-center text-center mb-4">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-20 h-20 rounded-full object-cover mb-3 group-hover:ring-2 group-hover:ring-blue-400 transition-all"
                    style={{ border: '2px solid #E8E8E8' }}
                  />
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-700 transition-colors" style={{ color: '#212529' }}>
                    {person.name}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#5F6368' }}>
                    {person.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#9AA0A6' }}>
                    <MapPin className="w-3 h-3" />
                    <span>{person.location}</span>
                  </div>
                </div>

                {/* Mutual Connections */}
                {person.mutualConnections > 0 && (
                  <div className="rounded-lg p-3 mb-4 text-center" style={{ backgroundColor: '#F8F9FA' }}>
                    <p className="text-sm" style={{ color: '#212529' }}>
                      <span className="font-semibold">{person.mutualConnections}</span> mutual connections
                    </p>
                  </div>
                )}

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {person.expertise.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs rounded-full"
                      style={{ backgroundColor: '#F8F9FA', color: '#212529' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Connect Button */}
                <button
                  className="w-full px-4 py-2.5 rounded-lg font-medium transition-all"
                  style={{ backgroundColor: '#212529', color: '#FFFFFF' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3D3D3D')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212529')}
                  onClick={e => { e.preventDefault(); /* Optionally handle connect logic here */ }}
                >
                  Connect
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button
            className="px-8 py-3 rounded-xl font-medium transition-all"
            style={{
              border: '2px solid #E8E8E8',
              color: '#5F6368',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Load More People
          </button>
        </div>
      </div>
    </div>
  )
}
