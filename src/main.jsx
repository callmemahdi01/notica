import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';

import App from './App.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignupPage from './components/SignupPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import NotFoundPage from './components/NotFoundPage.jsx';
import './style.css';

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
    path: "*",
    element: <ProtectedRoute><NotFoundPage /></ProtectedRoute>,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);