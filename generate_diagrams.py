import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
os.makedirs("generated_figures", exist_ok=True)

# Common styling for diagrams
diagram_css = """
body {
    margin: 0;
    padding: 20px;
    background: #ffffff;
    font-family: 'Segoe UI', Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
}
.diagram-box {
    border: 1.5px solid #0f172a;
    background: #ffffff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.node {
    fill: #f8fafc;
    stroke: #334155;
    stroke-width: 1.5;
}
.node-accent {
    fill: #eff6ff;
    stroke: #2563eb;
    stroke-width: 2;
}
.node-danger {
    fill: #fef2f2;
    stroke: #dc2626;
    stroke-width: 2;
}
.node-success {
    fill: #f0fdf4;
    stroke: #16a34a;
    stroke-width: 2;
}
.node-purple {
    fill: #faf5ff;
    stroke: #9333ea;
    stroke-width: 2;
}
.txt-title {
    font-size: 13px;
    font-weight: bold;
    fill: #0f172a;
    text-anchor: middle;
}
.txt-sub {
    font-size: 11px;
    fill: #475569;
    text-anchor: middle;
}
.arrow {
    stroke: #475569;
    stroke-width: 1.5;
    fill: none;
    marker-end: url(#arrowhead);
}
.arrow-dash {
    stroke: #2563eb;
    stroke-width: 1.5;
    stroke-dasharray: 4,3;
    fill: none;
    marker-end: url(#arrowhead-blue);
}
"""

# 1. Figure 1.1: Overview of SENTINEL
fig1_1_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>{diagram_css}</style>
</head>
<body>
<div class="diagram-box">
<svg width="820" height="380" viewBox="0 0 820 380">
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#475569" />
    </marker>
    <marker id="arrowhead-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
    </marker>
  </defs>

  <!-- User / Interface -->
  <rect x="20" y="140" width="150" height="80" rx="8" class="node-accent" />
  <text x="95" y="172" class="txt-title">End User / Developer</text>
  <text x="95" y="192" class="txt-sub">Enters Prompt in AI Web UI</text>
  <text x="95" y="206" class="txt-sub">(ChatGPT, Claude, Gemini)</text>

  <!-- Content Script Interceptor -->
  <rect x="220" y="130" width="160" height="100" rx="8" class="node-purple" />
  <text x="300" y="162" class="txt-title">SENTINEL Content Script</text>
  <text x="300" y="180" class="txt-sub">&bull; DOM Input / Keydown Trap</text>
  <text x="300" y="196" class="txt-sub">&bull; Submit Button Observer</text>
  <text x="300" y="212" class="txt-sub">&bull; Fetch/XHR Hook (Pre-TLS)</text>

  <!-- Detection Engine -->
  <rect x="430" y="110" width="170" height="140" rx="8" class="node-accent" />
  <text x="515" y="138" class="txt-title">Core Detection Engine</text>
  <text x="515" y="158" class="txt-sub">1. Regex Secret Patterns</text>
  <text x="515" y="176" class="txt-sub">2. Shannon Entropy (H &ge; 3.8)</text>
  <text x="515" y="194" class="txt-sub">3. PII &amp; Luhn Algorithm</text>
  <text x="515" y="212" class="txt-sub">4. Org Keyword Matcher</text>
  <text x="515" y="232" class="txt-sub">5. Contextual Risk Scoring</text>

  <!-- Decision Fork -->
  <polygon points="690,140 760,180 690,220 620,180" class="node" style="fill:#fef3c7; stroke:#d97706;" />
  <text x="690" y="178" class="txt-title" style="font-size:11px;">Violation?</text>
  <text x="690" y="192" class="txt-sub" style="font-size:10px;">Score &gt; 0</text>

  <!-- Clean Branch (Pass) -->
  <rect x="630" y="20" width="160" height="65" rx="8" class="node-success" />
  <text x="710" y="48" class="txt-title" style="fill:#166534;">Safe Prompt: Allowed</text>
  <text x="710" y="68" class="txt-sub">Direct Transmission to AI Model</text>

  <!-- Blocked Branch (Modal) -->
  <rect x="620" y="280" width="180" height="75" rx="8" class="node-danger" />
  <text x="710" y="306" class="txt-title" style="fill:#991b1b;">Interception &amp; Warning Modal</text>
  <text x="710" y="324" class="txt-sub">&bull; In-Place Auto-Redaction</text>
  <text x="710" y="340" class="txt-sub">&bull; Masked Audit Log in Local Storage</text>

  <!-- Arrows -->
  <path d="M 170 180 L 220 180" class="arrow" />
  <path d="M 380 180 L 430 180" class="arrow" />
  <path d="M 600 180 L 620 180" class="arrow" />

  <!-- Decision to Clean -->
  <path d="M 690 140 L 690 85" class="arrow" />
  <text x="702" y="115" class="txt-sub" style="fill:#16a34a; font-weight:bold;">No</text>

  <!-- Decision to Block -->
  <path d="M 690 220 L 690 280" class="arrow" />
  <text x="702" y="252" class="txt-sub" style="fill:#dc2626; font-weight:bold;">Yes</text>

  <!-- Feedback Loop from Modal to AI -->
  <path d="M 620 320 C 400 360, 280 340, 240 230" class="arrow-dash" />
  <text x="360" y="345" class="txt-sub" style="fill:#2563eb; font-weight:bold;">Sanitized Prompt Injected in DOM</text>
