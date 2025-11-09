export type SubscriptionTier = 'free' | 'premium';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  last_sign_in?: string;
  subscription_tier: SubscriptionTier;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: string;
  message_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'podcast' | 'video';
  url: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}
