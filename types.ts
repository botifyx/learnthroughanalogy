export interface Analogy {
  id: number;
  title: string;
  concept: string;
  analogy: string;
  url: string;
  category: string;
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

// FIX: Add GroundedSource and ChatMessage types for the ChatPage.
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

// FIX: Centralized the type definition for 'window.aistudio' by declaring
// the AIStudio interface within the global scope to resolve type conflicts.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        // FIX: Added 'readonly' modifier to resolve "All declarations of 'aistudio' must have identical modifiers" error.
        readonly aistudio: AIStudio;
    }
}