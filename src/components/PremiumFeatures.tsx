import React from 'react';
import { Crown, Zap, BookOpen, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: Crown,
    title: 'Exclusive Content',
    description: 'Access premium analogies and in-depth explanations',
  },
  {
    icon: Zap,
    title: 'Early Access',
    description: 'Get new content before anyone else',
  },
  {
    icon: BookOpen,
    title: 'Study Guides',
    description: 'Downloadable resources and practice materials',
  },
  {
    icon: MessageSquare,
    title: 'Priority Support',
    description: 'Direct access to content creators and faster responses',
  },
];

export function PremiumFeatures() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Upgrade to Premium</h2>
          <p className="text-xl text-gray-600">
            Unlock exclusive features and take your learning to the next level
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Lifetime Premium</h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-gray-600">/user</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-gray-600">
              <Crown className="h-5 w-5 text-indigo-600" />
              Access all premium content
            </li>
            <li className="flex items-center gap-3 text-gray-600">
              <Zap className="h-5 w-5 text-indigo-600" />
              Early access to new analogies
            </li>
            <li className="flex items-center gap-3 text-gray-600">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Downloadable study materials
            </li>
            <li className="flex items-center gap-3 text-gray-600">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Priority support
            </li>
          </ul>

          <button className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition">
            Start Premium Trial
          </button>
        </div>
      </div>
    </div>
  );
}