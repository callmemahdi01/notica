const PrintComponent = ({ studentId, frameRef }) => {
  const printFrame = () => {
    if (!frameRef?.current) return;
    
    const iframe = frameRef.current;
    const iframeWin = iframe.contentWindow;
    const iframeDoc = iframe.contentDocument || iframeWin.document;

    const disabledRules = [];
    const removedScripts = [];
    const watermarkElements = [];

    for (const sheet of iframeDoc.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          if (rule.type === CSSRule.MEDIA_RULE && rule.media.mediaText.includes("print")) {
            const cssText = rule.cssText;
            if (cssText.includes("body") && cssText.includes("display:") && cssText.includes("none")) {
              disabledRules.push({ sheet, ruleText: cssText, index: i });
              sheet.deleteRule(i);
              i--;
            }
          }
        }
      } catch (e) {
        console.warn("عدم دسترسی به stylesheet:", e);
      }
    }

    const elementsToModify = iframeDoc.querySelectorAll('#elegant-scroll-indicator, #elegant-scroll-progress, #masterAnnotationToggleBtn');
    const removedElements = [];
    
    elementsToModify.forEach(element => {
      if (element) {
        removedElements.push({
          element: element,
          parent: element.parentNode,
          nextSibling: element.nextSibling,
          originalHTML: element.innerHTML
        });
        
        if (element.id === "elegant-scroll-progress") {
          element.style.width = "auto";
          element.style.overflow = "visible";
          element.style.whiteSpace = "nowrap";
          element.style.backgroundColor = "transparent";
          element.style.boxShadow = "none";
          element.innerHTML = '<a href="https://notica.pages.dev" style="display:inline-block; color: blue; text-decoration: underline;">notica.pages.dev</a>';
        } else {
          element.remove();
        }
      }
    });
    
    const scripts = iframeDoc.querySelectorAll('script[src*="scrollbar.js"], script[src*="note.js"]');
    scripts.forEach(script => {
      removedScripts.push({
        element: script,
        parent: script.parentNode
      });
      script.remove();
    });

    const numberOfWatermarks = 50;
    const pageHeight = iframeDoc.body.scrollHeight;

    for (let i = 0; i < numberOfWatermarks; i++) {
      const wm = iframeDoc.createElement("div");
      wm.textContent = studentId;
      wm.style.position = "absolute";
      wm.style.zIndex = "9999";
      wm.style.opacity = "0.1";
      wm.style.color = "black";
      wm.style.fontSize = "18px";
      wm.style.transform = "rotate(-30deg)";
      wm.style.pointerEvents = "none";
      wm.style.userSelect = "none";
      wm.style.fontFamily = "Tahoma, sans-serif";

      const topPx = Math.floor((i + 1) * pageHeight / (numberOfWatermarks + 1));
      wm.style.top = `${topPx}px`;
      wm.style.left = `${Math.floor(Math.random() * 70 + 10)}%`;

      iframeDoc.body.appendChild(wm);
      watermarkElements.push(wm);
    }

    iframeWin.focus();
    iframeWin.print();

    setTimeout(() => {
      disabledRules.forEach(({ sheet, ruleText, index }) => {
        try {
          sheet.insertRule(ruleText, Math.min(index, sheet.cssRules.length));
        } catch (e) {
          console.warn("خطا در بازگردانی rule:", e);
        }
      });

      removedElements.forEach(({ element, parent, nextSibling, originalHTML }) => {
        if (element.id === "elegant-scroll-progress") {
          element.innerHTML = originalHTML;
        } else {
          if (nextSibling) {
            parent.insertBefore(element, nextSibling);
          } else {
            parent.appendChild(element);
          }
        }
      });

      removedScripts.forEach(({ element, parent }) => {
        parent.appendChild(element);
      });

      watermarkElements.forEach(wm => wm.remove());
    }, 1000);
  };

  return (
    <button
      onClick={printFrame}
      className="mt-5 px-5 py-2.5 text-base bg-blue-600 text-white border-0 rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
    >
      چاپ
    </button>
  );
};

export default PrintComponent;