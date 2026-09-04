/**
 * WikiExplore - Main JavaScript Application
 * Handles Article Rendering, Search, Filtering, Sorting, Bookmarks, and Dark Theme.
 */

// ==========================================================================
// 1. ARTICLES DATABASE (Static Sample Data)
// ==========================================================================
// ==========================================================================
// 1. LEGACY LOCAL ARTICLES -> WIKIPEDIA MAPPING
//    The static database was retired in v3; these maps keep old
//    bookmarks / history / deep links pointing at the right page.
// ==========================================================================
const LOCAL_TO_WIKI = {
    'ai': 'Artificial intelligence',
    'solar-system': 'Solar System',
    'computer-science': 'Computer science',
    'world-war-ii': 'World War II',
    'climate-change': 'Climate change',
    'renewable-energy': 'Renewable energy',
    'space-exploration': 'Space exploration',
    'internet': 'Internet',
    'quantum-physics': 'Quantum mechanics',
    'geography-earth': 'Earth'
};

// ==========================================================================
// 2. STATE MANAGEMENT
// ==========================================================================
let currentFilter = 'all';
let currentSort = 'default';
// localStorage-backed persistence keys
const STORAGE_KEYS = {
    theme: 'wikiexplore-theme',
    bookmarks: 'wikiexplore-bookmarks',
    recent: 'wikiexplore-recent',
    migrated: 'wikiexplore-v3-migrated'
};

const RECENT_LIMIT = 5;

// Used only when the live most-read seed cannot be fetched.
const DEFAULT_RECENT = [
    { title: 'Artificial intelligence', id: 'wiki:Artificial%20intelligence' },
    { title: 'Solar System', id: 'wiki:Solar%20System' },
    { title: 'World War II', id: 'wiki:World%20War%20II' }
];

function getStored(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
}

function setStored(key, value) {
    try { localStorage.setItem(key, value); } catch (err) {}
}

function loadStoredArray(key, fallback) {
    const raw = getStored(key);
    if (!raw) return fallback;
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (err) {
        return fallback;
    }
}

/** One-time v3 migration: rewrite local ids (bookmarks, recents, history) to wiki: ids. */
function migrateV3Data() {
    try {
        if (getStored(STORAGE_KEYS.migrated)) return;
        const migrateId = function (id) {
            if (!id) return id;
            if (String(id).indexOf('wiki:') === 0) return id;
            const wikiTitle = LOCAL_TO_WIKI[id];
            return wikiTitle ? 'wiki:' + encodeURIComponent(wikiTitle) : id;
        };
        const migrateList = function (raw) {
            if (!raw) return raw;
            try {
                const arr = JSON.parse(raw);
                if (!Array.isArray(arr)) return raw;
                const out = [];
                arr.forEach(function (item) {
                    if (item && typeof item === 'object' && item.id) {
                        item.id = migrateId(item.id);
                        out.push(item);
                    } else if (typeof item === 'string') {
                        // Bookmark lists are plain string ids; skip junk from
                        // pre-v3 card bugs and map legacy local ids.
                        if (/\+ article|</.test(item)) return;
                        out.push(migrateId(item));
                    }
                });
                return JSON.stringify(out);
            } catch (err) { return raw; }
        };
        const b = getStored(STORAGE_KEYS.bookmarks);
        if (b) setStored(STORAGE_KEYS.bookmarks, migrateList(b));
        const r = getStored(STORAGE_KEYS.recent);
        if (r) setStored(STORAGE_KEYS.recent, migrateList(r));
        const rawHistory = getStored('wikiexplore-read-history');
        if (rawHistory) setStored('wikiexplore-read-history', migrateList(rawHistory));
        setStored(STORAGE_KEYS.migrated, '1');
    } catch (err) {
        console.warn('v3 migration failed', err);
    }
}
migrateV3Data();

let bookmarkedArticles = loadStoredArray(STORAGE_KEYS.bookmarks, []);
let recentArticles = loadStoredArray(STORAGE_KEYS.recent, DEFAULT_RECENT);

// ==========================================================================
// 2c. ICON SET (inline SVG glyphs by discipline)
// ==========================================================================
const ICON_SET = {
    Science: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.8v6.4L4.6 17a2.8 2.8 0 0 0 2.4 4.2h10a2.8 2.8 0 0 0 2.4-4.2L14 9.2V2.8"/><path d="M8.6 2.8h6.8"/></svg>',
    Technology: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="6.5" width="11" height="11" rx="2"/><rect x="10.4" y="10.4" width="3.2" height="3.2"/><path d="M9.5 2.8v3.7M14.5 2.8v3.7M9.5 17.5v3.7M14.5 17.5v3.7M2.8 9.5h3.7M2.8 14.5h3.7M17.5 9.5h3.7M17.5 14.5h3.7"/></svg>',
    History: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 17.5h17"/><path d="M12 3.4 4.8 9.8h14.4z"/><path d="M8.2 9.8v7.7M12 9.8v7.7M15.8 9.8v7.7"/></svg>',
    Geography: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.2 12h17.6"/><path d="M12 3.1c3 3.6 3 14.2 0 17.8-3-3.6-3-14.2 0-17.8z"/></svg>',
    Environment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 18.5C6 10 10.5 5.4 19 4.6c.4 8.4-4 13.9-13.5 13.9z"/><path d="M5.5 18.5c1.8-6 5.6-9.6 10.2-11.3"/></svg>',
    Space: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6.2"/><ellipse cx="12" cy="12" rx="10.8" ry="3.6" transform="rotate(-18 12 12)"/></svg>'
};

// Keyword -> glyph heuristic for live pages (Wikipedia has no category field).
const WIKI_FALLBACK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.2 12h17.6"/><path d="M12 3.1c3 3.6 3 14.2 0 17.8-3-3.6-3-14.2 0-17.8z"/></svg>';
function wikiIconFor(text) {
    const hay = (text || '').toLowerCase();
    if (/(physics|quantum|chemistry|biology|science|medicine|genetics|astronom)/.test(hay)) return ICON_SET.Science;
    if (/(computer|software|ai|artificial|tech|internet|robot|digital|data|code)/.test(hay)) return ICON_SET.Technology;
    if (/(histor|war|century|empire|ancient|medieval|kingdom|revolut)/.test(hay)) return ICON_SET.History;
    if (/(geograph|earth|continent|country|mountain|river|island|map|ocean)/.test(hay)) return ICON_SET.Geography;
    if (/(environment|climate|ecolog|forest|energy|conserv|pollut|wildlife)/.test(hay)) return ICON_SET.Environment;
    if (/(space|planet|solar|galaxy|star|orbit|nasa|cosmos)/.test(hay)) return ICON_SET.Space;
    return WIKI_FALLBACK_ICON;
}


// ==========================================================================
// 3. DOM ELEMENTS
// ==========================================================================
const articlesGrid = document.getElementById('articles-grid');
const navSearchInput = document.getElementById('nav-search-input');
const searchBtn = document.getElementById('search-btn');
const searchDropdown = document.getElementById('search-dropdown');
const heroSearchInput = document.getElementById('hero-search-input');
const heroSearchBtn = document.getElementById('hero-search-btn');
const categoryPills = document.querySelectorAll('.category-pills .pill');
const categoryCards = document.querySelectorAll('.category-card');
const liveFeatured = document.getElementById('live-featured');
const livePopular = document.getElementById('live-popular');
const onThisDayList = document.getElementById('onthisday-list');
const newsList = document.getElementById('news-list');
const sortSelect = document.getElementById('sort-select');
const themeToggle = document.getElementById('theme-toggle');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mainNav = document.getElementById('main-nav');
const tocToggleBtn = document.getElementById('toc-toggle');
const tocList = document.getElementById('toc-list');
const searchModal = document.getElementById('search-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalResultsList = document.getElementById('modal-results-list');
const modalSearchTerm = document.getElementById('modal-search-term');
const clearRecentBtn = document.getElementById('clear-recent-btn');
const recentList = document.getElementById('recent-list');

// ==========================================================================
// 4. RENDERING FUNCTIONS
// ==========================================================================

// Explore grid state: an array of lightweight wiki records.
let gridArticles = [];
let gridLoading = false;

/**
 * Renders live wiki cards into the Explore grid based on active filter & sort.
 * Cards carry the same anatomy as before: glyph tile, star, title, snippet, read time.
 */
function renderArticlesGrid() {
    if (!articlesGrid) return;

    let displayList = [...gridArticles];

    if (currentFilter === 'saved') {
        if (!bookmarkedArticles.length) {
            renderEmptyGrid('No bookmarked articles yet — tap the ★ on any article to save it for later.');
            return;
        }
        const savedInGrid = displayList.filter(function (a) { return bookmarkedArticles.indexOf(a.id) > -1; });
        if (savedInGrid.length === bookmarkedArticles.length) {
            displayList = savedInGrid;
        } else {
            // The random grid doesn't hold the saved set — fetch those pages live.
            loadSavedGrid();
            return;
        }
    }

    displayList = sortArticles(currentSort, displayList);

    articlesGrid.innerHTML = '';

    if (displayList.length === 0) {
        renderEmptyGrid('No articles here yet — the feed is loading or Wikipedia is unreachable.');
        return;
    }

    displayList.forEach(function (article, i) {
        const card = document.createElement('div');
        card.className = 'article-card';
        const isSaved = bookmarkedArticles.indexOf(article.id) > -1;
        const readTime = liveReadTime(article);
        card.innerHTML = '<div class="card-topline">'
            + '<span class="card-icon-tile" aria-hidden="true">' + wikiIconFor(article.title + ' ' + (article.description || '')) + '</span>'
            + '<button class="bookmark-btn' + (isSaved ? ' active' : '') + '" title="' + (isSaved ? 'Remove from saved' : 'Save for later')
            + '" aria-label="' + (isSaved ? 'Remove from saved' : 'Save for later') + '" aria-pressed="' + isSaved + '"'
            + ' onclick="toggleBookmark(event, \' + article.id + \')">'
            + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.4l2.6 5.4 5.9.9-4.3 4.1 1 5.9-5.2-2.7-5.2 2.7 1-5.9-4.3-4.1 5.9-.9z"/></svg>'
            + '</button></div>'
            + '<div class="card-content">'
            + '<span class="category-tag">Wikipedia</span>'
            + '<h3 class="card-title">' + escapeHtml(article.title) + '</h3>'
            + '<p class="card-snippet">' + escapeHtml(wikiSnippet(article.description || article.extract || '', 140)) + '</p>'
            + '</div>'
            + '<div class="card-footer">'
            + '<span class="card-readtime">' + readTime + '</span>'
            + '<button class="read-link" onclick="loadArticle(\' + article.id + \')">Read'
            + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'
            + '</button></div>';
        card.style.animationDelay = (Math.min(i, 8) * 30) + 'ms';
        articlesGrid.appendChild(card);
    });
}

function renderEmptyGrid(message) {
    articlesGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);"><p>' + message + '</p></div>';
}

