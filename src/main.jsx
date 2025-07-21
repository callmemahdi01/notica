import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'
import LoginPage from './components/LoginPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import GuestRoute from './components/GuestRoute.jsx'
import './style.css'

const SignupPage = lazy(() => import('./components/SignupPage.jsx'))
const NotFoundPage = lazy(() => import('./components/NotFoundPage.jsx'))
const PayPage = lazy(() => import('./components/PayPage.jsx'))

const withSuspense = (element) => (
  <Suspense fallback={<div>در حال بارگذاری...</div>}>
    {element}
  </Suspense>
)

const router = createBrowserRouter([
  {
    path: '/',
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
    element: <ProtectedRoute>{withSuspense(<NotFoundPage />)}</ProtectedRoute>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)