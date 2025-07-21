import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(
    () => localStorage.getItem('lastCourseId') || null
  );
  const [selectedNotePath, setSelectedNotePath] = useState(
    () => localStorage.getItem('lastNotePath') || ''
  );
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isIframeLoading, setIframeLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeContainerRef = useRef(null);

  useEffect(() => {
    fetch('/courses.json?' + Date.now())
      .then(response => response.json())
      .then(setCourses)
      .catch(error => console.error('Error fetching courses:', error));
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      localStorage.setItem('lastCourseId', selectedCourseId);
    } else {
      localStorage.removeItem('lastCourseId');
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedNotePath) {
      localStorage.setItem('lastNotePath', selectedNotePath);
    } else {
      localStorage.removeItem('lastNotePath');
    }
  }, [selectedNotePath]);

  const handleCourseClick = useCallback((courseId) => {
    const newCourseId = selectedCourseId === courseId ? null : courseId;
    setSelectedCourseId(newCourseId);
    if (!newCourseId) setSelectedNotePath('');
  }, [selectedCourseId]);

  const checkNoteAccess = useCallback((course, note) => {
    return course.isFree || note.free || user?.subscription === 'pro';
  }, [user?.subscription]);

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
    localStorage.clear();
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const toggleFrameFullscreen = useCallback(() => {
    const container = iframeContainerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.error(err.message));
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (!user) {
    return (
      <div className="main-layout">
        <div className="p-4 text-center">در حال بارگذاری...</div>
      </div>
    );
  }

  const hasPremiumAccess = user?.subscription === 'pro';

  return (
    <div className="main-layout">
      <div className={`overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />
      
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-button" onClick={closeSidebar}>
          &times;
        </button>
        
        <div className="sidebar-header">
          <h1>نوتیکا</h1>
        </div>
        
        <div className="flex flex-wrap justify-between items-center gap-3 text-center mb-5 border-t border-b border-l-4 border-r-4 border-blue-300 rounded-lg p-3">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">{user.name}</h3>
          {user.studentId && <p className="text-sm text-gray-500">{user.studentId}</p>}
          <Link 
            to="/pay" 
            className="text-xs" 
            title={!hasPremiumAccess ? 'برای دسترسی اشتراک خریداری کنید' : ''}
          >
            {user.subscription || 'free'}
          </Link>
        </div>
        
        <button onClick={handleLogout} className="logout-button">
          خروج از حساب
        </button>
        
        <h2 className="course-list-title">لیست دروس</h2>
        
        <ul className="course-list">
          {courses.map((course) => (
            <li key={course.id} className={`course-list-item ${selectedCourseId === course.id ? 'open' : ''}`}>
              <h3 
                onClick={() => handleCourseClick(course.id)} 
                className={selectedCourseId === course.id ? 'active' : ''}
              >
                {course.name}
              </h3>
              
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
                      {note.free && !hasPremiumAccess && <span className="free-badge">رایگان</span>}
                      {!hasAccess && <span className="lock-icon">🔒</span>}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="content">
        <button className="sidebar-open-button" onClick={() => setSidebarOpen(true)}>
          &#9776;
        </button>
        
        <div className="iframe-container" ref={iframeContainerRef}>
          {isIframeLoading && selectedNotePath && (
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          )}
          
          {selectedNotePath ? (
            <>
              <button 
                className="fullscreen-btn" 
                onClick={toggleFrameFullscreen} 
                title="تمام صفحه"
              >
                <span className="material-icons">
                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>
              
              <iframe
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
              <p>جلسه‌ای را انتخاب کنید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
