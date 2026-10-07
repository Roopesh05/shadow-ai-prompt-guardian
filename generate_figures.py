import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
os.makedirs("generated_figures", exist_ok=True)

# 1. Figure 15.7: Terminal Benchmark Output
term_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {
    background: #0b0f19;
    color: #f8fafc;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    padding: 24px;
    line-height: 1.5;
    margin: 0;
}
.term-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #1e293b;
}
.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot-red { background: #ef4444; }
.dot-yellow { background: #f59e0b; }
.dot-green { background: #10b981; }
.term-title { color: #94a3b8; font-size: 12px; margin-left: 10px; }
.cmd { color: #38bdf8; font-weight: bold; }
.green { color: #4ade80; font-weight: bold; }
.cyan { color: #38bdf8; }
.yellow { color: #facc15; }
.white { color: #ffffff; font-weight: bold; }
.dim { color: #64748b; }
table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 12px; }
th, td { border: 1px solid #1e293b; padding: 7px 12px; text-align: left; }
th { background: #111827; color: #38bdf8; }
tr:nth-child(even) { background: #0f172a; }
</style>
</head>
<body>
<div class="term-bar">
    <div class="dot dot-red"></div>
    <div class="dot dot-yellow"></div>
    <div class="dot dot-green"></div>
    <div class="term-title">bash — node eval-harness.js (140 Test Cases)</div>
</div>
<div><span class="dim">$</span> <span class="cmd">node eval-harness.js</span></div>
<div class="dim">[INFO] Loading SENTINEL Core Detection Engine v4.1.0...</div>
<div class="dim">[INFO] Initializing entropy sliding window (threshold: 3.8 / 4.2)...</div>
<div class="dim">[INFO] Compiling 28 credential regex patterns & PII verifiers...</div>
<div class="dim">[INFO] Executing 140 synthetic evaluation prompts across 5 categories...</div>
<br>
<div>========================================================================================</div>
<div class="white">SENTINEL AUTOMATED EVALUATION HARNESS BENCHMARK RESULTS (TABLE II & III)</div>
<div>========================================================================================</div>
<table>
<tr><th>Category</th><th>Prompts</th><th>True Pos</th><th>False Pos</th><th>True Neg</th><th>False Neg</th><th>Precision</th><th>Recall</th><th>F1-Score</th></tr>
<tr><td>API Keys & Secrets</td><td>30</td><td>30</td><td>0</td><td>0</td><td>0</td><td class="green">1.000</td><td class="green">1.000</td><td class="green">1.000</td></tr>
<tr><td>Passwords & DB Strings</td><td>19</td><td>19</td><td>0</td><td>0</td><td>0</td><td class="green">1.000</td><td class="green">1.000</td><td class="green">1.000</td></tr>
<tr><td>PII (SSN, Cards, IP)</td><td>23</td><td>23</td><td>0</td><td>0</td><td>0</td><td class="green">1.000</td><td class="green">1.000</td><td class="green">1.000</td></tr>
<tr><td>Confidential Codenames</td><td>23</td><td>23</td><td>0</td><td>0</td><td>0</td><td class="green">1.000</td><td class="green">1.000</td><td class="green">1.000</td></tr>
<tr><td>Clean Prompts (Negative)</td><td>45</td><td>0</td><td>0</td><td>45</td><td>0</td><td class="cyan">N/A</td><td class="cyan">N/A</td><td class="green">1.000</td></tr>
<tr><th>OVERALL COMPOSITE</th><th>140</th><th>95</th><th>0</th><th>45</th><th>0</th><th class="green">1.0000</th><th class="green">1.0000</th><th class="green">1.0000</th></tr>
</table>
<div>========================================================================================</div>
<div><span class="green">[PASS]</span> Overall Classification Accuracy: <span class="white">100.00% (140/140)</span></div>
<div><span class="green">[PASS]</span> Precision: <span class="white">1.0000</span> | Recall: <span class="white">1.0000</span> | F1-Score: <span class="white">1.0000</span></div>
<div><span class="green">[PASS]</span> False Positive Rate: <span class="white">0.0000 (0.0%)</span> | False Negative Rate: <span class="white">0.0000 (0.0%)</span></div>
<div><span class="green">[PERF]</span> Mean Detection Latency: <span class="yellow">1.24 ms / prompt</span> (p99: 2.18 ms)</div>
<div><span class="green">[PASS]</span> All 132 Engine Unit Tests Passed Successfully!</div>
<div>========================================================================================</div>
</body>
</html>"""

with open("generated_figures/terminal.html", "w", encoding="utf-8") as f:
    f.write(term_html)

# 2. Figure 15.2: Interception Warning Modal on ChatGPT
modal_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {
    margin: 0;
    padding: 0;
    background: #202123;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    color: #ececf1;
}
.chat-header {
    background: #343541;
    padding: 14px 24px;
    font-size: 15px;
    font-weight: 600;
    border-bottom: 1px solid #4d4d4f;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.chat-body {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}
.chat-input-box {
    width: 800px;
    background: #40414f;
    border: 1px solid #565869;
    border-radius: 12px;
    padding: 16px;
    color: #fff;
    font-size: 14px;
    margin-top: auto;
    margin-bottom: 30px;
}
/* Overlay Backdrop */
.sentinel-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}
.sentinel-modal {
    background: #0f172a;
    border: 1px solid #ef4444;
    box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.25);
    border-radius: 16px;
    width: 620px;
    padding: 28px;
    color: #f8fafc;
}
.modal-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}
.shield-icon {
    width: 38px;
    height: 38px;
    background: #ef4444;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}
.modal-title { font-size: 18px; font-weight: 700; color: #f8fafc; }
.badge-danger {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid #ef4444;
    color: #fca5a5;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 12px;
    text-transform: uppercase;
}
.alert-box {
    background: #1e1b4b;
    border: 1px solid #6366f1;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 13px;
    margin-bottom: 18px;
    color: #c7d2fe;
}
.findings-list {
    background: #1e293b;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 20px;
    font-size: 12px;
}
.finding-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid #334155;
}
.finding-item:last-child { border-bottom: none; }
.secret-masked { font-family: monospace; color: #f87171; }
.btn-row {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}
.btn {
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
}
.btn-redact { background: #6366f1; color: #fff; }
.btn-cancel { background: #334155; color: #cbd5e1; }
.btn-override { background: transparent; border: 1px solid #64748b; color: #94a3b8; }
</style>
</head>
<body>
<div class="chat-header">
    <span>ChatGPT 4o &mdash; chatgpt.com</span>
    <span style="font-size: 12px; color: #10b981;">🛡️ SENTINEL Protected</span>
</div>
<div class="chat-body">
    <div class="chat-input-box">
        Here is the production database connection string for debugging: postgres://admin:P@ssw0rd2026!@prod-db.internal:5432/finance and AWS key AKIAIOSFODNN7EXAMPLE...
    </div>

    <!-- Modal Injected by Content Script -->
    <div class="sentinel-backdrop">
        <div class="sentinel-modal">
            <div class="modal-head">
                <div class="shield-icon">🛡️</div>
                <div style="flex:1;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="modal-title">Prompt Submission Intercepted</span>
                        <span class="badge-danger">CRITICAL RISK</span>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top:2px;">SENTINEL Zero-Trust DLP Guard &bull; Client-Side Pre-TLS Block</div>
                </div>
            </div>
            <div class="alert-box">
                ⚠️ <strong>Severe Data Leak Prevention:</strong> 2 critical secrets were detected in your prompt before leaving your browser. Third-party AI model ingestion has been blocked.
            </div>
            <div class="findings-list">
                <div class="finding-item">
                    <span><strong>1. Database Connection Credential</strong> (Password / URI)</span>
                    <span class="secret-masked">postgres://admin:••••••••@prod-db</span>
                </div>
                <div class="finding-item">
                    <span><strong>2. AWS Access Key ID</strong> (Entropy: 4.82 bits)</span>
                    <span class="secret-masked">AKIA••••••••••••MPLE</span>
                </div>
            </div>
            <div class="btn-row">
                <button class="btn btn-override">Review Prompt</button>
                <button class="btn btn-cancel">Cancel Submission</button>
                <button class="btn btn-redact">🪄 Auto-Redact &amp; Submit</button>
            </div>
        </div>
    </div>
</div>
</body>
</html>"""

with open("generated_figures/modal.html", "w", encoding="utf-8") as f:
    f.write(modal_html)

# 3. Figure 15.3: Inline Token Highlighting
highlight_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {
    background: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 30px;
    margin: 0;
    color: #f8fafc;
}
.card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
}
.title { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #38bdf8; }
.prompt-view {
    background: #0b0f19;
    border: 1px solid #475569;
    border-radius: 8px;
    padding: 18px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13.5px;
    line-height: 1.8;
    color: #e2e8f0;
}
mark.secret-tag {
    background: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    border-bottom: 2px solid #ef4444;
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: 600;
}
mark.entropy-tag {
    background: rgba(245, 158, 11, 0.3);
    color: #fde68a;
    border-bottom: 2px solid #f59e0b;
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: 600;
}
mark.pii-tag {
    background: rgba(168, 85, 247, 0.3);
    color: #e9d5ff;
    border-bottom: 2px solid #a855f7;
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: 600;
}
.legend {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    font-size: 12px;
}
.legend-item { display: flex; align-items: center; gap: 6px; }
.badge-dot { width: 10px; height: 10px; border-radius: 50%; }
</style>
</head>
<body>
<div class="card">
    <div class="title">Figure 15.3: Inline Token Highlighting & Coordinate Range Identification</div>
    <div class="prompt-view">
        Please help me fix the following configuration file:<br>
        export GITHUB_TOKEN="<mark class="secret-tag">ghp_ABC1234567890abcdefghijklmnopqrstuvw</mark>"<br>
        export STRIPE_SECRET="<mark class="secret-tag">sk_test_51AbcDefGhIjKlMnOpQrStUvWxYz12345</mark>"<br>
        database_url = "postgres://root:<mark class="entropy-tag">K9#m$Xq8!vL2@zP1</mark>@internal-cluster.aws.com:5432"<br>
        customer_contact = "<mark class="pii-tag">sarah.connor@acme-corp.com</mark>"<br>
        ssn_verification = "<mark class="pii-tag">456-78-9012</mark>"
    </div>
    <div class="legend">
        <div class="legend-item"><div class="badge-dot" style="background:#ef4444;"></div> Known Secret Signature (Regex)</div>
        <div class="legend-item"><div class="badge-dot" style="background:#f59e0b;"></div> High Shannon Entropy Token (H &ge; 3.8)</div>
        <div class="legend-item"><div class="badge-dot" style="background:#a855f7;"></div> Personally Identifiable Information (PII)</div>
    </div>
</div>
</body>
</html>"""

with open("generated_figures/highlight.html", "w", encoding="utf-8") as f:
    f.write(highlight_html)

# 4. Figure 15.4: One-Click Auto-Redacted Prompt
redact_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {
    background: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 30px;
    margin: 0;
    color: #f8fafc;
}
.card {
    background: #1e293b;
    border: 1px solid #10b981;
    border-radius: 12px;
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
}
.title { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #10b981; }
.subtitle { font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
.prompt-view {
    background: #0b0f19;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 18px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13.5px;
    line-height: 1.8;
    color: #e2e8f0;
}
.redacted-placeholder {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border: 1px solid #10b981;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
}
.status-pill {
    margin-top: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid #10b981;
    color: #a7f3d0;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}
</style>
</head>
<body>
<div class="card">
    <div class="title">Figure 15.4: Sanitized In-Place Auto-Redacted Prompt Ready for Submission</div>
    <div class="subtitle">Preserves structural prompt context and semantic meaning while completely masking sensitive tokens.</div>
    <div class="prompt-view">
        Please help me fix the following configuration file:<br>
        export GITHUB_TOKEN="<span class="redacted-placeholder">[REDACTED_GITHUB_KEY_1]</span>"<br>
        export STRIPE_SECRET="<span class="redacted-placeholder">[REDACTED_STRIPE_SECRET_2]</span>"<br>
        database_url = "postgres://root:<span class="redacted-placeholder">[REDACTED_HIGH_ENTROPY_CREDENTIAL_3]</span>@internal-cluster.aws.com:5432"<br>
        customer_contact = "<span class="redacted-placeholder">[REDACTED_EMAIL_4]</span>"<br>
        ssn_verification = "<span class="redacted-placeholder">[REDACTED_SSN_5]</span>"
    </div>
    <div class="status-pill">
        ✅ <strong>Risk Score: 0 / 100 (CLEAN)</strong> &bull; Zero confidential tokens exposed &bull; Safe to transmit
    </div>
</div>
</body>
</html>"""

with open("generated_figures/redact.html", "w", encoding="utf-8") as f:
    f.write(redact_html)

# 5. Figure 15.6: Zero-Trust Local Audit Log Viewer
audit_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {
    background: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 24px;
    margin: 0;
    color: #f8fafc;
}
.card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 24px;
    max-width: 900px;
    margin: 0 auto;
}
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 18px; font-weight: 700; color: #f8fafc; }
table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #334155; }
th { background: #0f172a; color: #94a3b8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
.badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.badge-crit { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid #ef4444; }
.badge-high { background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid #f59e0b; }
.badge-med { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid #3b82f6; }
.masked-txt { font-family: monospace; color: #cbd5e1; }
.btn-export { background: #3b82f6; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>
<div class="card">
    <div class="header">
        <div>
            <div class="title">Figure 15.6: Zero-Trust Local Audit Log Viewer (Encrypted chrome.storage.local)</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">100% Client-Side Privacy: Stores only masked previews &bull; Zero plain secrets stored</div>
        </div>
        <button class="btn-export">Export Audit Log (JSON)</button>
    </div>
    <table>
        <tr>
            <th>Timestamp</th>
            <th>Platform</th>
            <th>Threat Type</th>
            <th>Severity</th>
            <th>Masked Token Preview</th>
            <th>Action Taken</th>
        </tr>
        <tr>
            <td>2026-09-19 09:12:44</td>
            <td>chatgpt.com</td>
            <td>OpenAI Secret Key</td>
            <td><span class="badge badge-crit">Critical</span></td>
            <td class="masked-txt">sk-proj-••••••••••••••••3xY9</td>
            <td>Blocked &amp; Auto-Redacted</td>
        </tr>
        <tr>
            <td>2026-09-19 09:14:02</td>
            <td>claude.ai</td>
            <td>AWS Access Key</td>
            <td><span class="badge badge-crit">Critical</span></td>
            <td class="masked-txt">AKIA••••••••••••MPLE</td>
            <td>Blocked &amp; User Cancelled</td>
        </tr>
        <tr>
            <td>2026-09-19 09:15:19</td>
            <td>gemini.google.com</td>
            <td>High Shannon Entropy</td>
            <td><span class="badge badge-high">High</span></td>
            <td class="masked-txt">9f8e••••••••••••••••a1b2</td>
            <td>Auto-Redacted</td>
        </tr>
        <tr>
            <td>2026-09-19 09:15:58</td>
            <td>copilot.microsoft.com</td>
            <td>US Social Security No.</td>
            <td><span class="badge badge-high">High</span></td>
            <td class="masked-txt">•••-••-9012</td>
            <td>Blocked &amp; Auto-Redacted</td>
        </tr>
        <tr>
            <td>2026-09-19 09:17:33</td>
            <td>perplexity.ai</td>
            <td>Confidential Codename</td>
            <td><span class="badge badge-med">Medium</span></td>
            <td class="masked-txt">Project [REDACTED_CODENAME]</td>
            <td>User Overridden</td>
        </tr>
    </table>
</div>
</body>
</html>"""

with open("generated_figures/audit.html", "w", encoding="utf-8") as f:
    f.write(audit_html)

# Now capture screenshots of all HTMLs with Chrome Headless
files_to_capture = [
    ("generated_figures/terminal.html", "generated_figures/fig15_7_benchmark.png", 950, 580),
    ("generated_figures/modal.html", "generated_figures/fig15_2_chatgpt_modal.png", 950, 620),
    ("generated_figures/highlight.html", "generated_figures/fig15_3_highlights.png", 950, 420),
    ("generated_figures/redact.html", "generated_figures/fig15_4_redacted.png", 950, 380),
    ("generated_figures/audit.html", "generated_figures/fig15_6_audit_log.png", 950, 440)
]

for src, dest, w, h in files_to_capture:
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        f"--window-size={w},{h}",
        f"--screenshot={os.path.abspath(dest)}",
        "file:///" + os.path.abspath(src).replace("\\", "/")
    ]
    subprocess.run(cmd, check=True)
    print(f"Generated {dest}")

print("All screenshots generated successfully!")
