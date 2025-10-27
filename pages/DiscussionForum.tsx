import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ANALOGY_DATA } from '../constants';
import { DiscussionTopic, DiscussionPost } from '../types';

const initialTopics: DiscussionTopic[] = ANALOGY_DATA.map(analogy => ({
    id: analogy.id,
    title: analogy.title,
    posts: [
        { id: 1, author: 'Admin', timestamp: '10 minutes ago', content: `Welcome to the discussion for **"${analogy.title}"**. \n\nWhat are your thoughts? Feel free to use *Markdown*!` }
    ]
}));

export default function DiscussionForum() {
    const [topics, setTopics] = useState<DiscussionTopic[]>(initialTopics);
    const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(topics[0]);
    const [newPostContent, setNewPostContent] = useState('');

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !selectedTopic) return;
        
        const newPost: DiscussionPost = {
            id: Date.now(),
            author: 'CurrentUser', // Mock user
            timestamp: 'Just now',
            content: newPostContent.trim()
        };
        
        const updatedTopics = topics.map(topic => {
            if (topic.id === selectedTopic.id) {
                return { ...topic, posts: [...topic.posts, newPost] };
            }
            return topic;
        });

        setTopics(updatedTopics);
        setSelectedTopic(updatedTopics.find(t => t.id === selectedTopic.id) || null);
        setNewPostContent('');
    };

    const createMarkup = (markdown: string) => {
        const rawMarkup = marked.parse(markdown, { gfm: true, breaks: true }) as string;
        const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);
        return { __html: sanitizedMarkup };
    };

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-white dark:bg-slate-800/50 rounded-lg shadow-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
            <div className="w-1/3 bg-slate-100 dark:bg-slate-900/50 p-4 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Topics</h2>
                <ul>
                    {topics.map(topic => (
                        <li key={topic.id} 
                            onClick={() => setSelectedTopic(topic)}
                            className={`p-3 rounded-md cursor-pointer mb-2 transition-colors ${selectedTopic?.id === topic.id ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            {topic.title}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-2/3 flex flex-col">
                {selectedTopic ? (
                    <>
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                            <h3 className="text-2xl font-bold border-b border-slate-200 dark:border-slate-700 pb-2 text-violet-600 dark:text-violet-400">{selectedTopic.title}</h3>
                            {selectedTopic.posts.map(post => (
                                <div key={post.id} className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-cyan-600 dark:text-cyan-400">{post.author}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{post.timestamp}</p>
                                    </div>
                                    <div 
                                        className="text-slate-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert" 
                                        dangerouslySetInnerHTML={createMarkup(post.content)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                            <form onSubmit={handlePostSubmit}>
                                <textarea
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full p-3 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-800 dark:text-white"
                                    rows={3}
                                />
                                <div className="flex justify-between items-center mt-2">
                                     <p className="text-xs text-slate-400 dark:text-slate-500">Markdown is supported.</p>
                                    <button type="submit" className="px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:opacity-100 disabled:cursor-not-allowed transition-opacity text-sm" disabled={!newPostContent.trim()}>
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-400 dark:text-slate-500">Select a topic to view the discussion.</p>
                    </div>
                )}
            </div>
        </div>
    );
}