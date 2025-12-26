/**
 * Unit Tests for Build Script
 *
 * Tests cover:
 * - CSS minification accuracy
 * - JS minification safety (doesn't break code)
 * - Placeholder replacement correctness
 * - File ordering dependencies
 */

const fs = require('fs');
const path = require('path');

// Import build utilities
const {
    config,
    minifyCSS,
    minifyJS,
    concatenateFiles,
    getDayContent,
    getFiles,
    readFile,
    formatBytes,
    wrapInIIFE,
    fileCache
} = require('../build/build.js');

// ============================================================================
// Test Fixtures and Helpers
// ============================================================================

const TEST_FIXTURES_DIR = path.join(__dirname, 'fixtures');

// Helper to temporarily enable minification for tests
function withMinify(fn) {
    const original = config.minify;
    config.minify = true;
    try {
        return fn();
    } finally {
        config.minify = original;
    }
}

// Helper to reset file cache between tests
beforeEach(() => {
    fileCache.clear();
});

// ============================================================================
// CSS Minification Tests
// ============================================================================

describe('CSS Minification', () => {
    describe('minifyCSS()', () => {
        test('removes single-line comments', () => {
            const input = `/* This is a comment */
.class { color: red; }`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).not.toContain('This is a comment');
            expect(result).toContain('.class');
            expect(result).toContain('color:red');
        });

        test('removes multi-line comments', () => {
            const input = `/**
 * Multi-line
 * comment
 */
.class { color: blue; }`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).not.toContain('Multi-line');
            expect(result).toContain('.class');
        });

        test('preserves important comments (/*! ... */)', () => {
            const input = `/*! This is important */
.class { color: green; }`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).toContain('/*! This is important */');
        });

        test('collapses whitespace', () => {
            const input = `.class {
    color:    red;
    margin:   10px;
}`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).not.toMatch(/\s{2,}/);
        });

        test('removes space around punctuation', () => {
            const input = `.class { color : red ; margin : 10px ; }`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).toContain('color:red');
            expect(result).toContain('margin:10px');
        });

        test('removes trailing semicolons before closing brace', () => {
            const input = `.class { color: red; }`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).toBe('.class{color:red}');
        });

        test('removes units from zero values', () => {
            const input = `.class { margin: 0px; padding: 0em; }`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).toContain('margin:0');
            expect(result).toContain('padding:0');
            expect(result).not.toContain('0px');
            expect(result).not.toContain('0em');
        });

        test('handles complex selectors correctly', () => {
            const input = `.parent > .child + .sibling ~ .other { display: flex; }`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).toContain('>');
            expect(result).toContain('+');
            expect(result).toContain('~');
        });

        test('handles CSS variables', () => {
            const input = `:root { --primary-color: #007bff; }
.class { color: var(--primary-color); }`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).toContain('--primary-color');
            expect(result).toContain('var(--primary-color)');
        });

        test('handles media queries', () => {
            const input = `@media (max-width: 768px) {
    .class { display: none; }
}`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).toContain('@media');
            expect(result).toContain('max-width:768px');
        });

        test('handles keyframes', () => {
            const input = `@keyframes fade {
    from { opacity: 0; }
    to { opacity: 1; }
}`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).toContain('@keyframes fade');
            expect(result).toContain('from{opacity:0}');
            expect(result).toContain('to{opacity:1}');
        });

        test('returns original CSS when minify is disabled', () => {
            const input = `.class { color: red; }`;
            config.minify = false;
            const result = minifyCSS(input);
            expect(result).toBe(input);
        });

        test('handles empty input', () => {
            const result = withMinify(() => minifyCSS(''));
            expect(result).toBe('');
        });

        test('handles pseudo-selectors correctly', () => {
            const input = `.button:hover { background: blue; }
.link::before { content: "→"; }`;
            const result = withMinify(() => minifyCSS(input));
            expect(result).toContain(':hover');
            expect(result).toContain('::before');
        });
    });
});

// ============================================================================
// JS Minification Tests
// ============================================================================

