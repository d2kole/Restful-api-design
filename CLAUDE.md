# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **7-Day RESTful API Design Learning Module** - a self-contained, interactive HTML-based course teaching REST API concepts. The course uses a **build system** that compiles organized source files into a single, distributable HTML file with embedded CSS and JavaScript.

## Architecture

### Build System (Planned/In Progress)

**Source Structure:** Organized, maintainable files in `src/`
```
src/
├── index.html              # Main template with placeholders
├── styles/                 # Separate CSS files
│   ├── base.css           # Variables, reset, body styles
│   ├── layout.css         # Sidebar, main, responsive
│   ├── components.css     # Reusable UI components
│   └── themes.css         # Dark mode theming
├── scripts/               # Modular JavaScript
│   ├── navigation.js      # Day switching, nav rendering
│   ├── progress.js        # Progress tracking, localStorage
│   ├── code-blocks.js     # Enhanced code block functions
│   ├── quiz.js            # Quiz checking logic
│   └── main.js            # Initialization, theme toggle
└── content/               # Day content partials
    ├── day1.html          # Day 1: REST Fundamentals
    ├── day2.html          # Day 2: Resource Design
    ├── day3.html          # Day 3: Error Handling
    ├── day4.html          # Day 4: Authentication
    ├── day5.html          # Day 5: API Versioning
    ├── day6.html          # Day 6: Performance
    └── day7.html          # Day 7: Documentation & Testing
```

**Distribution:** Single-file output in `dist/`
- **dist/restful-api-design-7day-module.html** - Self-contained, zero-dependency HTML file
- All CSS inlined into `<style>` tag
- All JavaScript inlined into `<script>` tag
- All day content injected into main content area
- ~4,800 lines total with all 7 days of curriculum

**Build Process:**
```bash
npm run build    # Compile src/ → dist/
npm run dev      # Watch mode (auto-rebuild on changes)
```

The build script (`build/build.js`) reads all source files and combines them into a single HTML output, maintaining the same functionality as the original monolithic file while providing better developer experience.

### Legacy Single File (Being Phased Out)
- **restful-api-design-7day-module.html** (~4,800 lines) - Original monolithic file
- Will be replaced by organized source structure with build system

### Enhancement Files
Day-specific code block enhancement packages contain:
- `dayN-enhanced-code-blocks.html` - Ready-to-insert enhanced code blocks
- `DAYN-INTEGRATION-GUIDE.md` - Step-by-step integration instructions
- `DAYN-PREVIEW.html` - Browser preview of enhancements

## Key Patterns

### Build System Placeholders
The `src/index.html` template uses these placeholders that the build script replaces:
- `/* {{CSS_PLACEHOLDER}} */` - Replaced with concatenated CSS from `src/styles/`
- `/* {{JS_PLACEHOLDER}} */` - Replaced with concatenated JavaScript from `src/scripts/`
- `<!-- {{CONTENT_PLACEHOLDER}} -->` - Replaced with all day content from `src/content/`

### Code Block Structure
```html
<div class="code-block">
    <div class="code-header">
        <span>Language - Description</span>
        <button class="copy-btn" onclick="copyCode(this, 'code-id')">Copy</button>
    </div>
    <pre><code id="code-id"
              class="language-javascript"
              data-type="category"
              data-description="detailed description">
    // Code here
    </code></pre>
</div>
```

### Code Block IDs Convention
- Day content: `code-d{day}-{number}` (e.g., `code-d4-1`)
- Storage examples: `storage-d{day}`
- Exercise solutions: `solution-d{day}`