</svg>
</div>
</body>
</html>"""

with open("generated_figures/fig1_1.html", "w", encoding="utf-8") as f:
    f.write(fig1_1_html)

# 2. Figure 7.1: Detailed System Architecture
fig7_1_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>{diagram_css}</style>
</head>
<body>
<div class="diagram-box">
<svg width="840" height="520" viewBox="0 0 840 520">
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#475569" />
    </marker>
  </defs>

  <!-- Layer 1: Presentation / Web Applications -->
  <rect x="30" y="20" width="780" height="70" rx="8" class="node" style="fill:#f8fafc; stroke:#94a3b8;" />
  <text x="180" y="42" class="txt-title" style="text-anchor:start;">LAYER 1: USER INTERACTION &amp; AI PLATFORM INTERFACES</text>
  <rect x="50" y="52" width="130" height="28" rx="4" class="node-accent" /><text x="115" y="70" class="txt-sub">ChatGPT Web UI</text>
  <rect x="200" y="52" width="130" height="28" rx="4" class="node-accent" /><text x="265" y="70" class="txt-sub">Claude.ai Web UI</text>
  <rect x="350" y="52" width="130" height="28" rx="4" class="node-accent" /><text x="415" y="70" class="txt-sub">Google Gemini UI</text>
  <rect x="500" y="52" width="130" height="28" rx="4" class="node-accent" /><text x="565" y="70" class="txt-sub">Microsoft Copilot</text>
  <rect x="650" y="52" width="140" height="28" rx="4" class="node-accent" /><text x="720" y="70" class="txt-sub">Perplexity / Grok / Poe</text>

  <!-- Layer 2: Deep Interception Pipeline -->
  <rect x="30" y="115" width="780" height="80" rx="8" class="node-purple" />
  <text x="180" y="137" class="txt-title" style="text-anchor:start; fill:#6b21a8;">LAYER 2: DEEP INTERCEPTION PIPELINE (MANIFEST V3 CONTENT SCRIPT)</text>
  <rect x="50" y="148" width="165" height="34" rx="4" class="node" /><text x="132" y="169" class="txt-sub">DOM Keystroke / Enter Trap</text>
  <rect x="235" y="148" width="165" height="34" rx="4" class="node" /><text x="317" y="169" class="txt-sub">MutationObserver (Buttons)</text>
  <rect x="420" y="148" width="175" height="34" rx="4" class="node" /><text x="507" y="169" class="txt-sub">Window.fetch Capture Hook</text>
  <rect x="615" y="148" width="175" height="34" rx="4" class="node" /><text x="702" y="169" class="txt-sub">XMLHttpRequest Hook (XHR)</text>

  <!-- Layer 3: Core Multi-Layer Detection Engine -->
  <rect x="30" y="220" width="780" height="110" rx="8" class="node-accent" />
  <text x="180" y="242" class="txt-title" style="text-anchor:start; fill:#1e40af;">LAYER 3: CORE MULTI-LAYER DETECTION &amp; HEURISTIC ENGINE</text>
  <rect x="50" y="255" width="160" height="60" rx="4" class="node" />
  <text x="130" y="278" class="txt-title" style="font-size:11px;">Known Secrets</text>
  <text x="130" y="295" class="txt-sub">AWS, OpenAI, GitHub</text>
  <text x="130" y="308" class="txt-sub">Stripe, Slack, Azure</text>

  <rect x="230" y="255" width="160" height="60" rx="4" class="node" />
  <text x="310" y="278" class="txt-title" style="font-size:11px;">Shannon Entropy</text>
  <text x="310" y="295" class="txt-sub">Information Entropy (H)</text>
  <text x="310" y="308" class="txt-sub">Random High-Entropy Keys</text>

  <rect x="410" y="255" width="160" height="60" rx="4" class="node" />
  <text x="490" y="278" class="txt-title" style="font-size:11px;">PII Recognition</text>
  <text x="490" y="295" class="txt-sub">SSN, Phone, Email</text>
  <text x="490" y="308" class="txt-sub">Luhn Credit Cards</text>

  <rect x="590" y="255" width="200" height="60" rx="4" class="node" />
  <text x="690" y="278" class="txt-title" style="font-size:11px;">Confidential Terms &amp; Risk</text>
  <text x="690" y="295" class="txt-sub">Project Codenames, NDA</text>
  <text x="690" y="308" class="txt-sub">Weighted Risk Evaluator</text>

  <!-- Layer 4: Enforcement & Remediation -->
  <rect x="30" y="355" width="780" height="75" rx="8" class="node-danger" />
  <text x="180" y="377" class="txt-title" style="text-anchor:start; fill:#991b1b;">LAYER 4: ENFORCEMENT, REMEDIATION &amp; UI NOTIFICATION</text>
  <rect x="50" y="388" width="225" height="30" rx="4" class="node" /><text x="162" y="407" class="txt-sub">Glassmorphism Interception Modal</text>
  <rect x="300" y="388" width="225" height="30" rx="4" class="node" /><text x="412" y="407" class="txt-sub">Reverse-Splice Auto-Redaction</text>
  <rect x="550" y="388" width="240" height="30" rx="4" class="node" /><text x="670" y="407" class="txt-sub">Inline Coordinate Highlighting</text>

  <!-- Layer 5: Local Storage & Security -->
  <rect x="30" y="450" width="780" height="55" rx="8" class="node-success" />
  <text x="180" y="470" class="txt-title" style="text-anchor:start; fill:#166534;">LAYER 5: ZERO-TRUST LOCAL PERSISTENCE (100% CLIENT-SIDE STORAGE)</text>
  <text x="420" y="492" class="txt-sub">&bull; Masked Audit Log &bull; Custom Regex Rules &bull; Domain Whitelist &bull; Zero Remote Telemetry &bull; chrome.storage.local</text>

  <!-- Inter-layer connecting arrows -->
  <path d="M 420 90 L 420 115" class="arrow" />
  <path d="M 420 195 L 420 220" class="arrow" />
  <path d="M 420 330 L 420 355" class="arrow" />
  <path d="M 420 430 L 420 450" class="arrow" />
</svg>
</div>
</body>
</html>"""

