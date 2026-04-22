// Profile types for business networking UI

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  location?: string;
  stats: {
    connections: number;
    followers: number;
    posts: number;
    groups: number;
  };
}

export interface UserPost {
  id: string;
  content: string;
  createdAt: string;
  // Add more fields as needed
}

export interface UserAnswer {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  // Add more fields as needed
}

export interface UserBlog {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  // Add more fields as needed
}
