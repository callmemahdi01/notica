import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';

import App from './App.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignupPage from './components/SignupPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import PayPage from './components/PayPage.jsx';
import './style.css';

const NotFoundPage = lazy(() => import('./components/NotFoundPage.jsx'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><App /></ProtectedRoute>,
  },
  {
    path: "/login",
    element: <GuestRoute><LoginPage /></GuestRoute>,
  },
  {
    path: "/signup",
    element: <GuestRoute><SignupPage /></GuestRoute>,
  },
  {
    path: "/pay",
    element: <ProtectedRoute><PayPage /></ProtectedRoute>,
  },
  {
    path: "*",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<div>loading ...</div>}>
          <NotFoundPage />
        </Suspense>
      </ProtectedRoute>
    ),
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);