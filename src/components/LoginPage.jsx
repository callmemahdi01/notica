// src/components/LoginPage.jsx

import React, { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = useCallback(async (e) => {
    e.preventDefault()
    
    if (!studentId.trim() || !password) {
      setError('لطفاً تمام فیلدها را پر کنید')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: studentId.trim(), 
          password 
        })
      })

      if (res.ok) {
        login()
        navigate('/app')
      } else {
        const data = await res.json().catch(() => ({ error: 'خطای ناشناخته' }))
        setError(data.error || 'خطایی رخ داده است')
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور')
    } finally {
      setIsLoading(false)
    }
  }, [studentId, password, login, navigate])

  const handleStudentIdChange = useCallback((e) => {
    setStudentId(e.target.value)
    if (error) setError('')
  }, [error])

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value)
    if (error) setError('')
  }, [error])

  return (
    <div className='auth-container'>
      <div className='auth-form'>
        <h2>ورود به حساب نوتیکا</h2>
        {error && <div className='error-message'>{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type='text'
            placeholder='شماره دانشجویی'
            value={studentId}
            onChange={handleStudentIdChange}
            required
            disabled={isLoading}
          />
          <input
            type='password'
            placeholder='رمز عبور'
            value={password}
            onChange={handlePasswordChange}
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