### Theme System
CSS variables defined in `:root` and `body.dark-mode` selectors control theming. Key variables:
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--text-primary`, `--text-secondary`
- `--accent`, `--code-bg`, `--code-text`

### Progress Tracking
Uses localStorage to persist:
- Completed days
- Quiz scores
- Exercise progress

## Content Structure

### Source Files (New Architecture)
- **CSS:** ~600 lines split across 4 files (base, layout, components, themes)
- **JavaScript:** ~2,000 lines split across 5 modules (navigation, progress, quiz, code-blocks, main)
- **Day Content:** ~2,200 lines split into 7 HTML partials (300-400 lines each)
- **Template:** ~100 lines in index.html

### Distribution File (Output)
| Section | Approx. Lines |
|---------|---------------|
| CSS Styles (inlined) | 1-600 |
| Day 1: REST Fundamentals | 650-1100 |
| Day 2: Resource Design | 1100-1500 |
| Day 3: Error Handling | 1500-1850 |
| Day 4: Authentication | 1850-2200 |
| Day 5: Versioning & Caching | 2200-2800 |
| Day 6: Advanced Topics | 2800-3500 |
| Day 7: Testing & CI/CD | 3500-4200 |
| JavaScript Functions (inlined) | 4200-4800 |

## Development Guidelines

### Working with Source Files

1. **Edit Source, Not Dist** - Always edit files in `src/`, never modify `dist/` output directly
2. **Build After Changes** - Run `npm run build` after editing source files
3. **Use Watch Mode** - Run `npm run dev` for auto-rebuild during active development
4. **Test in Browser** - Open `dist/restful-api-design-7day-module.html` to verify changes

### File Organization

- **Adding Content:** Create new day files in `src/content/` (follow `dayN.html` pattern)
- **Styling:** Add CSS to appropriate file in `src/styles/` based on concern
- **Functionality:** Add JavaScript to relevant module in `src/scripts/` or create new module
- **Preserve IDs** - Code block IDs are referenced by copy buttons and localStorage

### Code Standards

1. **Match existing style** - Use consistent indentation, section separators, and comment patterns
2. **Modular approach** - Keep files focused on single concerns
3. **Build verification** - Ensure build script successfully compiles after changes
4. **Version control** - Commit source files, not generated dist files (add dist/ to .gitignore)

## Enhancement Standards

When enhancing code blocks in `src/content/dayN.html` files:
- Add `class="language-{lang}"` for syntax highlighting compatibility
- Add `data-type` and `data-description` attributes for accessibility
- Use section separators: `// ========================================`
- Provide inline comments explaining key concepts
- Consider simplified + full versions for complex examples (15+ lines)