/** Saved filter: fetch the bookmarked pages' summaries and render them. */
let savedFetchSeq = 0;
function loadSavedGrid() {
    const seq = ++savedFetchSeq;
    const titles = bookmarkedArticles.map(function (id) {
        return String(id).indexOf('wiki:') === 0 ? decodeURIComponent(String(id).slice(5)) : id;
    });
    articlesGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);">Loading your saved articles…</div>';
    Promise.all(titles.map(function (t) {
        return wikiSummary(t).then(function (s) {
            if (!s || s.title === 'Not found.') return null;
            return {
                id: 'wiki:' + encodeURIComponent(s.title || t),
                title: s.title || t,
                extract: s.extract || '',
                description: s.description || wikiSnippet(s.extract || '', 140),
                thumbnail: (s.thumbnail && s.thumbnail.source) || null
            };
        }).catch(function () { return null; });
    })).then(function (records) {
        if (seq !== savedFetchSeq) return;
        gridArticles = records.filter(Boolean);
        renderArticlesGrid();
    });
}

/**
 * Sorts the explore grid: A-Z, most-read (from the persisted reading log), or default order.
 */
function sortArticles(sortBy, list) {
    if (sortBy === 'az') {
        return [...list].sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else if (sortBy === 'popular') {
        const counts = {};
        (typeof readHistory !== 'undefined' ? readHistory : []).forEach(function (r) {
            counts[r.id] = (counts[r.id] || 0) + 1;
        });
        return [...list].sort(function (a, b) {
            const diff = (counts[b.id] || 0) - (counts[a.id] || 0);
            return diff !== 0 ? diff : a.title.localeCompare(b.title);
        });
    }
    return list;
}

/**
 * Loads an article into the reader. Every id is a wiki id now —
 * legacy local ids are resolved through LOCAL_TO_WIKI.
 */
function loadArticle(articleId) {
    let title = articleId;
    if (articleId && typeof articleId === 'string' && articleId.indexOf('wiki:') === 0) {
        title = decodeURIComponent(articleId.slice(5));
    } else if (LOCAL_TO_WIKI[articleId]) {
        title = LOCAL_TO_WIKI[articleId];
    }
    if (title) loadWikiArticle(title);
}

/** Estimated read time for a live record (extract length / 200 wpm). */
function liveReadTime(record) {
    const words = String(record.extract || record.lead || '').trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return minutes + ' min read';
}

/**
 * Adds an item to recently viewed
 */
function addRecentlyViewed(title, id) {
    recentArticles = recentArticles.filter(item => item.id !== id);
    recentArticles.unshift({ title: title, id: id });
    if (recentArticles.length > RECENT_LIMIT) recentArticles.length = RECENT_LIMIT;
    setStored(STORAGE_KEYS.recent, JSON.stringify(recentArticles));
    renderRecentChips();
}

// ==========================================================================
// 5. SEARCH SYSTEM
// ==========================================================================

/**
 * Header dropdown: live Wikipedia suggestions as you type.
 * renderSearchDropdown shows the shell; augmentDropdownWithWiki fills results.
 */
function renderSearchDropdown(query) {
    if (!searchDropdown) return;
    if (!query || query.trim() === '') {
        searchDropdown.classList.remove('show');
        searchDropdown.innerHTML = '';
        return;
    }
    searchDropdown.innerHTML = '<div class="search-result-item" style="color: var(--text-muted);">Searching Wikipedia…</div>';
    searchDropdown.classList.add('show');
}

/** Select suggestion from search dropdown (legacy entry point). */
function selectSearchResult(articleId) {
    if (searchDropdown) searchDropdown.classList.remove('show');
    if (navSearchInput) navSearchInput.value = '';
    loadArticle(articleId);
}

/** Full search: opens the modal and queries Wikipedia live. */
function performSearch(query) {
    if (!query || query.trim() === '') return;
    if (modalSearchTerm) modalSearchTerm.textContent = query;
    if (modalResultsList) {
        modalResultsList.innerHTML = '<p style="padding: 20px; color: var(--text-muted); text-align: center;">Searching Wikipedia…</p>';
    }
    if (searchModal) {
        searchModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (searchModal) {
        searchModal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// ==========================================================================
// 6. BOOKMARK HANDLER
// ==========================================================================
function toggleBookmark(e, articleId) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const savedIdx = bookmarkedArticles.indexOf(articleId);
    if (savedIdx > -1) {
        // Un-save: while the Saved filter is active this removes the card too
        bookmarkedArticles.splice(savedIdx, 1);
        if (btn) {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
        if (currentFilter === 'saved') renderArticlesGrid();
    } else {
        bookmarkedArticles.push(articleId);
        if (btn) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
    }
    setStored(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarkedArticles));
}

// ==========================================================================
// 6b. PERSISTED UI STATE (theme, bookmarks, recently viewed)
// ==========================================================================

/**
 * Applies dark/light theme and stores the choice.
 */
function applyTheme(isDark) {
    document.documentElement.classList.toggle('dark-theme', isDark);
    if (themeToggle) {
        const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
        themeToggle.setAttribute('aria-label', label);
        themeToggle.setAttribute('title', label);
    }
    setStored(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
}

/**
 * Theme toggle handler with a small spin flourish on the icon.
 */
function toggleTheme() {
    const isDark = !document.documentElement.classList.contains('dark-theme');
    applyTheme(isDark);
    if (themeToggle) {
        themeToggle.classList.remove('spin');
        void themeToggle.offsetWidth; // restart the animation
        themeToggle.classList.add('spin');
    }
}

/**
 * Renders the recently-viewed chips from persisted state.
 */
function renderRecentChips() {
    if (!recentList) return;
    if (recentArticles.length === 0) {
        recentList.innerHTML = '<span class="recent-empty">History cleared. Newly viewed articles will appear here.</span>';
        return;
    }
    recentList.innerHTML = '';
    recentArticles.forEach(item => {
        const chip = document.createElement('span');
        chip.className = 'recent-chip';
        // Older seeds stored raw wiki titles (Murder_of_Tupac_Shakur) — display clean.
        chip.textContent = String(item.title || '').indexOf('_') !== -1 ? wikiCleanTitle(item.title) : item.title;
        chip.onclick = () => loadArticle(item.id);
        recentList.appendChild(chip);
    });
}

// ==========================================================================
// 6c. SCROLL SPY (active nav link + active TOC entry)
// ==========================================================================

const SPY_IDS = ['home', 'categories', 'explore', 'article', 'about'];

function updateScrollSpy() {
    // Header nav link for the section currently in view
    const navLinks = Array.from(document.querySelectorAll('.main-nav .nav-link'));
    const probe = window.scrollY + 140;
    let currentId = SPY_IDS[0];
    SPY_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && (el.getBoundingClientRect().top + window.scrollY) <= probe) currentId = id;
    });
    navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === '#' + currentId;
        link.classList.toggle('active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    // Highlight the matching TOC entry while reading an article
    if (tocList) {
        const chapters = document.querySelectorAll('#article-body-content .article-chapter');
        let currentChapter = null;
        chapters.forEach(ch => {
            if (ch.getBoundingClientRect().top <= 140) currentChapter = ch.id;
        });
        tocList.querySelectorAll('a').forEach(a => {
            a.classList.toggle('active', currentChapter !== null && a.getAttribute('href') === '#' + currentChapter);
        });
    }
}

let spyRafPending = false;
function onScrollThrottled() {
    if (spyRafPending) return;
    spyRafPending = true;
    requestAnimationFrame(() => {
        spyRafPending = false;
        updateScrollSpy();
    });
}

/**
 * Derives the "N Articles" count on every category card from the real database.
 */
/** Live article counts per topic (one cheap search query per card, lazy). */
function updateCategoryCounts() {
    if (!categoryCards.length) return;
    categoryCards.forEach(card => {
        const topic = card.getAttribute('data-topic');
        const countEl = card.querySelector('.category-count');
        if (!topic || !countEl) return;
        const url = WIKI_API + '?action=query&list=search&srsearch=' + encodeURIComponent(topic)
            + '&srnamespace=0&srlimit=1&srprop=totalhits&format=json&origin=*';
        fetch(url).then(function (res) { return res.json(); }).then(function (data) {
            const hits = data && data.query && data.query.searchinfo ? data.query.searchinfo.totalhits : 0;
            const shown = hits >= 10000 ? Math.round(hits / 1000) + 'k+' : String(hits);
            countEl.textContent = shown + ' article' + (hits === 1 ? '' : 's');
        }).catch(function () {
            countEl.textContent = 'Live…';
        });
    });
}

/** Clicking a topic card jumps straight into the top matching live article. */
function openTopic(topic) {
    if (!topic) return;
    showToast('Searching Wikipedia for “' + topic + '”…');
    wikiSuggest(topic, 3).then(function (results) {
        if (!results.length) { showToast('No live articles found for that topic'); return; }
        loadWikiArticle(results[0].title);
    }).catch(function () { showToast('Wikipedia is unreachable right now'); });
}

// ==========================================================================
// 7. EVENT LISTENERS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Sync persisted UI state
    if (themeToggle) {
        const dark = document.documentElement.classList.contains('dark-theme');
        themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    renderRecentChips();
    updateCategoryCounts();
    updateScrollSpy();
    window.addEventListener('scroll', onScrollThrottled, { passive: true });

    // Escape closes the search modal and the header dropdown
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            if (searchDropdown) searchDropdown.classList.remove('show');
        }
    });
    // Initial Render of cards
    renderArticlesGrid();

    // Category Pills Event (All / ★ Saved / Shuffle)
    if (categoryPills) {
        categoryPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                categoryPills.forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.getAttribute('data-filter');
                currentFilter = filter === 'saved' ? 'saved' : 'all';
                if (filter === 'shuffle') {
                    loadRandomGrid();
                } else {
                    renderArticlesGrid();
                }
            });
        });
    }

    // Category Card Buttons -> open the topic's top live article
    if (categoryCards) {
        categoryCards.forEach(card => {
            const btn = card.querySelector('.category-filter-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    openTopic(btn.getAttribute('data-topic') || btn.getAttribute('data-category'));
                });
            }
        });
    }

    // Sort Select
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderArticlesGrid();
        });
    }

    // Nav Search input typing
    if (navSearchInput) {
        navSearchInput.addEventListener('input', (e) => {
            renderSearchDropdown(e.target.value);
        });

        navSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch(navSearchInput.value);
                if (searchDropdown) searchDropdown.classList.remove('show');
            }
        });
    }

    // Header Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = navSearchInput.value;
            performSearch(query);
        });
    }

    // Hero Search Button
    if (heroSearchBtn && heroSearchInput) {
        heroSearchBtn.addEventListener('click', () => {
            performSearch(heroSearchInput.value);
        });

        heroSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch(heroSearchInput.value);
            }
        });
    }

    // Close Dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (searchDropdown && !e.target.closest('.header-search')) {
            searchDropdown.classList.remove('show');
        }
    });

    // Close Search Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) closeModal();
        });
    }

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            toggleTheme();
        });
    }

    // Mobile Menu Toggle
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('show');
            if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        });
    }

    // Close the mobile menu after picking a destination
    if (mainNav) {
        mainNav.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('show');
                if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // TOC Toggle
    if (tocToggleBtn && tocList) {
        tocToggleBtn.addEventListener('click', () => {
            if (tocList.style.display === 'none') {
                tocList.style.display = 'block';
                tocToggleBtn.textContent = '[hide]';
            } else {
                tocList.style.display = 'none';
                tocToggleBtn.textContent = '[show]';
            }
        });
    }

    // Clear History Button
    if (clearRecentBtn && recentList) {
        clearRecentBtn.addEventListener('click', () => {
            recentArticles = [];
            setStored(STORAGE_KEYS.recent, JSON.stringify(recentArticles));
            renderRecentChips();
        });
    }
});


