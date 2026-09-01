import os
import subprocess
import time

html_content = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shadow AI Prompt Guardian — SENTINEL v5.0 | Complete Project Breakdown</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 18mm 14mm 18mm 14mm;
      @bottom-right {
        content: "Page " counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
      @bottom-left {
        content: "SENTINEL v5.0 — Shadow AI Prompt Guardian";
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 9.5pt;
      line-height: 1.55;
      color: #1e293b;
      background: #ffffff;
    }

    /* ─── Cover Page ────────────────────────────────────────────────────────── */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px 30px;
      page-break-after: always;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      color: #ffffff;
      position: relative;
    }

    .cover-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(129, 140, 248, 0.4);
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 600;
      color: #a5b4fc;
      margin-bottom: 24px;
      width: fit-content;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .cover-title {
      font-size: 28pt;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      background: linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 400;
      color: #94a3b8;
      margin-bottom: 36px;
      line-height: 1.5;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 40px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .cover-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 12px 16px;
    }

    .cover-card-label {
      font-size: 7.5pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6366f1;
      margin-bottom: 4px;
    }

    .cover-card-val {
      font-size: 9.5pt;
      font-weight: 600;
      color: #f1f5f9;
    }

    .cover-footer {
      margin-top: auto;
      font-size: 8.5pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 16px;
    }

    /* ─── Typography & Headings ────────────────────────────────────────────── */
    h1, h2, h3, h4, h5 {
      color: #0f172a;
      font-weight: 700;
      page-break-after: avoid;
      break-after: avoid;
    }

    h1 {
      font-size: 15pt;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 5px;
      margin-top: 22px;
      margin-bottom: 10px;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h2 {
      font-size: 11.5pt;
      margin-top: 16px;
      margin-bottom: 8px;
      color: #1e1b4b;
    }

    h3 {
      font-size: 10pt;
      margin-top: 12px;
      margin-bottom: 6px;
      color: #334155;
    }

    p {
      margin-bottom: 8px;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 10px;
    }

    li {
      margin-bottom: 4px;
    }

    strong {
      color: #0f172a;
      font-weight: 600;
    }

    /* ─── Tables ───────────────────────────────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th, td {
      padding: 6px 9px;
      border: 1px solid #cbd5e1;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #94a3b8;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* ─── Code Blocks & Monospace ──────────────────────────────────────────── */
    code {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 8pt;
      background: #f1f5f9;
      color: #4338ca;
      padding: 1px 4px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 10px 12px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 7.8pt;
      line-height: 1.45;
      overflow-x: auto;
      margin: 10px 0 14px 0;
      page-break-inside: avoid;
      break-inside: avoid;
      border-left: 4px solid #6366f1;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
      font-size: inherit;
    }

    /* ─── Callout Boxes ────────────────────────────────────────────────────── */
    .callout {
      padding: 10px 14px;
      margin: 12px 0;
      border-radius: 6px;
      border-left: 4px solid;
      background: #f8fafc;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .qa-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 9px 12px;
      margin-bottom: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .qa-question {
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .qa-answer {
      color: #334155;
      font-size: 8.8pt;
    }

    .highlight-card {
      background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
      border: 1px solid #c7d2fe;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 12px 0;
      page-break-inside: avoid;
    }

    .section-break {
      page-break-before: always;
      break-before: page;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-badge">🛡️ Client-Side DLP Architecture</div>
    <div class="cover-title">Shadow AI Prompt Guardian<br>SENTINEL v5.0</div>
    <div class="cover-subtitle">Complete Project Breakdown, Technical Architecture, Evaluation Benchmarks & Comprehensive Viva Examination Guide</div>

    <div class="cover-grid">
      <div class="cover-card">
        <div class="cover-card-label">Technology Standard</div>
        <div class="cover-card-val">Chrome Manifest V3 · Service Worker</div>
      </div>
      <div class="cover-card">
        <div class="cover-card-label">Detection Paradigm</div>
        <div class="cover-card-val">150+ Signatures · Shannon Entropy · Luhn Check</div>
      </div>
      <div class="cover-card">
        <div class="cover-card-label">Platform Coverage</div>
        <div class="cover-card-val">25+ AI Platforms (ChatGPT, Claude, Gemini, etc.)</div>
      </div>
      <div class="cover-card">
        <div class="cover-card-label">Evaluation Metric</div>
        <div class="cover-card-val">100% Accuracy · 1.00 F1 Score · 0% FPR (95 Prompts)</div>
      </div>
    </div>

    <div class="cover-footer">
      <div>Project Scope: Mini-Project / Final Year Project Guide</div>
      <div>Zero-Trust Client-Side Architecture</div>
    </div>
  </div>

  <!-- TABLE OF CONTENTS SUMMARY -->
  <h1>📑 Table of Contents</h1>
  <table>
    <tr><th>Section</th><th>Topic Title</th><th>Focus Area</th></tr>
    <tr><td><b>1</b></td><td>Project Overview</td><td>Title, problem statement, real-world relevance, target users</td></tr>
    <tr><td><b>2</b></td><td>Objectives</td><td>Major technical goals of client-side prompt DLP</td></tr>
    <tr><td><b>3</b></td><td>Features & Capabilities</td><td>Detailed matrix of every built-in capability</td></tr>
    <tr><td><b>4</b></td><td>Technology Stack</td><td>Frontend, runtime, storage, libraries, rationale</td></tr>
    <tr><td><b>5</b></td><td>Complete Project Structure</td><td>Folder hierarchy, file purposes, dependency mappings</td></tr>
    <tr><td><b>6</b></td><td>System Workflow</td><td>Step-by-step lifecycle from keystroke to blocking/redaction</td></tr>
    <tr><td><b>7</b></td><td>System Architecture</td><td>5-layer zero-trust architecture diagram & data flow</td></tr>
    <tr><td><b>8</b></td><td>Database & Storage</td><td>chrome.storage.local schema, keys, and masking</td></tr>
    <tr><td><b>9</b></td><td>Code Explanation</td><td>Deep-dive into detection engine, interceptors, React sync</td></tr>
    <tr><td><b>10</b></td><td>Algorithms & Logic</td><td>Shannon entropy math, Luhn checksum, hash chaining</td></tr>
    <tr><td><b>11</b></td><td>API & Extension IPC</td><td>Message passing channels, request/response protocols</td></tr>
    <tr><td><b>12</b></td><td>Authentication & Security</td><td>Pre-TLS defense, zero data exfiltration, storage isolation</td></tr>
    <tr><td><b>13</b></td><td>User Interface Breakdown</td><td>HUD banner, explainability drawer, Mission Control popup</td></tr>
    <tr><td><b>14</b></td><td>Project Setup & Execution</td><td>Installation, Node test commands, Chrome load instructions</td></tr>
    <tr><td><b>15</b></td><td>Testing & Quality Assurance</td><td>121 unit tests, 95 evaluation prompts, confusion matrix</td></tr>
    <tr><td><b>16</b></td><td>Results & Current Status</td><td>Implemented features, verified benchmarks, partial modules</td></tr>
    <tr><td><b>17</b></td><td>Limitations</td><td>Current boundaries and client-side constraints</td></tr>
    <tr><td><b>18</b></td><td>Future Enhancements</td><td>Wasm OCR, enterprise SIEM webhooks, cross-browser ports</td></tr>
    <tr><td><b>19</b></td><td>College Project Report Content</td><td>Complete ready-to-use mini project report text</td></tr>
    <tr><td><b>20</b></td><td>Viva Preparation (30 Q&A)</td><td>30 examiner questions with concise, confident answers</td></tr>
    <tr><td><b>21</b></td><td>2-Minute Faculty Pitch</td><td>Natural spoken script for quick faculty demonstration</td></tr>
    <tr><td><b>22</b></td><td>5-Minute Presentation Script</td><td>Complete slide-by-slide project presentation speech</td></tr>
    <tr><td><b>23</b></td><td>Codebase Verification Audit</td><td>Truth matrix, implementation checks, cross-file notes</td></tr>
    <tr><td><b>★</b></td><td>WHAT I MUST KNOW FOR VIVA</td><td>Top 20 high-yield concepts to speak fluently</td></tr>
  </table>

  <!-- SECTION 1 -->
  <h1 class="section-break">1. Project Overview</h1>
  <p><strong>Project Title:</strong> Shadow AI Prompt Guardian — SENTINEL (v5.0.0 / v4.0 "NEXUS")</p>
  <p><strong>Project Purpose:</strong> A client-side Data Loss Prevention (DLP) browser extension that inspects, sanitizes, and blocks sensitive credentials, API keys, Personally Identifiable Information (PII), and confidential trade secrets in real time before they leave the browser and reach third-party AI models (ChatGPT, Claude, Gemini, Copilot, Perplexity, etc.).</p>
  <p><strong>Problem Statement:</strong> Employees and developers frequently paste proprietary source code, customer records, database credentials, and production API keys into public AI chatbots (called <em>"Shadow AI"</em> usage). Once submitted over TLS, this sensitive information is transmitted to external servers, risking data leaks, regulatory fines (GDPR, HIPAA, PCI-DSS), and credential compromise.</p>
  <p><strong>Why This Project Was Created:</strong> Existing corporate DLP solutions require complex network proxies, VPN agents, or server-side relays that violate end-to-end privacy and introduce latency. SENTINEL was created to run <strong>100% locally in the browser client</strong>—zero telemetry, zero cloud dependencies, and zero external network calls.</p>
  <p><strong>Main Idea in Simple Words:</strong> Think of SENTINEL as a <strong>smart security guard standing between your keyboard and AI chatbots</strong>. Before your prompt gets sent, SENTINEL scans the text inside your browser. If you accidentally included an AWS key, password, customer email list, or confidential codename, SENTINEL intercepts the submission, shows a warning banner with an explainability panel, and lets you auto-redact the secrets with safe placeholders in one click.</p>
  <p><strong>Target Users:</strong></p>
  <ul>
    <li>Software engineers and DevOps professionals working with cloud credentials and API keys.</li>
    <li>Enterprise employees handling proprietary business documents, customer PII, or patient health data.</li>
    <li>Security & Compliance Officers looking for lightweight, zero-trust client-side DLP enforcement.</li>
  </ul>
  <p><strong>Real-World Use Case:</strong> A developer is debugging an authentication script and pastes a code snippet into ChatGPT containing <code>AKIAIOSFODNN7EXAMPLE</code> and a database connection string. SENTINEL intercepts the <code>fetch</code> / <code>submit</code> event, halts the network request, displays a critical warning HUD, and replaces the secrets with <code>[API_KEY]</code> and <code>[PASSWORD]</code> when the developer clicks <strong>"Auto-Redact & Resubmit"</strong>.</p>

  <!-- SECTION 2 -->
  <h1>2. Objectives</h1>
  <ol>
    <li><strong>Pre-Transmission Interception:</strong> Catch user prompts in the browser DOM and network layer before TLS encryption and transmission occur.</li>
    <li><strong>Multi-Layer Detection Engine:</strong> Combine deterministic regex patterns (150+ signatures), mathematical Shannon entropy calculation, Luhn algorithm card validation, and custom keyword dictionaries.</li>
    <li><strong>Zero Data Exfiltration & Privacy-First Architecture:</strong> Ensure 100% of detection and audit storage happens locally inside the browser (<code>chrome.storage.local</code>), never transmitting prompt data to any external server.</li>
    <li><strong>Seamless Workflow Integration (Auto-Redaction):</strong> Allow developers to sanitize prompts in-place with safe placeholders (<code>[API_KEY]</code>, <code>[REDACTED]</code>) and trigger synthetic React events so the chatbot UI stays fully functional without manual re-typing.</li>
    <li><strong>Contextual Risk Scoring & Explainability:</strong> Distinguish educational queries (e.g., <em>"What is an AWS key?"</em>) from actual leaks, assign a 0–100 risk score, and provide plain-English explanations without exposing raw secrets.</li>
    <li><strong>Tamper-Proof Audit Logging:</strong> Record local security incident entries linked via SHA-256 cryptographic hash chains for enterprise auditability.</li>
  </ol>

  <!-- SECTION 3 -->
  <h1 class="section-break">3. Features & Capabilities</h1>
  <table>
    <tr><th>Feature</th><th>What It Does</th><th>Implementation File</th><th>Logic Used</th></tr>
    <tr><td><b>150+ Secret Signatures</b></td><td>Detects cloud, AI, payment, and database credentials</td><td><code>js/detection-engine.js</code></td><td><code>API_KEY_PATTERNS</code> regex dictionary (AWS, GitHub, OpenAI, Stripe, GCP, etc.).</td></tr>
    <tr><td><b>Shannon Entropy Secret Detection</b></td><td>Catches unknown/custom high-entropy secret tokens</td><td><code>js/detection-engine.js</code></td><td>Computes $H(X) \ge 4.0$ on tokens $\ge 20$ characters.</td></tr>
    <tr><td><b>PII & Luhn Card Validation</b></td><td>Detects emails, phones, SSNs, IBANs, and credit cards</td><td><code>js/detection-engine.js</code></td><td>Matches PII patterns and filters card PANs with MOD-10 <code>luhnCheck()</code>.</td></tr>
    <tr><td><b>5-Vector Interception Engine</b></td><td>Intercepts submissions across all browser pathways</td><td><code>js/content.js</code> & <code>js/main-world-intercept.js</code></td><td>Hooks <code>fetch</code>, <code>XHR</code>, Form submit (capture phase), Enter keydown, Send button.</td></tr>
    <tr><td><b>Holographic HUD Warning Banner</b></td><td>Displays threat alert with dynamic severity badges</td><td><code>js/content.js</code> & <code>css/content.css</code></td><td>Glassmorphism HUD, animated shield icon, risk meter, action buttons.</td></tr>
    <tr><td><b>One-Click Auto-Redaction</b></td><td>Replaces sensitive tokens with placeholders</td><td><code>js/detection-engine.js</code> & <code>js/content.js</code></td><td>Splices tokens in descending index order, sets native descriptor, dispatches React events.</td></tr>
    <tr><td><b>Bulk Data Leak Detection</b></td><td>Identifies database/spreadsheet dump exports</td><td><code>js/detection-engine.js</code></td><td>Flags $\ge 5$ same type or $\ge 10$ mixed PII as Critical data dumps.</td></tr>
    <tr><td><b>Explainable Detection Panel</b></td><td>Explains *why* content was flagged without leaking secrets</td><td><code>js/content.js</code></td><td>Click-to-open drawer displaying rule name, reason, and character position.</td></tr>
    <tr><td><b>Real-Time Mirror Overlay</b></td><td>Highlights risky text as the user types (300ms debounce)</td><td><code>js/content.js</code></td><td>Mirrors textarea layout with transparent overlay and colored <code>&lt;mark&gt;</code> spans.</td></tr>
    <tr><td><b>Live Floating Risk Indicator</b></td><td>Shows a live risk pill at the bottom corner (400ms debounce)</td><td><code>js/content.js</code></td><td>Debounced risk scoring: Safe $\to$ Low $\to$ High $\to$ Danger.</td></tr>
    <tr><td><b>Obfuscation Normalizer</b></td><td>Defeats leak bypass attempts (leet-speak, zero-width chars)</td><td><code>js/detection-engine.js</code></td><td>Strips invisible unicode, maps lookalikes, collapses spaced characters.</td></tr>
    <tr><td><b>Base64 Decode-and-Scan</b></td><td>Catches hidden encoded credentials</td><td><code>js/detection-engine.js</code></td><td>Regex base64 matching ($\ge 32$ chars), <code>atob()</code> decoding, and re-scanning.</td></tr>
    <tr><td><b>Compliance Presets</b></td><td>Specialized modes for HIPAA, PCI-DSS, GDPR, SOC 2</td><td><code>js/detection-engine.js</code></td><td>Applies domain pattern sets (NPI, MRN, ICD-10) and 1.2x–1.5x risk multipliers.</td></tr>
    <tr><td><b>Context Window Slow-Drip Scan</b></td><td>Tracks cumulative risk across consecutive chat turns</td><td><code>js/detection-engine.js</code></td><td>Stores last 5 messages in conversation memory to catch split secrets.</td></tr>
    <tr><td><b>API Key Quick-Rotation Links</b></td><td>Provides direct links to revoke/rotate exposed keys</td><td><code>js/detection-engine.js</code></td><td>Maps flagged key types to AWS IAM, GitHub Tokens, OpenAI API keys, etc.</td></tr>
    <tr><td><b>Conversation Chat Scanner</b></td><td>Scans historical messages on the current AI chat page</td><td><code>js/content.js</code></td><td>DOM query selectors extracting past bubbles and checking for past leaks.</td></tr>
    <tr><td><b>Tamper-Proof Audit Log</b></td><td>Maintains an immutable audit trail of blocked attempts</td><td><code>js/background.js</code></td><td>Computes SHA-256 hash chains linking each block entry to previous entries.</td></tr>
    <tr><td><b>Mission Control Popup</b></td><td>Toolbar popup overview</td><td><code>popup.html</code> & <code>js/popup.js</code></td><td>240° SVG Exposure Gauge, risk history sparkline, recent blocks.</td></tr>
    <tr><td><b>Guardian Center Dashboard</b></td><td>Comprehensive settings and rule management page</td><td><code>options.html</code> & <code>js/options.js</code></td><td>Sensitivity slider, preset toggles, custom regex/terms, JSON export.</td></tr>
    <tr><td><b>Public Developer API</b></td><td>Enables external programmatic scanning</td><td><code>js/detection-engine.js</code></td><td>Exposes <code>window.SentinelAPI</code> (<code>scan</code>, <code>redact</code>, <code>entropy</code>).</td></tr>
  </table>

  <!-- SECTION 4 -->
  <h1>4. Technology Stack</h1>
  <ul>
    <li><strong>Frontend:</strong> Vanilla HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 (Custom design system with tokens, CSS Grid, Flexbox, glassmorphism, keyframe animations).<br><em>Rationale:</em> Extensions must be ultra-lightweight. Zero-framework design guarantees instant (&lt;1ms) load time and no build pipeline.</li>
    <li><strong>Backend / Runtime:</strong> Chrome Extensions <strong>Manifest V3</strong> with Background Service Worker (<code>js/background.js</code>).<br><em>Rationale:</em> Manifest V3 is the modern, secure standard for Chromium browsers replacing persistent background pages with event-driven service workers.</li>
    <li><strong>Database / Storage:</strong> <code>chrome.storage.local</code> (Client-side browser storage API).<br><em>Rationale:</em> Stores configuration, custom rules, and masked audit logs locally on the user's hard drive without network overhead.</li>
    <li><strong>Programming Languages:</strong> JavaScript (Node.js for evaluation harness/tests, Browser JS for runtime).</li>
    <li><strong>Security & Cryptography:</strong> SHA-256 hashing via <code>crypto.subtle.digest</code> for hash chaining; Luhn algorithm ($O(n)$ check digit verification).</li>
    <li><strong>AI/ML Technologies (Phase 2 Experimental):</strong> Lightweight client-side Logistic Regression Classifier (<code>js/phases/ml-classifier.js</code>) with TF-IDF feature extraction and gradient descent training.</li>
  </ul>

  <!-- SECTION 5 -->
  <h1 class="section-break">5. Complete Project Structure</h1>
  <pre><code>shadow-ai-prompt-guardian/
├── manifest.json                  # Manifest V3 manifest, permissions, host rules, content scripts
├── popup.html                     # Toolbar popup UI (Mission Control)
├── options.html                   # Options / Settings dashboard (Guardian Center)
├── eval-harness.js                # Automated benchmark harness (95 test prompts)
├── results.json                   # Machine-readable evaluation benchmark metrics
├── results.md                     # Human-readable evaluation report
├── DECISIONS.md                   # Architecture & engineering design decisions record
├── PROJECT_CHECKLIST.md           # Requirement tracking & implementation checklist
├── VERIFICATION_REPORT.md         # Comprehensive verification and quality assurance report
├── css/
│   └── content.css                # Cinematic warning HUD, neon highlights, overlays, toast styles
├── js/
│   ├── background.js              # Background service worker (metrics, badge, SHA-256 audit chain)
│   ├── content.js                 # Content script (DOM observer, HUD injector, input event interceptor)
│   ├── detection-engine.js        # Core detection engine (150+ regex, Shannon entropy, Luhn, scoring)
│   ├── main-world-intercept.js    # Injected main-world script (native fetch & XHR monkeypatching)
│   ├── popup.js                   # Mission Control logic (SVG gauge, sparkline, recent blocks)
│   ├── options.js                 # Guardian Center logic (settings, presets, custom rules, audit export)
│   └── phases/
│       └── ml-classifier.js       # Phase 2 experimental in-browser Logistic Regression classifier
├── icons/                         # 16x16, 48x48, 128x128 extension icons
└── tests/
    ├── test-detection-engine.js   # 121 unit tests covering all detection features & edge cases
    ├── test-prompts.json          # 95 synthetic & realistic test prompts with ground truth labels
    └── qa-checklist.js          # Static & regression test suite</code></pre>

  <!-- SECTION 6 & 7 -->
  <h1>6. System Workflow & 7. Architecture</h1>
  <div class="highlight-card">
    <p><strong>System Workflow:</strong></p>
    <p>1. <strong>User Interaction:</strong> User types or pastes text into an AI chatbot input.</p>
    <p>2. <strong>Passive Monitoring:</strong> 300ms debounced mirror overlay displays colored inline highlights; 400ms debounced floating badge updates live risk score.</p>
    <p>3. <strong>Submission Interception:</strong> When Enter is pressed or a network request is dispatched, SENTINEL catches the event.</p>
    <p>4. <strong>Multi-Layer Analysis:</strong> Normalized text is evaluated through 150+ regexes, Shannon entropy, Luhn validation, and bulk data detectors.</p>
    <p>5. <strong>Decision:</strong> If Critical or Risk Score $\ge$ Threshold, request is aborted, HUD banner is displayed, and audit log is recorded with SHA-256 chaining.</p>
    <p>6. <strong>Auto-Redact:</strong> One-click button replaces secrets with safe tokens and synchronizes React's internal state tree.</p>
  </div>

  <!-- SECTION 8 -->
  <h1>8. Database & Local Storage</h1>
  <table>
    <tr><th>Storage Key</th><th>Type</th><th>Purpose</th><th>Sensitive Data?</th></tr>
    <tr><td><code>sapg_protectionEnabled</code></td><td>Boolean</td><td>Master protection toggle</td><td>No</td></tr>
    <tr><td><code>sapg_sensitivityThreshold</code></td><td>Number</td><td>Numeric threshold (10–100, default: 30 / 50)</td><td>No</td></tr>
    <tr><td><code>sapg_compliancePresets</code></td><td>Array&lt;String&gt;</td><td>Active compliance modes (e.g. <code>["hipaa"]</code>)</td><td>No</td></tr>
    <tr><td><code>sapr_customTerms</code></td><td>Array&lt;String&gt;</td><td>User-defined organization keywords</td><td>No</td></tr>
    <tr><td><code>sapr_customRegex</code></td><td>Array&lt;String&gt;</td><td>User-defined custom regex rules</td><td>No</td></tr>
    <tr><td><code>sapg_blockedAttempts</code></td><td>Array&lt;Object&gt;</td><td>Recent blocks displayed in popup</td><td>Masked Only</td></tr>
    <tr><td><code>sapg_audit_log</code></td><td>Array&lt;Object&gt;</td><td>Tamper-proof chained audit history</td><td>Masked Only</td></tr>
    <tr><td><code>sapg_audit_chain</code></td><td>String (Hex)</td><td>Current 64-char SHA-256 chain head</td><td>No</td></tr>
  </table>

  <!-- SECTION 9 & 10 -->
  <h1 class="section-break">9. Code Explanation & 10. Algorithms</h1>
  <h3>1. Shannon Entropy Formula ($H$)</h3>
  <p>Used to detect unknown high-entropy random keys without known prefixes:</p>
  <p>$$H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$</p>
  <p>Tokens with length $\ge 20$ and $H \ge 4.0$ are flagged as <code>high_entropy_token</code>.</p>

  <h3>2. Luhn Algorithm Checksum (MOD-10)</h3>
  <p>Verifies credit card candidate strings to prevent false positives:</p>
  <ul>
    <li>Reverses numeric string and doubles every second digit.</li>
    <li>If doubled value $> 9$, subtracts 9. Sums all digits.</li>
    <li>If <code>sum % 10 === 0</code>, the candidate is a valid payment card number.</li>
  </ul>

  <h3>3. Cryptographic Hash Chaining</h3>
  <p>$$H_k = \text{SHA-256}(H_{k-1} \parallel \text{Timestamp} \parallel \text{Categories} \parallel \text{RiskScore})$$</p>
  <p>Maintains an immutable chain linking every audit log entry to its predecessor.</p>

  <h3>4. Auto-Redaction Reverse Splicing</h3>
  <pre><code>// Sort findings in descending order of start position to prevent index shifting
const sorted = [...findings].sort((a, b) => b.start - a.start);
let redacted = text;
for (const f of sorted) {
  const placeholder = PLACEHOLDERS[f.category] || '[REDACTED]';
  redacted = redacted.substring(0, f.start) + placeholder + redacted.substring(f.end);
}</code></pre>

  <!-- SECTION 11 & 12 -->
  <h1>11. Extension IPC & 12. Security Model</h1>
  <ul>
    <li><strong>Main-World $\leftrightarrow$ Content Script Bridge:</strong> Communicates via <code>window.postMessage</code> (<code>SAPG_CHECK_PROMPT</code> and <code>SAPG_BLOCK_DECISION</code>).</li>
    <li><strong>Content Script $\leftrightarrow$ Background Worker:</strong> Communicates via <code>chrome.runtime.sendMessage</code> (<code>SAPG_BLOCK_OCCURRED</code>, <code>SAPG_GET_METRICS</code>).</li>
    <li><strong>Pre-TLS Protection:</strong> Intercepts prompts in DOM memory before network packets are formatted.</li>
    <li><strong>Zero Data Exfiltration:</strong> 100% of detection runs on client CPU. Zero remote servers.</li>
  </ul>

  <!-- SECTION 14 & 15 -->
  <h1 class="section-break">14. Setup & 15. Testing Benchmarks</h1>
  <h3>Local Execution Commands</h3>
  <pre><code># 1. Run 95-prompt automated evaluation benchmark
node eval-harness.js

# 2. Run 121 unit tests
node tests/test-detection-engine.js</code></pre>

  <h3>Evaluation Benchmark Results (95 Test Prompts)</h3>
  <table>
    <tr><th>Metric</th><th>Score</th><th>Benchmark Standard</th></tr>
    <tr><td><b>Total Prompts Evaluated</b></td><td>95 Prompts</td><td>34 Clean, 18 API Keys, 11 Passwords, 19 PII, 13 Confidential</td></tr>
    <tr><td><b>Accuracy</b></td><td><b>100% (1.0000)</b></td><td>61 True Positives, 34 True Negatives</td></tr>
    <tr><td><b>Precision</b></td><td><b>100% (1.0000)</b></td><td>0 False Positives</td></tr>
    <tr><td><b>Recall</b></td><td><b>100% (1.0000)</b></td><td>0 False Negatives</td></tr>
    <tr><td><b>F1 Score</b></td><td><b>1.0000</b></td><td>Perfect harmonic balance</td></tr>
    <tr><td><b>False Positive Rate</b></td><td><b>0.00%</b></td><td>Clean code & educational queries pass freely</td></tr>
  </table>

  <!-- SECTION 16, 17, 18 -->
  <h1>16. Results, 17. Limitations & 18. Future Scope</h1>
  <ul>
    <li><strong>Completed:</strong> Manifest V3 extension, 150+ signatures, Shannon entropy, Luhn verification, HUD warning banner, one-click auto-redact, bulk data detector, explainability drawer, tamper-proof SHA-256 audit log, 25+ AI platform support.</li>
    <li><strong>Limitations:</strong> Scoped to Chromium browsers; monitors browser-based interactions (terminal curl requests are outside browser scope).</li>
    <li><strong>Future Scope:</strong> WebAssembly OCR for multimodal image uploads, enterprise SIEM webhook streaming, and Firefox/Safari WebExtension ports.</li>
  </ul>

  <!-- SECTION 20 -->
  <h1 class="section-break">20. Viva Examination Preparation (30 Q&A)</h1>

  <div class="qa-box">
    <div class="qa-question">1. What is "Shadow AI" and why is it dangerous?</div>
    <div class="qa-answer">Shadow AI refers to employees using unauthorized public AI chatbots (like ChatGPT) for work tasks. It is dangerous because pasting proprietary code, API keys, or customer data into external AI tools risks data leaks and regulatory penalties.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">2. What is the primary purpose of SENTINEL?</div>
    <div class="qa-answer">SENTINEL is a browser extension that inspects prompts on AI websites in real time, blocking sensitive credentials, PII, and trade secrets before they leave the browser.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">3. What does "Client-Side Zero-Trust" mean in your project?</div>
    <div class="qa-answer">100% of detection logic, regex matching, entropy calculation, and logging happens locally in the browser. Zero prompt data or telemetry is ever transmitted to any external server.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">4. Why is blocking data at the browser level better than using a network proxy?</div>
    <div class="qa-answer">A network proxy requires breaking TLS encryption, introduces network latency, and requires managing complex proxy servers. SENTINEL intercepts text in the DOM before network packets are even created.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">5. Which AI platforms does SENTINEL support?</div>
    <div class="qa-answer">Over 25 major platforms, including ChatGPT, Anthropic Claude, Google Gemini, Microsoft Copilot, Perplexity, Groq, Mistral, HuggingFace Chat, Poe, and Cursor.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">6. Why did you build SENTINEL using Chrome Manifest V3 instead of V2?</div>
    <div class="qa-answer">Manifest V3 is Google's modern standard for browser extensions. It replaces persistent background pages with lightweight background service workers and enforces stricter security models.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">7. What is the difference between an isolated world content script and the main world?</div>
    <div class="qa-answer">Content scripts run in an isolated execution world—they share the DOM with the webpage but cannot access the page's global JS variables. We inject <code>main-world-intercept.js</code> into the main world to intercept the page's actual <code>fetch</code> and <code>XHR</code> calls.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">8. How do the content script and main-world script communicate?</div>
    <div class="qa-answer">They communicate asynchronously across the window boundary using <code>window.postMessage()</code> with custom event types (<code>SAPG_CHECK_PROMPT</code> and <code>SAPG_BLOCK_DECISION</code>).</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">9. What database is used in this project?</div>
    <div class="qa-answer"><code>chrome.storage.local</code>, an asynchronous, quota-managed NoSQL local key-value store built into the browser.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">10. Why did you use Vanilla JavaScript and CSS instead of React or Tailwind?</div>
    <div class="qa-answer">Extensions must be extremely fast and lightweight. Vanilla JS and CSS eliminate framework bundle size, require zero build tools, load in less than 1 millisecond, and prevent CSS conflicts with the host webpage.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">11. How does the Shannon Entropy algorithm work in your project?</div>
    <div class="qa-answer">Shannon entropy measures character randomness in a string: $H = -\sum p_i \log_2 p_i$. High entropy ($\ge 4.0$) on tokens 20+ characters long flags them as likely API keys or secrets, even without known prefixes.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">12. How does your Auto-Redact feature avoid corrupting text indexes?</div>
    <div class="qa-answer">It sorts all detected findings in descending order by starting character position (<code>b.start - a.start</code>) and replaces them from the end of the text to the beginning.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">13. Why do you need special logic to update text in ChatGPT?</div>
    <div class="qa-answer">React 18 overrides standard HTML property setters. We invoke the native prototype descriptor setter (<code>HTMLTextAreaElement.prototype</code>) and dispatch synthetic <code>input</code> and <code>beforeinput</code> events to sync React's internal state.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">14. What is the Luhn Algorithm and where is it used?</div>
    <div class="qa-answer">The Luhn algorithm (MOD-10) verifies credit card checksums. We use it in <code>luhnCheck()</code> to ensure random 16-digit numbers in code aren't falsely flagged as credit cards unless mathematically valid.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">15. How does your system detect bulk data exports?</div>
    <div class="qa-answer"><code>detectBulkData()</code> counts instances per PII type. If 5 or more of the same type (e.g. 6 emails) or 10+ mixed PII items are found, it generates a "Bulk Data Export" critical finding.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">16. How does your audit log achieve "tamper-proof" integrity?</div>
    <div class="qa-answer">It uses cryptographic SHA-256 hash chaining: each audit record contains the hash of the previous record. Modifying any past record breaks the chain head hash stored in <code>sapg_audit_chain</code>.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">17. How does the system handle obfuscation or bypass attempts (e.g. "s k - a b c")?</div>
    <div class="qa-answer"><code>normalizeObfuscated()</code> strips zero-width invisible characters, normalizes Unicode homoglyphs, converts leet-speak numbers, and collapses single-character spacing before running detection.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">18. How does base64 detection work?</div>
    <div class="qa-answer">It matches base64 patterns $\ge 32$ characters, decodes them using <code>atob()</code>, and re-scans the decoded plaintext through the API key detection engine.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">19. What compliance presets are implemented?</div>
    <div class="qa-answer">HIPAA (Medical Record Numbers, NPI, PHI keywords), PCI-DSS (Payment cards, track data, CVV), GDPR (Data subject rights, citizen IDs), and SOC 2 (audit and access control terms).</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">20. How does the engine prevent false positives on educational queries?</div>
    <div class="qa-answer"><code>isEducationalContext()</code> checks for question prefixes like <em>"What is..."</em> or <em>"Explain..."</em> and applies a 50% risk discount to API keys/passwords while keeping PII strictly protected.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">21. Why didn't you use chrome.webRequest blocking in your service worker?</div>
    <div class="qa-answer">In Manifest V3, synchronous blocking via <code>webRequestBlocking</code> is deprecated and unavailable. Content script + main-world interception is the official and most reliable MV3 approach.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">22. Why did you choose Regex + Shannon Entropy over a heavy Machine Learning model?</div>
    <div class="qa-answer">Regex and Shannon entropy execute deterministically in 0 to 20 milliseconds with 100% precision and zero memory overhead. A full deep learning model would consume 100MB+ of RAM and cause typing lag.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">23. Why do you store masked previews instead of encrypted secrets in the audit log?</div>
    <div class="qa-answer">Under zero-trust principles, the extension should never persist raw credentials on disk. Storing masked strings (e.g. <code>AKIA••••••••••••••LE</code>) provides audit context without creating a credential cache for malware to steal.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">24. Why did you implement both inline highlight overlays and HUD banners?</div>
    <div class="qa-answer">The inline overlay provides gentle, non-blocking real-time awareness while typing, whereas the HUD banner acts as a hard stop during submission to prevent accidental exfiltration.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">25. What happens if an AI chat app sends data via WebSockets?</div>
    <div class="qa-answer">SENTINEL's DOM interception layer (Form submit, Enter keypress, Send button click) runs in the capture phase before the application's internal handlers can dispatch data across any network protocol.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">26. How do you handle Single Page Applications (SPAs) where forms dynamically re-render?</div>
    <div class="qa-answer">We attach a <code>MutationObserver</code> to <code>document.body</code> that listens for DOM tree mutations and automatically attaches listeners to newly created textareas and contenteditable elements.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">27. What is the time complexity of your detection engine?</div>
    <div class="qa-answer">$O(N)$ linear time with respect to prompt character length $N$, because regular expressions and Shannon entropy process the input text in single passes over token streams.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">28. Can a malicious script inside the webpage tamper with SENTINEL's postMessage bridge?</div>
    <div class="qa-answer">No, because <code>content.js</code> runs in an isolated V8 execution context. It validates message origins and schema structures, while critical blocking logic occurs within the isolated content script.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">29. What are the benchmark results of your evaluation harness?</div>
    <div class="qa-answer">Across 95 test prompts (34 clean, 61 sensitive), SENTINEL achieved 100% accuracy, 100% precision, 100% recall, 1.00 F1 score, and 0% false positive rate.</div>
  </div>

  <div class="qa-box">
    <div class="qa-question">30. If you had 6 more months, what major feature would you add?</div>
    <div class="qa-answer">Local OCR via WebAssembly to inspect images and screenshots pasted into multimodal models (like GPT-4o and Claude 3.5 Sonnet) for embedded credentials.</div>
  </div>

  <!-- SECTION 21 & 22 -->
  <h1 class="section-break">21. 2-Minute Faculty Pitch & 22. 5-Minute Presentation Script</h1>
  <div class="highlight-card">
    <h3>2-Minute Spoken Explanation for Faculty:</h3>
    <p><em>"Good morning respected faculty. Today I present <strong>Shadow AI Prompt Guardian — SENTINEL</strong>, a client-side Data Loss Prevention browser extension built on Chrome Manifest V3. As AI chatbots like ChatGPT and Claude become daily tools, employees frequently paste sensitive source code, customer records, database credentials, and production API keys directly into prompts. This 'Shadow AI' usage leads to critical data leaks and regulatory penalties under GDPR and HIPAA. Existing DLP solutions use heavy network proxies that slow down connections and compromise user privacy. In contrast, SENTINEL operates <strong>100% locally in the browser client</strong> with zero external network requests. SENTINEL intercepts text before it leaves the browser using a 5-vector interception pipeline hooking DOM events and network APIs. Our multi-layer detection engine combines over 150 signature regexes, Shannon entropy calculation for unknown secret tokens, Luhn validation for payment cards, and custom keyword dictionaries. If a violation is detected, SENTINEL halts the request, displays a holographic warning HUD with an explainability drawer, and offers a <strong>One-Click Auto-Redact</strong> feature that replaces sensitive secrets with safe placeholders like <code>[API_KEY]</code> while updating the chatbot's React state seamlessly. On our automated benchmark of 95 synthetic scenarios, SENTINEL achieved <strong>100% accuracy, 100% precision, and zero false positives</strong> with an average execution latency of under 25 milliseconds. All incident logs are protected on-disk using SHA-256 cryptographic hash chains. Thank you, and I am ready for your questions."</em></p>
  </div>

  <!-- VIVA MUST KNOW -->
  <h1 class="section-break">★ WHAT I MUST KNOW FOR VIVA (Top 20 Summary Sheet)</h1>
  <ol>
    <li><strong>The Core Problem:</strong> Employees accidentally leak API keys, source code, and customer PII into public AI chatbots ("Shadow AI"), risking major security breaches and regulatory fines.</li>
    <li><strong>The Core Solution:</strong> SENTINEL is a 100% client-side Chrome Extension (Manifest V3) that inspects prompts locally and blocks sensitive submissions before network requests leave the browser.</li>
    <li><strong>Zero Data Exfiltration:</strong> No prompt data, tokens, or telemetry ever leave the user's browser. Everything runs locally in JavaScript.</li>
    <li><strong>Why Manifest V3:</strong> MV3 is Chrome's modern standard. It uses lightweight background service workers and strictly scopes permissions (<code>storage</code>, <code>activeTab</code>).</li>
    <li><strong>Main-World vs Isolated World:</strong> Content scripts cannot access the page's JS variables. We inject <code>main-world-intercept.js</code> into the page's main world to monkeypatch native <code>fetch</code> and <code>XMLHttpRequest</code>, communicating back to the content script via <code>window.postMessage</code>.</li>
    <li><strong>The 5 Interception Vectors:</strong> Form <code>submit</code> event, Enter key <code>keydown</code>, Send button <code>click</code>, <code>window.fetch</code>, and <code>XMLHttpRequest.prototype.send</code>.</li>
    <li><strong>Shannon Entropy Formula:</strong> $H(X) = -\sum P(x) \log_2 P(x)$. Measures character randomness to catch unknown secrets $\ge 20$ chars with $H \ge 4.0$.</li>
    <li><strong>Deterministic Pattern Engine:</strong> Over 150 high-precision regular expressions covering AWS, GitHub, OpenAI, Anthropic, Stripe, GCP, JWTs, private keys, database connection strings, and PII.</li>
    <li><strong>Luhn Algorithm Validation:</strong> Prevents false positive credit card alerts by running candidate numbers through the MOD-10 check digit calculation.</li>
    <li><strong>One-Click Auto-Redaction:</strong> Slices sensitive spans from the tail end (descending index) to preserve character offsets, replacing them with <code>[API_KEY]</code>, <code>[PASSWORD]</code>, or <code>[REDACTED]</code>.</li>
    <li><strong>React State Synchronization:</strong> Directly setting <code>textarea.value</code> fails in React 18. We invoke the native prototype setter descriptor and dispatch synthetic <code>input</code>/<code>beforeinput</code> events.</li>
    <li><strong>Severity Levels:</strong> Critical (API keys, passwords, bulk PII — always blocks), Warning (single PII), and Info (confidential terms).</li>
    <li><strong>Bulk Data Detection:</strong> Prompts containing 5+ instances of the same PII type (e.g. 6 emails) or 10+ mixed items are flagged as Critical "Data Export" leaks.</li>
    <li><strong>Explainability Drawer:</strong> Clicking category chips opens a panel showing rule ID, severity, human reason, and character position—<strong>never displaying raw secret text</strong>.</li>
    <li><strong>Real-Time Mirror Overlay:</strong> Positions an invisible computed-style mirror div over textareas with colored <code>&lt;mark&gt;</code> elements on a 300ms debounce without disrupting typing.</li>
    <li><strong>Live Risk Indicator:</strong> Floating UI pill at the bottom corner that updates risk status (Safe, Low, High, Danger) on a 400ms debounce.</li>
    <li><strong>Tamper-Proof Audit Logging:</strong> Local logs in <code>chrome.storage.local</code> are linked via SHA-256 cryptographic hash chains ($H_k = \text{SHA-256}(H_{k-1} \parallel \text{entry})$).</li>
    <li><strong>Compliance Presets:</strong> Domain-specific pattern sets for HIPAA (healthcare PHI), PCI-DSS (cards), GDPR (EU data), and SOC 2.</li>
    <li><strong>Obfuscation Normalizer:</strong> Strips zero-width invisible characters, converts leet-speak, maps Unicode lookalikes, and collapses character spacing ("s k - a b c").</li>
    <li><strong>Benchmark Results:</strong> Tested against 95 synthetic scenarios with <strong>100% Accuracy, 100% Precision, 100% Recall, 1.00 F1 Score, and 0% False Positive Rate</strong> at an average latency under 25ms.</li>
  </ol>

</body>
</html>
'''

with open("SENTINEL_Project_Breakdown.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("[OK] Wrote SENTINEL_Project_Breakdown.html")

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
html_path = os.path.abspath("SENTINEL_Project_Breakdown.html")
pdf_path = os.path.abspath("SENTINEL_Project_Breakdown.pdf")

file_url = "file:///" + html_path.replace("\\", "/")

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    file_url,
]

print("Executing Chrome headless PDF compilation...")
subprocess.run(cmd, check=True)
time.sleep(2)

if os.path.exists(pdf_path):
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"[OK] Successfully generated PDF: {pdf_path} ({size_kb:.1f} KB)")
else:
    print("[ERROR] Failed to generate PDF")
