// ============================================================
// SEARCH MODULE
// Provides search functionality across all day content
// Features: Real-time search, highlighting, result navigation
// ============================================================

let searchIndex = null;
let currentResults = [];
let currentResultIndex = -1;

/**
 * Initialize search functionality
 * Builds search index from all day content
 */
function initializeSearch() {
    buildSearchIndex();

    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');

    if (searchInput) {
        // Real-time search as user types
        searchInput.addEventListener('input', debounce(handleSearch, 300));

        // Handle Enter key to navigate results
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                navigateToNextResult();
            }
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', clearSearch);
    }
}

/**
 * Build search index from all day content
 * Creates a searchable database of all text content with location info
 */
function buildSearchIndex() {
    searchIndex = [];

    const days = document.querySelectorAll('.day-content');
    days.forEach(dayElement => {
        const dayId = dayElement.id;
        const dayNum = parseInt(dayId.replace('day', ''));
        const dayTitle = dayElement.querySelector('h2')?.textContent || `Day ${dayNum}`;

        // Index all headings and paragraphs
        const elements = dayElement.querySelectorAll('h2, h3, h4, p, li, td, th, code');
        elements.forEach((element, index) => {
            const text = element.textContent.trim();
            if (text.length > 0) {
                searchIndex.push({
                    dayNum,
                    dayId,
                    dayTitle,
                    text,
                    element,
                    tagName: element.tagName.toLowerCase(),
                    // Get section context (nearest heading)
                    section: getParentHeading(element)
                });
            }
        });
    });
}

/**
 * Get the nearest parent heading for context
 * @param {HTMLElement} element - The element to find context for
 * @returns {string} The heading text or empty string
 */
function getParentHeading(element) {
    let current = element;
    while (current && current.tagName !== 'BODY') {
        if (/^H[2-4]$/.test(current.tagName)) {
            return current.textContent.trim();
        }
        current = current.previousElementSibling || current.parentElement;
    }
    return '';
}

/**
 * Handle search input
 * @param {Event} e - Input event
 */
function handleSearch(e) {
    const query = e.target.value.trim();
    const resultsContainer = document.getElementById('search-results');
    const searchClear = document.getElementById('search-clear');

    // Show/hide clear button
    if (searchClear) {
        searchClear.style.display = query ? 'block' : 'none';
    }

    // Clear previous results
    clearHighlights();
    currentResults = [];
    currentResultIndex = -1;

    if (query.length < 2) {
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
        }
        return;
    }

    // Perform search
    const results = performSearch(query);
    currentResults = results;

    // Display results
    displaySearchResults(results, query);
}

/**
 * Perform search against the index
 * @param {string} query - Search query
 * @returns {Array} Array of search results
 */
function performSearch(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];
    const seenSections = new Set();

    searchIndex.forEach(entry => {
        const lowerText = entry.text.toLowerCase();
        if (lowerText.includes(lowerQuery)) {
            // Create unique key for deduplication
            const key = `${entry.dayNum}-${entry.section}`;

            // Limit results per section to avoid overwhelming UI
            if (!seenSections.has(key) || seenSections.size < 50) {
                results.push({
                    ...entry,
                    // Calculate relevance score
                    score: calculateRelevance(entry.text, query, entry.tagName)
                });
                seenSections.add(key);
            }
        }
    });

    // Sort by relevance (score) and day number
    results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.dayNum - b.dayNum;
    });

    return results.slice(0, 30); // Limit to top 30 results
}

/**
 * Calculate relevance score for search results
 * @param {string} text - Text to score
 * @param {string} query - Search query
 * @param {string} tagName - HTML tag name
 * @returns {number} Relevance score
 */
function calculateRelevance(text, query, tagName) {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let score = 0;

    // Exact match gets highest score
    if (lowerText === lowerQuery) score += 100;

    // Match at start of text
    if (lowerText.startsWith(lowerQuery)) score += 50;

    // Match in headings is more relevant
    if (tagName === 'h2') score += 30;
    else if (tagName === 'h3') score += 20;
    else if (tagName === 'h4') score += 10;

    // Word boundary match
    if (new RegExp(`\\b${escapeRegex(lowerQuery)}\\b`).test(lowerText)) {
        score += 25;
    }

    // Case-sensitive exact match bonus
    if (text.includes(query)) score += 15;

    // Shorter text with match is more relevant
    if (text.length < 100) score += 5;

    return score;
}

/**
 * Display search results in the sidebar
 * @param {Array} results - Search results to display
 * @param {string} query - Original search query
 */
function displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="search-no-results">
                No results found for "${escapeHtml(query)}"
            </div>
        `;
        return;
    }

    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
        <div class="search-results-header">
            <strong>${results.length}</strong> result${results.length === 1 ? '' : 's'} found
        </div>
        ${results.map((result, index) => `
            <div class="search-result-item" onclick="navigateToResult(${index})" data-index="${index}">
                <div class="search-result-day">Day ${result.dayNum}</div>
                <div class="search-result-section">${escapeHtml(result.section || result.dayTitle)}</div>
                <div class="search-result-preview">${highlightText(result.text, query, 100)}</div>
            </div>
        `).join('')}
    `;
}

/**
 * Navigate to a specific search result
 * @param {number} index - Index of result to navigate to
 */
function navigateToResult(index) {
    if (index < 0 || index >= currentResults.length) return;

    const result = currentResults[index];
    currentResultIndex = index;

    // Switch to the day containing the result
    showDay(result.dayNum);

    // Scroll to and highlight the element
    setTimeout(() => {
        clearHighlights();
        highlightElement(result.element);
        result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Update active result in sidebar
        document.querySelectorAll('.search-result-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }, 100);
}

/**
 * Navigate to next search result (called on Enter key)
 */
function navigateToNextResult() {
    if (currentResults.length === 0) return;

    currentResultIndex = (currentResultIndex + 1) % currentResults.length;
    navigateToResult(currentResultIndex);
}

/**
 * Highlight a specific element in the content
 * @param {HTMLElement} element - Element to highlight
 */
function highlightElement(element) {
    element.classList.add('search-highlight');

    // Remove highlight after 3 seconds
    setTimeout(() => {
        element.classList.remove('search-highlight');
    }, 3000);
}

/**
 * Clear all search highlights
 */
function clearHighlights() {
    document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
    });
}

/**
 * Clear search input and results
 */
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    const searchClear = document.getElementById('search-clear');

    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }

    if (resultsContainer) {
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '';
    }

    if (searchClear) {
        searchClear.style.display = 'none';
    }

    clearHighlights();
    currentResults = [];
    currentResultIndex = -1;
}

/**
 * Highlight query text within a longer string
 * @param {string} text - Text to highlight within
 * @param {string} query - Query to highlight
 * @param {number} maxLength - Maximum length of preview
 * @returns {string} HTML with highlighted text
 */
function highlightText(text, query, maxLength = 100) {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
        return escapeHtml(text.substring(0, maxLength)) + (text.length > maxLength ? '...' : '');
    }

    // Get context around the match
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + query.length + 70);

    let preview = text.substring(start, end);
    if (start > 0) preview = '...' + preview;
    if (end < text.length) preview = preview + '...';

    // Highlight the query
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    preview = escapeHtml(preview).replace(
        new RegExp(`(${escapeRegex(escapeHtml(query))})`, 'gi'),
        '<mark>$1</mark>'
    );

    return preview;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Escape regex special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
