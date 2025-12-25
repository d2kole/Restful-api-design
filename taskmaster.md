## Taskmaster — Code Block Enhancement (Days 1–7)

### Checklist (≤10 tasks total)

- [ ] 1) **Vendor Prism (offline/inlined)**: add Prism core + `line-numbers` plugin + needed languages (javascript/json/bash/yaml) into `src/scripts/`, and update `build/build.js` so Prism loads **before** `src/scripts/code-blocks.js`.
- [ ] 2) **Add Prism CSS (offline/inlined)**: add Prism theme CSS + line-numbers CSS into `src/styles/`, and tune code-block colors to be **softer/lighter** in light mode.
- [ ] 3) **Fix Prism init**: update `src/scripts/code-blocks.js` so highlighting works when `language-*` is on `<code>` (and line numbers work when `pre.line-numbers` is present).
- [ ] 4) **Day 1** (`src/content/day1.html`): add a short description above each example; add `language-*` + `data-type` + `data-description`; for any 15–20+ line block use Simple-first + `<details>` full chunks; split very large examples into smaller logical chunks.
- [ ] 5) **Day 2** (`src/content/day2.html`): same standardization + splitting/disclosure for 15–20+ line blocks.
- [ ] 6) **Day 3** (`src/content/day3.html`): same standardization + splitting/disclosure for 15–20+ line blocks.
- [ ] 7) **Day 4** (`src/content/day4.html`): same standardization + splitting/disclosure for 15–20+ line blocks.
- [ ] 8) **Day 5** (`src/content/day5.html`): same standardization + splitting/disclosure for 15–20+ line blocks.
- [ ] 9) **Day 6** (`src/content/day6.html`): same standardization + splitting/disclosure for 15–20+ line blocks.
- [ ] 10) **Day 7** (`src/content/day7.html`): same standardization; ensure YAML uses `language-yaml`; then run `npm run build` and verify `dist/restful-api-design-7day-module.html` (highlighting, line numbers, `<details>`, copy buttons, dark mode).

---

### Parallel agentic flows (Day 1–Day 7)

**Shared rules for every day-agent**
- Edit **only** the day file you’re assigned (`src/content/dayN.html`) to avoid merge conflicts.
- **No before/after comparisons**.
- Any block **>15–20 lines**: show a **Simple** snippet first, then put the rest inside:
  - `<details class="code-details"><summary>Show full code</summary> ... </details>`
- Add to each `<code>`:
  - `class="language-..."` (correct language)
  - `data-type="..."` and `data-description="..."`
- For full/advanced code inside `<details>`, use line numbers:
  - `<pre class="line-numbers"><code ...>...</code></pre>`
- Add separators + inline comments for complex sections (e.g., `// ========================================`).
- Keep existing IDs usable: if you create `*-simple`, keep the original `code-dN-X` ID for the full version somewhere.

#### Day 1 agent prompt

```text
@c:\Users\joeti\.cursor\plans\enhance_code_blocks_49ce5ee9.plan.md
@src/content/day1.html

Task: Refactor ONLY `src/content/day1.html` code blocks to match the plan (progressive disclosure + readability).
Constraints: no before/after comparisons; no mobile work; do not edit dist/ or shared CSS/JS files.
Do:
- Add a 1–2 sentence description above each code example (what it teaches + key takeaway).
- Update each <code> to include: correct language class, data-type, data-description.
- Any block >15–20 lines: create a short Simple snippet shown first (new id suffix `-simple`), then wrap the full material in <details class="code-details"><summary>Show full code</summary> ... </details>.
- For the very large Node HTTP server example, split the full implementation inside <details> into multiple smaller blocks (startup, helpers, routes, server start), each with its own header + copy button.
Definition of done: no duplicate IDs; copy buttons reference correct IDs; long blocks are hidden behind <details>.
```

#### Day 2 agent prompt

```text
@c:\Users\joeti\.cursor\plans\enhance_code_blocks_49ce5ee9.plan.md
@src/content/day2.html

Task: Refactor ONLY `src/content/day2.html` code blocks per plan.
Constraints: no before/after comparisons; no mobile work; do not edit dist/ or shared CSS/JS files.
Do:
- Add short descriptions above each code example.
- Add correct language class + data-type + data-description to each <code>.
- For any >15–20 line blocks: make a Simple snippet first, then <details> with full code split into smaller logical chunks.
- Ensure full chunks use <pre class="line-numbers">.
Definition of done: IDs unique; copy works; long code is collapsed by default.
```

