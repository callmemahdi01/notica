import React, { useCallback } from 'react';

const PrintComponent = ({ iframeRef, studentId }) => {

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

  return (
    <div className="z-[1000] p-0.5 rounded-lg flex gap-2.5 items-center">
      <button
        onClick={printIframeWithoutMediaPrint}
        className="absolute top-[0.45rem] left-[0.3rem] sm:top-[0.4rem] py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs cursor-pointer transition-colors duration-200 ease-in-out"
      >
        دانلود
      </button>
    </div>
  );
};

export default PrintComponent;