with open("generated_figures/fig7_1.html", "w", encoding="utf-8") as f:
    f.write(fig7_1_html)

# 3. Figure 7.3: System Workflow Flowchart
fig7_3_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>{diagram_css}</style>
</head>
<body>
<div class="diagram-box">
<svg width="780" height="600" viewBox="0 0 780 600">
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#475569" />
    </marker>
  </defs>

  <rect x="280" y="20" width="220" height="40" rx="20" class="node" style="fill:#e0f2fe; stroke:#0284c7;" />
  <text x="390" y="45" class="txt-title">1. User Inputs Prompt in AI UI</text>

  <rect x="270" y="85" width="240" height="45" rx="6" class="node-purple" />
  <text x="390" y="105" class="txt-title">2. Event Trapped by Content Script</text>
  <text x="390" y="120" class="txt-sub">keydown [Enter] / submit click / fetch()</text>

  <rect x="250" y="155" width="280" height="55" rx="6" class="node-accent" />
  <text x="390" y="178" class="txt-title">3. Multi-Layer Heuristic Scanning</text>
  <text x="390" y="196" class="txt-sub">Regex + Shannon Entropy + PII + Codenames</text>

  <polygon points="390,235 480,275 390,315 300,275" class="node" style="fill:#fef3c7; stroke:#d97706;" />
  <text x="390" y="272" class="txt-title" style="font-size:11px;">Threat Detected?</text>
  <text x="390" y="286" class="txt-sub" style="font-size:10px;">Risk Score &gt; 0</text>

  <!-- Clean Path -->
  <rect x="570" y="250" width="180" height="50" rx="6" class="node-success" />
  <text x="660" y="272" class="txt-title" style="fill:#166534;">Allow Submission</text>
  <text x="660" y="288" class="txt-sub">Transparently Pass to Model</text>

  <!-- Threat Path -->
  <rect x="260" y="340" width="260" height="50" rx="6" class="node-danger" />
  <text x="390" y="362" class="txt-title" style="fill:#991b1b;">4. Block Event &amp; Show Modal</text>
  <text x="390" y="378" class="txt-sub">Highlight findings, display masked preview</text>

  <!-- User Action Decision -->
  <polygon points="390,415 480,455 390,495 300,455" class="node" style="fill:#fef3c7; stroke:#d97706;" />
  <text x="390" y="452" class="txt-title" style="font-size:11px;">User Choice?</text>

  <!-- Action Branches -->
  <rect x="40" y="435" width="190" height="45" rx="6" class="node" style="fill:#fee2e2;" />
  <text x="135" y="455" class="txt-title">Cancel / Dismiss</text>
  <text x="135" y="470" class="txt-sub">User edits manually / aborts</text>

  <rect x="270" y="525" width="240" height="55" rx="6" class="node-success" />
  <text x="390" y="548" class="txt-title" style="fill:#166534;">Auto-Redact &amp; Submit</text>
  <text x="390" y="565" class="txt-sub">Reverse-splice placeholders &amp; dispatch</text>

  <rect x="560" y="435" width="180" height="45" rx="6" class="node" style="fill:#f1f5f9;" />
  <text x="650" y="455" class="txt-title">Manual Override</text>
  <text x="650" y="470" class="txt-sub">Explicit user confirmation</text>

  <!-- Arrows -->
  <path d="M 390 60 L 390 85" class="arrow" />
  <path d="M 390 130 L 390 155" class="arrow" />
  <path d="M 390 210 L 390 235" class="arrow" />
  <path d="M 480 275 L 570 275" class="arrow" /><text x="515" y="267" class="txt-sub" style="fill:#16a34a; font-weight:bold;">No</text>
  <path d="M 390 315 L 390 340" class="arrow" /><text x="400" y="332" class="txt-sub" style="fill:#dc2626; font-weight:bold;">Yes</text>
  <path d="M 390 390 L 390 415" class="arrow" />
  <path d="M 300 455 L 230 455" class="arrow" /><text x="255" y="447" class="txt-sub">Cancel</text>
  <path d="M 390 495 L 390 525" class="arrow" /><text x="400" y="512" class="txt-sub" style="fill:#16a34a; font-weight:bold;">Redact</text>
  <path d="M 480 455 L 560 455" class="arrow" /><text x="510" y="447" class="txt-sub">Override</text>
