import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function PayPage() {
    const { user } = useAuth();

    const handleUpgradeClick = () => {
        if (user && user.studentId) {
            const encodedStudentId = btoa(user.studentId);
            window.location.href = `https://payment-notica.pages.dev?sid=${encodedStudentId}`;
        } else {
            alert('اطلاعات کاربری برای ارتقا یافت نشد.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-form" style={{ maxWidth: '600px', textAlign: 'right' }}>
                <h2 style={{ textAlign: 'center' }}>ارتقا به اشتراک حرفه‌ای نوتیکا</h2>
                <p style={{ fontSize: '1.1rem', color: '#334155', lineHeight: '1.8' }}>
                    با ارتقای حساب کاربری خود به نسخه حرفه‌ای، به تمام جزوات و قابلیت‌های نوتیکا بدون هیچ محدودیتی دسترسی خواهید داشت.
                </p>
                <ul style={{ listStyleType: 'disc', paddingRight: '20px', marginBottom: '32px' }}>
                    <li>دسترسی نامحدود به تمام جزوات تمامی دروس</li>
                    <li>قابلیت دانلود و پرینت جزوات</li>
                    <li>پشتیبانی ویژه و اختصاصی</li>
                    <li>تجربه بدون تبلیغات</li>
                </ul>
                <button onClick={handleUpgradeClick}>
                    ارتقا به حساب حرفه‌ای
                </button>
            </div>
        </div>
    );
}

export default PayPage;