// ==========================================================================
// 8. V2 FEATURES  (reading stats, reader tools, wiki integration, etc.)
// ==========================================================================

const V2_KEYS = {
    fontSize: 'wikiexplore-reader-font',
    history: 'wikiexplore-read-history'
};

let readerFontScale = 1; // 0..3 mapped to CSS classes below
try {
    const stored = parseInt(localStorage.getItem(V2_KEYS.fontSize), 10);
    if (!isNaN(stored) && stored >= 0 && stored <= 3) readerFontScale = stored;
} catch (err) {}

let readHistory = [];
try {
    const raw = localStorage.getItem(V2_KEYS.history);
    if (raw) readHistory = JSON.parse(raw) || [];
} catch (err) {}

function saveHistory() {
    try { localStorage.setItem(V2_KEYS.history, JSON.stringify(readHistory)); } catch (err) {}
}

function minutesOfArticle(article) {
    if (!article) return 4;
    const words = String(article.lead || article.extract || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

/** Records a read event (id, title, minutes, ts) and renders the dashboard. */
function recordRead(article) {
    if (!article) return;
    const today = new Date().toISOString().slice(0, 10);
    const last = readHistory[readHistory.length - 1];
    if (last && last.id === article.id && last.day === today) {
        last.count = (last.count || 1) + 1;
    } else {
        readHistory.push({ id: article.id, title: article.title, minutes: minutesOfArticle(article), day: today, count: 1 });
    }
    if (readHistory.length > 400) readHistory = readHistory.slice(-400);
    saveHistory();
    renderReadingDashboard();
}

function uniqueReadCount() {
    const seen = new Set();
    readHistory.forEach(r => seen.add(r.id));
    return seen.size;
}

function totalReadMinutes() {
    return readHistory.reduce((sum, r) => sum + r.minutes, 0);
}

function currentStreak() {
    const days = new Set(readHistory.map(r => r.day));
    if (days.size === 0) return 0;
    const d = new Date();
    // If today has no read yet, start from yesterday so a streak survives the day.
    if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
    let streak = 0;
    while (days.has(d.toISOString().slice(0, 10))) {
        streak += 1;
        d.setDate(d.getDate() - 1);
    }
    return streak;
}

/** Single reusable toast. */
let toastTimer = null;
function showToast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/** Renders the reading dashboard (hidden until there is at least one read). */
function renderReadingDashboard() {
    const box = document.getElementById('reading-dashboard');
    if (!box) return;
    const total = readHistory.length;
    if (total === 0) { box.hidden = true; return; }
    box.hidden = false;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('rd-articles', uniqueReadCount());
    set('rd-minutes', totalReadMinutes());
    set('rd-streak', currentStreak());
}

/** Current article context used by the reader tools. */
let currentArticleId = null;

/** Route every load through the live pipeline and keep V2 bookkeeping. */
const loadArticleCore = window.loadArticle;
window.loadArticle = function (articleId) {
    loadArticleCore(articleId);
};

/** Deep-link support: ?a=<id> or ?w=<wiki title> opens on load. */
function handleDeepLink() {
    const params = new URLSearchParams(location.search);
    const a = params.get('a');
    const w = params.get('w');
    if (a) {
        loadArticle(a);
    } else if (w) {
        loadWikiArticle(w);
    }
}


// ==========================================================================
// 9. READER TOOLS & COMFORT  (font size, copy/share/print, progress, keys)
// ==========================================================================

function applyReaderFontScale() {
    const main = document.querySelector('.article-main');
    if (!main) return;
    main.classList.remove('reader-scale-0', 'reader-scale-1', 'reader-scale-2', 'reader-scale-3');
    main.classList.add('reader-scale-' + readerFontScale);
    try { localStorage.setItem(V2_KEYS.fontSize, String(readerFontScale)); } catch (err) {}
}

function changeFontScale(delta) {
    readerFontScale = Math.min(3, Math.max(0, readerFontScale + delta));
    applyReaderFontScale();
    showToast(readerFontScale === 1 ? 'Text size: default' : (readerFontScale > 1 ? 'Text size increased' : 'Text size decreased'));
}

function buildArticleShareUrl() {
    const base = location.origin + location.pathname;
    if (currentArticleId && !currentArticleId.startsWith('wiki:')) {
        return base + '?a=' + encodeURIComponent(currentArticleId);
    }
    return base + '?w=' + encodeURIComponent(document.getElementById('article-title') ? document.getElementById('article-title').textContent : '');
}

function copyCurrentLink() {
    const url = buildArticleShareUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
            () => showToast('Link copied to clipboard'),
            () => fallbackCopy(url)
        );
    } else {
        fallbackCopy(url);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Link copied to clipboard'); } catch (err) { showToast('Copy failed — select the address bar'); }
    ta.remove();
}

async function shareCurrentArticle() {
    const title = document.getElementById('article-title') ? document.getElementById('article-title').textContent : 'WikiExplore';
    const url = buildArticleShareUrl();
    const shareData = { title: 'WikiExplore — ' + title, url: url };
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return;
        } catch (err) {
            if (err && err.name === 'AbortError') return;
        }
    }
    copyCurrentLink();
}

/** Reading progress bar (whole-page scroll progress, appears once you start scrolling). */
function updateReadingProgress() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
    bar.classList.toggle('visible', window.scrollY > 80 && pct < 99.5);
}

/** Surprise me: fetch a random live Wikipedia article (never the one open). */
let randomInFlight = false;
function openRandomArticle() {
    if (randomInFlight) return;
    randomInFlight = true;
    showToast('Rolling the dice on Wikipedia…');
    const url = WIKI_API + '?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*';
    fetch(url).then(function (res) { return res.json(); }).then(function (data) {
        const page = data && data.query && data.query.random && data.query.random[0];
        if (!page) { showToast('Could not pick a random article'); return; }
        const title = page.title;
        if (currentArticleId && title.toLowerCase() === decodeURIComponent(String(currentArticleId).slice(5)).toLowerCase()) {
            return openRandomArticle();
        }
        loadWikiArticle(title);
        showToast('Surprise! Opening “' + title + '”');
    }).catch(function () {
        showToast('Wikipedia is unreachable right now');
    }).finally(function () {
        randomInFlight = false;
    });
}