</svg>
</div>
</body>
</html>"""

with open("generated_figures/fig7_3.html", "w", encoding="utf-8") as f:
    f.write(fig7_3_html)

# 4. Figure 7.4: Data Flow Diagram (DFD Level 0 & Level 1)
fig7_4_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>{diagram_css}</style>
</head>
<body>
<div class="diagram-box">
<svg width="820" height="480" viewBox="0 0 820 480">
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#475569" />
    </marker>
  </defs>

  <!-- Level 0 Context Diagram (Top Half) -->
  <text x="30" y="30" class="txt-title" style="text-anchor:start; fill:#1e40af;">DFD LEVEL 0: CONTEXT DIAGRAM</text>
  
  <rect x="40" y="50" width="140" height="60" rx="4" class="node" />
  <text x="110" y="85" class="txt-title">End User / Dev</text>

  <circle cx="390" cy="80" r="45" class="node-accent" />
  <text x="390" y="78" class="txt-title">0.0</text>
  <text x="390" y="94" class="txt-title" style="font-size:11px;">SENTINEL System</text>

  <rect x="630" y="50" width="150" height="60" rx="4" class="node" />
  <text x="705" y="85" class="txt-title">AI Model Provider</text>

  <path d="M 180 70 L 345 70" class="arrow" />
  <text x="260" y="63" class="txt-sub">Raw Prompt</text>

  <path d="M 435 70 L 630 70" class="arrow" />
  <text x="530" y="63" class="txt-sub">Sanitized Prompt</text>

  <path d="M 390 125 L 390 155" class="arrow" />
  <text x="450" y="145" class="txt-sub">Masked Log</text>
  <line x1="330" y1="155" x2="450" y2="155" stroke="#334155" stroke-width="2" />
  <line x1="330" y1="180" x2="450" y2="180" stroke="#334155" stroke-width="2" />
  <text x="390" y="172" class="txt-sub" style="font-weight:bold;">D1: chrome.storage.local</text>

  <!-- Divider -->
  <line x1="20" y1="200" x2="800" y2="200" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4" />

  <!-- Level 1 DFD (Bottom Half) -->
  <text x="30" y="230" class="txt-title" style="text-anchor:start; fill:#1e40af;">DFD LEVEL 1: INTERNAL PROCESS DECOMPOSITION</text>

  <circle cx="90" cy="300" r="32" class="node-purple" />
  <text x="90" y="298" class="txt-title" style="font-size:10px;">1.0</text>
  <text x="90" y="312" class="txt-sub" style="font-size:9px;">DOM Intercept</text>

  <circle cx="270" cy="300" r="32" class="node-accent" />
  <text x="270" y="298" class="txt-title" style="font-size:10px;">2.0</text>
  <text x="270" y="312" class="txt-sub" style="font-size:9px;">Multi-Layer Scan</text>

  <circle cx="450" cy="300" r="32" class="node-danger" />
  <text x="450" y="298" class="txt-title" style="font-size:10px;">3.0</text>
  <text x="450" y="312" class="txt-sub" style="font-size:9px;">Risk &amp; Modal</text>

  <circle cx="630" cy="300" r="32" class="node-success" />
  <text x="630" y="298" class="txt-title" style="font-size:10px;">4.0</text>
  <text x="630" y="312" class="txt-sub" style="font-size:9px;">Auto-Redaction</text>

  <path d="M 122 300 L 238 300" class="arrow" />
  <text x="180" y="292" class="txt-sub" style="font-size:10px;">Raw Text</text>

  <path d="M 302 300 L 418 300" class="arrow" />
  <text x="360" y="292" class="txt-sub" style="font-size:10px;">Findings</text>

  <path d="M 482 300 L 598 300" class="arrow" />
  <text x="540" y="292" class="txt-sub" style="font-size:10px;">User Confirm</text>

  <!-- Store connections -->
  <path d="M 450 332 L 450 400" class="arrow" />
  <text x="490" y="380" class="txt-sub" style="font-size:10px;">Audit Record</text>
  <line x1="390" y1="400" x2="510" y2="400" stroke="#334155" stroke-width="2" />
  <line x1="390" y1="425" x2="510" y2="425" stroke="#334155" stroke-width="2" />
  <text x="450" y="417" class="txt-sub" style="font-weight:bold;">D1: Local Storage</text>
</svg>
</div>
</body>
</html>"""

