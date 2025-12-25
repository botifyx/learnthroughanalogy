import React, { useState, useEffect } from 'react';
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

const TopicSkeleton = () => (
    <div className="p-3 mb-2 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-md flex items-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
    </div>
);

const PostSkeleton = () => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg animate-pulse mb-4 border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-24"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-16"></div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-5/6"></div>
        </div>
    </div>
);

export default function DiscussionForum() {
    const [topics, setTopics] = useState<DiscussionTopic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(null);
    const [newPostContent, setNewPostContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setTopics(initialTopics);
            setSelectedTopic(initialTopics[0]);
            setIsLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !selectedTopic) return;
        
        const newPost: DiscussionPost = {
            id: Date.now(),
            author: 'CurrentUser',
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
        <div className="flex h-[calc(100vh-10rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
            {/* Sidebar */}
            <div className="w-1/3 bg-slate-50 dark:bg-slate-900 p-4 overflow-y-auto border-r border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100 px-2 tracking-tight">Library Discussion</h2>
                {isLoading ? (
                    Array(8).fill(0).map((_, i) => <TopicSkeleton key={i} />)
                ) : (
                    <ul className="space-y-1">
                        {topics.map(topic => (
                            <li key={topic.id} 
                                onClick={() => setSelectedTopic(topic)}
                                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 text-sm font-medium ${
                                    selectedTopic?.id === topic.id 
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                                }`}>
                                {topic.title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Content Area */}
            <div className="w-2/3 flex flex-col bg-white dark:bg-slate-800">
                {isLoading ? (
                    <div className="p-6 space-y-6">
                        <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded w-1/2 mb-6"></div>
                        <PostSkeleton />
                        <PostSkeleton />
                    </div>
                ) : selectedTopic ? (
                    <>
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{selectedTopic.title}</h3>
                                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{selectedTopic.posts.length} Posts</span>
                            </div>
                            {selectedTopic.posts.map(post => (
                                <div key={post.id} className="bg-slate-50 dark:bg-slate-700/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.005]">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-violet-600 uppercase">{post.author[0]}</span>
                                            </div>
                                            <p className="font-bold text-slate-900 dark:text-cyan-400 text-sm">{post.author}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">{post.timestamp}</p>
                                    </div>
                                    <div 
                                        className="text-slate-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert" 
                                        dangerouslySetInnerHTML={createMarkup(post.content)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                            <form onSubmit={handlePostSubmit}>
                                <textarea
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                    placeholder="Share an analogy or ask a question..."
                                    className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-200 resize-none transition-shadow shadow-inner min-h-[100px]"
                                />
                                <div className="flex justify-between items-center mt-4">
                                     <div className="flex items-center gap-2 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs italic">Markdown enabled</p>
                                     </div>
                                    <button type="submit" className="px-8 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-sm" disabled={!newPostContent.trim()}>
                                        Publish Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <p className="text-lg font-medium">Select a topic to join the community conversation.</p>
                    </div>
                )}
            </div>
        </div>
    );
}