/** Keyboard shortcuts:  /  focus search,  D  theme,  R  random. */
function handleGlobalKeys(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target.isContentEditable);
    const key = e.key.toLowerCase();
    if (e.key === '/') {
        e.preventDefault();
        const target = (heroSearchInput && getComputedStyle(document.querySelector('.hero-section') || document.body).display !== 'none') ? heroSearchInput : navSearchInput;
        if (target) { target.focus(); target.select(); }
        return;
    }
    if (typing) return;
    if (key === 'd') { toggleTheme(); }
    if (key === 'r') { openRandomArticle(); }
}


// ==========================================================================
// 10. RELATED TOPICS + INLINE CROSS-LINKS WITH HOVER PREVIEWS
// ==========================================================================

// Local-library related/cross-links were retired in v3 —
// live equivalents live in renderWikiRelated + wikiLinkifyBody.

function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** One shared tooltip element positioned near the hovered link/card. */
let previewTipEl = null;
function getPreviewTip() {
    if (previewTipEl) return previewTipEl;
    previewTipEl = document.createElement('div');
    previewTipEl.className = 'preview-tip';
    previewTipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(previewTipEl);
    return previewTipEl;
}

function attachPreviewTips(scope) {
    if (!scope) return;
    const targets = scope.querySelectorAll('.article-xlink, .related-card');
    if (!targets.length) return;
    const tip = getPreviewTip();
    let hideTimer = null;
    let showTimer = null;

    function fillTip(el) {
        const id = el.getAttribute('data-id') || el.getAttribute('data-title');
        let title = id || '';
        if (title.indexOf('wiki:') === 0) title = decodeURIComponent(title.slice(5));
        let desc = '';
        let cat = 'Wikipedia';
        const cached = wikiCache[title.toLowerCase()];
        if (cached) {
            desc = cached.description || '';
        } else if (title) {
            // Lazily fetch the summary for the preview (best effort).
            wikiSummary(title).then(function (s) {
                if (!s || s.title === 'Not found.') return;
                wikiCache[title.toLowerCase()] = {
                    id: 'wiki:' + encodeURIComponent(title),
                    title: s.title || title,
                    description: s.description || '',
                    lead: s.extract || ''
                };
                const liveTip = getPreviewTip();
                liveTip.innerHTML = '<p class="pt-title">' + escapeAttr(s.title || title) + '</p>'
                    + '<p class="pt-desc">' + escapeAttr(s.description || 'Wikipedia article') + '</p>'
                    + '<span class="pt-cat">Wikipedia</span>';
            }).catch(function () {});
        }
        tip.innerHTML = '<p class="pt-title">' + escapeAttr(title) + '</p>'
            + '<p class="pt-desc">' + escapeAttr(desc || 'Wikipedia article') + '</p>'
            + '<span class="pt-cat">' + cat + '</span>';
    }

    function positionTip(el) {
        const r = el.getBoundingClientRect();
        const tipW = tip.offsetWidth || 260;
        let left = r.left;
        if (left + tipW > window.innerWidth - 10) left = window.innerWidth - tipW - 10;
        if (left < 10) left = 10;
        tip.style.left = left + 'px';
        tip.style.top = (r.bottom + 10) + 'px';
    }

    targets.forEach(el => {
        if (el.dataset.tipwired) return;
        el.dataset.tipwired = '1';
        el.addEventListener('mouseenter', () => {
            clearTimeout(hideTimer);
            clearTimeout(showTimer);
            fillTip(el);
            showTimer = setTimeout(() => { tip.classList.add('show'); positionTip(el); }, 250);
        });
        el.addEventListener('mouseleave', () => {
            clearTimeout(showTimer);
            hideTimer = setTimeout(() => tip.classList.remove('show'), 120);
        });
        el.addEventListener('focus', () => {
            clearTimeout(hideTimer);
            clearTimeout(showTimer);
            fillTip(el);
            showTimer = setTimeout(() => { tip.classList.add('show'); positionTip(el); }, 250);
        });
        el.addEventListener('blur', () => {
            clearTimeout(showTimer);
            hideTimer = setTimeout(() => tip.classList.remove('show'), 120);
        });
    });
}

/** Export helper: downloads a JSON blob and toasts. */
function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 800);
}

function exportSaved() {
    if (!bookmarkedArticles.length) { showToast('No saved articles yet — tap the ★ on any card'); return; }
    const items = bookmarkedArticles.map(function (id) {
        let title = id;
        if (String(id).indexOf('wiki:') === 0) title = decodeURIComponent(String(id).slice(5));
        const cached = wikiCache[title.toLowerCase()];
        return {
            id: id,
            title: cached ? cached.title : title,
            description: cached ? (cached.description || '') : '',
            source: 'Wikipedia'
        };
    });
    downloadJson('wikiexplore-saved.json', items);
    showToast('Exported ' + items.length + ' saved article(s)');
}

function exportHistory() {
    if (!readHistory.length) { showToast('No reading history yet'); return; }
    downloadJson('wikiexplore-history.json', readHistory);
    showToast('Exported reading history');
}


// ==========================================================================
// 11. LIVE WIKIPEDIA INTEGRATION
//     Real content from en.wikipedia.org — search suggestions, summaries
//     and section text rendered inside the same reader chrome.
// ==========================================================================

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const WIKI_REST = 'https://en.wikipedia.org/api/rest_v1';

let wikiAbort = null;      // abort controller for in-flight lookups
const wikiCache = {};      // normalized title -> fetched record

function normalizeWikiTitle(t) {
    return t.replace(/_/g, ' ').trim();
}

function wikiSnippet(text, max) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max - 1) + String.fromCharCode(8230) : text;
}

/** OpenSearch suggestions: returns [{ title, description, url }]. */
async function wikiSuggest(query, limit) {
    const url = WIKI_API + '?action=opensearch&search=' + encodeURIComponent(query)
        + '&limit=' + (limit || 5) + '&namespace=0&format=json&origin=*';
    const res = await fetch(url);
    const data = await res.json();
    const titles = data[1] || [];
    const descs = data[2] || [];
    const urls = data[3] || [];
    return titles.map(function (title, i) {
        return {
            title: normalizeWikiTitle(title),
            description: (descs[i] || 'Wikipedia article'),
            url: urls[i] || null
        };
    });
}

/** Section list for a page: returns [{ index, title }] for top-level sections. */
async function wikiSections(title) {
    const url = WIKI_API + '?action=parse&page=' + encodeURIComponent(title)
        + '&prop=sections&format=json&origin=*';
    const res = await fetch(url);
    const data = await res.json();
    const list = (data.parse && data.parse.sections) || [];
    const skip = /references|external links|see also|further reading|notes|bibliography/i;
    return list
        .filter(function (s) { return s.toclevel === 1 && !skip.test(s.line); })
        .slice(0, 5)
        .map(function (s) { return { index: s.index, title: s.line }; });
}

/** Plain text + local reference list of one section (parse output). Each section
 *  HTML carries its own <ol class="references"> numbered locally from 1, plus
 *  embedded citation CSS — capture the citations cleanly, then drop all the
 *  reference machinery so no raw CSS or footnote markup leaks into the prose. */
async function wikiSectionText(title, index) {
    const url = WIKI_API + '?action=parse&page=' + encodeURIComponent(title)
        + '&section=' + index + '&prop=text&format=json&origin=*';
    const res = await fetch(url);
    const data = await res.json();
    const html = (data.parse && data.parse.text && data.parse.text['*']) || '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    // Clean, ordered citations for this section (list position = local number).
    // Standalone section parses can leave "Cite error: … never defined"
    // placeholders for named refs defined in other sections — mark them so the
    // caller can skip them without shifting the numbering of real citations.
    const refs = [];
    tmp.querySelectorAll('ol.references > li').forEach(function (li) {
        li.querySelectorAll('.mw-cite-backlink, sup, style, script, .mw-editsection, ol, ul').forEach(function (n) { n.remove(); });
        let ext = null;
        const a = li.querySelector('a[href^="http"]');
        if (a) ext = a.getAttribute('href');
        const txt = (li.textContent || '').replace(/\s+/g, ' ').trim();
        if (txt) refs.push({ text: txt, url: ext, error: /^cite error:/i.test(txt) });
    });
    tmp.querySelectorAll('style, script, ol.references, .reflist, .mw-cite-backlink, .mw-editsection').forEach(function (s) { s.remove(); });
    const parts = [];
    tmp.querySelectorAll('p, li').forEach(function (node) {
        const txt = (node.textContent || '').replace(/\s+/g, ' ').trim();
        if (txt && txt.length > 40) parts.push(txt);
    });
    return { text: parts.join(' '), refs: refs };
}

/** Summary via the REST API (title, description, extract, thumbnail). */
async function wikiSummary(title) {
    const url = WIKI_REST + '/page/summary/' + encodeURIComponent(title);
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Wikipedia summary failed (' + res.status + ')');
    return await res.json();
}

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Loads a live Wikipedia article into the reader.
 */
