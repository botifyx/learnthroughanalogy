import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { FeaturedAnalogy } from './components/FeaturedAnalogy';
import { CategoryGrid } from './components/CategoryGrid';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PremiumFeatures } from './components/PremiumFeatures';
import { ArticleView } from './components/ArticleView';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Example article data
  const sampleArticle = {
    title: 'Understanding Software Development Through Cooking',
    content: `
# The Art of Software Development

Just as a chef carefully plans and executes a meal, software development follows a similar process...

## Planning Phase (The Recipe)
Before any cooking begins, a chef carefully plans the menu, considering ingredients, timing, and presentation...

## Development Phase (Cooking)
With all ingredients prepared, the actual cooking process begins...

## Testing Phase (Tasting)
Before serving any dish, a chef must taste and adjust...

## Deployment (Serving)
Finally, the meal is ready to be served...
    `,
    readTime: 8,
    likes: 245,
    comments: 18,
    isPremium: true,
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Navigation onAuthClick={() => setIsAuthModalOpen(true)} />
        <Hero />
        <FeaturedAnalogy />
        <CategoryGrid />
        <ArticleView article={sampleArticle} />
        <PremiumFeatures />
        <Newsletter />
        <Footer />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </AuthProvider>
  );
}

export default App;