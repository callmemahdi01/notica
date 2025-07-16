import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../hooks/useCourses';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const HomePage = () => {
  const { user, logout } = useAuth();
  const { courses } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useLocalStorage('lastCourseId', null);
  const [selectedNotePath, setSelectedNotePath] = useLocalStorage('lastNotePath', '');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isIframeLoading, setIframeLoading] = useState(false);
  const iframeContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCourseClick = (courseId) => {
    const newCourseId = selectedCourseId === courseId ? null : courseId;
    setSelectedCourseId(newCourseId);
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
    localStorage.removeItem('lastCourseId');
    localStorage.removeItem('lastNotePath');
    await logout();
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
          <h1>Notica</h1>
        </div>
        {user && <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-900 text-center mb-2">{user.name}</h3>}
        <button onClick={handleLogout} className="logout-button">Logout</button>
        <h2 className="course-list-title">Courses</h2>
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
              <button className="fullscreen-btn" onClick={toggleFrameFullscreen} title="Fullscreen">
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
              <p>Please select a note to view.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};