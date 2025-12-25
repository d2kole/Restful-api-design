#!/usr/bin/env node

/**
 * Build Script for RESTful API Design 7-Day Learning Module
 *
 * Compiles organized source files into a single, distributable HTML file.
 *
 * Usage:
 *   npm run build              # Development build
 *   npm run build -- --minify  # Production build (minified)
 *   npm run build -- --watch   # Watch mode
 *   npm run build -- --verbose # Detailed output
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration (supports CLI args and environment variables)
// ============================================================================

const args = process.argv.slice(2);
const ENV = process.env.NODE_ENV || 'development';

const config = {
    // Paths
    srcDir: path.join(__dirname, '..', 'src'),
    distDir: path.join(__dirname, '..', 'dist'),
    outputFile: 'restful-api-design-7day-module.html',

    // Build options (CLI flags override defaults)
    minify: args.includes('--minify') || args.includes('-m') || ENV === 'production',
    verbose: args.includes('--verbose') || args.includes('-v'),
    watch: args.includes('--watch') || args.includes('-w'),
    silent: args.includes('--silent') || args.includes('-s'),

    // File processing order (dependency-aware)
    cssOrder: ['base.css', 'layout.css', 'components.css', 'themes.css'],
    jsOrder: ['navigation.js', 'progress.js', 'code-blocks.js', 'quiz.js', 'main.js'],

    // Template placeholders
    placeholders: {
        css: '/* {{CSS_PLACEHOLDER}} */',
        js: '/* {{JS_PLACEHOLDER}} */',
        content: '<!-- {{CONTENT_PLACEHOLDER}} -->'
    }
};

// ============================================================================
// Logger (respects silent/verbose flags)
// ============================================================================

const log = {
    info: (msg) => !config.silent && console.log(msg),
    verbose: (msg) => config.verbose && console.log(`  [verbose] ${msg}`),
    success: (msg) => !config.silent && console.log(`[OK] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`),
    stats: (label, value) => !config.silent && console.log(`   ${label}: ${value}`)
};

// ============================================================================
// File Operations (optimized with caching)
// ============================================================================

const fileCache = new Map();

function readFile(filePath, useCache = true) {
    if (useCache && fileCache.has(filePath)) {
        log.verbose(`Cache hit: ${path.basename(filePath)}`);
        return fileCache.get(filePath);
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        fileCache.set(filePath, content);
        log.verbose(`Read: ${path.basename(filePath)} (${content.length} bytes)`);
        return content;
    } catch (error) {
        log.warn(`Could not read ${path.basename(filePath)}: ${error.code}`);
        return null;
    }
}

function getFiles(dir, pattern) {
    try {
        if (!fs.existsSync(dir)) {
            log.warn(`Directory not found: ${dir}`);
            return [];
        }
        return fs.readdirSync(dir)
            .filter(file => pattern.test(file))
            .map(file => path.join(dir, file));
    } catch (error) {
        log.error(`Failed to read directory ${dir}: ${error.message}`);
        return [];
    }
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log.verbose(`Created directory: ${dir}`);
    }
}

// ============================================================================
// File Concatenation (optimized order resolution)
// ============================================================================

function concatenateFiles(dir, order, pattern, separatorFn) {
    const availableFiles = new Set(getFiles(dir, pattern));
    const orderedFiles = [];

    // Add files in specified order
    for (const fileName of order) {
        const filePath = path.join(dir, fileName);
        if (availableFiles.has(filePath)) {
            orderedFiles.push(filePath);
            availableFiles.delete(filePath);
        }
    }

    // Add remaining files alphabetically
    const remaining = [...availableFiles].sort();
    if (remaining.length > 0) {
        log.verbose(`Found ${remaining.length} additional file(s) not in order config`);
    }
    orderedFiles.push(...remaining);

    // Concatenate with separators
    const parts = [];
    for (const filePath of orderedFiles) {
        const content = readFile(filePath);
        if (content !== null) {
            parts.push(separatorFn(path.basename(filePath), content));
        }
    }

    return { content: parts.join('\n\n'), fileCount: parts.length };
}

