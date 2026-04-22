import PostCard from '@/components/user/PostCard';
import QuestionPost from '@/components/user/QuestionPost';
import BlogCard from '@/components/user/BlogCard';

export function ProfileActivityFeed({
  activeTab,
  posts,
  qna,
  blogs,
  aboutContent,
}: {
  activeTab: string;
  posts: any[];
  qna: any[];
  blogs: any[];
  aboutContent?: React.ReactNode;
}) {
  if (activeTab === 'posts') {
    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  }
  if (activeTab === 'qna') {
    return (
      <div className="space-y-4">
        {qna.map((item) => (
          <QuestionPost key={item.id} {...item} />
        ))}
      </div>
    );
  }
  if (activeTab === 'blogs') {
    return (
      <div className="space-y-4">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    );
  }
  if (activeTab === 'about') {
    return <div>{aboutContent}</div>;
  }
  return null;
}