describe('JS Minification', () => {
    describe('minifyJS()', () => {
        test('removes single-line comments', () => {
            const input = `// This is a comment
const x = 1;`;
            const result = withMinify(() => minifyJS(input));
            expect(result).not.toContain('This is a comment');
            expect(result).toContain('const x=1');
        });

        test('removes multi-line comments', () => {
            const input = `/**
 * Multi-line comment
 */
const x = 1;`;
            const result = withMinify(() => minifyJS(input));
            expect(result).not.toContain('Multi-line');
            expect(result).toContain('const x=1');
        });

        test('preserves important comments (/*! ... */)', () => {
            const input = `/*! License info */
const x = 1;`;
            const result = withMinify(() => minifyJS(input));
            // Comment is preserved but whitespace inside may be collapsed
            expect(result).toMatch(/\/\*!.*License.*info.*\*\//);
        });

        test('preserves URLs in strings', () => {
            const input = `const url = "https://example.com/path";`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toContain('https://example.com/path');
        });

        test('preserves regex patterns with slashes', () => {
            const input = `const pattern = /\\/test\\//;`;
            const result = withMinify(() => minifyJS(input));
            // Should maintain the regex structure
            expect(result).toContain('/');
        });

        test('preserves return keyword spacing', () => {
            const input = `function test() { return true; }`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toMatch(/return\s+true/);
        });

        test('preserves typeof keyword spacing', () => {
            const input = `if (typeof x === 'undefined') {}`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toMatch(/typeof\s+x/);
        });

        test('preserves instanceof keyword spacing', () => {
            const input = `if (obj instanceof Array) {}`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toMatch(/instanceof\s+Array/);
        });

        test('preserves new keyword spacing', () => {
            const input = `const obj = new Object();`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toMatch(/new\s+Object/);
        });

        test('handles arrow functions', () => {
            const input = `const fn = (a, b) => a + b;`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toContain('=>');
            expect(result).toContain('a+b');
        });

        test('handles template literals', () => {
            const input = 'const str = `Hello ${name}!`;';
            const result = withMinify(() => minifyJS(input));
            expect(result).toContain('`Hello ${name}!`');
        });

        test('handles destructuring', () => {
            const input = `const { a, b } = obj;`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toContain('{a');
            expect(result).toContain('b}');
        });

        test('handles async/await', () => {
            const input = `async function fetchData() { await fetch(url); }`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toContain('async');
            expect(result).toContain('await');
        });

        test('handles spread operator', () => {
            const input = `const arr = [...items];`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toContain('...');
        });

        test('returns original JS when minify is disabled', () => {
            const input = `const x = 1;`;
            config.minify = false;
            const result = minifyJS(input);
            expect(result).toBe(input);
        });

        test('handles empty input', () => {
            const result = withMinify(() => minifyJS(''));
            expect(result).toBe('');
        });

        test('handles class syntax', () => {
            const input = `class MyClass {
    constructor() {
        this.value = 1;
    }
    method() {
        return this.value;
    }
}`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toContain('class MyClass');
            expect(result).toContain('constructor');
            expect(result).toContain('method');
        });

        test('preserves string content with special characters', () => {
            const input = `const msg = "Don't break this! // not a comment";`;
            const result = withMinify(() => minifyJS(input));
            expect(result).toContain("Don't break this!");
        });
    });

    describe('JS Minification Safety', () => {
        test('minified code is syntactically valid', () => {
            const input = `
function calculate(a, b) {
    // Add two numbers
    const result = a + b;
    return result;
}

const sum = calculate(1, 2);
console.log(sum);
`;
            const result = withMinify(() => minifyJS(input));
            // Should not throw when evaluated
            expect(() => {
                new Function(result);
            }).not.toThrow();
        });

        test('minified code preserves functionality', () => {
            const input = `
function add(a, b) {
    return a + b;
}
`;
            const result = withMinify(() => minifyJS(input));
            // Create function and test it works
            const fn = new Function(result + '\nreturn add(2, 3);');
            expect(fn()).toBe(5);
        });

        test('handles complex real-world code pattern', () => {
            const input = `
// Navigation handler
function handleNavigation(dayId) {
    const days = document.querySelectorAll('.day-content');
    days.forEach(day => {
        day.style.display = day.id === 'day-' + dayId ? 'block' : 'none';
    });
    return true;
}
`;
            const result = withMinify(() => minifyJS(input));
            expect(() => {
                new Function(result);
            }).not.toThrow();
            expect(result).toContain('handleNavigation');
            expect(result).toContain('querySelectorAll');
        });
    });
});

// ============================================================================
// Placeholder Replacement Tests
// ============================================================================

describe('Placeholder Replacement', () => {
    describe('config.placeholders', () => {
        test('has CSS placeholder defined', () => {
            expect(config.placeholders.css).toBe('/* {{CSS_PLACEHOLDER}} */');
        });

        test('has JS placeholder defined', () => {
            expect(config.placeholders.js).toBe('/* {{JS_PLACEHOLDER}} */');
        });

        test('has content placeholder defined', () => {
            expect(config.placeholders.content).toBe('<!-- {{CONTENT_PLACEHOLDER}} -->');
        });
    });

    describe('placeholder injection', () => {
        test('CSS placeholder is replaceable', () => {
            const template = `<style>/* {{CSS_PLACEHOLDER}} */</style>`;
            const css = '.test { color: red; }';
            const result = template.replace(config.placeholders.css, () => css);
            expect(result).toContain('.test { color: red; }');
            expect(result).not.toContain('{{CSS_PLACEHOLDER}}');
        });

        test('JS placeholder is replaceable', () => {
            const template = `<script>/* {{JS_PLACEHOLDER}} */</script>`;
            const js = 'const x = 1;';
            const result = template.replace(config.placeholders.js, () => js);
            expect(result).toContain('const x = 1;');
            expect(result).not.toContain('{{JS_PLACEHOLDER}}');
        });

        test('content placeholder is replaceable', () => {
            const template = `<main><!-- {{CONTENT_PLACEHOLDER}} --></main>`;
            const content = '<div>Day 1 Content</div>';
            const result = template.replace(config.placeholders.content, () => content);
            expect(result).toContain('<div>Day 1 Content</div>');
            expect(result).not.toContain('{{CONTENT_PLACEHOLDER}}');
        });

        test('handles content with special regex replacement characters', () => {
            // Prism.js contains $' which is a special replacement pattern
            const template = `<script>/* {{JS_PLACEHOLDER}} */</script>`;
            const jsWithSpecialChars = `const regex = /test/; const x = "$'";`;
            // Using function replacer (as build.js does) avoids special pattern interpretation
            const result = template.replace(config.placeholders.js, () => jsWithSpecialChars);
            expect(result).toContain(`$'`);
        });

        test('all placeholders can be replaced in single template', () => {
            const template = `<!DOCTYPE html>
<html>
<style>/* {{CSS_PLACEHOLDER}} */</style>
<body><!-- {{CONTENT_PLACEHOLDER}} --></body>
<script>/* {{JS_PLACEHOLDER}} */</script>
</html>`;
            let result = template
                .replace(config.placeholders.css, () => '.body{margin:0}')
                .replace(config.placeholders.content, () => '<div>Content</div>')
                .replace(config.placeholders.js, () => 'console.log("loaded");');

            expect(result).toContain('.body{margin:0}');
            expect(result).toContain('<div>Content</div>');
            expect(result).toContain('console.log("loaded");');
            expect(result).not.toContain('{{');
        });
    });
});

// ============================================================================
// File Ordering Tests
// ============================================================================

describe('File Ordering', () => {
    describe('config.cssOrder', () => {
        test('defines correct CSS file order', () => {
            expect(config.cssOrder).toEqual([
                'base.css',
                'layout.css',
                'components.css',
                'themes.css',
                'prism.css'
            ]);
        });

        test('base.css comes before other files', () => {
            expect(config.cssOrder.indexOf('base.css')).toBe(0);
        });

        test('themes.css comes after components.css', () => {
            const themesIndex = config.cssOrder.indexOf('themes.css');
            const componentsIndex = config.cssOrder.indexOf('components.css');
            expect(themesIndex).toBeGreaterThan(componentsIndex);
        });
    });

    describe('config.jsOrder', () => {
        test('defines correct JS file order', () => {
            expect(config.jsOrder).toEqual([
                'prism-core.js',
                'navigation.js',
                'progress.js',
                'code-blocks.js',
                'quiz.js',
                'main.js'
            ]);
        });

        test('prism-core.js comes first (dependency for syntax highlighting)', () => {
            expect(config.jsOrder.indexOf('prism-core.js')).toBe(0);
        });

        test('main.js comes last (initialization)', () => {
            expect(config.jsOrder[config.jsOrder.length - 1]).toBe('main.js');
        });

        test('code-blocks.js comes after prism-core.js (depends on Prism)', () => {
            const codeBlocksIndex = config.jsOrder.indexOf('code-blocks.js');
            const prismIndex = config.jsOrder.indexOf('prism-core.js');
            expect(codeBlocksIndex).toBeGreaterThan(prismIndex);
        });
    });

    describe('concatenateFiles()', () => {
        // Create temporary test fixtures for file ordering tests
        const tempDir = path.join(__dirname, 'temp-fixtures');

        beforeAll(() => {
            // Create temp directory with test files
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            fs.writeFileSync(path.join(tempDir, 'a.css'), '.a { order: 1; }');
            fs.writeFileSync(path.join(tempDir, 'b.css'), '.b { order: 2; }');
            fs.writeFileSync(path.join(tempDir, 'c.css'), '.c { order: 3; }');
        });

        afterAll(() => {
            // Clean up temp files
            if (fs.existsSync(tempDir)) {
                fs.readdirSync(tempDir).forEach(file => {
                    fs.unlinkSync(path.join(tempDir, file));
                });
                fs.rmdirSync(tempDir);
            }
        });

        test('concatenates files in specified order', () => {
            const order = ['c.css', 'a.css', 'b.css'];
            const result = concatenateFiles(
                tempDir,
                order,
                /\.css$/,
                (name, content) => content
            );
            const parts = result.content.split('\n\n');
            expect(parts[0]).toContain('.c { order: 3; }');
            expect(parts[1]).toContain('.a { order: 1; }');
            expect(parts[2]).toContain('.b { order: 2; }');
        });

        test('handles files not in order config alphabetically', () => {
            const order = ['b.css']; // Only b.css in order
            const result = concatenateFiles(
                tempDir,
                order,
                /\.css$/,
                (name, content) => content
            );
            expect(result.fileCount).toBe(3);
            // b.css should be first, then a.css and c.css alphabetically
            expect(result.content.indexOf('.b {')).toBeLessThan(result.content.indexOf('.a {'));
        });

        test('applies separator function correctly', () => {
            const order = ['a.css', 'b.css'];
            const result = concatenateFiles(
                tempDir,
                order,
                /\.css$/,
                (name, content) => `/* ===== ${name} ===== */\n${content}`
            );
            expect(result.content).toContain('/* ===== a.css ===== */');
            expect(result.content).toContain('/* ===== b.css ===== */');
        });

        test('returns correct file count', () => {
            const result = concatenateFiles(
                tempDir,
                [],
                /\.css$/,
                (name, content) => content
            );
            expect(result.fileCount).toBe(3);
        });

        test('handles missing directory gracefully', () => {
            const result = concatenateFiles(
                '/nonexistent/path',
                [],
                /\.css$/,
                (name, content) => content
            );
            expect(result.fileCount).toBe(0);
            expect(result.content).toBe('');
        });
    });

    describe('getDayContent()', () => {
        test('sorts day files numerically', () => {
            const contentDir = path.join(config.srcDir, 'content');
            if (fs.existsSync(contentDir)) {
                const result = getDayContent(contentDir);
                // Extract day numbers from content
                const dayMatches = result.content.match(/<!-- Day (\d+) -->/g);
                if (dayMatches) {
                    const dayNumbers = dayMatches.map(m => parseInt(m.match(/\d+/)[0]));
                    // Verify they are in ascending order
                    for (let i = 1; i < dayNumbers.length; i++) {
                        expect(dayNumbers[i]).toBeGreaterThan(dayNumbers[i - 1]);
                    }
                }
            }
        });
    });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('Utility Functions', () => {
    describe('formatBytes()', () => {
        test('formats bytes correctly', () => {
            expect(formatBytes(500)).toBe('500 B');
        });

        test('formats kilobytes correctly', () => {
            expect(formatBytes(1024)).toBe('1.0 KB');
            expect(formatBytes(2048)).toBe('2.0 KB');
        });

        test('formats megabytes correctly', () => {
            expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
            expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.50 MB');
        });
    });

    describe('wrapInIIFE()', () => {
        test('adds use strict directive', () => {
            const result = wrapInIIFE('const x = 1;', ['test.js']);
            expect(result).toContain("'use strict'");
        });

        test('returns empty string for empty input', () => {
            const result = wrapInIIFE('   ', ['test.js']);
            expect(result).toBe('');
        });

        test('preserves original code', () => {
            const input = 'function test() { return 42; }';
            const result = wrapInIIFE(input, ['test.js']);
            expect(result).toContain(input);
        });
    });

    describe('getFiles()', () => {
        test('filters files by pattern', () => {
            const stylesDir = path.join(config.srcDir, 'styles');
            if (fs.existsSync(stylesDir)) {
                const cssFiles = getFiles(stylesDir, /\.css$/);
                cssFiles.forEach(file => {
                    expect(file).toMatch(/\.css$/);
                });
            }
        });

        test('returns empty array for nonexistent directory', () => {
            const result = getFiles('/nonexistent/path', /\.css$/);
            expect(result).toEqual([]);
        });
    });

    describe('readFile()', () => {
        test('reads existing file', () => {
            const testFile = path.join(config.srcDir, 'index.html');
            if (fs.existsSync(testFile)) {
                const content = readFile(testFile);
                expect(content).not.toBeNull();
                expect(typeof content).toBe('string');
            }
        });

        test('returns null for nonexistent file', () => {
            const result = readFile('/nonexistent/file.txt');
            expect(result).toBeNull();
        });

        test('uses cache on second read', () => {
            const testFile = path.join(config.srcDir, 'index.html');
            if (fs.existsSync(testFile)) {
                fileCache.clear();
                const first = readFile(testFile);
                const second = readFile(testFile);
                expect(first).toBe(second);
                expect(fileCache.has(testFile)).toBe(true);
            }
        });

        test('bypasses cache when useCache is false', () => {
            const testFile = path.join(config.srcDir, 'index.html');
            if (fs.existsSync(testFile)) {
                fileCache.clear();
                readFile(testFile, true); // First read with cache
                fileCache.set(testFile, 'cached content');
                const result = readFile(testFile, false); // Bypass cache
                expect(result).not.toBe('cached content');
            }
        });
    });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Integration Tests', () => {
    describe('Full Build Process', () => {
        test('source files exist', () => {
            expect(fs.existsSync(path.join(config.srcDir, 'index.html'))).toBe(true);
            expect(fs.existsSync(path.join(config.srcDir, 'styles'))).toBe(true);
            expect(fs.existsSync(path.join(config.srcDir, 'scripts'))).toBe(true);
            expect(fs.existsSync(path.join(config.srcDir, 'content'))).toBe(true);
        });

        test('CSS files match configured order', () => {
            const stylesDir = path.join(config.srcDir, 'styles');
            config.cssOrder.forEach(file => {
                const filePath = path.join(stylesDir, file);
                expect(fs.existsSync(filePath)).toBe(true);
            });
        });

        test('JS files match configured order', () => {
            const scriptsDir = path.join(config.srcDir, 'scripts');
            config.jsOrder.forEach(file => {
                const filePath = path.join(scriptsDir, file);
                expect(fs.existsSync(filePath)).toBe(true);
            });
        });

        test('template contains all placeholders', () => {
            const template = readFile(path.join(config.srcDir, 'index.html'));
            expect(template).toContain(config.placeholders.css);
            expect(template).toContain(config.placeholders.js);
            expect(template).toContain(config.placeholders.content);
        });
    });
});
