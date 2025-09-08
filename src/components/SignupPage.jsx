// src/components/SignupPage.jsx

import React, { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = useCallback(() => {
    if (!fullName.trim()) {
      setError('لطفاً نام و نام خانوادگی را وارد کنید')
      return false
    }
    if (!studentId.trim()) {
      setError('لطفاً شماره دانشجویی را وارد کنید')
      return false
    }
    if (password.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد')
      return false
    }
    if (phoneNumber.trim() && !/^09\d{9}$/.test(phoneNumber.trim())) {
      setError('شماره تلفن باید ۱۱ رقمی و با 09 شروع شود')
      return false
    }
    return true
  }, [fullName, studentId, password, phoneNumber])

  const handleSignup = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          studentId: studentId.trim(),
          password,
          phoneNumber: phoneNumber.trim()
        })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message + ' در حال انتقال به صفحه ورود...')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(data.error || 'خطایی در ثبت‌نام رخ داد.')
      }
    } catch {
      setError('خطا در ارتباط با سرور.')
    } finally {
      setIsLoading(false)
    }
  }, [fullName, studentId, password, phoneNumber, navigate, validateForm])

  const handleFullNameChange = useCallback((e) => {
    setFullName(e.target.value)
    if (error) setError('')
  }, [error])

  const handleStudentIdChange = useCallback((e) => {
    setStudentId(e.target.value)
    if (error) setError('')
  }, [error])

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value)
    if (error) setError('')
  }, [error])

  const handlePhoneNumberChange = useCallback((e) => {
    setPhoneNumber(e.target.value)
    if (error) setError('')
  }, [error])

  return (
    <div className='auth-container'>
      <div className='auth-form'>
        <h2>ثبت‌نام در نوتیکا</h2>
        <form onSubmit={handleSignup}>
          <input
            type='text'
            placeholder='نام و نام خانوادگی'
            value={fullName}
            onChange={handleFullNameChange}
            required
            disabled={isLoading}
          />
          <input
            type='text'
            placeholder='شماره دانشجویی (نام کاربری)'
            value={studentId}
            onChange={handleStudentIdChange}
            required
            disabled={isLoading}
          />
          <input
            type='password'
            placeholder='رمز عبور (حداقل ۸ کاراکتر)'
            value={password}
            onChange={handlePasswordChange}
            required
            minLength='8'
            disabled={isLoading}
          />
          <input
            type='tel'
            placeholder='شماره تلفن (اختیاری)'
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            disabled={isLoading}
          />
          <button type='submit' disabled={isLoading}>
            {isLoading ? <div className='spinner-btn' /> : 'ثبت‌نام'}
          </button>
        </form>
        {error && <p className='form-error'>{error}</p>}
        {success && <p className='form-success'>{success}</p>}
        <p className='form-switch'>
          حساب کاربری دارید؟ <Link to='/login'>وارد شوید</Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage