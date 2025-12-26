# RESTful API Design - 7-Day Learning Module

[![Build](https://github.com/d2kole/Restful-api-design/actions/workflows/build.yml/badge.svg)](https://github.com/d2kole/Restful-api-design/actions/workflows/build.yml)

A self-contained, interactive HTML-based course teaching REST API concepts over 7 days.

## Features

- **Single-file distribution** - One HTML file, zero dependencies, works offline
- **Interactive learning** - Quizzes, code examples with syntax highlighting, progress tracking
- **Dark mode** - Toggle between light and dark themes
- **Progressive disclosure** - Complex code examples can be expanded for full details

## Quick Start

Open `dist/restful-api-design-7day-module.html` in any modern browser.

## Curriculum

| Day | Topic | Description |
|-----|-------|-------------|
| 1 | REST Fundamentals | HTTP verbs, status codes, resource naming |
| 2 | Resource Design | URL patterns, nested resources, filtering |
| 3 | Error Handling | Error classes, middleware, logging patterns |
| 4 | Authentication | JWT, OAuth, role-based access control |
| 5 | API Versioning | Version routing, cache headers, ETags |
| 6 | Performance | Pagination, rate limiting, compression |
| 7 | Testing & CI/CD | Test patterns, workflows, deployment |

## Development

### Prerequisites

- Node.js 18+

### Setup

```bash
npm install
```

### Build

```bash
npm run build        # Compile src/ → dist/
npm run dev          # Watch mode (auto-rebuild on changes)
npm run clean        # Remove dist/ directory
```

### Project Structure

```
src/
├── index.html           # Main template with placeholders
├── styles/              # CSS files (base, layout, components, themes)
├── scripts/             # JavaScript modules (navigation, progress, quiz, etc.)
└── content/             # Day content partials (day1.html - day7.html)

dist/
└── restful-api-design-7day-module.html   # Built single-file output

build/
└── build.js             # Build script
```

## Contributing

1. Edit files in `src/` (never modify `dist/` directly)
2. Run `npm run build` to compile
3. Test by opening `dist/restful-api-design-7day-module.html`
4. Commit both source and dist changes

See [CLAUDE.md](CLAUDE.md) for detailed development guidelines.

## License

MIT