with open("generated_figures/fig7_4.html", "w", encoding="utf-8") as f:
    f.write(fig7_4_html)

# 5. Figure 7.5: Use Case Diagram
fig7_5_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>{diagram_css}</style>
</head>
<body>
<div class="diagram-box">
<svg width="840" height="500" viewBox="0 0 840 500">
  <!-- Actor 1: Developer / End User -->
  <circle cx="80" cy="180" r="16" class="node" style="fill:#e0f2fe; stroke:#0284c7;" />
  <line x1="80" y1="196" x2="80" y2="230" stroke="#0284c7" stroke-width="2" />
  <line x1="60" y1="210" x2="100" y2="210" stroke="#0284c7" stroke-width="2" />
  <line x1="80" y1="230" x2="65" y2="260" stroke="#0284c7" stroke-width="2" />
  <line x1="80" y1="230" x2="95" y2="260" stroke="#0284c7" stroke-width="2" />
  <text x="80" y="280" class="txt-title">End User / Dev</text>

  <!-- Actor 2: Security Administrator -->
  <circle cx="760" cy="180" r="16" class="node" style="fill:#fef3c7; stroke:#d97706;" />
  <line x1="760" y1="196" x2="760" y2="230" stroke="#d97706" stroke-width="2" />
  <line x1="740" y1="210" x2="780" y2="210" stroke="#d97706" stroke-width="2" />
  <line x1="760" y1="230" x2="745" y2="260" stroke="#d97706" stroke-width="2" />
  <line x1="760" y1="230" x2="775" y2="260" stroke="#d97706" stroke-width="2" />
  <text x="760" y="280" class="txt-title">Security Admin</text>

  <!-- System Boundary -->
  <rect x="180" y="20" width="480" height="460" rx="12" class="node" style="fill:none; stroke:#64748b; stroke-width:1.5; stroke-dasharray:6,4;" />
  <text x="420" y="45" class="txt-title" style="fill:#334155;">SENTINEL System Boundary (Manifest V3)</text>

  <!-- Use Cases (Ellipses) -->
  <ellipse cx="320" cy="90" rx="110" ry="25" class="node-accent" />
  <text x="320" y="95" class="txt-sub" style="font-weight:600;">UC-1: Enter Prompt in AI Web UI</text>

  <ellipse cx="320" cy="160" rx="110" ry="25" class="node-purple" />
  <text x="320" y="165" class="txt-sub" style="font-weight:600;">UC-2: Intercept &amp; Detect Secrets</text>

  <ellipse cx="320" cy="230" rx="110" ry="25" class="node-danger" />
  <text x="320" y="235" class="txt-sub" style="font-weight:600;">UC-3: View Warning Modal &amp; Findings</text>

  <ellipse cx="320" cy="300" rx="110" ry="25" class="node-success" />
  <text x="320" y="305" class="txt-sub" style="font-weight:600;">UC-4: Trigger In-Place Auto-Redaction</text>

  <ellipse cx="520" cy="160" rx="110" ry="25" class="node" style="fill:#fef3c7;" />
  <text x="520" y="165" class="txt-sub" style="font-weight:600;">UC-5: Configure Detection Rules</text>

  <ellipse cx="520" cy="240" rx="110" ry="25" class="node" style="fill:#fef3c7;" />
  <text x="520" y="245" class="txt-sub" style="font-weight:600;">UC-6: Manage Domain Whitelist</text>

  <ellipse cx="520" cy="320" rx="110" ry="25" class="node" style="fill:#fef3c7;" />
  <text x="520" y="325" class="txt-sub" style="font-weight:600;">UC-7: Audit Incident Logs (Masked)</text>

  <ellipse cx="420" cy="400" rx="110" ry="25" class="node-accent" />
  <text x="420" y="405" class="txt-sub" style="font-weight:600;">UC-8: View Extension Popup Stats</text>

  <!-- Actor 1 Connections -->
  <line x1="100" y1="210" x2="210" y2="90" stroke="#94a3b8" stroke-width="1.2" />
  <line x1="100" y1="210" x2="210" y2="160" stroke="#94a3b8" stroke-width="1.2" />
  <line x1="100" y1="210" x2="210" y2="230" stroke="#94a3b8" stroke-width="1.2" />
  <line x1="100" y1="210" x2="210" y2="300" stroke="#94a3b8" stroke-width="1.2" />
  <line x1="100" y1="210" x2="310" y2="400" stroke="#94a3b8" stroke-width="1.2" />

  <!-- Actor 2 Connections -->
  <line x1="740" y1="210" x2="630" y2="160" stroke="#94a3b8" stroke-width="1.2" />
  <line x1="740" y1="210" x2="630" y2="240" stroke="#94a3b8" stroke-width="1.2" />
  <line x1="740" y1="210" x2="630" y2="320" stroke="#94a3b8" stroke-width="1.2" />
  <line x1="740" y1="210" x2="530" y2="400" stroke="#94a3b8" stroke-width="1.2" />
