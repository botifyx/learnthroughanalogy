import React from 'react';
import { Mail } from 'lucide-react';

export function Newsletter() {
  return (
    <div className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-indigo-100">Get weekly analogies and learning tips delivered to your inbox</p>
          </div>
          
          <div className="flex w-full md:w-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-64 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold hover:bg-indigo-50 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}