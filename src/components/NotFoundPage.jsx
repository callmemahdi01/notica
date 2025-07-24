import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-form max-w-xl">
        <div className="space-y-10">
          <div>
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
              404
            </h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-800">صفحه مورد نظرت پیدا نشد!</h2>
          </div>
          <p className="text-lg text-gray-600">چیزی که دنبالشی اصلا وجود نداره.</p>
          <a href="/">
            <button className="mt-6">
              ↩ بازگشت
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