</svg>
</div>
</body>
</html>"""

with open("generated_figures/fig7_5.html", "w", encoding="utf-8") as f:
    f.write(fig7_5_html)

# 6. Figure 8.1: Entity-Relationship / Local Storage Schema Diagram
fig8_1_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>{diagram_css}
.table-box {{
    fill: #ffffff;
    stroke: #334155;
    stroke-width: 1.5;
}}
.table-head {{
    fill: #1e293b;
}}
.table-title {{
    fill: #ffffff;
    font-size: 11px;
    font-weight: bold;
    text-anchor: middle;
}}
.field-name {{
    font-size: 10px;
    font-family: monospace;
    fill: #0f172a;
    text-anchor: start;
}}
.field-type {{
    font-size: 9px;
    font-family: monospace;
    fill: #64748b;
    text-anchor: end;
}}
</style>
</head>
<body>
<div class="diagram-box">
<svg width="840" height="460" viewBox="0 0 840 460">
  <!-- Table 1: SettingsEntity -->
  <rect x="40" y="30" width="220" height="170" rx="6" class="table-box" />
  <rect x="40" y="30" width="220" height="28" rx="6" class="table-head" />
  <text x="150" y="48" class="table-title">SettingsEntity (chrome.storage)</text>
  <text x="50" y="75" class="field-name">PK id : string</text><text x="250" y="75" class="field-type">UUID</text>
  <text x="50" y="95" class="field-name">protectionEnabled</text><text x="250" y="95" class="field-type">BOOLEAN</text>
  <text x="50" y="115" class="field-name">sensitivityLevel</text><text x="250" y="115" class="field-type">VARCHAR(16)</text>
  <text x="50" y="135" class="field-name">blockOnCritical</text><text x="250" y="135" class="field-type">BOOLEAN</text>
  <text x="50" y="155" class="field-name">autoRedactDefault</text><text x="250" y="155" class="field-type">BOOLEAN</text>
  <text x="50" y="175" class="field-name">lastUpdated</text><text x="250" y="175" class="field-type">BIGINT</text>

  <!-- Table 2: AuditLogEntity -->
  <rect x="310" y="30" width="240" height="210" rx="6" class="table-box" />
  <rect x="310" y="30" width="240" height="28" rx="6" class="table-head" style="fill:#991b1b;" />
  <text x="430" y="48" class="table-title">AuditLogEntity (Masked Trail)</text>
  <text x="320" y="75" class="field-name">PK incidentId : string</text><text x="540" y="75" class="field-type">UUID</text>
  <text x="320" y="95" class="field-name">timestamp</text><text x="540" y="95" class="field-type">BIGINT</text>
  <text x="320" y="115" class="field-name">domainHost</text><text x="540" y="115" class="field-type">VARCHAR(128)</text>
  <text x="320" y="135" class="field-name">threatCategory</text><text x="540" y="135" class="field-type">VARCHAR(32)</text>
  <text x="320" y="155" class="field-name">severityLevel</text><text x="540" y="155" class="field-type">ENUM</text>
  <text x="320" y="175" class="field-name">maskedSecretPreview</text><text x="540" y="175" class="field-type">VARCHAR(64)</text>
  <text x="320" y="195" class="field-name">actionTaken</text><text x="540" y="195" class="field-type">VARCHAR(32)</text>
  <text x="320" y="215" class="field-name">riskScore</text><text x="540" y="215" class="field-type">INTEGER</text>

  <!-- Table 3: CustomRuleEntity -->
  <rect x="590" y="30" width="220" height="170" rx="6" class="table-box" />
  <rect x="590" y="30" width="220" height="28" rx="6" class="table-head" style="fill:#1e40af;" />
  <text x="700" y="48" class="table-title">CustomRuleEntity (Patterns)</text>
  <text x="600" y="75" class="field-name">PK ruleId : string</text><text x="800" y="75" class="field-type">UUID</text>
  <text x="600" y="95" class="field-name">ruleName</text><text x="800" y="95" class="field-type">VARCHAR(64)</text>
  <text x="600" y="115" class="field-name">regexPattern</text><text x="800" y="115" class="field-type">TEXT</text>
  <text x="600" y="135" class="field-name">threatCategory</text><text x="800" y="135" class="field-type">VARCHAR(32)</text>
  <text x="600" y="155" class="field-name">severityWeight</text><text x="800" y="155" class="field-type">INTEGER</text>
  <text x="600" y="175" class="field-name">isEnabled</text><text x="800" y="175" class="field-type">BOOLEAN</text>

  <!-- Table 4: PlatformRegistryEntity -->
  <rect x="150" y="270" width="240" height="150" rx="6" class="table-box" />
  <rect x="150" y="270" width="240" height="28" rx="6" class="table-head" style="fill:#065f46;" />
  <text x="270" y="288" class="table-title">PlatformRegistryEntity (Hosts)</text>
  <text x="160" y="315" class="field-name">PK platformId : string</text><text x="380" y="315" class="field-type">VARCHAR(32)</text>
  <text x="160" y="335" class="field-name">domainHost</text><text x="380" y="335" class="field-type">VARCHAR(128)</text>
  <text x="160" y="355" class="field-name">isProtected</text><text x="380" y="355" class="field-type">BOOLEAN</text>
  <text x="160" y="375" class="field-name">interceptionMode</text><text x="380" y="375" class="field-type">VARCHAR(16)</text>
  <text x="160" y="395" class="field-name">customSelector</text><text x="380" y="395" class="field-type">VARCHAR(64)</text>

  <!-- Table 5: StatisticalAggregates -->
  <rect x="460" y="270" width="240" height="150" rx="6" class="table-box" />
  <rect x="460" y="270" width="240" height="28" rx="6" class="table-head" style="fill:#581c87;" />
  <text x="580" y="288" class="table-title">StatisticalAggregates (Metrics)</text>
  <text x="470" y="315" class="field-name">PK statsKey : string</text><text x="690" y="315" class="field-type">VARCHAR(32)</text>
  <text x="470" y="335" class="field-name">totalPromptsScanned</text><text x="690" y="335" class="field-type">INTEGER</text>
  <text x="470" y="355" class="field-name">threatsIntercepted</text><text x="690" y="355" class="field-type">INTEGER</text>
  <text x="470" y="375" class="field-name">secretsRedacted</text><text x="690" y="375" class="field-type">INTEGER</text>
  <text x="470" y="395" class="field-name">cumulativeRiskScore</text><text x="690" y="395" class="field-type">FLOAT</text>

  <!-- Relationship Lines -->
  <line x1="260" y1="110" x2="310" y2="110" stroke="#475569" stroke-width="1.5" />
  <text x="285" y="105" class="txt-sub" style="font-weight:bold;">1:N</text>

  <line x1="390" y1="240" x2="390" y2="270" stroke="#475569" stroke-width="1.5" />
  <text x="405" y="258" class="txt-sub" style="font-weight:bold;">N:1</text>
</svg>
</div>
</body>
</html>"""

