import React from 'react';
import Link from 'next/link';
import { profileHref } from '@/lib/profile-link'

interface BlogCardProps {
  blog: {
    id: string | number;
    title: string;
    content: string;
    author?: {
      id?: string | number;
      name?: string;
      avatar?: string;
    };
    created_at?: string;
    image?: string;
  };
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
      <div className="flex items-center mb-2">
        {blog.author?.avatar && (
          <Link href={blog.author?.id ? profileHref(blog.author.id, blog.author.name) : '#'} className="shrink-0 mr-2">
            <img
              src={blog.author.avatar}
              alt={blog.author.name || 'Author'}
              className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition-opacity"
            />
          </Link>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{blog.title}</h3>
          {blog.author?.name && (
            <p className="text-xs text-gray-500">
              By{' '}
              {blog.author?.id ? (
                    <Link href={profileHref(blog.author.id, blog.author.name)} className="hover:underline">{blog.author.name}</Link>
                  ) : (
                    blog.author.name
                  )}
            </p>
          )}
          {blog.created_at && (
            <p className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString()}</p>
          )}
        </div>
      </div>
      {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-40 object-cover rounded mb-2"
        />
      )}
      <p className="text-gray-700 text-sm line-clamp-3">{blog.content}</p>
    </div>
  );
};

export default BlogCard;
