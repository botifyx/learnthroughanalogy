import React from 'react';
import { Lightbulb, BookOpen, Share2 } from 'lucide-react';

export function Hero() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Complex Concepts, Simple Analogies
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-indigo-100">
            Understanding difficult topics through everyday experiences
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition">
              Start Learning
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition">
              Browse Categories
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <Lightbulb className="h-10 w-10 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">100+ Analogies</h3>
              <p className="text-indigo-100">Complex topics explained through familiar concepts</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <BookOpen className="h-10 w-10 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-indigo-100">Save your favorites and track your learning journey</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <Share2 className="h-10 w-10 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-indigo-100">Join discussions and share insights with others</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}