async function loadWikiArticle(title, opts) {
    const normalized = normalizeWikiTitle(title);
    const target = document.getElementById('article');
    if (!target) return;
    const quiet = !!(opts && opts.quiet);
    if (!quiet) showToast('Fetching from Wikipedia...');

    try {
        const key = normalized.toLowerCase();
        if (wikiCache[key]) { renderWikiArticle(wikiCache[key], opts); return; }

        const [summary, sections] = await Promise.all([
            wikiSummary(normalized).catch(function () { return null; }),
            wikiSections(normalized).catch(function () { return []; })
        ]);
        if (!summary || summary.type === 'disambiguation' || summary.title === 'Not found.') {
            showToast('Could not find that article on Wikipedia');
            return;
        }

        const record = {
            id: 'wiki:' + encodeURIComponent(normalized),
            title: summary.title || normalized,
            description: summary.description || 'Live from Wikipedia',
            lead: summary.extract || '',
            thumbnail: summary.thumbnail ? summary.thumbnail.source : null,
            pageUrl: (summary.content_urls && summary.content_urls.desktop && summary.content_urls.desktop.page) || null,
            sections: sections
        };
        wikiCache[key] = record;
        renderWikiArticle(record, opts);
    } catch (err) {
        if (!quiet) showToast('Wikipedia is unreachable right now - try again later');
        console.warn('wiki load error', err);
    }
}

/** Renders a fetched Wikipedia record into the standard reader + infobox. */
function renderWikiArticle(record, opts) {
    const quiet = !!(opts && opts.quiet);
    currentArticleId = record.id;
    const set = function (id, val) { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setHtml = function (id, val) { const el = document.getElementById(id); if (el) el.innerHTML = val; };

    set('article-category', 'Live · Wikipedia');
    set('article-title', record.title);
    set('article-readtime', liveReadTime(record));
    const subtitle = document.getElementById('article-subtitle');
    if (subtitle) subtitle.textContent = record.description || 'Sourced live from Wikipedia';

    const leadEl = document.getElementById('article-lead');
    if (leadEl) leadEl.innerHTML = '<p>' + escapeHtml(record.lead || 'No summary available.') + '</p>';

    // Infobox
    setHtml('infobox-title', record.title);
    const glyph = wikiIconFor(record.title + ' ' + (record.description || ''));
    const infoIcon = document.getElementById('infobox-icon');
    if (infoIcon) infoIcon.innerHTML = glyph;
    const imgSlot = document.querySelector('.infobox-image-placeholder');
    if (imgSlot) {
        if (record.thumbnail) {
            imgSlot.innerHTML = '<img class="infobox-thumb" src="' + escapeHtml(record.thumbnail) + '" alt="" loading="lazy">';
        } else {
            imgSlot.innerHTML = '<span class="infobox-icon">' + glyph + '</span>';
        }
    }
    set('infobox-subtitle', record.description || 'Live from Wikipedia');
    set('info-topic', record.title);
    set('info-field', record.description || 'Wikipedia');
    set('info-status', 'Community-written · updated continuously');
    set('info-year', 'Live — fetched now');
    set('info-apps', 'Encyclopedic, community-written');
    set('info-figures', 'Wikipedia contributors');
    const extLink = document.getElementById('info-external-link');
    if (extLink && record.pageUrl) extLink.setAttribute('href', record.pageUrl);
    const extRow = document.getElementById('info-external-row');
    if (extRow) extRow.style.display = '';

    // TOC: Overview first (sections fill in as they arrive)
    const toc = document.getElementById('toc-list');
    if (toc) toc.innerHTML = '<li><a href="#w-overview">Overview</a></li>';

    const body = document.getElementById('article-body-content');
    if (body) {
        body.innerHTML = '<section id="w-overview" class="article-chapter"><h2>1. Overview</h2><p>'
            + escapeHtml(record.lead || '') + '</p></section>'
            + '<p class="wiki-section-note">Fetching sections…</p>';
    }

    if (!quiet) {
        const articleElem = document.getElementById('article');
        if (articleElem) articleElem.scrollIntoView({ behavior: 'smooth' });
        addRecentlyViewed(record.title, record.id);
        recordRead(record);
    }
    wikiLinkifyBody(record);
    renderWikiRelated(record);
    loadWikiSections(record);
}

/** Fetches the top-level section texts and appends them to the rendered article. */
async function loadWikiSections(record) {
    if (!record.sections || !record.sections.length) return;
    try {
        const results = await Promise.all(
            record.sections.slice(0, 8).map(function (s) {
                return wikiSectionText(record.title, s.index).then(function (r) {
                    return { sec: s, text: r.text, refs: r.refs };
                }).catch(function () { return null; });
            })
        );
        const toc = document.getElementById('toc-list');
        const body = document.getElementById('article-body-content');
        if (!body) return;
        let extra = '';
        let tocExtra = '';
        let num = 2; // Overview is 1
        results.forEach(function (r) {
            if (!r || !r.text || r.text.length < 60) return;
            const id = 'w-sec-' + r.sec.index;
            tocExtra += '<li><a href="#' + id + '">' + num + '. ' + escapeHtml(r.sec.title) + '</a></li>';
            extra += '<section id="' + id + '" class="article-chapter"><h2>' + num + '. '
                + escapeHtml(r.sec.title) + '</h2><p>' + escapeHtml(wikiSnippet(r.text, 2600)) + '</p></section>';
            num += 1;
        });
        if (extra) {
            const note = body.querySelector('.wiki-section-note');
            if (note) note.remove();
            body.insertAdjacentHTML('beforeend', extra);
            if (toc && tocExtra) toc.insertAdjacentHTML('beforeend', tocExtra);
        } else if (record.pageUrl) {
            const note = body.querySelector('.wiki-section-note');
            if (note) note.remove();
            body.insertAdjacentHTML('beforeend',
                '<section class="article-chapter"><h2>Continue reading</h2><p>'
                + 'This article is longer than our live preview. '
                + '<a href="' + escapeHtml(record.pageUrl) + '" target="_blank" rel="noopener noreferrer">Read the full article on Wikipedia</a>.'
                + '</p></section>');
        }
        // Linkify the freshly appended chapters (cached list, idempotent pass).
        wikiLinkifyBody(record);
        // Sources & References: each chapter numbers its citations locally, and
        // some are broken "Cite error" placeholders — merge the real ones into a
        // global end-list and record a local->global map per chapter so the [n]
        // markers in the prose always land on the correct citation.
        const merged = [];
        const maps = {};
        const cap = 40;
        results.forEach(function (r) {
            if (!r || !r.text || r.text.length < 60 || !Array.isArray(r.refs)) return;
            const localMap = [];
            r.refs.forEach(function (rf) {
                if (rf.error || merged.length >= cap) { localMap.push(0); return; }
                localMap.push(merged.length + 1);
                merged.push(rf);
            });
            maps[r.sec.index] = localMap;
        });
        if (merged.length) {
            let refsHtml = '<section id="w-references" class="article-chapter"><h2>' + num
                + '. Sources &amp; References</h2><ol class="wiki-refs">';
            merged.forEach(function (r, ri) {
                refsHtml += '<li id="w-ref-' + (ri + 1) + '">' + escapeHtml(r.text)
                    + (r.url ? ' <a class="ref-ext" href="' + escapeHtml(r.url) + '" target="_blank" rel="noopener noreferrer" title="Open source">↗</a>' : '')
                    + '</li>';
            });
            refsHtml += '</ol>';
            if (record.pageUrl) {
                refsHtml += '<p class="refs-note">Full citation list — <a href="' + escapeHtml(record.pageUrl) + '" target="_blank" rel="noopener noreferrer">view on Wikipedia ↗</a></p>';
            }
            refsHtml += '</section>';
            body.insertAdjacentHTML('beforeend', refsHtml);
            if (toc) toc.insertAdjacentHTML('beforeend', '<li><a href="#w-references">' + num + '. Sources &amp; References</a></li>');
            Object.keys(maps).forEach(function (idx) {
                const sec = document.getElementById('w-sec-' + idx);
                if (sec) linkRefMarkersIn(sec, maps[idx]);
            });
            wireRefJumps();
        }
    } catch (err) {
        console.warn('wiki sections error', err);
    }
}

/** Converts local [n] markers inside one chapter into links that jump to the
 *  merged reference list. `map` holds the global ref id for each local position
 *  (0 = broken/omitted ref — leave the marker as plain text). The visible label
 *  stays the local number, matching how the chapter renders. */
function linkRefMarkersIn(el, map) {
    if (!el || !map || !map.some(function (g) { return g > 0; })) return;
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const n = walker.currentNode;
        if (n.parentElement && n.parentElement.closest('a')) continue;
        nodes.push(n);
    }
    nodes.forEach(function (node) {
        const text = node.nodeValue;
        const re = /\[(\d{1,3})\]/g;
        let m;
        let last = 0;
        let out = '';
        while ((m = re.exec(text)) !== null) {
            const local = parseInt(m[1], 10);
            const globalId = (local >= 1 && local <= map.length) ? map[local - 1] : 0;
            if (globalId > 0) {
                out += escapeHtml(text.slice(last, m.index)) + '<a href="#w-ref-' + globalId + '" class="ref-jump">[' + local + ']</a>';
                last = m.index + m[0].length;
            }
        }
        if (last > 0) {
            out += escapeHtml(text.slice(last));
            const span = document.createElement('span');
            span.innerHTML = out;
            while (span.firstChild) node.parentNode.insertBefore(span.firstChild, node);
            node.parentNode.removeChild(node);
        }
    });
}

