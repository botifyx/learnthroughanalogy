import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Clock, BookOpen, Share2, ThumbsUp, MessageSquare } from 'lucide-react';

interface ArticleViewProps {
  article: {
    title: string;
    content: string;
    readTime: number;
    likes: number;
    comments: number;
    isPremium: boolean;
  };
}

export function ArticleView({ article }: ArticleViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        
        <div className="flex items-center gap-6 text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>{article.readTime} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            <span>{article.likes} likes</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>{article.comments} comments</span>
          </div>
        </div>
      </div>

      {article.isPremium && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-xl mb-8">
          <div className="flex items-start gap-4">
            <BookOpen className="h-8 w-8 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
              <p className="mb-4">
                This is a premium article. Upgrade to access the full content and
                unlock all premium features.
              </p>
              <button className="bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold hover:bg-indigo-50 transition">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>

      <div className="border-t border-gray-200 mt-12 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
              <ThumbsUp className="h-5 w-5" />
              Like
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
            Leave a Comment
          </button>
        </div>
      </div>
    </div>
  );
}