import React from 'react';
import Link from 'next/link';
import { profileHref } from '@/lib/profile-link'
import ExpandableText from '@/components/common/ExpandableText'

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
    tags?: string[] | { name?: string }[] | string | null;
  };
}

const normalizeTags = (value: BlogCardProps['blog']['tags']): string[] => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .map((tag) => (typeof tag === 'string' ? tag : tag?.name || ''))
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.replace(/^#+/, ''))
  }

  return []
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const tags = normalizeTags(blog.tags)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {blog.image && (
          <div className="shrink-0 overflow-hidden rounded-xl border border-gray-200 sm:w-40 sm:h-32">
            <img
              src={blog.image}
              alt={blog.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{blog.title}</h3>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.slice(0, 4).map((tag, index) => (
                    <Link
                      key={`${tag}-${index}`}
                      href={`/blogs?search=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {blog.content && (
            <div className="mt-3">
              <ExpandableText className="text-sm leading-6 text-gray-600 whitespace-pre-wrap break-words" lines={3}>{blog.content}</ExpandableText>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              {blog.author?.name && (
                <span>
                  By{' '}
                  {blog.author?.id ? (
                    <Link href={profileHref(blog.author.id, blog.author.name)} className="font-medium text-gray-700 hover:underline">
                      {blog.author.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-700">{blog.author.name}</span>
                  )}
                </span>
              )}
              {blog.created_at && <span>•</span>}
              {blog.created_at && <span>{new Date(blog.created_at).toLocaleDateString()}</span>}
            </div>

            <Link href={`/blogs/${blog.id}`} className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Read More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
