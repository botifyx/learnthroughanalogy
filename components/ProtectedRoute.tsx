import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, openLoginModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      openLoginModal();
    }
  }, [user, openLoginModal, location]);

  if (!user) {
    // Optionally return null or a loading spinner/placeholder
    // Returning null allows the background to potentially show or just be blank until modal logic handles it
    // But since we want to block access, returning specific "Access Denied" or just null is fine.
    // The LoginModal is global in App.tsx, so it will overlay.
    // We can render a "locked" state behind the modal if we want.
     return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
            <p>Please log in to access this feature.</p>
        </div>
     );
  }

  return <>{children}</>;
};
