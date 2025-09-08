// src/components/PrintComponent.jsx

import React, { useCallback, useEffect, useState } from 'react';

const PrintComponent = ({ iframeRef, studentId }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // بررسی اولیه اگر PWA قبلاً نصب شده باشد
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone || 
                        document.referrer.includes('android-app://');
    
    setIsPWAInstalled(isStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPWAInstalled(true);
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  }, [deferredPrompt]);

  const printIframeWithoutMediaPrint = useCallback(() => {
    if (!iframeRef?.current || !studentId?.trim()) {
      return;
    }

    const iframe = iframeRef.current;
    const iframeWin = iframe.contentWindow;
    const iframeDoc = iframe.contentDocument || iframeWin?.document;

    if (!iframeDoc || iframeDoc.readyState !== 'complete') {
      alert('محتوا هنوز بارگذاری نشده، لطفاً کمی صبر کنید');
      return;
    }

    const disabledRules = [];
    const removedElements = [];
    const removedScripts = [];
    const watermarkElements = [];

    try {
      if (iframeDoc.styleSheets) {
        for (const sheet of iframeDoc.styleSheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            if (!rules) continue;
            for (let i = rules.length - 1; i >= 0; i--) {
              const rule = rules[i];
              if (rule.type === CSSRule.MEDIA_RULE && rule.media.mediaText.includes("print")) {
                const cssText = rule.cssText;
                if (cssText.includes("body") && cssText.includes("display:") && cssText.includes("none")) {
                  disabledRules.push({ sheet, ruleText: cssText, index: i });
                  sheet.deleteRule(i);
                }
              }
            }
          } catch (e) {
            console.warn("عدم دسترسی به stylesheet:", e);
          }
        }
      }

      const elementsToModify = iframeDoc.querySelectorAll('#elegant-scroll-indicator, #elegant-scroll-progress, #masterAnnotationToggleBtn');
      elementsToModify.forEach(element => {
        if (!element) return;
        removedElements.push({
          element: element,
          parent: element.parentNode,
          nextSibling: element.nextSibling,
          originalHTML: element.innerHTML,
          originalStyle: element.getAttribute('style') || ''
        });
        if (element.id === "elegant-scroll-progress") {
          element.style.cssText = "width: auto; overflow: visible; white-space: nowrap; background-color: transparent; box-shadow: none;";
          element.innerHTML = '<a href="https://notica.pages.dev" style="display:inline-block; color: blue; text-decoration: underline; font-size:14px;">notica.pages.dev</a>';
        } else {
          element.remove();
        }
      });

      const scripts = iframeDoc.querySelectorAll('script[src*="scrollbar.js"], script[src*="note.js"]');
      scripts.forEach(script => {
        removedScripts.push({ element: script, parent: script.parentNode, nextSibling: script.nextSibling });
        script.remove();
      });

      const pageHeight = Math.max(iframeDoc.body.scrollHeight, iframeDoc.documentElement.scrollHeight);
      for (let i = 0; i < 10; i++) {
        const wm = iframeDoc.createElement("div");
        wm.textContent = studentId.trim();
        wm.style.cssText = `
          position: absolute;
          z-index: 9999;
          opacity: 0.2;
          color: black;
          font-size: 12px;
          transform: rotate(-30deg);
          pointer-events: none;
          user-select: none;
          font-family: Tahoma, sans-serif;
          top: ${Math.floor((i + 1) * pageHeight / 11)}px;
          left: ${Math.floor(Math.random() * 70 + 10)}%;
        `;
        iframeDoc.body.appendChild(wm);
        watermarkElements.push(wm);
      }

      setTimeout(() => {
        iframeWin.focus();
        iframeWin.print();
      }, 100);

      setTimeout(() => {
        disabledRules.forEach(({ sheet, ruleText, index }) => {
          try {
            const insertIndex = Math.min(index, sheet.cssRules ? sheet.cssRules.length : 0);
            sheet.insertRule(ruleText, insertIndex);
          } catch (e) {
            console.warn("خطا در بازگردانی rule:", e);
          }
        });

        removedElements.forEach(({ element, parent, nextSibling, originalHTML, originalStyle }) => {
          if (!parent) return;
          if (element.id === "elegant-scroll-progress") {
            element.innerHTML = originalHTML;
            element.setAttribute('style', originalStyle || '');
          } else {
            try {
              parent.insertBefore(element, nextSibling);
            } catch (e) {
              parent.appendChild(element);
            }
          }
        });

        removedScripts.forEach(({ element, parent, nextSibling }) => {
          if (!parent) return;
          try {
            parent.insertBefore(element, nextSibling);
          } catch (e) {
            parent.appendChild(element);
          }
        });

        watermarkElements.forEach(wm => wm.parentNode?.removeChild(wm));
      }, 2000);

    } catch (error) {
      console.error('An error occurred during printing:', error);
    }
  }, [iframeRef, studentId]);

  const handleDownloadClick = useCallback(() => {
    if (!isPWAInstalled && showInstallPrompt && deferredPrompt) {
      // نمایش modal برای نصب PWA
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `;
      
      modal.innerHTML = `
        <div style="
          background: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          max-width: 300px;
          width: 90%;
        ">
          <h3 style="margin-top: 0;">نصب اپلیکیشن</h3>
          <p>برای استفاده از قابلیت دانلود، لطفاً اپلیکیشن نوتیکا را نصب کنید.</p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button id="install-btn" style="
              background: #4CAF50;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
            ">نصب</button>
            <button id="cancel-btn" style="
              background: #f44336;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
            ">انصراف</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      modal.querySelector('#install-btn').addEventListener('click', () => {
        handleInstallPWA();
        document.body.removeChild(modal);
      });
      
      modal.querySelector('#cancel-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    } else if (!isPWAInstalled && !showInstallPrompt) {
      // اگر PWA قابل نصب نباشد ولی همچنان نصب نشده باشد
      alert('برای استفاده از قابلیت دانلود، لطفاً اپلیکیشن نوتیکا را نصب کنید.');
    } else {
      // اگر PWA نصب شده باشد یا کاربر انتخاب کند بدون نصب ادامه دهد
      printIframeWithoutMediaPrint();
    }
  }, [isPWAInstalled, showInstallPrompt, deferredPrompt, handleInstallPWA, printIframeWithoutMediaPrint]);

  // اگر PWA نصب نشده باشد و قابل نصب باشد، دکمه نصب را نمایش بده
  if (!isPWAInstalled && showInstallPrompt) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={handleDownloadClick}
          className="absolute top-[0.45rem] left-[0.3rem] sm:top-[0.4rem] py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs cursor-pointer transition-colors duration-200 ease-in-out"
        >
          دانلود
        </button>
        <button
          onClick={handleInstallPWA}
          style={{
            position: 'absolute',
            top: '0.45rem',
            left: 'calc(0.3rem + 60px)', // کنار دکمه دانلود
            padding: '4px 8px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer',
            zIndex: 1000
          }}
          title="نصب اپلیکیشن"
        >
          نصب
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDownloadClick}
      className="absolute top-[0.45rem] left-[0.3rem] sm:top-[0.4rem] py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs cursor-pointer transition-colors duration-200 ease-in-out"
    >
      دانلود
    </button>
  );
};

export default PrintComponent;