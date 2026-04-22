import { z } from 'zod'

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const SignupSchema = z.object({
  email: z.string().email('Valid email is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone_number: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
})

export const CompleteProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  profession: z.string().optional(),
  company: z.string().optional(),
  short_bio: z.string().max(100, 'Short bio must be less than 100 characters').optional(),
  about: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.string().optional(),
  location: z.string().optional(),
})

// Post Schema
export const CreatePostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000, 'Content must be less than 1000 characters'),
  image: z.instanceof(File).optional().nullable(),
})

// Message Schema
export const MessageSchema = z.object({
  content: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
})

// Blog Schema
export const CreateBlogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  excerpt: z.string().max(200, 'Excerpt must be less than 200 characters').optional(),
  cover_image: z.instanceof(File).optional().nullable(),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type SignupInput = z.infer<typeof SignupSchema>
export type CompleteProfileInput = z.infer<typeof CompleteProfileSchema>
export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type MessageInput = z.infer<typeof MessageSchema>
export type CreateBlogInput = z.infer<typeof CreateBlogSchema>
