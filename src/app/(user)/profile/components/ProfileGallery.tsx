'use client'

import { TrendingUp } from 'lucide-react'

export function ProfileGallery() {
  const galleryPosts = [
    {
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
      caption: 'Speaking at ProductCon',
      likes: 234,
    },
    {
      url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600',
      caption: 'Team offsite',
      likes: 189,
    },
    {
      url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600',
      caption: 'Launch event',
      likes: 312,
    },
    {
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
      caption: 'Mentoring session',
      likes: 156,
    },
  ]

  return (
    <div className="bg-white p-6 rounded-2xl border">
      <h2 className="text-xl font-semibold mb-6">
        Photos & Media
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {galleryPosts.map((post, index) => (
          <div
            key={index}
            className="relative group rounded-xl overflow-hidden cursor-pointer"
          >

            <img
              src={post.url}
              alt={post.caption}
              className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">

              <div className="absolute bottom-0 p-4 text-white">
                <p className="text-sm font-medium mb-1">
                  {post.caption}
                </p>

                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-4 h-4" />
                  {post.likes} likes
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>
    </div>
  )
}