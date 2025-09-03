class PointPool {
    constructor(initialSize = 1000) {
        this.pool = [];
        this._prepopulate(initialSize);
    }
    _prepopulate(size) {
        for (let i = 0; i < size; i++) {
            this.pool.push({ x: 0, y: 0 });
        }
    }
    acquire() {
        return this.pool.length > 0 ? this.pool.pop() : { x: 0, y: 0 };
    }
    release(point) {
        if (this.pool.length < 2000) {
            this.pool.push(point);
        }
    }
    releaseArray(points) {
        for (const p of points) {
            this.release(p);
        }
    }
}

class PathPool {
    constructor(initialSize = 50) {
        this.pool = [];
        this._prepopulate(initialSize);
    }
    _prepopulate(size) {
        for (let i = 0; i < size; i++) {
            this.pool.push(this._createEmptyPath());
        }
    }
    _createEmptyPath() {
        return { tool: null, points: [], color: '', lineWidth: 0, opacity: 1.0, bbox: null };
    }
    acquire() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this._createEmptyPath();
    }
    release(path) {
        if (this.pool.length < 100) {
            path.tool = null;
            path.points.length = 0;
            path.bbox = null;
            this.pool.push(path);
        }
    }
}

class Quadtree {
    constructor(boundary, capacity = 4) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.items = [];
        this.divided = false;
    }
    subdivide() {
        const { x, y, width, height } = this.boundary;
        const hw = width / 2;
        const hh = height / 2;
        this.northeast = new Quadtree(Quadtree.createBoundary(x + hw, y, hw, hh), this.capacity);
        this.northwest = new Quadtree(Quadtree.createBoundary(x, y, hw, hh), this.capacity);
        this.southeast = new Quadtree(Quadtree.createBoundary(x + hw, y + hh, hw, hh), this.capacity);
        this.southwest = new Quadtree(Quadtree.createBoundary(x, y + hh, hw, hh), this.capacity);
        this.divided = true;
    }
    insert(item) {
        if (!this.boundary.intersects(item.bbox)) {
            return false;
        }
        if (this.items.length < this.capacity) {
            this.items.push(item);
            return true;
        }
        if (!this.divided) {
            this.subdivide();
        }
        return this.northeast.insert(item) || this.northwest.insert(item) || this.southeast.insert(item) || this.southwest.insert(item);
    }
    query(range, found = []) {
        if (!this.boundary.intersects(range)) {
            return found;
        }
        for (let item of this.items) {
            if (range.intersects(item.bbox)) {
                found.push(item);
            }
        }
        if (this.divided) {
            this.northeast.query(range, found);
            this.northwest.query(range, found);
            this.southeast.query(range, found);
            this.southwest.query(range, found);
        }
        return found;
    }
    static createBoundary(x, y, width, height) {
        return {
            x, y, width, height,
            left: x, top: y, right: x + width, bottom: y + height,
            intersects(other) {
                return !(other.left > this.right || other.right < this.left || other.top > this.bottom || other.bottom < this.top);
            }
        };
    }
}

class AnnotationApp {
    static TOOL_PEN = "pen";
    static TOOL_HIGHLIGHTER = "highlighter";
    static TOOL_ERASER = "eraser";
    static INTERACTION_STATE_IDLE = "idle";
    static INTERACTION_STATE_DRAWING = "drawing";
    static INTERACTION_STATE_MULTI_TOUCH_START = "multi_touch_start";
    static INTERACTION_STATE_PANNING = "panning";

    #targetContainer;
    #PAN_MOVE_THRESHOLD;
    #HIGHLIGHTER_OPACITY;
    #TWO_FINGER_TAP_TIMEOUT;
    #pointPool;
    #pathPool;
    #noteCanvas; #noteCtx;
    #highlightCanvas; #highlightCtx;
    #committedNoteCanvas; #committedNoteCtx;
    #committedHighlightCanvas; #committedHighlightCtx;
    #virtualCanvasContainer;
    #viewportWidth = 0; #viewportHeight = 0;
    #scrollOffsetX = 0; #scrollOffsetY = 0;
    #totalWidth = 0; #totalHeight = 0;
    #isDrawing = false;
    #noteModeActive = false;
    #currentTool = AnnotationApp.TOOL_PEN;
    #currentPath = null;
    #drawings = [];
    #quadtree = null;
    #penColor = "#000000";
    #penLineWidth = 2;
    #highlighterColor = "#00ff00";
    #highlighterLineWidth = 20;
    #eraserWidth = 25;
    #boundUpdateVirtualCanvas;
    #interactionState = AnnotationApp.INTERACTION_STATE_IDLE;
    #touchStartTimestamp = 0;
    #panStartFinger1 = null; #panStartFinger2 = null;
    #lastPanMidX = null; #lastPanMidY = null;
    #initialTouchMidPoint = null;
    #twoFingerTapProcessedInCurrentSequence = false;
    #lastDimensions = { w: 0, h: 0, sx: 0, sy: 0, tw: 0, th: 0 };
    #pendingRender = false;
    #dirtyRects = [];
    #storageKey;
    #icons;
    #masterAnnotationToggleBtn; #toolsPanel; #penBtn; #highlighterBtn; #eraserBtn; #clearBtn;
    #penColorPicker; #penLineWidthDisplay; #penLineWidthContainer;
    #highlighterColorPicker; #highlighterLineWidthDisplay; #highlighterLineWidthContainer;

    constructor(targetContainerSelector) {
        this.#targetContainer = document.querySelector(targetContainerSelector);
        if (!this.#targetContainer) return;
        this.#ensureRelativePosition();
        this.#initializeProperties();
        this.#initializeStorageKey();
        this.#initializeIcons();
        this.init();
        this.#startRenderingLoop();
    }

    #ensureRelativePosition() {
        if (getComputedStyle(this.#targetContainer).position === "static") {
            this.#targetContainer.style.position = "relative";
        }
    }

    #initializeProperties() {
        this.#PAN_MOVE_THRESHOLD = 15;
        this.#HIGHLIGHTER_OPACITY = 0.7;
        this.#TWO_FINGER_TAP_TIMEOUT = 300;
        this.#pointPool = new PointPool();
        this.#pathPool = new PathPool();
        this.#boundUpdateVirtualCanvas = this.updateVirtualCanvas.bind(this);
    }