/** One delegated listener turns every .ref-jump click into a smooth scroll. */
function wireRefJumps() {
    const doc = document;
    if (doc.body.dataset.refjumps) return;
    doc.body.dataset.refjumps = '1';
    doc.body.addEventListener('click', function (e) {
        const a = e.target && e.target.closest ? e.target.closest('.ref-jump') : null;
        if (!a) return;
        e.preventDefault();
        const target = doc.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

/** Related topics straight from Wikipedia: first 3 valid page links with live summaries. */
function renderWikiRelated(record) {
    const box = document.getElementById('related-box');
    if (!box) return;
    box.hidden = true;
    box.innerHTML = '';
    if (!record || !record.title) return;

    const url = WIKI_API + '?action=query&prop=links&titles=' + encodeURIComponent(record.title)
        + '&plnamespace=0&pllimit=20&format=json&origin=*';
    fetch(url).then(function (res) { return res.json(); }).then(function (data) {
        const pages = data && data.query && data.query.pages ? data.query.pages : {};
        const links = [];
        Object.keys(pages).forEach(function (k) {
            const page = pages[k];
            if (page && Array.isArray(page.links)) {
                page.links.forEach(function (l) {
                    if (links.length < 6 && l.title && l.title.toLowerCase() !== record.title.toLowerCase()) {
                        links.push(l.title);
                    }
                });
            }
        });
        if (!links.length) return;
        // Fetch summaries for the first 3 links.
        Promise.all(links.slice(0, 3).map(function (t) {
            return wikiSummary(t).then(function (s) {
                if (!s || s.title === 'Not found.' || s.type === 'disambiguation') return null;
                return { title: s.title || t, description: s.description || 'Wikipedia article', pageUrl: (s.content_urls && s.content_urls.desktop && s.content_urls.desktop.page) || null };
            }).catch(function () { return null; });
        })).then(function (picks) {
            const valid = picks.filter(Boolean);
            if (!valid.length) return;
            box.hidden = false;
            box.innerHTML = '<div class="related-head"><div><span class="eyebrow">Keep exploring</span><h2>Related Topics</h2></div>'
                + (record.pageUrl ? '<a class="tool-btn" href="' + escapeHtml(record.pageUrl) + '" target="_blank" rel="noopener noreferrer">Full article on Wikipedia ↗</a>' : '')
                + '</div><div class="related-grid">'
                + valid.map(function (a) {
                    return '<button class="related-card" data-title="' + escapeAttr(a.title) + '" aria-label="Read ' + escapeAttr(a.title) + '">'
                        + '<span class="rc-cat">Wikipedia</span>'
                        + '<h4>' + escapeHtml(a.title) + '</h4>'
                        + '<p>' + escapeHtml(wikiSnippet(a.description, 110)) + '</p>'
                        + '<span class="rc-go">Read article</span></button>';
                }).join('')
                + '</div>';
            box.querySelectorAll('.related-card').forEach(function (card) {
                const open = function () { loadWikiArticle(card.getAttribute('data-title')); };
                card.addEventListener('click', open);
                card.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
                });
            });
            attachPreviewTips(box);
        });
    }).catch(function () {
        // No related content when the API is unreachable — the box stays hidden.
    });
}

/** Outbound link titles of a page, longest-first, cached per article. */
const outboundCache = {};
function fetchOutboundTitles(title) {
    const key = title.toLowerCase();
    if (outboundCache[key]) return Promise.resolve(outboundCache[key]);
    const url = WIKI_API + '?action=query&prop=links&titles=' + encodeURIComponent(title)
        + '&plnamespace=0&pllimit=max&format=json&origin=*';
    return fetch(url).then(function (res) { return res.json(); }).then(function (data) {
        const pages = data && data.query && data.query.pages ? data.query.pages : {};
        const titles = [];
        Object.keys(pages).forEach(function (k) {
            const page = pages[k];
            if (page && Array.isArray(page.links)) {
                page.links.forEach(function (l) {
                    if (l.title && l.title.toLowerCase() !== title.toLowerCase() && titles.length < 200) {
                        titles.push(l.title);
                    }
                });
            }
        });
        const sorted = titles.slice().sort(function (a, b) { return b.length - a.length; });
        outboundCache[key] = sorted;
        return sorted;
    });
}

/** Links first mention of each title inside one box (paragraph wrapper kept). */
function linkifyBox(box, titles) {
    const nodes = [];
    const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const n = walker.currentNode;
        if (n.parentElement && n.parentElement.closest('a')) continue;
        nodes.push(n);
    }
    const used = {}; // one link per title per box (encyclopedia style)
    const titlesLower = titles.map(function (t) { return t.toLowerCase(); });
    nodes.forEach(function (node) {
        const text = node.nodeValue;
        const lower = text.toLowerCase();
        let out = '';
        let last = 0;
        let i = 0;
        while (i < text.length) {
            let hit = null;
            for (let k = 0; k < titles.length; k++) {
                const t = titles[k];
                if (used[t]) continue;
                const tl = titlesLower[k];
                if (tl.length > text.length - i) continue;
                if (!lower.startsWith(tl, i)) continue;
                const before = i === 0 ? '' : text.charAt(i - 1);
                const after = i + t.length >= text.length ? '' : text.charAt(i + t.length);
                if (/[A-Za-z0-9]/.test(before) || /[A-Za-z0-9]/.test(after)) continue;
                hit = t;
                break;
            }
            if (hit) {
                used[hit] = true;
                out += escapeHtml(text.slice(last, i))
                    + '<a href="#" class="article-xlink" data-title="' + escapeAttr(hit) + '">'
                    + escapeHtml(text.substr(i, hit.length)) + '</a>';
                i += hit.length;
                last = i;
            } else {
                i += 1;
            }
        }
        if (last > 0) {
            out += escapeHtml(text.slice(last));
            const span = document.createElement('span');
            span.innerHTML = out;
            while (span.firstChild) node.parentNode.insertBefore(span.firstChild, node);
            node.parentNode.removeChild(node);
        }
    });
}

/** Replaces whole-word mentions of `titles` with cross-link anchors by walking
 *  text nodes, so paragraph wrappers survive. Idempotent: skips text inside
 *  anchors, safe to re-run when new sections arrive. Each chapter is treated
 *  as its own box so late sections still get first-mention links. */
function linkifyTextNodes(root, titles) {
    if (!root || !titles.length) return;
    const isLead = root && root.id === 'article-lead';
    let boxes = [];
    if (!isLead) {
        boxes = Array.prototype.slice.call(root.querySelectorAll('.article-chapter'));
    }
    if (!boxes.length) boxes.push(root);
    boxes.forEach(function (box) { linkifyBox(box, titles); });
}

/**
 * Auto-links mentions of the page's own outbound links inside the lead and body.
 * Runs at render time for the lead/Overview and again when chapter sections
 * arrive — the outbound list is cached and the walker is idempotent.
 */
function wikiLinkifyBody(record) {
    if (!record || !record.title) return;
    fetchOutboundTitles(record.title).then(function (titles) {
        if (!titles.length) return;
        const body = document.getElementById('article-body-content');
        const lead = document.getElementById('article-lead');
        linkifyTextNodes(lead, titles);
        linkifyTextNodes(body, titles);
        document.querySelectorAll('.article-xlink').forEach(function (link) {
            if (!link.dataset.wired) {
                link.dataset.wired = '1';
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    loadWikiArticle(link.getAttribute('data-title'));
                });
            }
        });
        attachPreviewTips(body);
        if (lead) attachPreviewTips(lead);
    }).catch(function () {});
}

function escapeRegExp2(s) {
    var bs = String.fromCharCode(92);
    var specials = '.+*?^${}()|[]' + bs;
    var out = '';
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        out += specials.indexOf(c) > -1 ? bs + c : c;
    }
    return out;
}

// ==========================================================================
// 12. LIVE WIKI IN SEARCH  (dropdown + modal)
// ==========================================================================

/** Debounced: fetch Wikipedia suggestions and append them to the dropdown. */
let wikiSearchTimer = null;
let wikiSearchSeq = 0;

function augmentDropdownWithWiki(query) {
    clearTimeout(wikiSearchTimer);
    if (!query || query.trim().length < 2) return;
    const seq = ++wikiSearchSeq;
    wikiSearchTimer = setTimeout(function () {
        wikiSuggest(query.trim(), 4).then(function (results) {
            if (seq !== wikiSearchSeq) return;
            const dd = document.getElementById('search-dropdown');
            if (!dd || !dd.classList.contains('show')) return;
            if (!results.length) {
                dd.innerHTML = '<div class="search-result-item" style="color: var(--text-muted);">No matching articles found.</div>';
                return;
            }
            dd.innerHTML = '';
            
            if (!dd || !dd.classList.contains('show')) return;
            const existing = dd.querySelector('.wiki-divider');
            if (existing) existing.remove();
            const block = document.createElement('div');
            block.className = 'wiki-block';
            block.innerHTML = '<div class="wiki-divider"><span>From Wikipedia (live)</span></div>'
                + results.map(function (r) {
                    return '<div class="search-result-item wiki-result" data-title="' + escapeHtml(r.title) + '" role="button" tabindex="0">'
                        + '<div class="result-title">' + escapeHtml(r.title) + '</div>'
                        + '<div class="result-snippet">' + escapeHtml(wikiSnippet(r.description, 80)) + '</div>'
                        + '</div>';
                }).join('');
            dd.appendChild(block);
            dd.querySelectorAll('.wiki-result').forEach(function (el) {
                const open = function () {
                    if (navSearchInput) navSearchInput.value = '';
                    const dd2 = document.getElementById('search-dropdown');
                    if (dd2) dd2.classList.remove('show');
                    loadWikiArticle(el.getAttribute('data-title'));
                };
                el.addEventListener('click', open);
                el.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
                });
            });
        }).catch(function () {});
    }, 220);
}

