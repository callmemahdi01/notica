// src/components/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId.trim(), password }),
      });

      if (response.ok) {
        login();
        navigate('/');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'خطای ناشناخته' }));
        alert(errorData.error);
      }
    } catch (err) {
      console.error(err);
      alert('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>ورود به حساب نوتیکا</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="شماره دانشجویی"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? <div className="spinner-button"></div> : 'ورود'}
          </button>
        </form>
        <p className="form-switch">
          حساب کاربری ندارید؟ <Link to="/signup">ثبت‌نام کنید</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;