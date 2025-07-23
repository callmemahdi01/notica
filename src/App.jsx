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

  useEffect(() => {
    fetch(`/courses.json?${Date.now()}`)
      .then(res => res.json())
      .then(setCourses)
      .catch(console.error);

    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    selectedCourseId
      ? localStorage.setItem(STORAGE_KEYS.COURSE_ID, selectedCourseId)
      : localStorage.removeItem(STORAGE_KEYS.COURSE_ID);
  }, [selectedCourseId]);

  useEffect(() => {
    selectedNotePath
      ? localStorage.setItem(STORAGE_KEYS.NOTE_PATH, selectedNotePath)
      : localStorage.removeItem(STORAGE_KEYS.NOTE_PATH);
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
    localStorage.clear();
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const toggleFullscreen = useCallback(() => {
    const container = iframeContainerRef.current;
    if (!container) return;
    
    document.fullscreenElement 
      ? document.exitFullscreen()
      : container.requestFullscreen().catch(console.error);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

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
          <h1>نوتیکا</h1>
        </div>
        
        <div className="flex flex-wrap items-center justify-around gap-1 text-center mb-5 border-t border-b border-l-4 border-r-4 border-blue-300 rounded-lg py-3 px-1">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">{user.name}</h3>
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
                <span className="material-icons">
                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
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