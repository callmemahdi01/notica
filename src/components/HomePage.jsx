// src/components/HomePage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  // این تابع معادل checkAuth در کد اصلی شماست.
  // با useEffect کاری می‌کنیم که این تابع فقط یک بار بعد از رندر شدن کامپوننت اجرا شود.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // "api/" به ابتدای آدرس اضافه شده است
        const res = await fetch('/api/auth', { credentials: 'include' });
        if (res.status !== 200) {
          // اگر کاربر احراز هویت نشده بود، به صفحه لاگین هدایت می‌شود
          navigate('/login');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]); // navigate به عنوان dependency به هوک پاس داده شده است.

  // تابع خروج از حساب کاربری
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    alert('از حساب خود خارج شدید.');
    // این خط را از کامنت خارج کنید تا کاربر به صفحه لاگین هدایت شود
    navigate('/login');
  };

  return (
    <div className="container">
      <h1>خوش آمدید!</h1>
      <p>شما با موفقیت وارد شدید.</p>
      <button onClick={handleLogout}>خروج</button>
    </div>
  );
}

export default HomePage;