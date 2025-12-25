// ============================================================
// NAVIGATION MODULE
// Handles day navigation, sidebar rendering, and active states
// ============================================================

// Days configuration
const days = [
    { id: 1, title: 'Day 1: REST Fundamentals', completed: false },
    { id: 2, title: 'Day 2: Resource Design', completed: false },
    { id: 3, title: 'Day 3: Error Handling', completed: false },
    { id: 4, title: 'Day 4: Authentication', completed: false },
    { id: 5, title: 'Day 5: API Versioning', completed: false },
    { id: 6, title: 'Day 6: Performance', completed: false },
    { id: 7, title: 'Day 7: Documentation', completed: false }
];

/**
 * Generate navigation sidebar from days configuration
 * Creates clickable nav items with completion status
 */
function renderNav() {
    const navContainer = document.getElementById('nav-container');
    navContainer.innerHTML = days.map(day => `
        <div class="nav-item ${day.completed ? 'completed' : ''}"
             data-day="${day.id}"
             onclick="showDay(${day.id})">
            <span>${day.title}</span>
        </div>
    `).join('');
    updateActiveNav();
}

/**
 * Update active navigation item based on current visible day
 * Adds 'active' class to the current day's nav item
 */
function updateActiveNav() {
    const currentDay = getCurrentDay();
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.day) === currentDay) {
            item.classList.add('active');
        }
    });
}

/**
 * Get the currently visible day number
 * @returns {number} The current day number (1-7)
 */
function getCurrentDay() {
    const activeContent = document.querySelector('.day-content.active');
    return activeContent ? parseInt(activeContent.id.replace('day', '')) : 1;
}

/**
 * Show specific day content and hide others
 * @param {number} dayNum - The day number to display (1-7)
 */
function showDay(dayNum) {
    document.querySelectorAll('.day-content').forEach(content => {
        content.classList.remove('active');
    });
    const dayContent = document.getElementById(`day${dayNum}`);
    if (dayContent) {
        dayContent.classList.add('active');
        updateActiveNav();
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