function getDayContent(contentDir) {
    const files = getFiles(contentDir, /^day\d+\.html$/);

    // Sort numerically by day number
    files.sort((a, b) => {
        const getNum = (f) => parseInt(path.basename(f).match(/\d+/)?.[0] || '0', 10);
        return getNum(a) - getNum(b);
    });

    const parts = [];
    for (const filePath of files) {
        const content = readFile(filePath);
        if (content !== null) {
            const dayNum = path.basename(filePath).match(/\d+/)[0];
            parts.push(`    <!-- Day ${dayNum} -->\n${content}`);
        }
    }

    return { content: parts.join('\n\n'), dayCount: parts.length };
}

// ============================================================================
// Minification (enhanced compression)
// ============================================================================

function minifyCSS(css) {
    if (!config.minify) return css;

    const original = css.length;
    const minified = css
        // Remove comments (preserve /*! important */)
        .replace(/\/\*(?!!)[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '')
        // Collapse whitespace
        .replace(/\s+/g, ' ')
        // Remove space around punctuation
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove trailing semicolons before }
        .replace(/;}/g, '}')
        // Remove units from zero values
        .replace(/(:|\s)0(px|em|rem|%)/g, '$10')
        // Collapse multiple semicolons
        .replace(/;+/g, ';')
        .trim();

    log.verbose(`CSS: ${original} -> ${minified.length} bytes (${((1 - minified.length/original) * 100).toFixed(1)}% reduction)`);
    return minified;
}

