import React from 'react';
import { Clock, ChefHat, Users, ClipboardCheck } from 'lucide-react';

export function FeaturedAnalogy() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">
        Featured: Software Development Life Cycle as Meal Preparation
      </h2>
      
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img
            src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1000"
            alt="Chef preparing a meal"
            className="rounded-xl shadow-lg"
          />
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <ChefHat className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Planning (Requirements)</h3>
              <p className="text-gray-600">Just as a chef plans ingredients and recipes, developers gather requirements and plan features.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Development (Cooking)</h3>
              <p className="text-gray-600">Like cooking follows a recipe, development follows specifications and best practices.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <ClipboardCheck className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Testing (Tasting)</h3>
              <p className="text-gray-600">Testing software is like tasting food - ensuring quality before serving to users.</p>
            </div>
          </div>
          
          <button className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition">
            Read Full Analogy
          </button>
        </div>
      </div>
    </div>
  );
}