/** Append live results inside the modal under the local results. */
let wikiModalSeq = 0;
function augmentModalWithWiki(query) {
    const seq = ++wikiModalSeq;
    const list = document.getElementById('modal-results-list');
    if (!list) return;
    const old = list.querySelector('.wiki-modal-block');
    if (old) old.remove();
    if (!query || query.trim().length < 2) return;

    wikiSuggest(query.trim(), 5).then(function (results) {
        if (seq !== wikiModalSeq) return;
        const current = document.getElementById('modal-results-list');
        if (!current) return;
        if (!results.length) {
            current.innerHTML = '<p style="padding: 20px; color: var(--text-muted); text-align: center;">No articles found matching this search.</p>';
            return;
        }
        const block = document.createElement('div');
        block.className = 'wiki-modal-block';
        block.innerHTML = '<div class="wiki-divider"><span>From Wikipedia (live)</span></div>'
            + results.map(function (r) {
                return '<div class="search-result-item wiki-result" data-title="' + escapeHtml(r.title) + '" role="button" tabindex="0">'
                    + '<div class="result-title">' + escapeHtml(r.title) + '</div>'
                    + '<div class="result-snippet">' + escapeHtml(wikiSnippet(r.description, 90)) + '</div>'
                    + '</div>';
            }).join('');
        current.appendChild(block);
        current.querySelectorAll('.wiki-result').forEach(function (el) {
            const open = function () {
                closeModal();
                loadWikiArticle(el.getAttribute('data-title'));
            };
            el.addEventListener('click', open);
            el.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
            });
        });
    }).catch(function () {});
}

/** Hook the original modal opener so every search also queries Wikipedia. */
const performSearchCore = window.performSearch;
window.performSearch = function (query) {
    performSearchCore(query);
    augmentModalWithWiki(query);
};

// ==========================================================================
// 13. V2 INIT — wire every new control
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
    // Search inputs also query Wikipedia (dropdown live suggestions)
    if (navSearchInput) {
        navSearchInput.addEventListener('input', function (e) {
            augmentDropdownWithWiki(e.target.value);
        });
    }
    if (heroSearchInput) {
        heroSearchInput.addEventListener('input', function () {
            // Hero has no dropdown; defer to the modal on submit (already wrapped).
        });
    }

    // Surprise me (random article)
    const surprise = document.getElementById('surprise-btn');
    if (surprise) surprise.addEventListener('click', openRandomArticle);

    // Reader font controls
    const fontPlus = document.getElementById('font-plus');
    const fontMinus = document.getElementById('font-minus');
    if (fontPlus) fontPlus.addEventListener('click', function () { changeFontScale(1); });
    if (fontMinus) fontMinus.addEventListener('click', function () { changeFontScale(-1); });
    applyReaderFontScale();

    // Copy / share / print
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) copyBtn.addEventListener('click', copyCurrentLink);
    const shareBtn = document.getElementById('share-article-btn');
    if (shareBtn) shareBtn.addEventListener('click', shareCurrentArticle);
    const printBtn = document.getElementById('print-article-btn');
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

    // Reading progress + scroll spy refresh
    const updateProgress = function () { updateReadingProgress(); };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // Keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeys);

    // Exports
    const expSaved = document.getElementById('export-saved-btn');
    if (expSaved) expSaved.addEventListener('click', exportSaved);
    const expHistory = document.getElementById('export-history-btn');
    if (expHistory) expHistory.addEventListener('click', exportHistory);

    // Reset stats
    const rdReset = document.getElementById('rd-reset');
    if (rdReset) {
        rdReset.addEventListener('click', function () {
            readHistory = [];
            saveHistory();
            renderReadingDashboard();
            showToast('Reading stats reset');
        });
    }

    // Add the external-link row used by live articles (infobox)
    const figuresCell = document.querySelector('#article-infobox tbody tr:last-child td');
    if (figuresCell && !document.getElementById('info-external-row')) {
        const tr = document.createElement('tr');
        tr.id = 'info-external-row';
        tr.style.display = 'none';
        tr.innerHTML = '<th>Source:</th><td><a href="https://en.wikipedia.org" target="_blank" rel="noopener noreferrer" id="info-external-link">en.wikipedia.org</a></td>';
        figuresCell.closest('tbody').appendChild(tr);
    }

    // Dashboard + deep links on load
    renderReadingDashboard();
    handleDeepLink();

    // V3: live home feed, random explore grid, live topic counts, recents seed
    fetchHomeFeed();
    loadRandomGrid();
    updateCategoryCounts();
    seedRecentFromMostRead();
    bootstrapReader();
});


// ==========================================================================
// 14. V3 LIVE HOME FEED  (featured / most-read / on-this-day / news)
// ==========================================================================

let homeFeedCache = null;
let homeFeedKey = '';

/** One call powers four sections: featured, most-read, on-this-day and news. */
function fetchHomeFeed() {
    const now = new Date();
    const key = now.getUTCFullYear() + '/' + String(now.getUTCMonth() + 1).padStart(2, '0') + '/' + String(now.getUTCDate()).padStart(2, '0');
    if (homeFeedKey === key && homeFeedCache) {
        renderHomeFeed(homeFeedCache);
        return Promise.resolve(homeFeedCache);
    }
    return fetch(WIKI_REST + '/feed/featured/' + key)
        .then(function (res) { if (!res.ok) throw new Error('feed ' + res.status); return res.json(); })
        .then(function (data) {
            homeFeedKey = key;
            homeFeedCache = data;
            renderHomeFeed(data);
            return data;
        })
        .catch(function (err) {
            console.warn('home feed failed', err);
            [liveFeatured, livePopular, onThisDayList, newsList].forEach(function (el) {
                if (el) el.classList.remove('is-loading');
            });
            if (liveFeatured) liveFeatured.innerHTML = '<div class="featured-placeholder">Wikipedia feed unavailable right now — check your connection and reload.</div>';
            showToast('Could not load the live feed');
            throw err;
        });
}

/**
 * Populates the reader with today's featured article on load — quiet, so it
 * neither scrolls the page nor records the article as "read". Skipped when a
 * deep link (?a= / ?w=) is asking for a specific article instead.
 */
function bootstrapReader() {
    const fallback = function () {
        const lead = document.getElementById('article-lead');
        if (lead) lead.innerHTML = '<p>No article open — search above or pick any card to start reading.</p>';
        const body = document.getElementById('article-body-content');
        if (body) body.innerHTML = '';
        const toc = document.getElementById('toc-list');
        if (toc) toc.innerHTML = '';
    };
    const params = new URLSearchParams(location.search);
    if (params.get('a') || params.get('w')) return; // a deep link owns the reader
    fetchHomeFeed().then(function (data) {
        if (data && data.tfa && data.tfa.title) {
            loadWikiArticle(data.tfa.title, { quiet: true });
        } else {
            fallback();
        }
    }).catch(fallback);
}

/** Renders all four sections from one fetched feed object. */
function renderHomeFeed(data) {
    if (!data) return;
    renderFeaturedFeed(data.tfa);
    renderPopularFeed(data.mostread);
    renderOnThisDay(data.onthisday);
    renderNewsFeed(data.news);
    fillLiveStats(data);
}



