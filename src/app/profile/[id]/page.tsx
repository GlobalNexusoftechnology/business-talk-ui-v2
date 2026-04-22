
"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileStats } from "./ProfileStats";
import { ProfileActivityFeed } from "./ProfileActivityFeed";
import { Mail, Phone, Link as LinkIcon, Edit, Award, TrendingUp } from "lucide-react";
import { UserSidebar } from "@/components/shared/UserSidebar";

// --- MOCK DATA ---
const MOCK_USERS: Record<string, any> = {
  "123": {
    id: "123",
    name: "Jane Doe",
    title: "Product Manager",
    company: "Acme Corp",
    location: "Bangalore, India",
    email: "jane.doe@email.com",
    phone: "+91 98765 43210",
    website: "janedoe.com",
    bio: "Building products that scale. Passionate about tech, leadership, and growth.",
    joinedDate: "April 2024",
    avatar: "/avatar.png",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2V8ZW58MXx8fHwxNzQwNzUxMDE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    stats: { connections: 2847, followers: 5621, posts: 342, groups: 12 },
    achievements: [
      { title: "Product Leader of the Year 2025", organization: "Tech Leadership Awards", date: "December 2025", icon: Award },
      { title: "Best Product Launch", organization: "Indian Product Awards", date: "August 2024", icon: TrendingUp },
    ],
    skills: [
      "Product Management", "Agile/Scrum", "User Research", "Data Analytics", "Product Strategy", "Roadmap Planning", "Team Leadership", "Stakeholder Management", "A/B Testing", "SQL", "UI/UX Design", "Go-to-Market Strategy"
    ],
    galleryPosts: [
      { type: "image", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwdGVhbXxlbnwxfHx8fDE3NzIyMjI3NTd8MA&ixlib=rb-4.1.0&q=80&w=1080", caption: "Team offsite 2026", likes: 234 },
      { type: "image", url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwbGF1bmNofGVufDF8fHx8MTc0MDc1MTAxNHww&ixlib=rb-4.1.0&q=80&w=1080", caption: "Product launch event", likes: 456 },
    ],
    posts: [
      { id: "p1", content: "Excited to announce our new product launch!", createdAt: "2026-04-01" },
    ],
    answers: [
      {
        id: "a1",
        question: "How to scale a SaaS product?",
        description: "What are the best practices for scaling SaaS products in 2026?",
        author: {
          name: "Jane Doe",
          title: "Product Manager",
          avatar: "/avatar.png"
        },
        timestamp: "2026-03-15",
        answers: 2,
        views: 120,
        answersList: [],
      },
    ],
    blogs: [
      { id: "b1", title: "Product Management Trends 2026", summary: "A look at what's next in product management.", createdAt: "2026-02-10" },
    ],
    experience: [
      {
        title: 'Senior Product Manager',
        company: 'Acme Corp',
        location: 'Bangalore, India',
        duration: 'Jan 2024 - Present',
        description: 'Leading product strategy and roadmap for enterprise SaaS products. Managing a team of engineers and designers. Successfully launched major products.',
        logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100',
      },
      {
        title: 'Product Manager',
        company: 'Digital Ventures Pvt Ltd',
        location: 'Bangalore, India',
        duration: 'Mar 2021 - Dec 2023',
        description: 'Managed product lifecycle for mobile and web applications. Worked closely with stakeholders to define product vision and execute go-to-market strategies.',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100',
      },
    ],
    education: [
      {
        degree: 'MBA in Business Administration',
        institution: 'Indian Institute of Management, Ahmedabad',
        duration: '2018 - 2020',
        description: 'Specialized in Product Management and Strategy',
      },
      {
        degree: 'B.Tech in Computer Science',
        institution: 'IIT Bombay',
        duration: '2014 - 2018',
        description: 'CGPA: 8.7/10',
      },
    ],
  },
  // Add more mock users as needed
};

const TABS = [
  { key: "posts", label: "Posts" },
  { key: "qna", label: "QnA" },
  { key: "blogs", label: "Blogs" },
  { key: "about", label: "About" },
];

export default function ProfilePage() {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState("posts");
  const [connectState, setConnectState] = useState<"connect" | "pending" | "connected">("connect");
  const [loading, setLoading] = useState(false);

  // Dynamic user data
  const profileData = useMemo(() => MOCK_USERS[id] || MOCK_USERS["123"], [id]);

  // Connect button logic
  const handleConnect = () => {
    if (connectState === "connect") {
      setConnectState("pending");
      setLoading(true);
      setTimeout(() => {
        setConnectState("connected");
        setLoading(false);
      }, 1200);
    }
  };

  // About tab content (now includes Education and Experience)
  const aboutContent = (
    <>
      {/* Bio Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6" style={{ border: "1px solid #E8E8E8" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: "#2B2B2B" }}>About</h2>
          <button style={{ color: "#5F6368" }}><Edit className="w-5 h-5" /></button>
        </div>
        <p className="leading-relaxed" style={{ color: "#5F6368" }}>{profileData.bio}</p>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6" style={{ border: "1px solid #E8E8E8" }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#2B2B2B" }}>Achievements</h2>
        <div className="space-y-4">
          {profileData.achievements?.map((achievement: any, index: number) => {
            const Icon = achievement.icon;
            return (
              <div key={index} className="flex gap-4 p-4 rounded-xl" style={{ backgroundColor: "#F8F9FA" }}>
                <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: "#FFF9E6" }}>
                  <Icon className="w-6 h-6" style={{ color: "#F59E0B" }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "#2B2B2B" }}>{achievement.title}</h3>
                  <p className="text-sm mb-1" style={{ color: "#5F6368" }}>{achievement.organization}</p>
                  <p className="text-xs" style={{ color: "#9AA0A6" }}>{achievement.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6" style={{ border: "1px solid #E8E8E8" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: "#2B2B2B" }}>Experience</h2>
          <button style={{ color: "#5F6368" }}><Edit className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          {(profileData.experience || []).map((exp: any, index: number) => (
            <div key={index} className="flex gap-4 group">
              {exp.logo && (
                <img src={exp.logo} alt={exp.company} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 transition-transform duration-500 group-hover:scale-110" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1" style={{ color: '#2B2B2B' }}>{exp.title}</h3>
                <p className="font-medium mb-1" style={{ color: '#5F6368' }}>{exp.company}</p>
                <div className="flex items-center gap-3 text-sm mb-3" style={{ color: '#9AA0A6' }}>
                  <span>{exp.duration}</span>
                  <span>·</span>
                  <span>{exp.location}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#5F6368' }}>{exp.description}</p>
                {index < (profileData.experience?.length || 0) - 1 && (
                  <div className="mt-6 border-t" style={{ borderColor: '#E8E8E8' }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #E8E8E8" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: "#2B2B2B" }}>Education</h2>
          <button style={{ color: "#5F6368" }}><Edit className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          {(profileData.education || []).map((edu: any, index: number) => (
            <div key={index} className="group">
              <h3 className="font-semibold text-lg mb-1 group-hover:underline transition-all duration-300" style={{ color: '#2B2B2B' }}>{edu.degree}</h3>
              <p className="font-medium mb-1" style={{ color: '#5F6368' }}>{edu.institution}</p>
              <p className="text-sm mb-2" style={{ color: '#9AA0A6' }}>{edu.duration}</p>
              <p className="text-sm" style={{ color: '#5F6368' }}>{edu.description}</p>
              {index < (profileData.education?.length || 0) - 1 && (
                <div className="mt-6 border-t" style={{ borderColor: '#E8E8E8' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="overflow-y-auto min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar (left) */}
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
          <UserSidebar />
        </div>
        {/* Main profile content */}
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="max-w-5xl mx-auto">
            {/* Cover Photo */}
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 1" }}>
              <img src={profileData.coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/5" />
              <button className="absolute top-4 right-4 p-3 rounded-xl backdrop-blur-sm hover:shadow-lg transition-all shadow-md flex items-center justify-center" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", color: "#2B2B2B" }}>
                <Edit className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Header */}
            <ProfileHeader profileData={profileData} connectState={connectState} loading={loading} onConnect={handleConnect} />

            {/* Stats */}
            <ProfileStats stats={profileData.stats} />

            {/* Tabs */}
            <ProfileTabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <ProfileActivityFeed
                    activeTab={activeTab}
                    posts={profileData.posts}
                    qna={profileData.answers}
                    blogs={profileData.blogs}
                    aboutContent={aboutContent}
                  />
                </div>
                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #E8E8E8" }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: "#2B2B2B" }}>Contact Information</h2>
                    <div className="space-y-3">
                      {profileData.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5" style={{ color: "#5F6368" }} />
                          <span className="text-sm" style={{ color: "#5F6368" }}>{profileData.email}</span>
                        </div>
                      )}
                      {profileData.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5" style={{ color: "#5F6368" }} />
                          <span className="text-sm" style={{ color: "#5F6368" }}>{profileData.phone}</span>
                        </div>
                      )}
                      {profileData.website && (
                        <div className="flex items-center gap-3">
                          <LinkIcon className="w-5 h-5" style={{ color: "#5F6368" }} />
                          <a href={`https://${profileData.website}`} className="text-sm hover:underline" style={{ color: "#1A73E8" }}>{profileData.website}</a>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Skills */}
                  <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #E8E8E8" }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold" style={{ color: "#2B2B2B" }}>Skills</h2>
                      <button style={{ color: "#5F6368" }}><Edit className="w-5 h-5" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills?.map((skill: string, index: number) => (
                        <span key={index} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: "#F8F9FA", color: "#2B2B2B" }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                  {/* Activity Summary */}
                  <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #E8E8E8" }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: "#2B2B2B" }}>Activity</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between"><span className="text-sm" style={{ color: "#5F6368" }}>Posts this month</span><span className="font-semibold" style={{ color: "#2B2B2B" }}>24</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm" style={{ color: "#5F6368" }}>Comments</span><span className="font-semibold" style={{ color: "#2B2B2B" }}>156</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm" style={{ color: "#5F6368" }}>Profile views</span><span className="font-semibold" style={{ color: "#2B2B2B" }}>1,234</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm" style={{ color: "#5F6368" }}>Search appearances</span><span className="font-semibold" style={{ color: "#2B2B2B" }}>3,456</span></div>
                    </div>
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