#### Day 3 agent prompt

```text
@c:\Users\joeti\.cursor\plans\enhance_code_blocks_49ce5ee9.plan.md
@src/content/day3.html

Task: Refactor ONLY `src/content/day3.html` code blocks per plan (error handling day).
Constraints: no before/after comparisons; no mobile work; do not edit dist/ or shared CSS/JS files.
Do:
- Add short descriptions above each code example (what problem it solves).
- Add correct language class + data-type="error-handling" (or similar) + data-description to each <code>.
- For long blocks: Simple snippet first, then <details> full code split into helper class, middleware, route usage, logging.
- Ensure full chunks use <pre class="line-numbers"> and add separators for “throw vs next() vs handler”.
Definition of done: collapsed full code by default; line numbers on full chunks; copy buttons correct.
```

#### Day 4 agent prompt

```text
@c:\Users\joeti\.cursor\plans\enhance_code_blocks_49ce5ee9.plan.md
@src/content/day4.html

Task: Refactor ONLY `src/content/day4.html` code blocks per plan (auth/authorization).
Constraints: no before/after comparisons; no mobile work; do not edit dist/ or shared CSS/JS files.
Do:
- Add short descriptions above each code example.
- Add correct language class + data-type (authentication / authorization) + data-description to each <code>.
- Any >15–20 lines: create Simple snippet first, then <details> with full code split into logical chunks.
- Ensure full chunks use <pre class="line-numbers"> and add separators/comments for JWT parsing + failure cases.
Definition of done: long code collapsed by default; line numbers on full chunks; IDs unique and copy works.
```

#### Day 5 agent prompt

```text
@c:\Users\joeti\.cursor\plans\enhance_code_blocks_49ce5ee9.plan.md
@src/content/day5.html

Task: Refactor ONLY `src/content/day5.html` code blocks per plan (versioning/caching).
Constraints: no before/after comparisons; no mobile work; do not edit dist/ or shared CSS/JS files.
Do:
- Add short descriptions above each code example.
- Add correct language class + data-type (versioning/caching) + data-description to each <code>.
- Split any 15–20+ line blocks into Simple snippet + <details> with full chunks.
- Ensure full chunks use <pre class="line-numbers"> and add separators/comments for version routing + cache headers.
Definition of done: long code collapsed; line numbers on full blocks; copy buttons correct.
```

#### Day 6 agent prompt

```text
@c:\Users\joeti\.cursor\plans\enhance_code_blocks_49ce5ee9.plan.md
@src/content/day6.html

Task: Refactor ONLY `src/content/day6.html` code blocks per plan (performance).
Constraints: no before/after comparisons; no mobile work; do not edit dist/ or shared CSS/JS files.
Do:
- Add short descriptions above each code example.
- Add correct language class + data-type="performance" + data-description to each <code>.
- Any 15–20+ line blocks: Simple snippet first; then <details> full code split into smaller chunks.
- Ensure full chunks use <pre class="line-numbers"> and add separators/comments for complex parts (metrics, caching, rate limits).
Definition of done: long code collapsed; line numbers on full chunks; IDs unique; copy works.
```

#### Day 7 agent prompt

```text
@c:\Users\joeti\.cursor\plans\enhance_code_blocks_49ce5ee9.plan.md
@src/content/day7.html

Task: Refactor ONLY `src/content/day7.html` code blocks per plan (testing + CI/CD).
Constraints: no before/after comparisons; no mobile work; do not edit dist/ or shared CSS/JS files.
Do:
- Add short descriptions above each code example.
- Add correct language classes:
  - JavaScript blocks: language-javascript
  - GitHub Actions workflow: language-yaml
- Add data-type (testing / cicd) + data-description to each <code>.
- Split any 15–20+ line blocks into Simple snippet + <details> full chunks.
- Ensure full chunks use <pre class="line-numbers">.
Definition of done: YAML highlights as YAML; long code collapsed; IDs unique; copy works.
```


