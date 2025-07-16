// src/components/SignupPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: fullName.trim(),
                    studentId: studentId.trim(),
                    password: password,
                    phoneNumber: phoneNumber.trim() // اگر خالی باشد، رشته خالی ارسال می‌شود
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess(result.message + ' در حال انتقال به صفحه ورود...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(result.error || 'خطایی در ثبت‌نام رخ داد.');
            }
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>ثبت‌نام در نوتیکا</h2>
                <form onSubmit={handleSignup}>
                    <input
                        type="text"
                        placeholder="نام و نام خانوادگی"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="شماره دانشجویی (نام کاربری)"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="رمز عبور (حداقل ۸ کاراکتر)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="8"
                    />
                    <input
                        type="tel"
                        // placeholder تغییر کرد و required حذف شد
                        placeholder="شماره تلفن (اختیاری)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                    </button>
                </form>
                {error && <p className="form-error">{error}</p>}
                {success && <p className="form-success">{success}</p>}
                <p className="form-switch">
                    حساب کاربری دارید؟ <Link to="/login">وارد شوید</Link>
                </p>
            </div>
        </div>
    );
}

export default SignupPage;