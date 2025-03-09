export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  analogyType: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string;
  imageUrl: string;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface User {
  id: string;
  name: string;
  progress: {
    articleId: string;
    completed: boolean;
  }[];
  bookmarks: string[];
}