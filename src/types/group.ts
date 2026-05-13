export interface Group {
  id: string;
  name: string;
  description: string;
  image?: string;
  cover_image?: string;
  members?: number;
  memberCount?: number;
  posts?: number;
  type?: 'public' | 'private' | 'PUBLIC' | 'PRIVATE';
  visibility?: 'public' | 'private' | 'PUBLIC' | 'PRIVATE';
  requiresApproval: boolean;
  joined: boolean;
  requested: boolean;
  category?: string;
  rules?: string[];
}
