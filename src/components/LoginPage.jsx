// src/components/LoginPage.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async e => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId.trim(), password })
      })
      if (res.ok) {
        login()
        navigate('/')
      } else {
        const data = await res.json().catch(() => ({ error: 'خطای ناشناخته' }))
        alert(data.error)
      }
    } catch {
      alert('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='auth-container'>
      <div className='auth-form'>
        <h2>ورود به حساب نوتیکا</h2>
        <form onSubmit={handleLogin}>
          <input
            type='text'
            placeholder='شماره دانشجویی'
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type='password'
            placeholder='رمز عبور'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button type='submit' disabled={isLoading}>
            {isLoading ? <div className='spinner-btn' /> : 'ورود'}
          </button>
        </form>
        <p className='form-switch'>
          حساب کاربری ندارید؟ <Link to='/signup'>ثبت‌نام کنید</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
