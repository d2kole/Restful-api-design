// ============================================================
// MAIN MODULE
// Application initialization, theme management, and entry point
// ============================================================

/**
 * Toggle between light and dark theme
 * Saves preference to localStorage
 */
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('restapi_theme', isDark ? 'dark' : 'light');
    document.querySelector('.theme-toggle').textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

/**
 * Load theme preference from localStorage
 * Applies saved theme on page load
 */
function loadTheme() {
    const theme = localStorage.getItem('restapi_theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle').textContent = '☀️ Light Mode';
    }
}

// ============================================================
// APPLICATION INITIALIZATION
// ============================================================

/**
 * Initialize the application when DOM is ready
 * Sets up theme, loads progress, renders navigation, initializes code blocks, and search
 */
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadProgress();
    renderNav();
    updateProgress();
    initializeCodeBlocks();
    initializeSearch();
});