with open("generated_figures/fig8_1.html", "w", encoding="utf-8") as f:
    f.write(fig8_1_html)

# 7. Figure 10.1: Threat Interception and Redaction Processing Workflow
fig10_1_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>{diagram_css}</style>
</head>
<body>
<div class="diagram-box">
<svg width="820" height="540" viewBox="0 0 820 540">
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#475569" />
    </marker>
  </defs>

  <rect x="40" y="20" width="180" height="45" rx="6" class="node" style="fill:#e0f2fe; stroke:#0284c7;" />
  <text x="130" y="47" class="txt-title">Raw Prompt String</text>

  <rect x="260" y="20" width="200" height="45" rx="6" class="node-purple" />
  <text x="360" y="47" class="txt-title">Whitespace &amp; Word Tokenizer</text>

  <rect x="500" y="20" width="280" height="45" rx="6" class="node-accent" />
  <text x="640" y="47" class="txt-title">Deterministic Signature Scanner (Regex)</text>

  <!-- Mid Stage: Parallel Scanning Blocks -->
  <rect x="80" y="105" width="200" height="70" rx="6" class="node-accent" />
  <text x="180" y="130" class="txt-title">Shannon Entropy Calculator</text>
  <text x="180" y="150" class="txt-sub">H = -&sum; p(x) log2 p(x)</text>
  <text x="180" y="165" class="txt-sub">Threshold: H &ge; 3.8 / 4.2</text>

  <rect x="310" y="105" width="200" height="70" rx="6" class="node-accent" />
  <text x="410" y="130" class="txt-title">PII &amp; Checksum Verifier</text>
  <text x="410" y="150" class="txt-sub">SSN, Phone, Email</text>
  <text x="410" y="165" class="txt-sub">Luhn Checksum (MOD-10)</text>

  <rect x="540" y="105" width="200" height="70" rx="6" class="node-accent" />
  <text x="640" y="130" class="txt-title">Keyword &amp; Codename Matcher</text>
  <text x="640" y="150" class="txt-sub">Project Codenames, NDA</text>
  <text x="640" y="165" class="txt-sub">Enterprise Blacklists</text>

  <!-- Aggregation -->
  <rect x="260" y="215" width="300" height="60" rx="6" class="node" style="fill:#fef3c7; stroke:#d97706;" />
  <text x="410" y="240" class="txt-title">Coordinate Range &amp; Finding Builder</text>
  <text x="410" y="258" class="txt-sub">Extracts [startIdx, endIdx, type, severity, secret]</text>

  <!-- Risk Score Matrix -->
  <rect x="260" y="305" width="300" height="60" rx="6" class="node-danger" />
  <text x="410" y="330" class="txt-title" style="fill:#991b1b;">Contextual Risk Scoring Engine</text>
  <text x="410" y="348" class="txt-sub">Score = &sum;(W_cat &times; S_level) &rarr; LOW / MED / HIGH / CRITICAL</text>

  <!-- Reverse-Splice Auto-Redaction -->
  <rect x="230" y="400" width="360" height="65" rx="6" class="node-success" />
  <text x="410" y="425" class="txt-title" style="fill:#166534;">Reverse-Splice Redaction Algorithm</text>
  <text x="410" y="443" class="txt-sub">Replaces tokens from right-to-left preserving exact string indices</text>
  <text x="410" y="457" class="txt-sub">Token &rarr; [REDACTED_TYPE_INDEX]</text>

  <!-- Output -->
  <rect x="290" y="490" width="240" height="40" rx="20" class="node" style="fill:#dcfce7; stroke:#16a34a;" />
  <text x="410" y="515" class="txt-title" style="fill:#14532d;">Safe Sanitized Prompt Dispatched</text>

  <!-- Arrows -->
  <path d="M 220 42 L 260 42" class="arrow" />
  <path d="M 460 42 L 500 42" class="arrow" />
  <path d="M 640 65 L 640 105" class="arrow" />
  <path d="M 410 65 L 410 105" class="arrow" />
  <path d="M 180 65 L 180 105" class="arrow" />

  <path d="M 180 175 L 340 215" class="arrow" />
  <path d="M 410 175 L 410 215" class="arrow" />
  <path d="M 640 175 L 480 215" class="arrow" />

  <path d="M 410 275 L 410 305" class="arrow" />
  <path d="M 410 365 L 410 400" class="arrow" />
  <path d="M 410 465 L 410 490" class="arrow" />
