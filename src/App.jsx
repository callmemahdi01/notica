// src/App.jsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrintComponent from './components/PrintComponent';

const STORAGE_KEYS = {
  COURSE_ID: 'lastCourseId',
  NOTE_PATH: 'lastNotePath'
};

function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.COURSE_ID) || null
  );
  const [selectedNotePath, setSelectedNotePath] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.NOTE_PATH) || ''
  );
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isIframeLoading, setIframeLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeContainerRef = useRef(null);
  const iframeRef = useRef(null);

  const hasPremiumAccess = useMemo(() => user?.subscription === 'pro', [user?.subscription]);

  const isCurrentlyFullscreen = useCallback(() => {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }, []);

  const requestFullscreen = useCallback((element) => {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      return element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      return element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      return element.msRequestFullscreen();
    }
    return Promise.reject(new Error('Fullscreen not supported'));
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      return document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      return document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      return document.msExitFullscreen();
    }
    return Promise.reject(new Error('Exit fullscreen not supported'));
  }, []);

  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFS = isCurrentlyFullscreen();
    setIsFullscreen(isCurrentlyFS);
  }, [isCurrentlyFullscreen]);

  const fetchCourses = useCallback(() => {
    fetch(`/courses.json?${Date.now()}`)
      .then(res => res.json())
      .then(setCourses)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchCourses();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [handleFullscreenChange, fetchCourses]);

  useEffect(() => {
    if (selectedCourseId) {
      localStorage.setItem(STORAGE_KEYS.COURSE_ID, selectedCourseId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.COURSE_ID);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedNotePath) {
      localStorage.setItem(STORAGE_KEYS.NOTE_PATH, selectedNotePath);
    } else {
      localStorage.removeItem(STORAGE_KEYS.NOTE_PATH);
    }
  }, [selectedNotePath]);

  const handleCourseClick = useCallback((courseId) => {
    const newCourseId = selectedCourseId === courseId ? null : courseId;
    setSelectedCourseId(newCourseId);
    if (!newCourseId) setSelectedNotePath('');
  }, [selectedCourseId]);

  const checkNoteAccess = useCallback((course, note) =>
    course.isFree || note.free || hasPremiumAccess
  , [hasPremiumAccess]);

  const handleNoteClick = useCallback((courseId, noteId, course, note) => {
    if (!checkNoteAccess(course, note)) {
      navigate('/pay');
      return;
    }
    
    const path = `/notes/${courseId}/${noteId}`;
    if (selectedNotePath !== path) {
      setSelectedNotePath(path);
      setIframeLoading(true);
    }
    if (window.innerWidth <= 768) setSidebarOpen(false);
  }, [checkNoteAccess, navigate, selectedNotePath]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const toggleFullscreen = useCallback(async () => {
    const container = iframeContainerRef.current;
    if (!container) return;

    try {
      if (isCurrentlyFullscreen()) {
        await exitFullscreen();
      } else {
        await requestFullscreen(container);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [isCurrentlyFullscreen, exitFullscreen, requestFullscreen]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const FullscreenIcon = useCallback(({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M8 3H5a2 2 0 00-2 2v3m13-5h3a2 2 0 012 2v3M3 16v3a2 2 0 002 2h3m13-5v3a2 2 0 01-2 2h-3" />
    </svg>
  ), []);

  const FullscreenExitIcon = useCallback(({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" transform="rotate(180 5.5 5.5)" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 3h3a2 2 0 0 1 2 2v3" transform="rotate(180 18.5 5.5)" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 16v3a2 2 0 0 0 2 2h3" transform="rotate(180 5.5 18.5)" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 16v3a2 2 0 0 1-2 2h-3" transform="rotate(180 18.5 18.5)" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ), []);

  if (!user) {
    return (
      <div className="main-layout">
        <div className="p-4 text-center">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <div className={`overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />
      
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-button" onClick={closeSidebar}>×</button>
        
        <div className="sidebar-header">
          <h1>نوتیکا 🎓</h1>
        </div>
        
        <div className="flex flex-wrap items-center justify-around gap-1 text-center mb-5 rounded-lg py-3 px-1 mx-1 border-r-4 border-l-4 border-y border-blue-300 shadow bg-gray-50">
          <div className="text-lg md:text-xl font-semibold text-gray-800">{user.name}</div>
          {user.studentId && <p className="text-sm text-gray-500">{user.studentId}</p>}
          {hasPremiumAccess ? (
            <span className="text-xs cursor-default" title="اشتراک فعال">
              {user.subscription}
            </span>
          ) : (
            <Link to="/pay" className="text-xs hover:underline" title="برای دسترسی اشتراک خریداری کنید">
              {user.subscription || 'free'}
            </Link>
          )}
        </div>
        <button onClick={handleLogout} className="logout-button">خروج از حساب</button>
        
        <ul className="course-list">
          {courses.map((course) => (
            <li key={course.id} className={`course-list-item ${selectedCourseId === course.id ? 'open' : ''}`}>
              <div
                onClick={() => handleCourseClick(course.id)} 
                className={selectedCourseId === course.id ? 'active' : 'shadow'}
              >
                {course.name}
              </div>
              
              <ul className="note-list">
                {course.notes.map((note) => {
                  const hasAccess = checkNoteAccess(course, note);
                  const isActive = selectedNotePath === `/notes/${course.id}/${note.id}`;
                  
                  return (
                    <li
                      key={note.id}
                      onClick={() => handleNoteClick(course.id, note.id, course, note)}
                      className={`${isActive ? 'active-note' : ''} ${!hasAccess ? 'locked-note' : ''}`}
                      title={!hasAccess ? 'برای دسترسی اشتراک خریداری کنید' : ''}
                    >
                      <span>{note.title}</span>
                      {hasPremiumAccess ? (
                        isActive && <PrintComponent iframeRef={iframeRef} studentId={user.studentId} />
                      ) : (
                        <>
                          {note.free && <span className="free-badge">رایگان</span>}
                          {!hasAccess && <span className="lock-icon">🔒</span>}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="content">
        <button className="sidebar-open-button" onClick={() => setSidebarOpen(true)}>☰</button>
        
        <div className="iframe-container" ref={iframeContainerRef}>
          {isIframeLoading && selectedNotePath && (
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          )}
          
          {selectedNotePath ? (
            <>
              <button className="fullscreen-btn" onClick={toggleFullscreen} title="تمام صفحه">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </button>

              <iframe
                ref={iframeRef}
                src={selectedNotePath}
                title="Note Viewer"
                className="note-iframe"
                key={selectedNotePath}
                onLoad={() => setIframeLoading(false)}
                style={{ visibility: isIframeLoading ? 'hidden' : 'visible' }}
                allowFullScreen
              />
            </>
          ) : (
            <div className="placeholder">
              <p>برای مشاهده از لیست جلسه‌ای را انتخاب کنید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;