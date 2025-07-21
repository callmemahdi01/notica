// src/components/NotFoundPage.jsx
import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="space-y-8">
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
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a
              href="/"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition duration-300 flex items-center gap-2"
            >
              <i className="fas fa-home"></i>
              بازگشت
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;