</svg>
</div>
</body>
</html>"""

with open("generated_figures/fig10_1.html", "w", encoding="utf-8") as f:
    f.write(fig10_1_html)

# Render all diagrams to PNG using Chrome Headless
diagrams = [
    ("generated_figures/fig1_1.html", "generated_figures/fig1_1_overview.png", 880, 440),
    ("generated_figures/fig7_1.html", "generated_figures/fig7_1_architecture.png", 900, 580),
    ("generated_figures/fig7_3.html", "generated_figures/fig7_3_workflow.png", 840, 660),
    ("generated_figures/fig7_4.html", "generated_figures/fig7_4_dfd.png", 880, 540),
    ("generated_figures/fig7_5.html", "generated_figures/fig7_5_usecase.png", 900, 560),
    ("generated_figures/fig8_1.html", "generated_figures/fig8_1_er.png", 900, 520),
    ("generated_figures/fig10_1.html", "generated_figures/fig10_1_workflow.png", 880, 600)
]

for src, dest, w, h in diagrams:
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        f"--window-size={w},{h}",
        f"--screenshot={os.path.abspath(dest)}",
        "file:///" + os.path.abspath(src).replace("\\", "/")
    ]
    subprocess.run(cmd, check=True)
    print(f"Rendered {dest}")

print("All architectural diagrams rendered successfully!")
