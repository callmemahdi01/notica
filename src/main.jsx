// src/main.jsx

import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'
import LoginPage from './components/LoginPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import GuestRoute from './components/GuestRoute.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import './style.css'
import PayPage from './components/PayPage.jsx';
import SignupPage from './components/SignupPage.jsx';
import Site from './components/Site.jsx';

const NotFoundPage = lazy(() => import('./components/NotFoundPage.jsx'))

const withSuspense = (element) => (
  <Suspense fallback={<div>loading ...</div>}>
    {element}
  </Suspense>
)

const MainApp = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [appReady, setAppReady] = useState(false);

  const isPWA = useCallback(() => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone || 
           document.referrer.includes('android-app://');
  }, []);

  useEffect(() => {
    if (isPWA()) {
      setShowSplash(true);
    } else {
      setAppReady(true);
    }
  }, [isPWA]);

  const handleSplashEnd = useCallback(() => {
    setShowSplash(false);
    setAppReady(true);
  }, []);

  if (showSplash) {
    return <SplashScreen onSplashEnd={handleSplashEnd} />;
  }

  if (!appReady) {
    return <div className="app-loading">در حال بارگذاری...</div>;
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Site />
    },
    {
      path: '/app',
      element: <ProtectedRoute><App /></ProtectedRoute>
    },
    {
      path: '/login',
      element: <GuestRoute><LoginPage /></GuestRoute>
    },
    {
      path: '/signup',
      element: <GuestRoute>{withSuspense(<SignupPage />)}</GuestRoute>
    },
    {
      path: '/pay',
      element: <ProtectedRoute>{withSuspense(<PayPage />)}</ProtectedRoute>
    },
    {
      path: '*',
      element: withSuspense(<NotFoundPage />)
    }
  ]);

  return <RouterProvider router={router} />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  </React.StrictMode>
)