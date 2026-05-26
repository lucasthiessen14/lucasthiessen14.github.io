/*!
    Lucas Thiessen portfolio — procedural maze explore mode
*/

(function () {
    'use strict';

    var SECTION_IDS = ['hero', 'about', 'experience', 'education', 'projects', 'skills', 'contact'];

    var SECTION_LABELS = {
        hero: 'Home',
        about: 'About Me',
        experience: 'Experience',
        education: 'Education',
        projects: 'Featured Projects',
        skills: 'Skills',
        contact: 'Get in Touch'
    };

    var SECTION_SHORT = {
        hero: 'Home',
        about: 'About',
        experience: 'Work',
        education: 'School',
        projects: 'Projects',
        skills: 'Skills',
        contact: 'Contact'
    };

    var MIN_MAZE_ROOMS_W = 13;
    var MIN_MAZE_ROOMS_H = 9;
    var MAX_MAZE_ROOMS_W = 36;
    var MAX_MAZE_ROOMS_H = 28;
    var VIEWPORT_CELL_BUFFER = 6;
    var CELL_SIZE = 36;
    var VISION_RADIUS = 4;
    var MOVE_MS_INITIAL = 130;
    var MOVE_MS_MIN = 50;
    var MOVE_RAMP_MS = 800;
    var SECTION_COUNT = 7;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var maze = [];
    var sectionCells = {};
    var visited = new Set();
    var found = new Set();
    var explored = new Set();
    var player = { row: 1, col: 1 };
    var startPos = { row: 1, col: 1 };
    var pendingSectionId = null;
    var modalOpen = false;
    var keysDown = {};
    var heldDir = null;
    var holdStartedAt = 0;
    var moveLoopActive = false;
    var moveLoopId = null;
    var lastMoveTime = 0;
    var blockedByWall = false;
    var lastClassicSection = 'hero';
    var focusBeforeModal = null;

    var gameEl;
    var viewportEl;
    var mazeWorldEl;
    var mazeGridEl;
    var avatarEl;
    var modalEl;
    var modalBackdropEl;
    var modalTitleEl;
    var modalBodyEl;
    var progressEl;
    var promptEl;
    var promptTextEl;
    var promptOpenBtn;
    var cellEls = [];

    function $(sel, ctx) {
        return (ctx || document).querySelector(sel);
    }

    function cellKey(row, col) {
        return row + ',' + col;
    }

    function shuffle(arr) {
        var copy = arr.slice();
        for (var i = copy.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    function getViewportSize() {
        if (viewportEl && viewportEl.clientWidth > 0 && viewportEl.clientHeight > 0) {
            return {
                width: viewportEl.clientWidth,
                height: viewportEl.clientHeight
            };
        }

        var navHeight = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 64;
        return {
            width: window.innerWidth,
            height: Math.max(320, window.innerHeight - navHeight)
        };
    }

    function computeRoomCount() {
        var view = getViewportSize();
        var minGridW = Math.ceil(view.width / CELL_SIZE) + VIEWPORT_CELL_BUFFER;
        var minGridH = Math.ceil(view.height / CELL_SIZE) + VIEWPORT_CELL_BUFFER;
        var roomsW = Math.ceil((minGridW - 1) / 2);
        var roomsH = Math.ceil((minGridH - 1) / 2);

        return {
            roomsW: Math.min(MAX_MAZE_ROOMS_W, Math.max(MIN_MAZE_ROOMS_W, roomsW)),
            roomsH: Math.min(MAX_MAZE_ROOMS_H, Math.max(MIN_MAZE_ROOMS_H, roomsH))
        };
    }

    function padMazeToViewport(grid) {
        var view = getViewportSize();
        var minCols = Math.ceil(view.width / CELL_SIZE);
        var minRows = Math.ceil(view.height / CELL_SIZE);

        while (grid[0].length < minCols) {
            for (var r = 0; r < grid.length; r++) {
                grid[r].push('#');
            }
        }

        while (grid.length < minRows) {
            grid.push(Array(grid[0].length).fill('#'));
        }

        return grid;
    }

    function generateMazeGrid(roomsW, roomsH) {
        var width = roomsW * 2 + 1;
        var height = roomsH * 2 + 1;
        var grid = [];

        for (var r = 0; r < height; r++) {
            grid[r] = [];
            for (var c = 0; c < width; c++) {
                grid[r][c] = '#';
            }
        }

        function carve(row, col) {
            grid[row][col] = '.';

            var directions = shuffle([
                [0, -2],
                [0, 2],
                [-2, 0],
                [2, 0]
            ]);

            directions.forEach(function (dir) {
                var nr = row + dir[0];
                var nc = col + dir[1];
                if (nr <= 0 || nc <= 0 || nr >= height - 1 || nc >= width - 1) return;
                if (grid[nr][nc] !== '#') return;
                grid[row + dir[0] / 2][col + dir[1] / 2] = '.';
                carve(nr, nc);
            });
        }

        carve(1, 1);
        return grid;
    }

    function getFloorCells(grid) {
        var floors = [];
        for (var r = 1; r < grid.length - 1; r++) {
            for (var c = 1; c < grid[r].length - 1; c++) {
                if (grid[r][c] === '.') {
                    floors.push({ row: r, col: c });
                }
            }
        }
        return floors;
    }

    function cellDistance(a, b) {
        return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    }

    function placeSections(grid) {
        var sections = {};
        var floors = getFloorCells(grid);
        var start = { row: 1, col: 1 };
        var placed = [start];

        sections[cellKey(start.row, start.col)] = 'hero';

        var remaining = SECTION_IDS.filter(function (id) {
            return id !== 'hero';
        });

        remaining.forEach(function (sectionId) {
            var best = null;
            var bestScore = -1;

            shuffle(floors).forEach(function (cell) {
                var key = cellKey(cell.row, cell.col);
                if (sections[key]) return;

                var minDist = placed.reduce(function (min, p) {
                    return Math.min(min, cellDistance(cell, p));
                }, Infinity);

                if (minDist > bestScore) {
                    bestScore = minDist;
                    best = cell;
                }
            });

            if (!best) {
                best = floors.find(function (cell) {
                    return !sections[cellKey(cell.row, cell.col)];
                });
            }

            if (best) {
                sections[cellKey(best.row, best.col)] = sectionId;
                placed.push(best);
            }
        });

        return sections;
    }

    function buildMaze() {
        var dims = computeRoomCount();
        maze = generateMazeGrid(dims.roomsW, dims.roomsH);
        maze = padMazeToViewport(maze);
        sectionCells = placeSections(maze);
        startPos = { row: 1, col: 1 };
        player = { row: startPos.row, col: startPos.col };
    }

    function isWall(row, col) {
        if (row < 0 || col < 0 || row >= maze.length || col >= maze[0].length) return true;
        return maze[row][col] === '#';
    }

    function updateProgress() {
        if (!progressEl) return;
        progressEl.textContent = visited.size + ' / ' + SECTION_COUNT + ' discovered';
    }

    function isGameMode() {
        return document.documentElement.getAttribute('data-ui') === 'game';
    }

    function visionDistance(row, col) {
        return Math.hypot(row - player.row, col - player.col);
    }

    function updateFog() {
        cellEls.forEach(function (entry) {
            var dist = visionDistance(entry.row, entry.col);
            var key = cellKey(entry.row, entry.col);
            var el = entry.el;

            el.classList.remove('is-visible', 'is-explored', 'is-hidden');

            if (dist <= VISION_RADIUS) {
                el.classList.add('is-visible');
                explored.add(key);
            } else if (explored.has(key)) {
                el.classList.add('is-explored');
            } else {
                el.classList.add('is-hidden');
            }
        });
    }

    function getCameraOffsets() {
        var viewW = viewportEl ? viewportEl.clientWidth : 0;
        var viewH = viewportEl ? viewportEl.clientHeight : 0;
        var playerX = player.col * CELL_SIZE + CELL_SIZE / 2;
        var playerY = player.row * CELL_SIZE + CELL_SIZE / 2;
        var offsetX = viewW / 2 - playerX;
        var offsetY = viewH / 2 - playerY;
        var mazeW = maze[0].length * CELL_SIZE;
        var mazeH = maze.length * CELL_SIZE;

        offsetX = Math.min(0, Math.max(viewW - mazeW, offsetX));
        offsetY = Math.min(0, Math.max(viewH - mazeH, offsetY));

        return { offsetX: offsetX, offsetY: offsetY, playerX: playerX, playerY: playerY };
    }

    function updateCamera() {
        if (!viewportEl || !mazeWorldEl) return;
        var cam = getCameraOffsets();
        mazeWorldEl.style.transform = 'translate(' + cam.offsetX + 'px, ' + cam.offsetY + 'px)';
    }

    function positionAvatar() {
        if (!avatarEl || !viewportEl) return;
        var cam = getCameraOffsets();
        avatarEl.style.left = cam.offsetX + cam.playerX + 'px';
        avatarEl.style.top = cam.offsetY + cam.playerY + 'px';
    }

    function refreshView() {
        updateFog();
        positionAvatar();
        updateCamera();
        updateSectionPrompt();
    }

    function cloneSectionContent(sectionId) {
        var section = document.getElementById(sectionId);
        if (!section) return null;

        if (sectionId === 'hero') {
            var heroContent = section.querySelector('.hero__content');
            if (!heroContent) return null;

            var clone = heroContent.cloneNode(true);
            var touchBtn = clone.querySelector('.hero__cta a[href="#contact"]');
            if (touchBtn) touchBtn.remove();

            var resumeLink = clone.querySelector('.hero__cta a[href*="Resume"]');
            if (resumeLink) {
                resumeLink.setAttribute('target', '_blank');
                resumeLink.setAttribute('rel', 'noopener noreferrer');
            }

            return clone;
        }

        if (sectionId === 'contact') {
            var contactInner = section.querySelector('.contact__inner');
            return contactInner ? contactInner.cloneNode(true) : null;
        }

        if (sectionId === 'projects') {
            var projectsContainer = section.querySelector('.container');
            if (!projectsContainer) return null;

            var projectsClone = projectsContainer.cloneNode(true);
            var moreProjects = projectsClone.querySelector('.projects__more');
            if (moreProjects) moreProjects.hidden = false;

            var projectsActions = projectsClone.querySelector('.projects__actions');
            if (projectsActions) projectsActions.remove();

            return projectsClone;
        }

        var container = section.querySelector('.container');
        return container ? container.cloneNode(true) : null;
    }

    function stripDuplicateIds(root) {
        if (!root) return;
        if (root.id) root.removeAttribute('id');
        root.querySelectorAll('[id]').forEach(function (el) {
            el.removeAttribute('id');
        });
    }

    function mountModalHooks() {
        if (window.Portfolio && window.Portfolio.initPanelHooks) {
            window.Portfolio.initPanelHooks(modalBodyEl);
        }
    }

    function openSectionModal(sectionId) {
        if (!modalEl || !modalBodyEl || !modalTitleEl) return;

        var content = cloneSectionContent(sectionId);
        if (!content) return;

        stripDuplicateIds(content);
        modalTitleEl.textContent = SECTION_LABELS[sectionId] || sectionId;
        modalBodyEl.replaceChildren(content);
        modalEl.hidden = false;
        modalOpen = true;
        stopMoveLoop();
        focusBeforeModal = document.activeElement;
        lastClassicSection = sectionId;

        markSectionVisited(sectionId);
        mountModalHooks();

        requestAnimationFrame(function () {
            modalEl.classList.add('is-open');
            var closeBtn = $('#game-modal-close');
            if (closeBtn) closeBtn.focus();
        });
    }

    function closeSectionModal() {
        if (!modalEl || modalEl.hidden) return;

        modalEl.classList.remove('is-open');
        modalOpen = false;

        window.setTimeout(function () {
            modalEl.hidden = true;
            modalBodyEl.replaceChildren();
            if (focusBeforeModal && focusBeforeModal.focus) {
                focusBeforeModal.focus();
            } else if (viewportEl) {
                viewportEl.focus();
            }
            updateSectionPrompt();
        }, prefersReducedMotion ? 0 : 260);
    }

    function updateSectionMarkers() {
        cellEls.forEach(function (entry) {
            if (!entry.sectionId) return;
            entry.el.classList.toggle('is-visited', visited.has(entry.sectionId));
            entry.el.classList.toggle('is-found', found.has(entry.sectionId));

            var check = entry.el.querySelector('.game-mode__section-check');
            if (visited.has(entry.sectionId) && !check) {
                check = document.createElement('span');
                check.className = 'game-mode__section-check';
                check.textContent = '✓';
                check.setAttribute('aria-hidden', 'true');
                entry.el.appendChild(check);
            } else if (!visited.has(entry.sectionId) && check) {
                check.remove();
            }
        });
    }

    function markSectionFound(sectionId) {
        if (!sectionId || found.has(sectionId)) return;
        found.add(sectionId);
        updateSectionMarkers();
    }

    function markSectionVisited(sectionId) {
        visited.add(sectionId);
        found.add(sectionId);
        updateProgress();
        updateSectionMarkers();
    }

    function updateSectionPrompt() {
        pendingSectionId = sectionCells[cellKey(player.row, player.col)] || null;

        if (!promptEl || !promptTextEl || !promptOpenBtn) return;

        if (pendingSectionId && !modalOpen) {
            markSectionFound(pendingSectionId);
            promptEl.hidden = false;
            promptTextEl.textContent = 'You found ' + SECTION_LABELS[pendingSectionId] + '. Press Enter or tap Open to view.';
            promptOpenBtn.textContent = 'Open ' + SECTION_SHORT[pendingSectionId];
        } else {
            promptEl.hidden = true;
        }
    }

    function tryOpenPendingSection() {
        if (!pendingSectionId || modalOpen) return;
        openSectionModal(pendingSectionId);
    }

    function getMoveInterval() {
        if (!holdStartedAt) return MOVE_MS_INITIAL;
        var elapsed = performance.now() - holdStartedAt;
        var t = Math.min(1, elapsed / MOVE_RAMP_MS);
        t = t * t;
        return MOVE_MS_INITIAL - (MOVE_MS_INITIAL - MOVE_MS_MIN) * t;
    }

    function applyMoveTransition(ms) {
        if (prefersReducedMotion || !avatarEl) return;
        var duration = ms + 'ms';
        avatarEl.style.transitionDuration = duration;
        avatarEl.style.transitionTimingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)';
        if (mazeWorldEl) {
            mazeWorldEl.style.transitionDuration = duration;
            mazeWorldEl.style.transitionTimingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)';
        }
        if (avatarEl.classList.contains('is-walking')) {
            avatarEl.style.animationDuration = Math.max(0.07, ms / 1000 * 0.75) + 's';
        }
    }

    function directionFromKey(key) {
        if (key === 'ArrowUp' || key === 'w' || key === 'W') return { dr: -1, dc: 0 };
        if (key === 'ArrowDown' || key === 's' || key === 'S') return { dr: 1, dc: 0 };
        if (key === 'ArrowLeft' || key === 'a' || key === 'A') return { dr: 0, dc: -1 };
        if (key === 'ArrowRight' || key === 'd' || key === 'D') return { dr: 0, dc: 1 };
        return null;
    }

    function directionsEqual(a, b) {
        return a && b && a.dr === b.dr && a.dc === b.dc;
    }

    function refreshHeldDirection() {
        var priority = ['ArrowUp', 'w', 'W', 'ArrowDown', 's', 'S', 'ArrowLeft', 'a', 'A', 'ArrowRight', 'd', 'D'];
        var i;
        for (i = 0; i < priority.length; i++) {
            if (keysDown[priority[i]]) {
                heldDir = directionFromKey(priority[i]);
                return;
            }
        }
        heldDir = null;
    }

    function stopMoveLoop() {
        moveLoopActive = false;
        holdStartedAt = 0;
        lastMoveTime = 0;
        blockedByWall = false;
        if (moveLoopId) {
            cancelAnimationFrame(moveLoopId);
            moveLoopId = null;
        }
        if (avatarEl) avatarEl.classList.remove('is-walking');
    }

    function startMoveLoop() {
        if (moveLoopActive || !heldDir) return;
        moveLoopActive = true;
        lastMoveTime = 0;

        function tick(now) {
            if (!moveLoopActive || !heldDir || modalOpen || !isGameMode()) {
                stopMoveLoop();
                return;
            }

            var interval = prefersReducedMotion ? MOVE_MS_MIN : getMoveInterval();
            if (!lastMoveTime) lastMoveTime = now;

            if (now - lastMoveTime >= interval) {
                tryMove(heldDir.dr, heldDir.dc);
                lastMoveTime = now;
            }

            moveLoopId = requestAnimationFrame(tick);
        }

        moveLoopId = requestAnimationFrame(tick);
    }

    function snapAvatarPosition() {
        if (prefersReducedMotion || !avatarEl) return;

        avatarEl.style.transition = 'none';
        if (mazeWorldEl) mazeWorldEl.style.transition = 'none';
        positionAvatar();
        updateCamera();

        requestAnimationFrame(function () {
            if (avatarEl) avatarEl.style.transition = '';
            if (mazeWorldEl) mazeWorldEl.style.transition = '';
        });
    }

    function tryMove(dr, dc) {
        if (!isGameMode() || modalOpen) return false;

        var nr = player.row + dr;
        var nc = player.col + dc;
        if (isWall(nr, nc)) {
            if (avatarEl) avatarEl.classList.remove('is-walking');
            if (!blockedByWall) {
                blockedByWall = true;
                snapAvatarPosition();
            }
            return false;
        }

        blockedByWall = false;

        var interval = prefersReducedMotion ? MOVE_MS_MIN : getMoveInterval();
        applyMoveTransition(interval);

        player.row = nr;
        player.col = nc;
        explored.add(cellKey(nr, nc));
        if (avatarEl) avatarEl.classList.add('is-walking');
        refreshView();
        return true;
    }

    function moveFromKey(key) {
        var dir = directionFromKey(key);
        if (!dir) return false;
        return tryMove(dir.dr, dir.dc);
    }

    function beginHeldMove(key) {
        var dir = directionFromKey(key);
        if (!dir) return false;

        var dirChanged = !directionsEqual(heldDir, dir);
        keysDown[key] = true;
        heldDir = dir;

        if (dirChanged) {
            holdStartedAt = performance.now();
            blockedByWall = false;
        }

        if (!moveLoopActive) {
            tryMove(dir.dr, dir.dc);
            startMoveLoop();
        }

        return true;
    }

    function renderMaze() {
        if (!mazeGridEl) return;

        mazeGridEl.innerHTML = '';
        cellEls = [];

        var cols = maze[0].length;
        var rows = maze.length;

        mazeGridEl.style.gridTemplateColumns = 'repeat(' + cols + ', ' + CELL_SIZE + 'px)';
        mazeGridEl.style.gridTemplateRows = 'repeat(' + rows + ', ' + CELL_SIZE + 'px)';
        mazeGridEl.style.width = cols * CELL_SIZE + 'px';
        mazeGridEl.style.height = rows * CELL_SIZE + 'px';

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var cell = document.createElement('div');
                cell.className = 'game-mode__cell';
                cell.setAttribute('data-row', String(r));
                cell.setAttribute('data-col', String(c));

                if (maze[r][c] === '#') {
                    cell.classList.add('is-wall');
                } else {
                    cell.classList.add('is-floor');
                }

                var sectionId = sectionCells[cellKey(r, c)];
                if (sectionId) {
                    cell.classList.add('is-section');
                    cell.setAttribute('data-section', sectionId);
                    if (found.has(sectionId)) {
                        cell.classList.add('is-found');
                    }
                    if (visited.has(sectionId)) {
                        cell.classList.add('is-visited');
                    }

                    var marker = document.createElement('span');
                    marker.className = 'game-mode__section-marker';
                    marker.textContent = SECTION_SHORT[sectionId] || sectionId;
                    marker.setAttribute('aria-hidden', 'true');
                    cell.appendChild(marker);

                    if (visited.has(sectionId)) {
                        var check = document.createElement('span');
                        check.className = 'game-mode__section-check';
                        check.textContent = '✓';
                        check.setAttribute('aria-hidden', 'true');
                        cell.appendChild(check);
                    }
                }

                mazeGridEl.appendChild(cell);
                cellEls.push({ row: r, col: c, el: cell, sectionId: sectionId || null });
            }
        }
    }

    function onKeyDown(e) {
        if (!isGameMode()) return;

        if (e.key === 'Escape') {
            if (modalOpen) {
                e.preventDefault();
                closeSectionModal();
            }
            return;
        }

        if (modalOpen) return;

        if (e.key === 'Enter' || e.key === ' ') {
            if (pendingSectionId) {
                e.preventDefault();
                tryOpenPendingSection();
            }
            return;
        }

        if (beginHeldMove(e.key)) {
            e.preventDefault();
        }
    }

    function onKeyUp(e) {
        if (!isGameMode()) return;
        if (!directionFromKey(e.key)) return;

        delete keysDown[e.key];
        var prev = heldDir;
        refreshHeldDirection();

        if (!heldDir) {
            stopMoveLoop();
        } else if (!directionsEqual(prev, heldDir)) {
            holdStartedAt = performance.now();
            lastMoveTime = 0;
            blockedByWall = false;
        }
    }

    function onWindowBlur() {
        keysDown = {};
        stopMoveLoop();
        heldDir = null;
    }

    function trapModalFocus(e) {
        if (!modalOpen || !modalEl || e.key !== 'Tab') return;

        var dialog = modalEl.querySelector('.game-mode__modal-dialog');
        if (!dialog) return;

        var focusable = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function bindTouchControls() {
        var pad = $('#game-dpad');
        if (!pad) return;

        pad.querySelectorAll('[data-move]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var dir = btn.getAttribute('data-move');
                if (dir === 'up') moveFromKey('ArrowUp');
                if (dir === 'down') moveFromKey('ArrowDown');
                if (dir === 'left') moveFromKey('ArrowLeft');
                if (dir === 'right') moveFromKey('ArrowRight');
            });
        });
    }

    function resetSession() {
        visited = new Set();
        found = new Set();
        explored = new Set();
        player = { row: startPos.row, col: startPos.col };
        explored.add(cellKey(player.row, player.col));
        pendingSectionId = null;
        updateProgress();
    }

    function regenerateMaze() {
        buildMaze();
        renderMaze();
        resetSession();
        refreshView();
    }

    function showGameShell() {
        if (!gameEl) return;

        gameEl.hidden = false;
        gameEl.setAttribute('aria-hidden', 'false');
        document.body.classList.add('game-active');

        window.requestAnimationFrame(function () {
            regenerateMaze();
            if (viewportEl) viewportEl.focus();
            window.requestAnimationFrame(refreshView);
        });
    }

    function hideGameShell() {
        if (!gameEl) return;
        stopMoveLoop();
        keysDown = {};
        heldDir = null;
        closeSectionModal();
        gameEl.hidden = true;
        gameEl.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('game-active');
    }

    function scrollToClassicSection(sectionId) {
        var el = document.getElementById(sectionId);
        if (!el) return;
        var navHeight = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 64;
        window.scrollTo(0, el.getBoundingClientRect().top + window.pageYOffset - navHeight + 1);
    }

    function onUiModeChange(mode) {
        if (mode === 'game') {
            showGameShell();
        } else {
            hideGameShell();
            scrollToClassicSection(lastClassicSection || 'hero');
        }
    }

    function bindControls() {
        var exitBtn = $('#game-exit');
        if (exitBtn) {
            exitBtn.addEventListener('click', function () {
                if (window.Portfolio && window.Portfolio.setUiMode) {
                    window.Portfolio.setUiMode('classic');
                }
            });
        }

        var closeBtn = $('#game-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSectionModal);
        }

        if (modalBackdropEl) {
            modalBackdropEl.addEventListener('click', closeSectionModal);
        }

        if (promptOpenBtn) {
            promptOpenBtn.addEventListener('click', tryOpenPendingSection);
        }
    }

    function initGameMode() {
        gameEl = $('#game-mode');
        viewportEl = $('#game-viewport');
        mazeWorldEl = $('#game-maze-world');
        mazeGridEl = $('#game-maze');
        avatarEl = $('#game-avatar');
        modalEl = $('#game-modal');
        modalBackdropEl = $('#game-modal-backdrop');
        modalTitleEl = $('#game-modal-title');
        modalBodyEl = $('#game-modal-body');
        progressEl = $('#game-progress');
        promptEl = $('#game-section-prompt');
        promptTextEl = $('#game-prompt-text');
        promptOpenBtn = $('#game-prompt-open');

        if (!gameEl) return;

        bindControls();
        bindTouchControls();

        window.addEventListener('resize', function () {
            if (isGameMode()) refreshView();
        });

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        document.addEventListener('keydown', trapModalFocus);
        window.addEventListener('blur', onWindowBlur);

        document.addEventListener('ui-mode-change', function (e) {
            onUiModeChange(e.detail && e.detail.mode);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGameMode);
    } else {
        initGameMode();
    }
})();
