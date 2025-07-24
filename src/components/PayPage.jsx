import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from "react-router-dom";

function PayPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showPaymentFrame, setShowPaymentFrame] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  const workerUrl = 'https://payment.ryzencloud910.workers.dev';

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== workerUrl) {
        return;
      }
      if (event.data === 'paymentSuccess') {
        setShowPaymentFrame(false);
        alert('پرداخت شما با موفقیت ثبت شد. پس از تایید مدیر، اشتراک شما فعال خواهد شد.');
        navigate('/');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate, workerUrl]);

  const handleUpgradeClick = () => {
    if (user && user.studentId) {
      const encodedStudentId = btoa(user.studentId);
      const url = `${workerUrl}/?sid=${encodedStudentId}`;
      setPaymentUrl(url);
      setShowPaymentFrame(true);
    } else {
      alert('اطلاعات کاربری برای ارتقا یافت نشد.');
    }
  };

  if (showPaymentFrame) {
    return (
      <div className="flex justify-center items-center min-h-screen fixed inset-0 z-50 auth-container">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-lg relative">
            <iframe
                src={paymentUrl}
                title="درگاه پرداخت"
                className="w-full h-[700px] border-0"
                allow="payment; clipboard-write"
            />
            <button 
                onClick={() => setShowPaymentFrame(false)}
                className="absolute top-2 right-2 bg-gray-700 text-white rounded-lg w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-red-600 transition-colors"
                aria-label="بستن پنجره پرداخت"
            >
                &times;
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form max-w-xl text-right p-8">
        <h2 className="text-2xl font-bold text-center mb-6">ارتقا به اشتراک حرفه‌ای نوتیکا</h2>
        <p className="text-slate-700 text-base leading-7 mb-5">
          با ارتقای حساب کاربری خود به نسخه حرفه‌ای، به تمام جزوات و قابلیت‌های نوتیکا بدون هیچ محدودیتی دسترسی خواهید داشت.
        </p>
        <ul className="list-disc pr-5 mb-8 text-slate-700 space-y-2">
          <li>♾️ دسترسی نامحدود به تمام جزوات تمامی دروس</li>
          <li>📥 قابلیت <strong>دانلود</strong> و پرینت جزوات</li>
          <li>💻 پشتیبانی ویژه و اختصاصی</li>
        </ul>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpgradeClick}
          >
            ارتقا به حساب حرفه‌ای
          </button>
          <Link
            to="/"
            className="text-blue-600 border border-blue-600 hover:bg-blue-200 py-3 px-6 rounded-xl text-center transition-all duration-200"
          >
            ↩ بازگشت
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PayPage;