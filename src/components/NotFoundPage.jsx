// src/components/NotFoundPage.jsx
import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="auth-container min-h-screen flex items-center justify-center">
      <div className="auth-form bg-white shadow-md rounded-xl p-15 max-w-xl w-full text-center">
        <div className="space-y-10">
          {/* Animated 404 Text */}
          <div>
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
              404
            </h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-800">صفحه مورد نظرت پیدا نشد!</h2>
          </div>
          
          {/* Description */}
          <p className="text-lg text-gray-600">
            چیزی که دنبالشی اصلا وجود نداره.
          </p>
          
          {/* Action Buttons */}
            <button
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition duration-300 flex items-center gap-2"
            >
              <a href="/">↩ بازگشت</a>
            </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;