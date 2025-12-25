// ============================================================
// CODE BLOCKS MODULE
// Enhanced code block functions for progressive disclosure,
// tabbed examples, copy functionality, and syntax highlighting
// ============================================================

/**
 * Toggle between simple and full code variants
 * @param {HTMLElement} button - The toggle button element
 */
function toggleCodeVariant(button) {
    try {
        // Find the parent code block container
        const codeBlock = button.closest('.code-block');
        if (!codeBlock) {
            console.error('Code block container not found');
            return;
        }

        // Find variant containers
        const simpleVariant = codeBlock.querySelector('.code-variant-simple');
        const fullVariant = codeBlock.querySelector('.code-variant-full');

        if (!simpleVariant || !fullVariant) {
            console.error('Code variants not found');
            return;
        }

        // Check current state
        const isShowingSimple = simpleVariant.style.display !== 'none';

        // Toggle visibility
        if (isShowingSimple) {
            simpleVariant.style.display = 'none';
            fullVariant.style.display = 'block';
            button.textContent = 'Show Simple';
            button.setAttribute('aria-label', 'Switch to simple code version');
        } else {
            simpleVariant.style.display = 'block';
            fullVariant.style.display = 'none';
            button.textContent = 'Show Full';
            button.setAttribute('aria-label', 'Switch to full code version');
        }

        // Re-trigger syntax highlighting if Prism is available
        if (typeof Prism !== 'undefined') {
            const visibleVariant = isShowingSimple ? fullVariant : simpleVariant;
            const codeElement = visibleVariant.querySelector('code');
            if (codeElement) {
                Prism.highlightElement(codeElement);
            }
        }
    } catch (error) {
        console.error('Error toggling code variant:', error);
    }
}

/**
 * Switch between tabbed code examples
 * @param {HTMLElement} button - The tab button element
 * @param {string} tabName - The name/ID of the tab to show
 */
function switchTab(button, tabName) {
    try {
        // Find the parent code block container
        const codeBlock = button.closest('.code-block');
        if (!codeBlock) {
            console.error('Code block container not found');
            return;
        }

        // Get all tab buttons and content panels in this code block
        const tabButtons = codeBlock.querySelectorAll('.tab-button');
        const tabContents = codeBlock.querySelectorAll('.tab-content');

        if (tabButtons.length === 0 || tabContents.length === 0) {
            console.error('Tab buttons or content not found');
            return;
        }

        // Remove active class from all buttons
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        // Hide all tab contents
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        // Activate clicked button
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');

        // Show corresponding tab content
        const targetContent = codeBlock.querySelector(`[data-tab="${tabName}"]`);
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.style.display = 'block';

            // Re-trigger syntax highlighting if Prism is available
            if (typeof Prism !== 'undefined') {
                const codeElement = targetContent.querySelector('code');
                if (codeElement) {
                    Prism.highlightElement(codeElement);
                }
            }
        } else {
            console.warn(`Tab content with data-tab="${tabName}" not found`);
        }
    } catch (error) {
        console.error('Error switching tabs:', error);
    }
}

/**
 * Enhanced copy code function with support for variants and tabs
 * @param {HTMLElement} button - The copy button element
 * @param {string} codeId - The ID of the code element (optional for variant/tab support)
 */
