import React from 'react';
import { Book, Code, Brain, Calculator, Globe, Microscope } from 'lucide-react';

const categories = [
  { icon: Book, name: 'Literature', count: 15 },
  { icon: Code, name: 'Programming', count: 25 },
  { icon: Brain, name: 'Psychology', count: 18 },
  { icon: Calculator, name: 'Mathematics', count: 20 },
  { icon: Globe, name: 'Geography', count: 12 },
  { icon: Microscope, name: 'Science', count: 22 },
];

export function CategoryGrid() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <category.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <p className="text-gray-600">{category.count} analogies</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}