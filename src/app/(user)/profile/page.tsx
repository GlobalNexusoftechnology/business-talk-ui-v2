

"use client";
import {
  MapPin, Briefcase, Calendar, Link as LinkIcon, Mail, Phone, Award, TrendingUp, Camera, Edit
} from "lucide-react";
import { useState } from "react";

const profileData = {
  name: 'Sunil Vishwakarma',
  title: 'Senior Product Manager & Technology Leader',
  company: 'TechInnovate Solutions',
  location: 'Mumbai, Maharashtra, India',
  email: 'sunil.vishwakarma@example.com',
  phone: '+91 98765 43210',
  website: 'sunilvishwakarma.com',
  bio: 'Passionate about building products that make a difference. 10+ years of experience in product management, leading cross-functional teams, and driving business growth through innovation. I love connecting with fellow entrepreneurs and sharing knowledge about startups, product development, and technology trends.',
  joinedDate: 'January 2020',
  connections: 2847,
  posts: 342,
  followers: 5621,
  coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2V8ZW58MXx8fHwxNzQwNzUxMDE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NDA3NTEwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
};

const experience = [
  {
    title: 'Senior Product Manager',
    company: 'TechInnovate Solutions',
    location: 'Mumbai, India',
    duration: 'Jan 2021 - Present',
    description: 'Leading product strategy and roadmap for enterprise SaaS products. Managing a team of 15+ engineers and designers. Successfully launched 3 major products with 50K+ active users.',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100',
  },
  {
    title: 'Product Manager',
    company: 'Digital Ventures Pvt Ltd',
    location: 'Bangalore, India',
    duration: 'Mar 2018 - Dec 2020',
    description: 'Managed product lifecycle for mobile and web applications. Worked closely with stakeholders to define product vision and execute go-to-market strategies.',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100',
  },
  {
    title: 'Associate Product Manager',
    company: 'StartupHub India',
    location: 'Mumbai, India',
    duration: 'Jun 2015 - Feb 2018',
    description: 'Assisted in product development, user research, and feature prioritization. Collaborated with engineering teams to deliver high-quality products.',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100',
  },
];

const education = [
  {
    degree: 'MBA in Business Administration',
    institution: 'Indian Institute of Management, Ahmedabad',
    duration: '2013 - 2015',
    description: 'Specialized in Product Management and Strategy',
  },
  {
    degree: 'B.Tech in Computer Science',
    institution: 'IIT Bombay',
    duration: '2009 - 2013',
    description: 'CGPA: 8.7/10',
  },
];

const skills = [
  'Product Management',
  'Agile/Scrum',
  'User Research',
  'Data Analytics',
  'Product Strategy',
  'Roadmap Planning',
  'Team Leadership',
  'Stakeholder Management',
  'A/B Testing',
  'SQL',
  'UI/UX Design',
  'Go-to-Market Strategy',
];

const achievements = [
  {
    title: 'Product Leader of the Year 2025',
    organization: 'Tech Leadership Awards',
    date: 'December 2025',
    icon: Award,
  },
  {
    title: 'Best Product Launch',
    organization: 'Indian Product Awards',
    date: 'August 2024',
    icon: TrendingUp,
  },
];

