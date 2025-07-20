// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);

  // --- شروع تغییرات برای LocalStorage ---

  // 1. خواندن آخرین وضعیت از localStorage هنگام بارگذاری اولیه
  const [selectedCourseId, setSelectedCourseId] = useState(
    () => localStorage.getItem('lastCourseId') || null
  );
  const [selectedNotePath, setSelectedNotePath] = useState(
    () => localStorage.getItem('lastNotePath') || ''
  );

  // --- پایان تغییرات برای LocalStorage ---

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isIframeLoading, setIframeLoading] = useState(false);
  const iframeContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // دریافت لیست دروس
  useEffect(() => {
    fetch('/courses.json')
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching courses:', error));
  }, []);


  // --- شروع تغییرات برای LocalStorage ---

  // 2. ذخیره شناسه درس در localStorage هر زمان که تغییر کند
  useEffect(() => {
    if (selectedCourseId) {
      localStorage.setItem('lastCourseId', selectedCourseId);
    } else {
      // اگر هیچ درسی انتخاب نشده بود، از localStorage پاک شود
      localStorage.removeItem('lastCourseId');
    }
  }, [selectedCourseId]);

  // 3. ذخیره مسیر جزوه در localStorage هر زمان که تغییر کند
  useEffect(() => {
    if (selectedNotePath) {
      localStorage.setItem('lastNotePath', selectedNotePath);
    } else {
      localStorage.removeItem('lastNotePath');
    }
  }, [selectedNotePath]);

  // --- پایان تغییرات برای LocalStorage ---


  const handleCourseClick = (courseId) => {
    const newCourseId = selectedCourseId === courseId ? null : courseId;
    setSelectedCourseId(newCourseId);
    // اگر کاربر یک درس باز را می‌بندد، جزوه انتخاب شده را نیز پاک می‌کنیم
    if (!newCourseId) {
        setSelectedNotePath('');
    }
  };

  const handleNoteClick = (courseId, noteId) => {
    const path = `/notes/${courseId}/${noteId}`;
    if (selectedNotePath !== path) {
        setSelectedNotePath(path);
        setIframeLoading(true);
    }
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    // پاک کردن localStorage هنگام خروج
    localStorage.removeItem('lastCourseId');
    localStorage.removeItem('lastNotePath');
    await logout();
    navigate('/login');
  };

  const toggleFrameFullscreen = () => {
    if (!iframeContainerRef.current) return;
    if (!document.fullscreenElement) {
      iframeContainerRef.current.requestFullscreen().catch(err => {
        alert(`Error enabling full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="main-layout">
      <div className={`overlay ${isSidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-button" onClick={toggleSidebar}>&times;</button>
        <div className="sidebar-header">
          <h1>نوتیکا</h1>
        </div>
        {user && ( <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-900 text-center mb-5"> {user.name} </h3> )}
        <button onClick={handleLogout} className="logout-button">خروج از حساب</button>
        <h2 className="course-list-title">لیست دروس</h2>
        <ul className="course-list">
          {courses.map((course) => (
            <li key={course.id} className={`course-list-item ${selectedCourseId === course.id ? 'open' : ''}`}>
              <h3 onClick={() => handleCourseClick(course.id)} className={selectedCourseId === course.id ? 'active' : ''}>
                {course.name}
              </h3>
              <ul className="note-list">
                {course.notes.map((note) => (
                  <li
                    key={note.id}
                    onClick={() => handleNoteClick(course.id, note.id)}
                    className={selectedNotePath === `/notes/${course.id}/${note.id}` ? 'active-note' : ''}
                  >
                    {note.title}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="content">
        <button className="sidebar-open-button" onClick={toggleSidebar}>&#9776;</button>

        <div className="iframe-container" ref={iframeContainerRef}>
          {isIframeLoading && selectedNotePath && (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          )}

          {selectedNotePath ? (
            <>
              <button className="fullscreen-btn" onClick={toggleFrameFullscreen} title="نمایش تمام صفحه">
                <span className="material-icons">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
              </button>
              <iframe
                src={selectedNotePath}
                title="Note Viewer"
                className="note-iframe"
                key={selectedNotePath}
                onLoad={handleIframeLoad}
                style={{ visibility: isIframeLoading ? 'hidden' : 'visible' }}
                allowFullScreen
              ></iframe>
            </>
          ) : (
            <div className="placeholder">
              <p>برای مشاهده جزوه، لطفا یک جلسه را از لیست انتخاب کنید.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;