/** Clean a wiki title for display: strip markup, underscores -> spaces. */
function wikiCleanTitle(t) {
    return String(t || '').replace(/<[^>]+>/g, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Featured article of the day -> hero card. */
function renderFeaturedFeed(tfa) {
    if (!liveFeatured) return;
    liveFeatured.classList.remove('is-loading');
    if (!tfa || !tfa.title) {
        liveFeatured.innerHTML = '<div class="featured-placeholder">No featured article today.</div>';
        return;
    }
    // The feed sometimes returns underscore titles (Huhu_beetle) — display clean.
    const tfaTitle = String(tfa.displaytitle || tfa.title).replace(/_/g, ' ').replace(/<[^>]+>/g, '');
    const thumb = tfa.thumbnail && tfa.thumbnail.source;
    liveFeatured.innerHTML = '<div class="featured-badge">Featured article · live</div>'
        + '<div class="featured-body"><div class="featured-info">'
        + '<div class="featured-topline"><span class="category-tag">Wikipedia</span>'
        + '<span class="featured-meta"><span>' + (tfa.description || 'Live from Wikipedia') + '</span></span></div>'
        + '<h3 class="featured-title">' + escapeHtml(tfaTitle) + '</h3>'
        + '<p class="featured-text">' + escapeHtml(wikiSnippet(tfa.extract || "Today's featured article from Wikipedia.", 320)) + '</p>'
        + '<button class="btn btn-primary btn-sm featured-read-btn">Read full article'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'
        + '</button></div>'
        + '<div class="featured-preview-box">'
        + (thumb ? '<img class="featured-thumb" src="' + escapeHtml(thumb) + '" alt="" loading="lazy">'
                 : '<div class="fact-box"><h4>Quick Facts</h4><ul><li>Fetched live from Wikipedia</li><li>Updated every day</li><li>Community-written</li></ul></div>')
        + '</div></div>';
    const btn = liveFeatured.querySelector('.featured-read-btn');
    if (btn) btn.addEventListener('click', function () { loadWikiArticle(tfa.title); });
}

/** Most-read today -> top 5 popular cards. */
function renderPopularFeed(mostread) {
    if (!livePopular) return;
    livePopular.classList.remove('is-loading');
    const list = (mostread && Array.isArray(mostread.articles)) ? mostread.articles.slice(0, 5) : [];
    if (!list.length) {
        livePopular.innerHTML = '<div class="featured-placeholder">No trending articles right now.</div>';
        return;
    }
    livePopular.innerHTML = list.map(function (a, i) {
        const pretty = wikiCleanTitle(a.normalizedtitle || a.displaytitle || a.title);
        return '<div class="popular-card" role="button" tabindex="0" data-title="' + escapeAttr(a.title) + '" data-display="' + escapeAttr(pretty) + '">'
            + '<div class="popular-icon" aria-hidden="true">' + wikiIconFor((a.title || '') + ' ' + (a.description || '')) + '</div>'
            + '<h4>' + escapeHtml(pretty) + '</h4>'
            + '<p>' + escapeHtml(wikiSnippet(a.description || a.extract || '', 110)) + '</p>'
            + '<span class="card-link">#' + (i + 1) + ' today <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>'
            + '</div>';
    }).join('');
    livePopular.querySelectorAll('.popular-card').forEach(function (card) {
        const open = function () { loadWikiArticle(card.getAttribute('data-title')); };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

/** On this day -> dated events with linked pages. */
function renderOnThisDay(events) {
    if (!onThisDayList) return;
    onThisDayList.classList.remove('is-loading');
    const rawList = Array.isArray(events) ? events.slice(0, 6) : [];
    // The feed can repeat the same event text with different selected pages — dedupe.
    const seen = {};
    const list = rawList.filter(function (ev) {
        const t = String(ev.text || '').slice(0, 60);
        if (seen[t]) return false;
        seen[t] = true;
        return true;
    }).slice(0, 5);
    if (!list.length) {
        onThisDayList.innerHTML = '<li class="featured-placeholder">No events available today.</li>';
        return;
    }
    onThisDayList.innerHTML = list.map(function (ev) {
        const pages = (Array.isArray(ev.pages) ? ev.pages : []).slice(0, 2);
        const chips = pages.map(function (p) {
            const plain = wikiCleanTitle(p.normalizedtitle || p.displaytitle || p.title || '');
            return '<button class="recent-chip" data-title="' + escapeAttr(plain) + '">' + escapeHtml(plain) + '</button>';
        }).join('');
        return '<li class="day-item"><span class="day-year">' + ev.year + '</span>'
            + '<span class="day-text">' + escapeHtml(wikiSnippet(ev.text || '', 190)) + '</span>'
            + (chips ? '<span class="day-chips">' + chips + '</span>' : '') + '</li>';
    }).join('');
    onThisDayList.querySelectorAll('.recent-chip').forEach(function (chip) {
        chip.addEventListener('click', function () { loadWikiArticle(chip.getAttribute('data-title')); });
    });
}


/** The feed's news `story` field is raw HTML (comments + wiki markup). Parse it
 *  safely: strip comments, escape plain text, convert wiki <a>s into chips that
 *  open the article in the reader. */
function storyHtml(story, links) {
    const doc = new DOMParser().parseFromString(story || '', 'text/html');
    const pretty = {};
    (Array.isArray(links) ? links : []).forEach(function (l) {
        const raw = String(l.title || '').replace(/_/g, ' ');
        const nice = String((l.titles && l.titles.normalized) || l.normalizedtitle || l.title || '');
        if (raw) pretty[raw] = nice;
    });
    let out = '';
    const used = {};
    const walk = function (node) {
        node.childNodes.forEach(function (ch) {
            if (ch.nodeType === 8) return; // strip comments like <!--Aug 31-->
            if (ch.nodeType === 3) { out += escapeHtml(ch.textContent); return; }
            if (ch.nodeType !== 1) return;
            if (ch.nodeName === 'A') {
                const href = ch.getAttribute('href') || '';
                let raw = '';
                try { raw = decodeURIComponent(href.replace(/^\.\//, '')); } catch (e) { raw = href.replace(/^\.\//, ''); }
                raw = raw.replace(/_/g, ' ');
                if (!raw) raw = ch.getAttribute('title') || ch.textContent;
                const nice = pretty[raw] || raw;
                used[raw] = true;
                const label = (ch.textContent || '').trim() || nice;
                out += '<button type="button" class="recent-chip" data-title="' + escapeAttr(nice) + '">' + escapeHtml(label) + '</button>';
                return;
            }
            walk(ch);
        });
    };
    walk(doc.body || doc);
    return { html: out, used: used };
}

/** In the news -> linked items. */
function renderNewsFeed(items) {
    if (!newsList) return;
    newsList.classList.remove('is-loading');
    const list = Array.isArray(items) ? items.slice(0, 4) : [];
    if (!list.length) {
        newsList.innerHTML = '<li class="featured-placeholder">No news stories right now.</li>';
        return;
    }
    newsList.innerHTML = list.map(function (n) {
        const parsed = storyHtml(n.story, n.links);
        const extra = (Array.isArray(n.links) ? n.links : []).filter(function (l) {
            return !parsed.used[String(l.title || '').replace(/_/g, ' ')];
        }).slice(0, 3).map(function (l) {
            const pageUrl = l.url || (l.content_urls && l.content_urls.desktop && l.content_urls.desktop.page);
            if (pageUrl) {
                return '<a href="' + escapeHtml(pageUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(wikiCleanTitle(l.title || '')) + ' ↗</a>';
            }
            const plainLink = wikiCleanTitle(l.title || '');
            return '<button class="recent-chip" data-title="' + escapeAttr(plainLink) + '">' + escapeHtml(plainLink) + '</button>';
        }).join(' ');
        return '<li class="news-item"><span class="news-story">' + parsed.html + '</span>'
            + (extra ? '<span class="news-links">' + extra + '</span>' : '') + '</li>';
    }).join('');
    newsList.querySelectorAll('.recent-chip').forEach(function (chip) {
        chip.addEventListener('click', function () { loadWikiArticle(chip.getAttribute('data-title')); });
    });
}

/** Live hero stats: article count from siteinfo, the rest from the feed. */
function fillLiveStats(data) {
    const set = function (id, val) { const el = document.getElementById(id); if (el) el.textContent = val; };
    const format = function (n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
        if (n >= 1000) return Math.round(n / 1000) + 'k+';
        return String(n);
    };
    fetch(WIKI_API + '?action=query&meta=siteinfo&siprop=statistics&format=json&origin=*')
        .then(function (res) { return res.json(); })
        .then(function (si) {
            const n = si && si.query && si.query.statistics ? si.query.statistics.pages : 0;
            set('stat-articles', format(n));
        }).catch(function () { set('stat-articles', '—'); });

    let views = 0;
    if (data && data.mostread && Array.isArray(data.mostread.articles)) {
        data.mostread.articles.forEach(function (a) { views += a.views || 0; });
    }
    set('stat-views', views >= 1000000 ? (views / 1000000).toFixed(1) + 'M' : String(views));
    set('stat-events', String((data && Array.isArray(data.onthisday)) ? data.onthisday.length : '—'));
    set('stat-news', String((data && Array.isArray(data.news)) ? data.news.length : '—'));
}

/** Explore grid: 10 fresh random Wikipedia articles with thumbs + extracts. */
let gridSeq = 0;
function loadRandomGrid() {
    const seq = ++gridSeq;
    if (gridLoading && !articlesGrid) return;
    gridLoading = true;
    articlesGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">Rolling 10 random articles from Wikipedia…</div>';
    const url = WIKI_API + '?action=query&generator=random&grnnamespace=0&grnlimit=10'
        + '&prop=extracts|pageimages&exintro&explaintext&exlimit=10&piprop=thumbnail&pithumbsize=320&format=json&origin=*';
    fetch(url).then(function (res) { return res.json(); }).then(function (data) {
        if (seq !== gridSeq) return;
        const pages = (data && data.query && data.query.pages) ? data.query.pages : {};
        const list = Object.keys(pages).map(function (k) { return pages[k]; })
            .filter(function (p) { return p && p.title && p.title.indexOf('(disambiguation)') === -1 && p.title.indexOf('List of') !== 0; })
            .slice(0, 10);
        gridArticles = list.map(function (p) {
            return {
                id: 'wiki:' + encodeURIComponent(p.title),
                title: p.title,
                extract: p.extract || '',
                description: p.extract ? wikiSnippet(p.extract, 140) : 'Wikipedia article',
                thumbnail: (p.thumbnail && p.thumbnail.source) || null
            };
        });
        gridLoading = false;
        renderArticlesGrid();
    }).catch(function () {
        if (seq !== gridSeq) return;
        gridLoading = false;
        articlesGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);"><p>Could not reach Wikipedia — try the Shuffle button again.</p></div>';
    });
}

/** First run: seed recently-viewed from today's most-read top 3 (live). */
function seedRecentFromMostRead() {
    if (getStored(STORAGE_KEYS.recent)) return; // user already has history
    fetchHomeFeed();
    // The feed renderer fills recents once popular is available.
    const watch = setInterval(function () {
        const pop = document.getElementById('live-popular');
        if (pop && pop.querySelector('.popular-card')) {
            clearInterval(watch);
            const titles = [];
            pop.querySelectorAll('.popular-card').forEach(function (c) {
                if (titles.length < 3) titles.push(c.getAttribute('data-display') || wikiCleanTitle(c.getAttribute('data-title')));
            });
            if (!titles.length) return;
            recentArticles = titles.map(function (t) {
                return { title: t, id: 'wiki:' + encodeURIComponent(t) };
            });
            setStored(STORAGE_KEYS.recent, JSON.stringify(recentArticles));
            renderRecentChips();
        }
    }, 300);
    // Stop watching after 8 seconds so it never runs forever.
    setTimeout(function () { clearInterval(watch); }, 8000);
}