    #initializeStorageKey() {
        const pageIdentifier = window.location.pathname.replace(/[^a-zA-Z0-9_-]/g, "_");
        this.#storageKey = `pageAnnotations_${pageIdentifier}`;
    }

    #initializeIcons() {
        this.#icons = {
            [AnnotationApp.TOOL_PEN]: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#e3e3e3"><path d="m499-287 335-335-52-52-335 335zm-261 87q-100-5-149-42T40-349q0-65 53.5-105.5T242-503q39-3 58.5-12.5T320-542q0-26-29.5-39T193-600l7-80q103 8 151.5 41.5T400-542q0 53-38.5 83T248-423q-64 5-96 23.5T120-349q0 35 28 50.5t94 18.5zm280 7L353-358l382-382q20-20 47.5-20t47.5 20l70 70q20 20 20 47.5T900-575zm-159 33q-17 4-30-9t-9-30l33-159 165 165z"/></svg>`,
            [AnnotationApp.TOOL_HIGHLIGHTER]: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#e3e3e3"><path d="M80 0v-160h800V0zm504-480L480-584 320-424l103 104zm-47-160 103 103 160-159-104-104zm-84-29 216 216-189 190q-24 24-56.5 24T367-263l-27 23H140l126-125q-24-24-25-57.5t23-57.5zm0 0 187-187q24-24 56.5-24t56.5 24l104 103q24 24 24 56.5T857-640L669-453z"/></svg>`,
            [AnnotationApp.TOOL_ERASER]: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#e3e3e3"><path d="M690-240h190v80H610zm-500 80-85-85q-23-23-23.5-57t22.5-58l440-456q23-24 56.5-24t56.5 23l199 199q23 23 23 57t-23 57L520-160zm296-80 314-322-198-198-442 456 64 64zm-6-240"/></svg>`
        };
    }

    #startRenderingLoop() {
        const loop = () => {
            if (this.#pendingRender) {
                this.#render();
                this.#pendingRender = false;
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    
    #requestRender() {
        if (!this.#pendingRender) {
            this.#pendingRender = true;
        }
    }

    init() {
        this.#createVirtualCanvasContainer();
        this.#createCanvases();
        this.#createToolbar();
        this.#addEventListeners();
        this.loadDrawings();
        this.updateVirtualCanvas();
        this.selectTool(AnnotationApp.TOOL_PEN);
    }

    #createVirtualCanvasContainer() {
        this.#virtualCanvasContainer = document.createElement("div");
        Object.assign(this.#virtualCanvasContainer.style, {
            position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
            pointerEvents: "none", zIndex: "98", overflow: "hidden"
        });
        document.body.appendChild(this.#virtualCanvasContainer);
    }

    #createCanvases() {
        this.#highlightCanvas = document.createElement("canvas");
        this.#highlightCanvas.id = "highlightCanvas";
        Object.assign(this.#highlightCanvas.style, { position: "absolute", top: "0", left: "0" });
        this.#virtualCanvasContainer.appendChild(this.#highlightCanvas);
        this.#highlightCtx = this.#highlightCanvas.getContext("2d");
        this.#noteCanvas = document.createElement("canvas");
        this.#noteCanvas.id = "noteCanvas";
        Object.assign(this.#noteCanvas.style, { position: "absolute", top: "0", left: "0", zIndex: "101" });
        this.#virtualCanvasContainer.appendChild(this.#noteCanvas);
        this.#noteCtx = this.#noteCanvas.getContext("2d");
        this.#committedHighlightCanvas = document.createElement("canvas");
        this.#committedHighlightCtx = this.#committedHighlightCanvas.getContext("2d");
        this.#committedNoteCanvas = document.createElement("canvas");
        this.#committedNoteCtx = this.#committedNoteCanvas.getContext("2d");
    }

    #createStyledButton(id, title, innerHTML, className = "tool-button") {
        const button = document.createElement("button");
        button.id = id;
        button.title = title;
        button.className = className;
        if (innerHTML) button.innerHTML = innerHTML;
        return button;
    }

    #createToolbar() {
        this.#createMasterToggleButton();
        this.#createToolsPanel();
        this.#createToolButtons();
        this.#createAllToolSettings();
        this.#createClearButton();
        this.#targetContainer.appendChild(this.#toolsPanel);
        this.updateToolSettingsVisibility();
    }

    #createMasterToggleButton() {
        this.#masterAnnotationToggleBtn = this.#createStyledButton("masterAnnotationToggleBtn", "NOTE - فعال/غیرفعال کردن یادداشت‌برداری", "NOTE ✏️");
        this.#targetContainer.appendChild(this.#masterAnnotationToggleBtn);
    }

    #createToolsPanel() {
        this.#toolsPanel = document.createElement("div");
        this.#toolsPanel.id = "annotationToolsPanel";
    }

    #createToolButtons() {
        const toolsGroup = document.createElement("div");
        toolsGroup.className = "toolbar-group";
        this.#penBtn = this.#createStyledButton("penBtn", "قلم", this.#icons[AnnotationApp.TOOL_PEN]);
        this.#highlighterBtn = this.#createStyledButton("highlighterBtn", "هایلایتر", this.#icons[AnnotationApp.TOOL_HIGHLIGHTER]);
        this.#eraserBtn = this.#createStyledButton("eraserBtn", "پاک‌کن", this.#icons[AnnotationApp.TOOL_ERASER]);
        toolsGroup.append(this.#penBtn, this.#highlighterBtn, this.#eraserBtn);
        this.#toolsPanel.appendChild(toolsGroup);
    }

    #createToolSettingUI(toolKey, colorGetter, colorSetter, lineWidthGetter, lineWidthSetter, colorPickerRefName, lineWidthDisplayRefName, lineWidthContainerRefName, minLineWidth, maxLineWidth, titleSuffix = "") {
        const settingsGroup = document.createElement("div");
        settingsGroup.className = "toolbar-group setting-group";
        settingsGroup.id = `${toolKey}SettingsGroup`;
        const colorLabel = document.createElement("label");
        this[colorPickerRefName] = document.createElement("input");
        this[colorPickerRefName].type = "color";
        this[colorPickerRefName].value = colorGetter();
        this[colorPickerRefName].title = `انتخاب رنگ ${titleSuffix}`;
        this[colorPickerRefName].addEventListener("input", (e) => {
            colorSetter(e.target.value);
        });
        const lineWidthLabel = document.createElement("label");
        this[lineWidthContainerRefName] = document.createElement('div');
        this[lineWidthContainerRefName].className = 'line-width-slider-container';
        const lessThanSpan = document.createElement('span');
        lessThanSpan.textContent = '<';
        this[lineWidthDisplayRefName] = document.createElement('span');
        this[lineWidthDisplayRefName].className = 'line-width-value-display';
        this[lineWidthDisplayRefName].textContent = lineWidthGetter();
        const greaterThanSpan = document.createElement('span');
        greaterThanSpan.textContent = '>';
        this[lineWidthContainerRefName].append(lessThanSpan, this[lineWidthDisplayRefName], greaterThanSpan);
        settingsGroup.append(colorLabel, this[colorPickerRefName], lineWidthLabel, this[lineWidthContainerRefName]);
        this.#toolsPanel.appendChild(settingsGroup);
        this.#addDragLogic(
            this[lineWidthContainerRefName], 
            (newValue) => {
                const clampedValue = Math.max(minLineWidth, Math.min(maxLineWidth, newValue));
                lineWidthSetter(clampedValue);
                this[lineWidthDisplayRefName].textContent = clampedValue;
            }, 
            lineWidthGetter, 
            minLineWidth, 
            maxLineWidth
        );
    }

    #createAllToolSettings() {
        this.#createToolSettingUI(
            AnnotationApp.TOOL_PEN,
            () => this.#penColor,
            (value) => { this.#penColor = value; },
            () => this.#penLineWidth,
            (value) => { this.#penLineWidth = value; },
            "#penColorPicker", "#penLineWidthDisplay", "#penLineWidthContainer", 1, 20, "قلم"
        );
        this.#createToolSettingUI(
            AnnotationApp.TOOL_HIGHLIGHTER,
            () => this.#highlighterColor,
            (value) => { this.#highlighterColor = value; },
            () => this.#highlighterLineWidth,
            (value) => { this.#highlighterLineWidth = value; },
            "#highlighterColorPicker", "#highlighterLineWidthDisplay", "#highlighterLineWidthContainer", 5, 50, "هایلایتر"
        );
    }

    #addDragLogic(element, setterCallback, getterCallback, min, max, sensitivityFactor = 10) {
        let isDragging = false, startX, startValue;
        const onDragStart = (clientX) => {
            isDragging = true; startX = clientX; startValue = getterCallback();
            element.classList.add('dragging');
        };
        const onDragMove = (clientX) => {
            if (!isDragging) return;
            const deltaX = clientX - startX;
            const newValue = Math.round(startValue + (deltaX / sensitivityFactor));
            setterCallback(newValue);
        };
        const onDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            element.classList.remove('dragging');
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchcancel', handleTouchEnd);
        };
        const handleMouseDown = (e) => { e.preventDefault(); onDragStart(e.clientX); document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); };
        const handleMouseMove = (e) => { e.preventDefault(); onDragMove(e.clientX); };
        const handleMouseUp = () => onDragEnd();
        const handleTouchStart = (e) => {
            if (e.touches.length === 1) {
                e.preventDefault(); onDragStart(e.touches[0].clientX);
                document.addEventListener('touchmove', handleTouchMove, { passive: false });
                document.addEventListener('touchend', handleTouchEnd);
                document.addEventListener('touchcancel', handleTouchEnd);
            }
        };
        const handleTouchMove = (e) => { if (e.touches.length === 1) { e.preventDefault(); onDragMove(e.touches[0].clientX); } };
        const handleTouchEnd = () => onDragEnd();
        element.addEventListener('mousedown', handleMouseDown);
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
    }

    #createClearButton() {
        this.#clearBtn = this.#createStyledButton("clearAnnotationsBtn", "پاک کردن تمام یادداشت‌ها", "پاک کردن همه");
        this.#toolsPanel.appendChild(this.#clearBtn);
    }

    updateToolSettingsVisibility() {
        const penSettings = document.getElementById(`${AnnotationApp.TOOL_PEN}SettingsGroup`);
        const highlighterSettings = document.getElementById(`${AnnotationApp.TOOL_HIGHLIGHTER}SettingsGroup`);
        if (penSettings) penSettings.style.display = (this.#currentTool === AnnotationApp.TOOL_PEN && this.#noteModeActive) ? "flex" : "none";
        if (highlighterSettings) highlighterSettings.style.display = (this.#currentTool === AnnotationApp.TOOL_HIGHLIGHTER && this.#noteModeActive) ? "flex" : "none";
        if (this.#clearBtn) this.#clearBtn.style.display = (this.#currentTool === AnnotationApp.TOOL_ERASER && this.#noteModeActive) ? "block" : "none";
    }

    updateVirtualCanvas() {
        const changed = this.#calculateAndUpdateDimensions();
        if (changed) {
            this.#addDirtyRect({ x: 0, y: 0, width: this.#totalWidth, height: this.#totalHeight });
            this.#resizeCanvases();
            this.#requestRender();
        }
    }

    #calculateAndUpdateDimensions() {
        const old = this.#lastDimensions;
        this.#viewportWidth = window.innerWidth;
        this.#viewportHeight = window.innerHeight;
        this.#scrollOffsetX = window.pageXOffset || document.documentElement.scrollLeft;
        this.#scrollOffsetY = window.pageYOffset || document.documentElement.scrollTop;
        this.#totalWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, this.#targetContainer.scrollWidth);
        this.#totalHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, this.#targetContainer.scrollHeight);
        const changed = old.w !== this.#viewportWidth || old.h !== this.#viewportHeight || old.sx !== this.#scrollOffsetX || old.sy !== this.#scrollOffsetY || old.tw !== this.#totalWidth || old.th !== this.#totalHeight;
        if (changed) {
            this.#lastDimensions = { w: this.#viewportWidth, h: this.#viewportHeight, sx: this.#scrollOffsetX, sy: this.#scrollOffsetY, tw: this.#totalWidth, th: this.#totalHeight };
            this.#addDirtyRect({ x: this.#scrollOffsetX, y: this.#scrollOffsetY, width: this.#viewportWidth, height: this.#viewportHeight });
        }
        return changed;
    }

    #resizeCanvases() {
        [this.#noteCanvas, this.#highlightCanvas].forEach(canvas => {
            canvas.width = this.#viewportWidth;
            canvas.height = this.#viewportHeight;
            Object.assign(canvas.style, { width: `${this.#viewportWidth}px`, height: `${this.#viewportHeight}px` });
        });
        if (this.#committedNoteCanvas.width !== this.#totalWidth || this.#committedNoteCanvas.height !== this.#totalHeight) {
            this.#committedNoteCanvas.width = this.#totalWidth;
            this.#committedNoteCanvas.height = this.#totalHeight;
            this.#committedHighlightCanvas.width = this.#totalWidth;
            this.#committedHighlightCanvas.height = this.#totalHeight;
            this.#rebuildQuadtree();
            this.#redrawCommittedDrawings();
        }
    }

    #addEventListeners() {
        window.addEventListener("resize", this.#boundUpdateVirtualCanvas);
        window.addEventListener("scroll", this.#boundUpdateVirtualCanvas);
        const touchOpts = { passive: false };
        this.#noteCanvas.addEventListener("touchstart", this.#handleTouchStart.bind(this), touchOpts);
        this.#noteCanvas.addEventListener("touchmove", this.#handleTouchMove.bind(this), touchOpts);
        this.#noteCanvas.addEventListener("touchend", this.#handleTouchEnd.bind(this), touchOpts);
        this.#noteCanvas.addEventListener("touchcancel", this.#handleTouchEnd.bind(this), touchOpts);
        this.#noteCanvas.addEventListener("mousedown", this.#handleMouseStart.bind(this));
        this.#noteCanvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
        this.#noteCanvas.addEventListener("mouseup", this.#handleMouseEnd.bind(this));
        this.#noteCanvas.addEventListener("mouseleave", (e) => this.#handleMouseEnd(e, true));
        this.#addUIEventListeners();
    }

    #addUIEventListeners() {
        this.#masterAnnotationToggleBtn.addEventListener("click", () => this.toggleMasterAnnotationMode());
        this.#penBtn.addEventListener("click", () => this.selectTool(AnnotationApp.TOOL_PEN));
        this.#highlighterBtn.addEventListener("click", () => this.selectTool(AnnotationApp.TOOL_HIGHLIGHTER));
        this.#eraserBtn.addEventListener("click", () => this.selectTool(AnnotationApp.TOOL_ERASER));
        this.#clearBtn.addEventListener("click", () => this.clearAllAnnotations());
    }

    #handleMouseStart(evt) {
        if (!this.#noteModeActive || evt.button !== 0) return;
        evt.preventDefault();
        this.#isDrawing = true;
        const { x, y } = this.#getEventCoordinates(evt);
        this.#currentPath = this.#createNewDrawingPath(x, y);
    }

    #handleMouseMove(evt) {
        if (!this.#isDrawing || !this.#noteModeActive) return;
        evt.preventDefault();
        const { x, y } = this.#getEventCoordinates(evt);
        if (this.#currentPath) {
            this.#updateCurrentDrawingPath(x, y);
            this.#requestRender();
        }
    }

    #handleMouseEnd(evt, leftCanvas = false) {
        if (!this.#isDrawing && !leftCanvas) return;
        if (this.#isDrawing) {
            if (this.#currentPath && this.#currentPath.points.length > 0) {
                this.#processAndCommitCompletedPath();
            }
            this.#resetDrawingStateAndClearLivePath();
        }
        if (leftCanvas) this.#resetDrawingStateAndClearLivePath();
    }

    #handleTouchStart(evt) {
        if (!this.#noteModeActive) return;
        evt.preventDefault();
        const touches = evt.touches;
        this.#twoFingerTapProcessedInCurrentSequence = false;
        if (touches.length === 1) {
            if (this.#interactionState === AnnotationApp.INTERACTION_STATE_PANNING) return;
            this.#interactionState = AnnotationApp.INTERACTION_STATE_DRAWING;
            this.#isDrawing = true;
            const { x, y } = this.#getEventCoordinates(touches[0]);
            this.#currentPath = this.#createNewDrawingPath(x, y);
        } else if (touches.length === 2) {
            this.#resetDrawingStateAndClearLivePath();
            this.#interactionState = AnnotationApp.INTERACTION_STATE_MULTI_TOUCH_START;
            this.#touchStartTimestamp = Date.now();
            this.#panStartFinger1 = { clientX: touches[0].clientX, clientY: touches[0].clientY };
            this.#panStartFinger2 = { clientX: touches[1].clientX, clientY: touches[1].clientY };
            this.#lastPanMidX = (touches[0].clientX + touches[1].clientX) / 2;
            this.#lastPanMidY = (touches[0].clientY + touches[1].clientY) / 2;
            this.#initialTouchMidPoint = { x: this.#lastPanMidX, y: this.#lastPanMidY };
        }
    }

    #handleTouchMove(evt) {
        if (!this.#noteModeActive) return;
        evt.preventDefault();
        const touches = evt.touches;
        if (this.#interactionState === AnnotationApp.INTERACTION_STATE_DRAWING && touches.length === 1) {
            const { x, y } = this.#getEventCoordinates(touches[0]);
            if (this.#currentPath) {
                this.#updateCurrentDrawingPath(x, y);
                this.#requestRender();
            }
        } else if (this.#interactionState === AnnotationApp.INTERACTION_STATE_MULTI_TOUCH_START && touches.length === 2) {
            const currentMidX = (touches[0].clientX + touches[1].clientX) / 2;
            const currentMidY = (touches[0].clientY + touches[1].clientY) / 2;
            const deltaX = currentMidX - this.#initialTouchMidPoint.x;
            const deltaY = currentMidY - this.#initialTouchMidPoint.y;
            if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > this.#PAN_MOVE_THRESHOLD) {
                this.#interactionState = AnnotationApp.INTERACTION_STATE_PANNING;
            }
        } else if (this.#interactionState === AnnotationApp.INTERACTION_STATE_PANNING && touches.length === 2) {
            const currentMidX = (touches[0].clientX + touches[1].clientX) / 2;
            const currentMidY = (touches[0].clientY + touches[1].clientY) / 2;
            const deltaScrollX = currentMidX - this.#lastPanMidX;
            const deltaScrollY = currentMidY - this.#lastPanMidY;
            window.scrollBy(-deltaScrollX, -deltaScrollY);
            this.#lastPanMidX = currentMidX;
            this.#lastPanMidY = currentMidY;
        }
    }

    #handleTouchEnd(evt) {
        if (!this.#noteModeActive) return;
        const touches = evt.touches;
        if (this.#interactionState === AnnotationApp.INTERACTION_STATE_DRAWING) {
            if (touches.length === 0) {
                if (this.#currentPath && this.#currentPath.points.length > 0) {
                    this.#processAndCommitCompletedPath();
                }
                this.#resetDrawingStateAndClearLivePath();
                this.#interactionState = AnnotationApp.INTERACTION_STATE_IDLE;
            }
        } else if (this.#interactionState === AnnotationApp.INTERACTION_STATE_MULTI_TOUCH_START) {
            if (Date.now() - this.#touchStartTimestamp < this.#TWO_FINGER_TAP_TIMEOUT && !this.#twoFingerTapProcessedInCurrentSequence) {
                this.undoLastDrawing();
                this.#twoFingerTapProcessedInCurrentSequence = true;
            }
            if (touches.length < 2) {
                this.#interactionState = AnnotationApp.INTERACTION_STATE_IDLE;
                this.#resetTouchPanState();
            }
        } else if (this.#interactionState === AnnotationApp.INTERACTION_STATE_PANNING) {
            if (touches.length < 2) {
                this.#interactionState = AnnotationApp.INTERACTION_STATE_IDLE;
                this.#resetTouchPanState();
            }
        }
        if (evt.touches.length === 0 && evt.targetTouches.length === 0 && evt.changedTouches.length > 0) {
             if (this.#isDrawing) {
                  this.#resetDrawingStateAndClearLivePath();
             }
             this.#interactionState = AnnotationApp.INTERACTION_STATE_IDLE;
             this.#resetTouchPanState();
        }
    }

    #resetTouchPanState() {
        this.#panStartFinger1 = null;
        this.#panStartFinger2 = null;
        this.#lastPanMidX = null;
        this.#lastPanMidY = null;
        this.#initialTouchMidPoint = null;
    }

    undoLastDrawing() {
        if (this.#drawings.length > 0) {
            const lastDrawing = this.#drawings.pop();
            this.#pointPool.releaseArray(lastDrawing.points);
            this.#pathPool.release(lastDrawing);
            this.#rebuildQuadtree();
            this.#redrawCommittedDrawings();
            this.saveDrawings();
        }
    }

    #rebuildQuadtree() {
        const boundary = Quadtree.createBoundary(0, 0, this.#totalWidth, this.#totalHeight);
        this.#quadtree = new Quadtree(boundary);
        this.#drawings.forEach(d => this.#quadtree.insert(d));
    }

    toggleMasterAnnotationMode() {
        this.#noteModeActive = !this.#noteModeActive;
        if (this.#noteModeActive) this.#activateAnnotationMode();
        else this.#deactivateAnnotationMode();
        this.updateToolSettingsVisibility();
    }

    #activateAnnotationMode() {
        this.#noteCanvas.style.pointerEvents = "auto";
        document.body.classList.add("annotation-active");
        this.#targetContainer.classList.add("annotation-active");
        this.#masterAnnotationToggleBtn.textContent = "NOTE ✏️ (فعال)";
        this.#masterAnnotationToggleBtn.classList.add("active");
        this.#toolsPanel.style.display = "flex";
        if (!this.#currentTool) this.selectTool(AnnotationApp.TOOL_PEN);
    }

    #deactivateAnnotationMode() {
        this.#noteCanvas.style.pointerEvents = "none";
        document.body.classList.remove("annotation-active");
        this.#targetContainer.classList.remove("annotation-active");
        this.#masterAnnotationToggleBtn.textContent = "NOTE ✏️ (غیرفعال)";
        this.#masterAnnotationToggleBtn.classList.remove("active");
        this.#toolsPanel.style.display = "none";
        this.#resetDrawingStateAndClearLivePath();
        this.#interactionState = AnnotationApp.INTERACTION_STATE_IDLE;
    }

    #resetDrawingStateAndClearLivePath() {
        this.#isDrawing = false;
        if (this.#currentPath) {
            this.#addDirtyRect(this.#currentPath.bbox);
            this.#pointPool.releaseArray(this.#currentPath.points);
            this.#pathPool.release(this.#currentPath);
            this.#currentPath = null;
        }
        this.#requestRender();
    }

    #getEventCoordinates(eventOrTouch) {
        return {
            x: eventOrTouch.clientX + this.#scrollOffsetX,
            y: eventOrTouch.clientY + this.#scrollOffsetY
        };
    }

    #createNewDrawingPath(x, y) {
        const path = this.#pathPool.acquire();
        path.tool = this.#currentTool;
        const point = this.#pointPool.acquire();
        point.x = x; point.y = y;
        path.points.push(point);
        switch (this.#currentTool) {
            case AnnotationApp.TOOL_PEN:
                Object.assign(path, { color: this.#penColor, lineWidth: this.#penLineWidth, opacity: 1.0 });
                break;
            case AnnotationApp.TOOL_HIGHLIGHTER:
                Object.assign(path, { color: this.#highlighterColor, lineWidth: this.#highlighterLineWidth, opacity: this.#HIGHLIGHTER_OPACITY });
                break;
            case AnnotationApp.TOOL_ERASER:
                path.lineWidth = this.#eraserWidth;
                break;
        }
        path.bbox = this.#calculatePathBbox(path);
        this.#addDirtyRect(path.bbox);
        return path;
    }

    #updateCurrentDrawingPath(x, y) {
        const oldBbox = this.#currentPath.bbox ? { ...this.#currentPath.bbox } : null;
        if (oldBbox) this.#addDirtyRect(oldBbox);
        if (this.#currentTool === AnnotationApp.TOOL_HIGHLIGHTER) {
            if (this.#currentPath.points.length <= 1) {
                const point = this.#pointPool.acquire();
                point.x = x; point.y = y;
                this.#currentPath.points.push(point);
            } else {
                this.#currentPath.points[1].x = x;
                this.#currentPath.points[1].y = y;
            }
        } else {
            const point = this.#pointPool.acquire();
            point.x = x; point.y = y;
            this.#currentPath.points.push(point);
        }
        this.#currentPath.bbox = this.#calculatePathBbox(this.#currentPath);
        this.#addDirtyRect(this.#currentPath.bbox);
    }

    #calculatePathBbox(path) {
        if (!path || !path.points || path.points.length === 0) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const halfWidth = (path.lineWidth || 1);
        for (const p of path.points) {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }
        return Quadtree.createBoundary(minX - halfWidth, minY - halfWidth, (maxX - minX) + halfWidth * 2, (maxY - minY) + halfWidth * 2);
    }

    #_perpendicularDistance(point, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        if (dx === 0 && dy === 0) return 0;
        const numerator = Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x);
        const denominator = Math.sqrt(dx * dx + dy * dy);
        return numerator / denominator;
    }

    #_simplifyRDP(points, epsilon) {
        if (points.length < 3) return points;
        let dmax = 0;
        let index = 0;
        const end = points.length - 1;
        for (let i = 1; i < end; i++) {
            const d = this.#_perpendicularDistance(points[i], points[0], points[end]);
            if (d > dmax) {
                index = i;
                dmax = d;
            }
        }
        if (dmax > epsilon) {
            const res1 = this.#_simplifyRDP(points.slice(0, index + 1), epsilon);
            const res2 = this.#_simplifyRDP(points.slice(index), epsilon);
            return res1.slice(0, res1.length - 1).concat(res2);
        } else {
            return [points[0], points[end]];
        }
    }

    #processAndCommitCompletedPath() {
        if (!this.#currentPath || this.#currentPath.points.length === 0) return;
        const MIN_POINTS_TO_SIMPLIFY = 15;
        const SIMPLIFICATION_EPSILON = 1.0;
        if (this.#currentPath.tool !== AnnotationApp.TOOL_ERASER && this.#currentPath.points.length > MIN_POINTS_TO_SIMPLIFY) {
            const originalPoints = this.#currentPath.points;
            const simplifiedPoints = this.#_simplifyRDP(originalPoints, SIMPLIFICATION_EPSILON);
            const keptPoints = new Set(simplifiedPoints);
            const discardedPoints = originalPoints.filter(p => !keptPoints.has(p));
            this.#pointPool.releaseArray(discardedPoints);
            this.#currentPath.points = simplifiedPoints;
        }
        this.#currentPath.bbox = this.#calculatePathBbox(this.#currentPath);
        this.#addDirtyRect(this.#currentPath.bbox);
        if (this.#currentTool === AnnotationApp.TOOL_ERASER) {
            this.#eraseStrokesUnderCurrentPath();
            this.#pointPool.releaseArray(this.#currentPath.points);
            this.#pathPool.release(this.#currentPath);
        } else {
            this.#drawings.push(this.#currentPath);
            this.#drawSinglePathOnContext(this.#currentPath, this.#currentPath.tool === AnnotationApp.TOOL_PEN ? this.#committedNoteCtx : this.#committedHighlightCtx, false);
            if (this.#quadtree) this.#quadtree.insert(this.#currentPath);
        }
        this.#currentPath = null;
        this.saveDrawings();
    }

    #distToSegmentSquared(p, v, w) {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const px = v.x + t * (w.x - v.x);
        const py = v.y + t * (w.y - v.y);
        return (p.x - px) ** 2 + (p.y - py) ** 2;
    }

    #_onSegment(p, q, r) {
        return (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
                q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y));
    }

    #_orientation(p, q, r) {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0;
        return (val > 0) ? 1 : 2;
    }

    #_doIntersect(p1, q1, p2, q2) {
        const o1 = this.#_orientation(p1, q1, p2);
        const o2 = this.#_orientation(p1, q1, q2);
        const o3 = this.#_orientation(p2, q2, p1);
        const o4 = this.#_orientation(p2, q2, q1);

        if (o1 !== o2 && o3 !== o4) {
            return true;
        }
        if (o1 === 0 && this.#_onSegment(p1, p2, q1)) return true;
        if (o2 === 0 && this.#_onSegment(p1, q2, q1)) return true;
        if (o3 === 0 && this.#_onSegment(p2, p1, q2)) return true;
        if (o4 === 0 && this.#_onSegment(p2, q1, q2)) return true;
        return false;
    }
    
    #eraseStrokesUnderCurrentPath() {
        if (!this.#currentPath || !this.#currentPath.bbox || !this.#quadtree) return;
        const eraserPathPoints = this.#currentPath.points;
        const drawingsToDelete = new Set();
        const eraserRadius = this.#eraserWidth / 2;
        const candidateDrawings = this.#quadtree.query(this.#currentPath.bbox);

        for (const drawing of candidateDrawings) {
            if (drawing.tool === AnnotationApp.TOOL_ERASER || drawingsToDelete.has(drawing)) continue;
            const drawingPoints = drawing.points;
            if (drawingPoints.length === 0) continue;

            let collisionFound = false;

            if (eraserPathPoints.length > 1 && drawingPoints.length > 1) {
                for (let i = 0; i < eraserPathPoints.length - 1; i++) {
                    for (let j = 0; j < drawingPoints.length - 1; j++) {
                        if (this.#_doIntersect(eraserPathPoints[i], eraserPathPoints[i + 1], drawingPoints[j], drawingPoints[j + 1])) {
                            collisionFound = true;
                            break;
                        }
                    }
                    if (collisionFound) break;
                }
            }
            
            if (!collisionFound) {
                const collisionThresholdSq = (eraserRadius + drawing.lineWidth / 2) ** 2;
                for (const p of drawingPoints) {
                    if (eraserPathPoints.length === 1) {
                        if (((p.x - eraserPathPoints[0].x) ** 2 + (p.y - eraserPathPoints[0].y) ** 2) < collisionThresholdSq) {
                            collisionFound = true;
                            break;
                        }
                    } else {
                        for (let i = 0; i < eraserPathPoints.length - 1; i++) {
                            if (this.#distToSegmentSquared(p, eraserPathPoints[i], eraserPathPoints[i + 1]) < collisionThresholdSq) {
                                collisionFound = true;
                                break;
                            }
                        }
                    }
                    if (collisionFound) break;
                }

                if (!collisionFound) {
                    for (const ep of eraserPathPoints) {
                        if (drawingPoints.length === 1) {
                            if (((ep.x - drawingPoints[0].x) ** 2 + (ep.y - drawingPoints[0].y) ** 2) < collisionThresholdSq) {
                                collisionFound = true;
                                break;
                            }
                        } else {
                            for (let i = 0; i < drawingPoints.length - 1; i++) {
                                if (this.#distToSegmentSquared(ep, drawingPoints[i], drawingPoints[i + 1]) < collisionThresholdSq) {
                                    collisionFound = true;
                                    break;
                                }
                            }
                        }
                        if (collisionFound) break;
                    }
                }
            }

            if (collisionFound) {
                drawingsToDelete.add(drawing);
            }
        }

        if (drawingsToDelete.size > 0) {
            this.#drawings = this.#drawings.filter(d => {
                if (drawingsToDelete.has(d)) {
                    if (d.bbox) {
                        this.#addDirtyRect(d.bbox);
                    }
                    this.#pointPool.releaseArray(d.points);
                    this.#pathPool.release(d);
                    return false;
                }
                return true;
            });
            this.#rebuildQuadtree();
            this.#redrawCommittedDrawings();
        }
    }

    #redrawCommittedDrawings() {
        this.#committedNoteCtx.clearRect(0, 0, this.#committedNoteCanvas.width, this.#committedNoteCanvas.height);
        this.#committedHighlightCtx.clearRect(0, 0, this.#committedHighlightCanvas.width, this.#committedHighlightCanvas.height);
        for (const path of this.#drawings) {
            const context = path.tool === AnnotationApp.TOOL_PEN ? this.#committedNoteCtx : this.#committedHighlightCtx;
            this.#drawSinglePathOnContext(path, context, false);
        }
        this.#addDirtyRect({ x: 0, y: 0, width: this.#totalWidth, height: this.#totalHeight });
        this.#requestRender();
    }

    #addDirtyRect(rect) {
        if (!rect) return;
        this.#dirtyRects.push(rect);
    }
    
    #mergeDirtyRects() {
        if (this.#dirtyRects.length <= 1) return;
        const merged = [];
        let rects = [...this.#dirtyRects];
        while (rects.length > 0) {
            let base = rects.pop();
            let i = rects.length - 1;
            while (i >= 0) {
                if (base.x < rects[i].x + rects[i].width &&
                    base.x + base.width > rects[i].x &&
                    base.y < rects[i].y + rects[i].height &&
                    base.y + base.height > rects[i].y) 
                {
                    const other = rects.splice(i, 1)[0];
                    const minX = Math.min(base.x, other.x);
                    const minY = Math.min(base.y, other.y);
                    const maxX = Math.max(base.x + base.width, other.x + other.width);
                    const maxY = Math.max(base.y + base.height, other.y + other.height);
                    base = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
                }
                i--;
            }
            merged.push(base);
        }
        this.#dirtyRects = merged;
    }

    #render() {
        if (this.#currentPath) {
            this.#addDirtyRect(this.#currentPath.bbox);
        }
        if (this.#dirtyRects.length === 0) return;
        this.#mergeDirtyRects();
        const rectsToRender = this.#dirtyRects;
        this.#dirtyRects = [];
        this.#redrawInDirtyRects(rectsToRender);
        if (this.#currentPath && (this.#isDrawing || this.#interactionState === AnnotationApp.INTERACTION_STATE_DRAWING)) {
            const context = this.#currentPath.tool === AnnotationApp.TOOL_HIGHLIGHTER ? this.#highlightCtx : this.#noteCtx;
            this.#drawSinglePathOnContext(this.#currentPath, context, true);
        }
    }

    #redrawInDirtyRects(rects) {
        rects.forEach(dirtyRect => {
            if (!dirtyRect) return;
            const vx1 = this.#scrollOffsetX;
            const vy1 = this.#scrollOffsetY;
            const vx2 = vx1 + this.#viewportWidth;
            const vy2 = vy1 + this.#viewportHeight;
            const rx1 = dirtyRect.x;
            const ry1 = dirtyRect.y;
            const rx2 = rx1 + dirtyRect.width;
            const ry2 = ry1 + dirtyRect.height;
            const ix1 = Math.max(vx1, rx1);
            const iy1 = Math.max(vy1, ry1);
            const ix2 = Math.min(vx2, rx2);
            const iy2 = Math.min(vy2, ry2);
            const iWidth = ix2 - ix1;
            const iHeight = iy2 - iy1;
            if (iWidth > 0 && iHeight > 0) {
                const dx = ix1 - vx1;
                const dy = iy1 - vy1;
                this.#noteCtx.clearRect(dx, dy, iWidth, iHeight);
                this.#highlightCtx.clearRect(dx, dy, iWidth, iHeight);
                if (this.#committedHighlightCanvas.width > 0) {
                     this.#highlightCtx.drawImage(this.#committedHighlightCanvas, ix1, iy1, iWidth, iHeight, dx, dy, iWidth, iHeight);
                }
                if (this.#committedNoteCanvas.width > 0) {
                    this.#noteCtx.drawImage(this.#committedNoteCanvas, ix1, iy1, iWidth, iHeight, dx, dy, iWidth, iHeight);
                }
            }
        });
    }

    #drawSinglePathOnContext(path, context, isLive) {
        if (!path || !path.points.length) return;
        const originalGCO = context.globalCompositeOperation;
        const originalGA = context.globalAlpha;
        this.#setupDrawingContextStyle(path, context);
        if (path.tool === AnnotationApp.TOOL_ERASER && !((this.#isDrawing || this.#interactionState === AnnotationApp.INTERACTION_STATE_DRAWING) && path === this.#currentPath)) {
            context.globalCompositeOperation = originalGCO;
            context.globalAlpha = originalGA;
            return;
        }
        this.#drawPathPointsOnContext(path, context, isLive);
        context.globalCompositeOperation = originalGCO;
        context.globalAlpha = originalGA;
    }

    #setupDrawingContextStyle(path, context) {
        context.beginPath();
        context.lineCap = "round";
        context.lineJoin = "round";
        let gco = 'source-over';
        let alpha = path.opacity !== undefined ? path.opacity : 1.0;
        let strokeStyle = path.color || '#000000';
        let lineWidth = path.lineWidth || 1;
        if (path.tool === AnnotationApp.TOOL_ERASER && (this.#isDrawing || this.#interactionState === AnnotationApp.INTERACTION_STATE_DRAWING) && path === this.#currentPath) {
            strokeStyle = "rgba(200, 0, 0, 0.6)";
            lineWidth = path.lineWidth;
            alpha = 0.6;
        } else if (path.tool === AnnotationApp.TOOL_HIGHLIGHTER) {
            gco = 'darken';
        }
        context.strokeStyle = strokeStyle;
        context.lineWidth = lineWidth;
        context.globalAlpha = alpha;
        context.globalCompositeOperation = gco;
    }

    #drawPathPointsOnContext(path, context, isLive) {
        if (!path.points.length) return;
        const first = this.#transformPointIfRequired(path.points[0], isLive);
        context.moveTo(first.x, first.y);
        for (let i = 1; i < path.points.length; i++) {
            const pt = this.#transformPointIfRequired(path.points[i], isLive);
            context.lineTo(pt.x, pt.y);
        }
        context.stroke();
    }

    #transformPointIfRequired(point, transform) {
        return transform ? { x: point.x - this.#scrollOffsetX, y: point.y - this.#scrollOffsetY } : point;
    }

    selectTool(toolName) {
        this.#currentTool = toolName;
        this.updateActiveToolButtonVisuals();
        this.updateToolSettingsVisibility();
    }

    updateActiveToolButtonVisuals() {
        const buttons = {
            [AnnotationApp.TOOL_PEN]: this.#penBtn,
            [AnnotationApp.TOOL_HIGHLIGHTER]: this.#highlighterBtn,
            [AnnotationApp.TOOL_ERASER]: this.#eraserBtn
        };
        for (const tool in buttons) {
            if (buttons[tool]) buttons[tool].classList.toggle("active", this.#currentTool === tool);
        }
    }

    clearAllAnnotations() {
        if (window.confirm("آیا مطمئن هستید که می‌خواهید تمام یادداشت‌ها و هایلایت‌ها را پاک کنید؟ این عمل قابل بازگشت نیست.")) {
            this.#drawings.forEach(path => {
                this.#pointPool.releaseArray(path.points);
                this.#pathPool.release(path);
            });
            this.#drawings = [];
            this.#rebuildQuadtree();
            localStorage.removeItem(this.#storageKey);
            this.#redrawCommittedDrawings();
        }
    }

    saveDrawings() {
        try {
            const storableDrawings = this.#drawings
                .filter(p => p.tool !== AnnotationApp.TOOL_ERASER)
                .map(p => ({ tool: p.tool, points: p.points, color: p.color, lineWidth: p.lineWidth, opacity: p.opacity }));
            localStorage.setItem(this.#storageKey, JSON.stringify(storableDrawings));
        } catch {}
    }

    loadDrawings() {
        const savedData = localStorage.getItem(this.#storageKey);
        if (savedData) {
            try {
                const loadedDrawings = JSON.parse(savedData);
                this.#drawings = loadedDrawings.map(d => {
                    const path = this.#pathPool.acquire();
                    Object.assign(path, d);
                    path.bbox = this.#calculatePathBbox(path);
                    return path;
                });
                this.#normalizeLoadedDrawingsProperties();
            } catch {
                this.#drawings = [];
                // localStorage.removeItem(this.#storageKey);
            }
        } else this.#drawings = [];
        this.#rebuildQuadtree();
        this.#redrawCommittedDrawings();
    }

    #normalizeLoadedDrawingsProperties() {
        for (const path of this.#drawings) {
            if (path.opacity === undefined) path.opacity = path.tool === AnnotationApp.TOOL_HIGHLIGHTER ? this.#HIGHLIGHTER_OPACITY : 1.0;
            if (path.lineWidth === undefined) {
                switch (path.tool) {
                    case AnnotationApp.TOOL_PEN: path.lineWidth = this.#penLineWidth; break;
                    case AnnotationApp.TOOL_HIGHLIGHTER: path.lineWidth = this.#highlighterLineWidth; break;
                    default: path.lineWidth = 1; break;
                }
            }
        }
    }

    destroy() {
        window.removeEventListener("resize", this.#boundUpdateVirtualCanvas);
        window.removeEventListener("scroll", this.#boundUpdateVirtualCanvas);
        if (this.#virtualCanvasContainer) this.#virtualCanvasContainer.remove();
        if (this.#toolsPanel && this.#toolsPanel.parentElement) this.#toolsPanel.remove();
        if (this.#masterAnnotationToggleBtn && this.#masterAnnotationToggleBtn.parentElement) this.#masterAnnotationToggleBtn.remove();
        Object.keys(this).forEach(key => this[key] = null);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.annotationAppInstance = new AnnotationApp("body");
});