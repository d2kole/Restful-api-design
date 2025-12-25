// ============================================================
// PROGRESS MODULE
// Handles progress tracking, localStorage persistence, and UI updates
// ============================================================

/**
 * Load progress from localStorage
 * Restores completed day states from saved data
 */
function loadProgress() {
    const saved = localStorage.getItem('restapi_progress');
    if (saved) {
        const progress = JSON.parse(saved);
        days.forEach((day, index) => {
            days[index].completed = progress[day.id] || false;
        });
    }
}

/**
 * Save progress to localStorage
 * Persists current completion states for future sessions
 */
function saveProgress() {
    const progress = {};
    days.forEach(day => {
        progress[day.id] = day.completed;
    });
    localStorage.setItem('restapi_progress', JSON.stringify(progress));
}

/**
 * Mark a day as complete and advance to next day
 * @param {number} dayNum - The day number to mark complete (1-7)
 */
function completeDay(dayNum) {
    days[dayNum - 1].completed = true;
    saveProgress();
    renderNav();
    updateProgress();

    // Move to next day if available
    if (dayNum < days.length) {
        setTimeout(() => showDay(dayNum + 1), 500);
    }
}

/**
 * Update progress bar UI
 * Calculates and displays completion percentage
 */
function updateProgress() {
    const completed = days.filter(d => d.completed).length;
    const percentage = Math.round((completed / days.length) * 100);

    document.getElementById('progress-text').textContent = `${percentage}% Complete`;
    document.getElementById('days-completed').textContent = `${completed}/${days.length} Days`;

    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = `${percentage}%`;
    progressFill.textContent = percentage > 0 ? `${percentage}%` : '';
}

/**
 * Reset all progress and return to Day 1
 * Confirms with user before clearing data
 */
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress?')) {
        localStorage.removeItem('restapi_progress');
        days.forEach(day => day.completed = false);
        renderNav();
        updateProgress();
        showDay(1);
    }
}
