import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'IO' | 'SHO' | 'LEGAL_ADVISOR' | 'ADMIN'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-police-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 rounded-lg max-w-md w-full border border-police-crimson/30">
          <div className="text-police-crimson text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-police-light mb-2">ACCESS RESTRICTED</h2>
          <p className="text-police-slate text-sm mb-6">
            Your profile role ({user.role}) does not have clearance to view this directory or perform this operation.
          </p>
          <a
            href="/"
            className="btn-secondary w-full"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