**Note:** For the complete code block enhancement initiative, including the 10-task checklist and parallel development workflow, see the [Code Block Enhancement Initiative](#code-block-enhancement-initiative) section below.

## Code Block Enhancement Initiative

This section documents an ongoing initiative to enhance code blocks across all 7 days of the course with improved syntax highlighting, progressive disclosure, and consistent documentation patterns.

### Enhancement Checklist (10 Tasks)

**Phase 1: Prism Integration (Tasks 1-3)**
1. **Vendor Prism offline** - Add Prism core + line-numbers plugin + languages (JS/JSON/Bash/YAML) to `src/scripts/`, update `build/build.js` so Prism loads before `src/scripts/code-blocks.js`
2. **Add Prism CSS** - Include Prism theme + line-numbers CSS in `src/styles/` with softer colors for light mode
3. **Fix Prism initialization** - Update `src/scripts/code-blocks.js` for proper highlighting when `language-*` is on `<code>` and line numbers work with `pre.line-numbers`

**Phase 2: Day-by-Day Content Enhancement (Tasks 4-10)**
4. **Day 1** (`src/content/day1.html`) - REST Fundamentals: HTTP verbs, status codes, resource naming
5. **Day 2** (`src/content/day2.html`) - Resource Design: URL patterns, nested resources, filtering
6. **Day 3** (`src/content/day3.html`) - Error Handling: Error classes, middleware, logging patterns
7. **Day 4** (`src/content/day4.html`) - Authentication: JWT, OAuth, role-based access (see `archive/day4-enhancements/` for reference implementation)
8. **Day 5** (`src/content/day5.html`) - API Versioning: Version routing, cache headers, ETags
9. **Day 6** (`src/content/day6.html`) - Performance: Pagination, rate limiting, compression
10. **Day 7** (`src/content/day7.html`) - Testing & CI/CD: Test patterns, YAML highlighting, workflows, then run `npm run build` and verify `dist/` output

**Each day task includes:**
- Add 1-2 sentence descriptions above code examples
- Add `class="language-*"`, `data-type`, and `data-description` attributes
- Progressive disclosure for 15-20+ line blocks (Simple snippet + `<details>` full code)
- Section separators (`// ========================================`) and inline comments

**Reference:** See `taskmaster.md` for detailed per-day agent prompts and acceptance criteria.

### Parallel Development Workflow

This project supports **parallel agent-based development** where 7 agents can simultaneously enhance different day files without merge conflicts.

**File Isolation Strategy:**
- Each agent assigned to ONE day file only (`src/content/dayN.html`)
- No cross-file dependencies during enhancement phase
- Shared styles/scripts in `src/styles/` and `src/scripts/` remain unchanged during day enhancements

**Shared Enhancement Patterns:**

1. **Progressive Disclosure** (for blocks >15-20 lines)
   - Show Simple snippet first (with ID suffix `-simple`)
   - Wrap full code in `<details class="code-details"><summary>Show full code</summary></details>`
   - Split large examples into logical chunks inside `<details>`
   - Use `<pre class="line-numbers">` for full implementations

2. **Code Block Standardization**
   - Add `class="language-{javascript|json|bash|yaml}"`
   - Add `data-type="{category}"` (e.g., "authentication", "error-handling", "performance")
   - Add `data-description="detailed explanation"`
   - Preserve existing code block IDs for copy button compatibility

3. **Documentation Enhancement**
   - Add 1-2 sentence description above each code example
   - Include separators: `// ========================================`
   - Add inline comments for complex sections
   - Split very large examples into smaller logical chunks

**Benefits:**
- Zero merge conflicts (one file per agent)
- Consistent patterns across all days
- Maintainable enhancements with clear structure
- Easy to review day-by-day progress

### Agent Assignment Reference

| Day | File | Focus Area | Key Enhancement Patterns |
|-----|------|------------|-------------------------|
| 1 | `src/content/day1.html` | REST Fundamentals | HTTP verbs, status codes, resource naming |
| 2 | `src/content/day2.html` | Resource Design | URL patterns, nested resources, filtering |
| 3 | `src/content/day3.html` | Error Handling | Error classes, middleware, logging patterns |
| 4 | `src/content/day4.html` | Authentication | JWT, OAuth, role-based access (see archive) |
| 5 | `src/content/day5.html` | Versioning & Caching | Version routing, cache headers, ETags |
| 6 | `src/content/day6.html` | Performance | Pagination, rate limiting, compression |
| 7 | `src/content/day7.html` | Testing & CI/CD | Test patterns, YAML highlighting, workflows |

**Day 4 Reference Implementation:** Complete enhancement package available in `archive/day4-enhancements/` with:
- `day4-enhanced-code-blocks.html` - Ready-to-insert enhanced code
- `DAY4-INTEGRATION-GUIDE.md` - Step-by-step integration instructions
- `DAY4-PREVIEW.html` - Browser preview of enhancements

**Detailed Agent Prompts:** See `taskmaster.md` for specific constraints, objectives, and definition of done for each day.

### Adding New Days

To add Day 8 (or beyond):
1. Create `src/content/day8.html` following the existing day structure
2. Add day to `days` array in `src/scripts/navigation.js`:
   ```javascript
   { id: 8, title: 'Day 8: Your Topic', completed: false }
   ```
3. Update build script if needed (should auto-detect new day files)
4. Run `npm run build` to compile

### Modifying the Build Script

The build script (`build/build.js`) can be extended to:
- Minify CSS/JS for smaller output
- Add source maps for debugging
- Generate multiple versions (full vs. compact)
- Include version numbers or timestamps
- Optimize for production vs. development

## Distribution

**For End Users:**
- Share `dist/restful-api-design-7day-module.html` only
- Single file, zero dependencies
- Works offline, no server needed
- Just open in any modern browser

**For Developers:**
- Clone the repository
- Run `npm install` (if using nodemon for watch mode)
- Edit files in `src/`
- Build with `npm run build`
- Test with `dist/` output file

## Benefits of This Architecture

- **Maintainability:** Edit 300-500 line files instead of 4,800
- **Scalability:** Easily add new days/modules
- **Collaboration:** Smaller files = fewer merge conflicts
- **Developer Experience:** Proper syntax highlighting, easier debugging
- **Organized:** Clear separation of concerns (styles/scripts/content)
- **Preserves Simplicity:** Still outputs single HTML file for distribution
