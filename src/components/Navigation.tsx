import React from 'react';
import { Search, Menu, BookOpen, Bookmark, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  onAuthClick: () => void;
}

export function Navigation({ onAuthClick }: NavigationProps) {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-800">Learn Through Analogy</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search analogies..."
                className="w-64 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <a href="#categories" className="text-gray-600 hover:text-indigo-600">Categories</a>
            <a href="#analogies" className="text-gray-600 hover:text-indigo-600">Analogies</a>
            <a href="#premium" className="text-gray-600 hover:text-indigo-600">Premium</a>
            
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700">
              Support Us
            </button>
            
            <div className="flex space-x-4">
              <Bookmark className="h-6 w-6 text-gray-600 cursor-pointer hover:text-indigo-600" />
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button onClick={() => signOut()} className="text-gray-600 hover:text-indigo-600">
                    <LogOut className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <button onClick={onAuthClick}>
                  <User className="h-6 w-6 text-gray-600 cursor-pointer hover:text-indigo-600" />
                </button>
              )}
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <Menu className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>
    </nav>
  );
}