function copyCode(button, codeId) {
    try {
        let codeText = '';

        // If codeId is provided, use the traditional approach
        if (codeId) {
            const codeBlock = document.getElementById(codeId);
            if (codeBlock) {
                codeText = codeBlock.textContent;
            } else {
                console.error(`Code block with id "${codeId}" not found`);
                return;
            }
        } else {
            // Handle variants and tabs - find the currently visible code
            const codeBlockContainer = button.closest('.code-block');
            if (!codeBlockContainer) {
                console.error('Code block container not found');
                return;
            }

            // Try to find visible code variant
            const visibleVariant = Array.from(
                codeBlockContainer.querySelectorAll('.code-variant-simple, .code-variant-full')
            ).find(variant => variant.style.display !== 'none');

            if (visibleVariant) {
                const codeElement = visibleVariant.querySelector('code') || visibleVariant.querySelector('pre');
                codeText = codeElement ? codeElement.textContent : '';
            } else {
                // Try to find active tab content
                const activeTab = codeBlockContainer.querySelector('.tab-content.active');
                if (activeTab) {
                    const codeElement = activeTab.querySelector('code') || activeTab.querySelector('pre');
                    codeText = codeElement ? codeElement.textContent : '';
                } else {
                    // Fallback: find any code element
                    const codeElement = codeBlockContainer.querySelector('code') || codeBlockContainer.querySelector('pre');
                    codeText = codeElement ? codeElement.textContent : '';
                }
            }
        }

        // Copy to clipboard
        if (codeText) {
            navigator.clipboard.writeText(codeText).then(() => {
                // Store original text
                const originalText = button.textContent;

                // Update button state
                button.textContent = '✓ Copied!';
                button.classList.add('copied');
                button.disabled = true;

                // Reset after 2 seconds
                setTimeout(() => {
                    button.textContent = originalText || 'Copy';
                    button.classList.remove('copied');
                    button.disabled = false;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code:', err);
                button.textContent = '✗ Failed';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
        } else {
            console.error('No code text found to copy');
        }
    } catch (error) {
        console.error('Error copying code:', error);
    }
}

/**
 * Initialize Prism.js syntax highlighting with line numbers
 * Call this after DOM is ready or after dynamically adding code blocks
 */
function initializePrism() {
    try {
        // Check if Prism is loaded
        if (typeof Prism === 'undefined') {
            console.warn('Prism.js is not loaded. Syntax highlighting will not be available.');
            return;
        }

        // Configure Prism plugins if available
        if (Prism.plugins && Prism.plugins.lineNumbers) {
            // Line numbers plugin is available
            console.log('Prism line numbers plugin detected');
        }

        // Highlight all code blocks
        Prism.highlightAll();

        // Add language labels to code blocks if not present
        document.querySelectorAll('pre[class*="language-"]').forEach(pre => {
            const langClass = Array.from(pre.classList).find(cls => cls.startsWith('language-'));
            if (langClass && !pre.hasAttribute('data-language')) {
                const language = langClass.replace('language-', '');
                pre.setAttribute('data-language', language);
            }
        });

        console.log('Prism.js initialized successfully');
    } catch (error) {
        console.error('Error initializing Prism:', error);
    }
}

/**
 * Helper function: Re-highlight a specific code element
 * Useful after dynamic content updates
 * @param {HTMLElement} element - The code element to highlight
 */
function rehighlightCode(element) {
    try {
        if (typeof Prism !== 'undefined' && element) {
            Prism.highlightElement(element);
        }
    } catch (error) {
        console.error('Error re-highlighting code:', error);
    }
}

/**
 * Helper function: Get code content from any code block structure
 * Handles variants, tabs, and standard code blocks
 * @param {HTMLElement} container - The code block container
 * @returns {string} The code text content
 */
function getCodeContent(container) {
    try {
        if (!container) return '';

        // Try visible variant
        const visibleVariant = Array.from(
            container.querySelectorAll('.code-variant-simple, .code-variant-full')
        ).find(variant => variant.style.display !== 'none');

        if (visibleVariant) {
            const codeElement = visibleVariant.querySelector('code') || visibleVariant.querySelector('pre');
            return codeElement ? codeElement.textContent : '';
        }

        // Try active tab
        const activeTab = container.querySelector('.tab-content.active');
        if (activeTab) {
            const codeElement = activeTab.querySelector('code') || activeTab.querySelector('pre');
            return codeElement ? codeElement.textContent : '';
        }

        // Fallback to any code element
        const codeElement = container.querySelector('code') || container.querySelector('pre');
        return codeElement ? codeElement.textContent : '';
    } catch (error) {
        console.error('Error getting code content:', error);
        return '';
    }
}

/**
 * Helper function: Initialize all enhanced code blocks
 * Call this if code blocks are added dynamically
 */
function initializeCodeBlocks() {
    try {
        // Initialize any tabbed code blocks (set first tab as active)
        document.querySelectorAll('.code-block').forEach(block => {
            const tabButtons = block.querySelectorAll('.tab-button');
            const tabContents = block.querySelectorAll('.tab-content');

            if (tabButtons.length > 0 && tabContents.length > 0) {
                // Check if any tab is already active
                const hasActiveTab = Array.from(tabButtons).some(btn => btn.classList.contains('active'));

                if (!hasActiveTab) {
                    // Activate first tab
                    tabButtons[0].classList.add('active');
                    tabButtons[0].setAttribute('aria-selected', 'true');

                    if (tabContents[0]) {
                        tabContents[0].classList.add('active');
                        tabContents[0].style.display = 'block';
                    }

                    // Hide other tabs
                    for (let i = 1; i < tabContents.length; i++) {
                        tabContents[i].style.display = 'none';
                    }
                }
            }

            // Initialize variant toggles (show simple by default)
            const simpleVariant = block.querySelector('.code-variant-simple');
            const fullVariant = block.querySelector('.code-variant-full');

            if (simpleVariant && fullVariant) {
                // Check current state, if not set, show simple by default
                if (!simpleVariant.style.display && !fullVariant.style.display) {
                    simpleVariant.style.display = 'block';
                    fullVariant.style.display = 'none';
                }
            }
        });

        // Initialize Prism if available
        if (typeof Prism !== 'undefined') {
            initializePrism();
        }

        console.log('Code blocks initialized');
    } catch (error) {
        console.error('Error initializing code blocks:', error);
    }
}
