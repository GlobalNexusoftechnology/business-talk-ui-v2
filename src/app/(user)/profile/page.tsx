'use client'

import { useProfile } from "@/hooks/useProfile"
import {
  Briefcase,
  Mail,
  MapPin,
  Phone
} from "lucide-react"
import { useState } from "react"

export default function ProfilePage() {
  const { profile, stats, activity, loading } = useProfile()
  const [activeTab, setActiveTab] = useState<'about' | 'activity'>('about')

  if (loading) return <div className="p-6">Loading profile...</div>
  if (!profile) return <div className="p-6">No profile found</div>

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F9FA]">
      <div className="max-w-5xl mx-auto">

        {/* Cover */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={'https://images.unsplash.com/photo-1497366216548-37526070297c'}
            alt="Cover Photo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header */}
        <div className="bg-white mx-6 mb-6 rounded-2xl border p-6">
          <div className="flex gap-6">

            <img
              src={profile.profile_photo || '/avatar.png'}
              alt={profile.full_name || 'Profile Photo'}
              className="w-32 h-32 rounded-2xl object-cover"
            />

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-gray-500">{profile.profession}</p>

              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {profile.company || 'N/A'}
                </span>

                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location || 'N/A'}
                </span>
              </div>

              {/* Stats */}
              {stats && (
                <div className="flex gap-6 mt-4">
                  <div>
                    <p className="font-bold">{stats.postsCount}</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                  <div>
                    <p className="font-bold">{stats.followersCount}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  <div>
                    <p className="font-bold">{stats.commentsCount}</p>
                    <p className="text-xs text-gray-500">Comments</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-6 border-b">
          <button onClick={() => setActiveTab('about')}>
            About
          </button>
          <button onClick={() => setActiveTab('activity')}>
            Activity
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* ABOUT */}
          {activeTab === 'about' && (
            <>
              <div className="bg-white p-6 rounded-xl border">
                <h2 className="font-semibold mb-2">About</h2>
                <p>{profile.about || profile.short_bio || 'No bio available'}</p>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <h2 className="font-semibold mb-4">Contact</h2>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex gap-2 items-center">
                    <Mail className="w-4 h-4" /> {profile.email}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Phone className="w-4 h-4" /> {profile.phone_number || 'N/A'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ACTIVITY */}
          {activeTab === 'activity' && (
            <>
              {/* Posts */}
              <div className="bg-white p-6 rounded-xl border">
                <h2 className="font-semibold mb-4">Recent Posts</h2>

                {activity?.recentPosts?.length ? (
                  activity.recentPosts.map((post: any) => (
                    <div key={post.id} className="border-b py-3">
                      {post.content}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No posts yet</p>
                )}
              </div>

              {/* Comments */}
              <div className="bg-white p-6 rounded-xl border">
                <h2 className="font-semibold mb-4">Recent Comments</h2>

                {activity?.recentComments?.length ? (
                  activity.recentComments.map((c: any) => (
                    <div key={c.id} className="border-b py-3">
                      {c.comment}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet</p>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}