const galleryPosts = [
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwdGVhbXxlbnwxfHx8fDE3NzIyMjI3NTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Team offsite 2026',
    likes: 234,
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwbGF1bmNofGVufDF8fHx8MTc0MDc1MTAxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Product launch event',
    likes: 456,
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlfGVufDF8fHx8MTc0MDc1MTAxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Speaking at Tech Summit',
    likes: 892,
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NDA3NTEwMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Workshop with the team',
    likes: 321,
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjB3b3JrfGVufDF8fHx8MTc0MDc1MTAxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Back to work mode',
    likes: 178,
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzQwNzUxMDE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Client presentation',
    likes: 267,
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'education' | 'gallery'>('about');

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-5xl mx-auto">
        {/* Cover Photo - Reduced Height */}
        <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300 overflow-hidden group">
          <img
            src={profileData.coverImage}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10" />
          <button 
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/95 backdrop-blur-sm hover:bg-white transition-all shadow-lg animate-fade-in"
            style={{ color: '#2B2B2B' }}
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white shadow-sm mx-6 mb-6 rounded-2xl animate-fade-in-up" style={{ border: '1px solid #E8E8E8' }}>
          <div className="p-6">
            {/* Avatar and Name Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative flex-shrink-0 -mt-20 group">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl transition-transform duration-700 group-hover:scale-105"
                />
                <button 
                  className="absolute bottom-1 right-1 p-2 rounded-lg bg-white shadow-lg hover:shadow-xl transition-all animate-fade-in"
                  style={{ color: '#2B2B2B', border: '1px solid #E8E8E8' }}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Profile Info - Full Width */}
              <div className="flex-1 min-w-0 pt-2">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#2B2B2B' }}>
                  {profileData.name}
                </h1>
                <p className="text-lg mb-4" style={{ color: '#5F6368' }}>
                  {profileData.title}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm mb-6" style={{ color: '#5F6368' }}>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    <span>{profileData.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {profileData.joinedDate}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-4" style={{ borderTop: '1px solid #E8E8E8' }}>
                  <div className="transition-all duration-500 hover:scale-105">
                    <div className="text-xl font-bold" style={{ color: '#2B2B2B' }}>
                      {profileData.connections.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: '#5F6368' }}>Connections</div>
                  </div>
                  <div className="transition-all duration-500 hover:scale-105">
                    <div className="text-xl font-bold" style={{ color: '#2B2B2B' }}>
                      {profileData.followers.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: '#5F6368' }}>Followers</div>
                  </div>
                  <div className="transition-all duration-500 hover:scale-105">
                    <div className="text-xl font-bold" style={{ color: '#2B2B2B' }}>
                      {profileData.posts}
                    </div>
                    <div className="text-xs" style={{ color: '#5F6368' }}>Posts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 flex gap-6" style={{ borderTop: '1px solid #E8E8E8' }}>
            {['about', 'experience', 'education', 'gallery'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className="py-4 font-medium transition-all relative focus:outline-none"
                style={{ color: activeTab === tab ? '#2B2B2B' : '#5F6368' }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full animate-tab-underline"
                    style={{ backgroundColor: '#2B2B2B' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Tab */}
              {activeTab === 'about' && (
                <>
                  {/* Bio Section */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in" style={{ border: '1px solid #E8E8E8' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold" style={{ color: '#2B2B2B' }}>
                        About
                      </h2>
                      <button style={{ color: '#5F6368' }}>
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="leading-relaxed" style={{ color: '#5F6368' }}>
                      {profileData.bio}
                    </p>
                  </div>

                  {/* Achievements */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in-up" style={{ border: '1px solid #E8E8E8' }}>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: '#2B2B2B' }}>
                      Achievements
                    </h2>
                    <div className="space-y-4">
                      {achievements.map((achievement, index) => {
                        const Icon = achievement.icon;
                        return (
                          <div key={index} className="flex gap-4 p-4 rounded-xl" style={{ backgroundColor: '#F8F9FA' }}>
                            <div className="p-3 rounded-xl" style={{ backgroundColor: '#FFF9E6' }}>
                              <Icon className="w-6 h-6 animate-bounce-slow" style={{ color: '#F59E0B' }} />
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1" style={{ color: '#2B2B2B' }}>
                                {achievement.title}
                              </h3>
                              <p className="text-sm mb-1" style={{ color: '#5F6368' }}>
                                {achievement.organization}
                              </p>
                              <p className="text-xs" style={{ color: '#9AA0A6' }}>
                                {achievement.date}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in-up" style={{ border: '1px solid #E8E8E8' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold" style={{ color: '#2B2B2B' }}>
                      Experience
                    </h2>
                    <button style={{ color: '#5F6368' }}>
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    {experience.map((exp, index) => (
                      <div key={index} className="flex gap-4 group">
                        <img
                          src={exp.logo}
                          alt={exp.company}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1" style={{ color: '#2B2B2B' }}>
                            {exp.title}
                          </h3>
                          <p className="font-medium mb-1" style={{ color: '#5F6368' }}>
                            {exp.company}
                          </p>
                          <div className="flex items-center gap-3 text-sm mb-3" style={{ color: '#9AA0A6' }}>
                            <span>{exp.duration}</span>
                            <span>·</span>
                            <span>{exp.location}</span>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: '#5F6368' }}>
                            {exp.description}
                          </p>
                          {index < experience.length - 1 && (
                            <div className="mt-6 border-t" style={{ borderColor: '#E8E8E8' }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in-up" style={{ border: '1px solid #E8E8E8' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold" style={{ color: '#2B2B2B' }}>
                      Education
                    </h2>
                    <button style={{ color: '#5F6368' }}>
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    {education.map((edu, index) => (
                      <div key={index} className="group">
                        <h3 className="font-semibold text-lg mb-1 group-hover:underline transition-all duration-300" style={{ color: '#2B2B2B' }}>
                          {edu.degree}
                        </h3>
                        <p className="font-medium mb-1" style={{ color: '#5F6368' }}>
                          {edu.institution}
                        </p>
                        <p className="text-sm mb-2" style={{ color: '#9AA0A6' }}>
                          {edu.duration}
                        </p>
                        <p className="text-sm" style={{ color: '#5F6368' }}>
                          {edu.description}
                        </p>
                        {index < education.length - 1 && (
                          <div className="mt-6 border-t" style={{ borderColor: '#E8E8E8' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Tab */}
              {activeTab === 'gallery' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in-up" style={{ border: '1px solid #E8E8E8' }}>
                  <h2 className="text-xl font-semibold mb-6" style={{ color: '#2B2B2B' }}>
                    Photos & Media
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {galleryPosts.map((post, index) => (
                      <div key={index} className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-500 animate-fade-in">
                        <img
                          src={post.url}
                          alt={post.caption}
                          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white text-sm font-medium mb-2 animate-fade-in-up">{post.caption}</p>
                            <div className="flex items-center gap-2 text-white text-xs">
                              <TrendingUp className="w-4 h-4 animate-bounce-slow" />
                              <span>{post.likes} likes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 animate-fade-in-up">
              {/* Contact Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in" style={{ border: '1px solid #E8E8E8' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#2B2B2B' }}>
                  Contact Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" style={{ color: '#5F6368' }} />
                    <span className="text-sm" style={{ color: '#5F6368' }}>
                      {profileData.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" style={{ color: '#5F6368' }} />
                    <span className="text-sm" style={{ color: '#5F6368' }}>
                      {profileData.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-5 h-5" style={{ color: '#5F6368' }} />
                    <a 
                      href={`https://${profileData.website}`}
                      className="text-sm hover:underline"
                      style={{ color: '#1A73E8' }}
                    >
                      {profileData.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in-up" style={{ border: '1px solid #E8E8E8' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold" style={{ color: '#2B2B2B' }}>
                    Skills
                  </h2>
                  <button style={{ color: '#5F6368' }}>
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-50 hover:scale-105"
                      style={{ 
                        backgroundColor: '#F8F9FA',
                        color: '#2B2B2B'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in" style={{ border: '1px solid #E8E8E8' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#2B2B2B' }}>
                  Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#5F6368' }}>Posts this month</span>
                    <span className="font-semibold" style={{ color: '#2B2B2B' }}>24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#5F6368' }}>Comments</span>
                    <span className="font-semibold" style={{ color: '#2B2B2B' }}>156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#5F6368' }}>Profile views</span>
                    <span className="font-semibold" style={{ color: '#2B2B2B' }}>1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#5F6368' }}>Search appearances</span>
                    <span className="font-semibold" style={{ color: '#2B2B2B' }}>3,456</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