function minifyJS(js) {
    if (!config.minify) return js;

    const original = js.length;
    const minified = js
        // Remove single-line comments (preserve URLs)
        .replace(/(?<!:)\/\/(?![*\/]).*$/gm, '')
        // Remove multi-line comments (preserve /*! important */)
        .replace(/\/\*(?!!)[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '')
        // Collapse whitespace (preserve strings)
        .replace(/\s+/g, ' ')
        // Remove space around operators (careful with keywords)
        .replace(/\s*([{};,=:?+\-*/<>!&|()])\s*/g, '$1')
        // Restore necessary spaces
        .replace(/\b(return|typeof|instanceof|in|of|new|delete|void|throw|case)\b/g, ' $1 ')
        .replace(/\s+/g, ' ')
        .trim();

    log.verbose(`JS: ${original} -> ${minified.length} bytes (${((1 - minified.length/original) * 100).toFixed(1)}% reduction)`);
    return minified;
}

// ============================================================================
// IIFE Wrapper (with source context)
// ============================================================================

function wrapInIIFE(js, sourceFiles) {
    if (!js.trim()) return '';

    const header = config.minify ? '' : `
    /**
     * RESTful API Design - 7-Day Learning Module
     * Auto-generated from: ${sourceFiles.join(', ')}
     * Built: ${new Date().toISOString()}
     */
`;

    // Don't wrap in IIFE - keep functions globally accessible for onclick handlers
    return `'use strict';${header}${js}`;
}

// ============================================================================
// Build Process
// ============================================================================

function build() {
    const startTime = process.hrtime.bigint();
    const stats = { css: 0, js: 0, days: 0, errors: [] };

    log.info(`\nBuilding RESTful API Design Module...`);
    log.info(`Mode: ${config.minify ? 'production (minified)' : 'development'}\n`);

    // Validate template
    const templatePath = path.join(config.srcDir, 'index.html');
    if (!fs.existsSync(templatePath)) {
        log.error('Template not found: src/index.html');
        log.info('Create the template with placeholders first.');
        process.exit(1);
    }

    let html = readFile(templatePath, false);
    if (!html) {
        log.error('Failed to read template');
        process.exit(1);
    }

    // Compile CSS
    log.info('Compiling CSS...');
    const cssResult = concatenateFiles(
        path.join(config.srcDir, 'styles'),
        config.cssOrder,
        /\.css$/,
        (name, content) => `/* ===== ${name} ===== */\n${content}`
    );
    stats.css = cssResult.fileCount;
    log.stats('Files', `${stats.css} stylesheets`);

    // Compile JavaScript
    log.info('Compiling JavaScript...');
    const jsResult = concatenateFiles(
        path.join(config.srcDir, 'scripts'),
        config.jsOrder,
        /\.js$/,
        (name, content) => `// ----- ${name} -----\n${content}`
    );
    stats.js = jsResult.fileCount;
    const wrappedJS = wrapInIIFE(jsResult.content, config.jsOrder.slice(0, stats.js));
    log.stats('Files', `${stats.js} modules`);

    // Compile day content
    log.info('Compiling content...');
    const contentResult = getDayContent(path.join(config.srcDir, 'content'));
    stats.days = contentResult.dayCount;
    log.stats('Days', stats.days);

    // Apply minification
    const finalCSS = minifyCSS(cssResult.content);
    const finalJS = minifyJS(wrappedJS);

    // Inject into template
    log.info('Injecting assets...');
    html = html
        .replace(config.placeholders.css, finalCSS)
        .replace(config.placeholders.js, finalJS)
        .replace(config.placeholders.content, contentResult.content);

    // Verify placeholders were replaced
    for (const [name, placeholder] of Object.entries(config.placeholders)) {
        if (html.includes(placeholder)) {
            stats.errors.push(`Placeholder not replaced: ${name}`);
        }
    }

    // Write output
    ensureDir(config.distDir);
    const outputPath = path.join(config.distDir, config.outputFile);
    fs.writeFileSync(outputPath, html, 'utf8');

    // Calculate metrics
    const endTime = process.hrtime.bigint();
    const buildTimeMs = Number(endTime - startTime) / 1_000_000;
    const fileSize = Buffer.byteLength(html, 'utf8');
    const lineCount = html.split('\n').length;

    // Report results
    log.info('\n----------------------------------------');
    log.success('Build complete!');
    log.info('----------------------------------------');
    log.stats('Output', `dist/${config.outputFile}`);
    log.stats('Size', formatBytes(fileSize));
    log.stats('Lines', lineCount.toLocaleString());
    log.stats('Time', `${buildTimeMs.toFixed(1)}ms`);

    if (config.minify) {
        log.stats('Mode', 'Minified');
    }

    if (stats.errors.length > 0) {
        log.warn(`\nWarnings: ${stats.errors.length}`);
        stats.errors.forEach(e => log.warn(`  - ${e}`));
    }

    log.info('');
    return { success: true, outputPath, fileSize, buildTimeMs };
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ============================================================================
// Watch Mode
// ============================================================================

function watch() {
    log.info('Watch mode enabled. Watching for changes...\n');

    const srcDir = config.srcDir;
    let debounceTimer = null;

    const rebuild = () => {
        fileCache.clear();
        try {
            build();
        } catch (error) {
            log.error(`Build failed: ${error.message}`);
        }
    };

    fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        if (!/\.(html|css|js)$/.test(filename)) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            log.info(`\nChange detected: ${filename}`);
            rebuild();
        }, 100);
    });

    // Initial build
    rebuild();
}

// ============================================================================
// CLI Entry Point
// ============================================================================

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
RESTful API Design Module Builder

Usage: node build.js [options]

Options:
  -m, --minify   Minify CSS and JavaScript output
  -w, --watch    Watch for changes and rebuild
  -v, --verbose  Show detailed build information
  -s, --silent   Suppress non-error output
  -h, --help     Show this help message

Examples:
  node build.js              # Development build
  node build.js --minify     # Production build
  node build.js -w -v        # Watch mode with verbose output
`);
    process.exit(0);
}

try {
    if (config.watch) {
        watch();
    } else {
        build();
    }
} catch (error) {
    log.error(`Build failed: ${error.message}`);
    if (config.verbose) {
        console.error(error.stack);
    }
    process.exit(1);
}
