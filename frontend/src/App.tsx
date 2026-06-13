import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Import Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CaseList } from './pages/CaseList';
import { NewCase } from './pages/NewCase';
import { CaseDetailsPage } from './pages/CaseDetailsPage';
import { AuditLogs } from './pages/AuditLogs';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            {/* Auth Page */}
            <Route path="/login" element={<Login />} />

            {/* Protected Portal Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/cases"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CaseList />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/cases/new"
              element={
                <ProtectedRoute allowedRoles={['IO', 'SHO', 'ADMIN']}>
                  <Layout>
                    <NewCase />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/cases/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CaseDetailsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AuditLogs />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
