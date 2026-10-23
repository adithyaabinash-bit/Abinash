# VeritasWrite AI — Advanced AI Writing & Proofreading Platform

VeritasWrite AI is an enterprise-grade writing assistant, proofreading workspace, AI authorship detector, and plagiarism verification system built with TypeScript, React 19, Tailwind CSS v4, Express, and Google GenAI.

---

## 1. Feature Status Table

| Feature Area | Implementation Status | Provider / Engine | Verification Method |
|---|---|---|---|
| **Live Writing Editor** | **Completed** | Custom Rich Text Canvas & Markdown formatting | Verified in Browser (Playwright) |
| **Grammar & Spell Engine** | **Completed** | Gemini 3.8 Flash + Fast Local Heuristic Rules Engine | Verified: Offset replacement & inline fixes |
| **Document Scoring** | **Completed** | Correctness, Clarity, Engagement, Delivery algorithm | Verified: Dynamic score circle (0-100) |
| **AI Content Detector** | **Completed** | Probabilistic Perplexity & Burstiness Engine | Verified: Sentence heatmaps & exported report |
| **Plagiarism Checker** | **Completed** | Passage fingerprinting & open corpus matching | Verified: Source percentage & match excerpts |
| **Multi-Mode Paraphraser** | **Completed** | 7 modes (Standard, Professional, Academic, etc.) | Verified: Side-by-side diff & direct editor injection |
| **AI Composition Engine** | **Completed** | Essay, memo, email, and abstract draft generation | Verified: Topic, audience, and length filters |
| **Summarizer** | **Completed** | 5 formats (Short, Detailed, Bullets, Takeaways, Notes)| Verified: Factual compression ratio metric |
| **Readability Studio** | **Completed** | Flesch Reading Ease, Flesch-Kincaid, Gunning Fog | 15 Node.js unit tests passing (`15/15`) |
| **Citation Generator** | **Completed** | APA 7th, MLA 9th, Chicago 17th, and Harvard styles | Verified: Bibliographic reference & in-text parentheticals |
| **Document Cloud & History** | **Completed** | In-memory + LocalStorage document version snapshots | Verified: One-click revision restore |
| **Dark & Light Themes** | **Completed** | Tailwind v4 custom dark-variant stylesheet | Verified on both desktop and mobile frames |

---

## 2. Architecture & Design

```
├── server.ts                    # Full-Stack Express server with Gemini API routes & fallback engines
├── tests/                       # Unit tests executed via node:test and tsx
│   ├── readability.test.ts      # Flesch, Flesch-Kincaid, Gunning Fog, syllable counts
│   ├── grammar-rules.test.ts    # Rule pattern detection, offset recalculation, replacement
│   ├── citation.test.ts         # APA 7th, MLA 9th, Chicago formatting
│   └── text-metrics.test.ts     # Word count, sentence splitting, passive voice detection
├── src/
│   ├── types/writing.ts         # Shared interfaces (WritingIssue, WritingScore, AIDetectionResult, etc.)
│   ├── utils/
│   │   ├── textMetrics.ts       # Pure calculations (words, chars, reading time, passive voice)
│   │   ├── readability.ts       # Scholarly readability formulas & suggestions
│   │   ├── grammarRules.ts      # Local grammar rules & offset-shifting algorithm
│   │   └── citationFormatter.ts # Bibliographic & in-text citation formatters
│   ├── components/
│   │   ├── Navbar.tsx           # Document title, live autosave status, undo/redo, export, theme toggle
│   │   ├── Sidebar.tsx          # Collapsible navigation, monthly usage gauge, shortcuts trigger
│   │   ├── Dashboard.tsx        # Hero banner, quick tool launchers, analytics, recent docs
│   │   ├── Editor/              # Live rich writing canvas with inline flags & analysis drawer
│   │   ├── AIDetector/          # Probabilistic detection, sentence heatmap, limitation notice
│   │   ├── Plagiarism/          # Passage-level similarity verification & matched sources
│   │   ├── Paraphraser/         # 7 rewrite modes with tone tuner & comparison
│   │   ├── AIWriter/            # Structured draft composition with audience controls
│   │   ├── Summarizer/          # Factual condensation engine with 5 formats
│   │   ├── Readability/         # Readability studio & stylistic tone diagnostics
│   │   ├── Citations/           # APA/MLA/Chicago/Harvard bibliographic generator
│   │   ├── Documents/           # Document library, search, tags, version restoration
│   │   └── Modals/              # Keyboard shortcuts & subscription tiers modal
│   └── App.tsx                  # Root state coordinator with undo/redo and autosave
```

---

## 3. Environment Variables

Define the following in `.env` (refer to `.env.example`):

```bash
# GEMINI_API_KEY: Required for server-side Gemini 3.8 Flash AI operations
GEMINI_API_KEY="your-api-key-here"

# APP_URL: Host URL for self-referential links
APP_URL="http://localhost:3000"
```

*Note: If no API key is provided, the platform automatically engages its built-in rule engines for grammar, readability, citations, and probabilistic detection.*

---

## 4. Run, Build & Test Commands

### Development Server
```bash
npm run dev
# Starts full-stack server on http://localhost:3000
```

### Run Unit Tests
```bash
npm run test
# Runs all 15 decoupled logic unit tests via tsx --test
```

### Build Production Bundle
```bash
npm run build
```

### Type Checking & Linting
```bash
npm run lint
```
