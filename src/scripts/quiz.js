// ============================================================
// QUIZ MODULE
// Handles quiz answer checking and feedback display
// ============================================================

/**
 * Check quiz answer and display feedback
 * @param {string} questionName - The name attribute of the radio button group
 * @param {string} correctAnswer - The correct answer value
 * @param {string} feedbackId - The ID of the feedback element to update
 */
function checkAnswer(questionName, correctAnswer, feedbackId) {
    const selected = document.querySelector(`input[name="${questionName}"]:checked`);
    const feedback = document.getElementById(feedbackId);

    if (!selected) {
        feedback.className = 'feedback incorrect';
        feedback.textContent = 'Please select an answer.';
        feedback.style.display = 'block';
        return;
    }

    if (selected.value === correctAnswer) {
        feedback.className = 'feedback correct';
        feedback.textContent = '✓ Correct! Great job!';
    } else {
        feedback.className = 'feedback incorrect';
        feedback.textContent = '✗ Incorrect. Try again or review the material.';
    }
    feedback.style.display = 'block';
}
