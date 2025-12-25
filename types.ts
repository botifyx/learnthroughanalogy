export interface Analogy {
  id: number;
  title: string;
  concept: string;
  analogy: string;
  url: string;
  category: string;
  averageRating: number;
  totalRatings: number;
  userRating?: number;
}

export interface DiscussionPost {
    id: number;
    author: string;
    timestamp: string;
    content: string;
}

export interface DiscussionTopic {
    id: number;
    title: string;
    posts: DiscussionPost[];
}


export interface GroundedSource {
    title?: string;
    uri?: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: string;
    sources?: GroundedSource[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    provider: 'google' | 'facebook';
}

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}