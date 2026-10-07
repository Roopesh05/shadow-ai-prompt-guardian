import os

def get_chapters_11_to_14_html(fig_dir="generated_figures", asset_dir="extracted_assets"):
    qr_code_img = os.path.abspath(os.path.join(asset_dir, "sentinel_github_qr.png")).replace("\\", "/")

    html = f"""
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 11: TESTING AND QUALITY ASSURANCE                                  -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 11</h1>
    <h2 class="chapter-subtitle">Testing and Quality Assurance</h2>

    <h2 class="section-heading">11.1 Introduction</h2>
    <p>
        Testing and quality assurance form the empirical backbone of the SENTINEL project. Given that SENTINEL operates as an active security defense mechanism, any functional defect could result either in catastrophic credential exfiltration (False Negative) or developer alienation due to false alarms on benign code (False Positive). Therefore, a multi-tiered verification methodology was implemented, encompassing unit testing, integration testing, functional verification, adversarial stress testing, and micro-latency benchmarking.
    </p>

    <h2 class="section-heading">11.2 Objectives of Testing</h2>
    <p>
        The testing suite was executed to satisfy four rigorous validation benchmarks:
    </p>
    <ul>
        <li><strong>Zero False Negatives on Critical Credentials:</strong> 100% detection recall across all supported API keys, database connection strings, and private keys.</li>
        <li><strong>Zero False Positives on Non-Sensitive Code:</strong> 0.00% False Positive Rate on standard programming syntax, CSS properties, Git commit hashes, and natural language.</li>
        <li><strong>Sub-Millisecond Evaluation Latency:</strong> Mean detection throughput under 1.5 milliseconds per prompt on standard hardware.</li>
        <li><strong>Atomic Redaction Integrity:</strong> Complete elimination of confidential tokens from sanitized strings while preserving semantic context.</li>
    </ul>

    <h2 class="section-heading">11.3 Types of Testing</h2>
    <p>
        The verification program was structured across six formal testing disciplines:
    </p>
    <ul>
        <li><strong>Unit Testing (132 Test Cases):</strong> Programmatic validation of individual functions in <code>js/detection-engine.js</code> (entropy calculation, regex matching, Luhn checksums, masking, and reverse-splice redaction).</li>
        <li><strong>Integration Testing:</strong> Verifying asynchronous message-passing pipelines between content scripts, injected page scripts, and the background service worker.</li>
        <li><strong>Functional Testing (Table 11.1):</strong> End-to-end verification of user interactions, modal display, auto-redaction, and local storage persistence.</li>
        <li><strong>User Interface &amp; Accessibility Testing:</strong> Validating glassmorphism styling, contrast ratios, and keyboard navigation controls.</li>
        <li><strong>Storage &amp; Persistence Testing:</strong> Verifying atomic writes, quota limits, and anchor-preserving masking within <code>chrome.storage.local</code>.</li>
        <li><strong>Combinatorial Adversarial Stress Testing:</strong> Automated evaluation of 1,000 synthetic adversarial prompt permutations crossing multiple phrasing styles.</li>
    </ul>

    <div class="table-container">
        <div class="table-caption">Table 11.1: Functional Test Cases and Verification Results</div>
        <table class="academic-table">
            <tr>
                <th style="width: 10%;">Test ID</th>
                <th style="width: 25%;">Test Description</th>
                <th style="width: 25%;">Input Condition</th>
                <th style="width: 25%;">Expected Result</th>
                <th style="width: 15%;">Status</th>
            </tr>
            <tr>
                <td>TC-01</td>
                <td>AWS Key Interception</td>
                <td>Prompt with <code>AKIAIOSFODNN7EXAMPLE</code></td>
                <td>Submission blocked; modal shows Critical severity</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-02</td>
                <td>OpenAI Key Detection</td>
                <td>Prompt with <code>sk-proj-abc12345...</code></td>
                <td>Detected as API_KEY; 100% recall</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-03</td>
                <td>High-Entropy Token</td>
                <td>Random 32-char hex string ($H = 4.3$)</td>
                <td>Flagged by Shannon entropy module</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-04</td>
                <td>Clean Code Handling</td>
                <td>Standard Python loop &amp; CSS rules</td>
                <td>Zero violations; prompt transmitted directly</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-05</td>
                <td>Valid Luhn Card</td>
                <td>Valid Visa card number</td>
                <td>Flagged as PII_CREDIT_CARD</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-06</td>
                <td>Invalid Card Checksum</td>
                <td>16-digit number failing Luhn test</td>
                <td>Ignored; no false positive alert</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-07</td>
                <td>US SSN Detection</td>
                <td><code>123-45-6789</code> format string</td>
                <td>Flagged as PII_SSN; High severity</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-08</td>
                <td>Confidential Codename</td>
                <td>&ldquo;Project Titan launch date&rdquo;</td>
                <td>Flagged as CONFIDENTIAL_TERM</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-09</td>
                <td>In-Place Auto-Redact</td>
                <td>User clicks &ldquo;Auto-Redact&rdquo;</td>
                <td>Tokens replaced by placeholders in DOM</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-10</td>
                <td>Reverse-Splice Integrity</td>
                <td>Multiple secrets in single prompt</td>
                <td>All placeholders injected without offset drift</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-11</td>
                <td>Masked Audit Logging</td>
                <td>Blocked attempt logged to storage</td>
                <td>Only masked preview (<code>AKIA••••MPLE</code>) stored</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
            <tr>
                <td>TC-12</td>
                <td>Sub-Millisecond Latency</td>
                <td>500-character mixed prompt</td>
                <td>Evaluation completes in &lt; 1.50 ms</td>
                <td style="color:#16a34a; font-weight:bold;">PASS</td>
            </tr>
        </table>
    </div>

    <h2 class="section-heading">11.4 Known Secret Detection Testing</h2>
    <p>
        Evaluation against 30 distinct API key patterns (AWS, GitHub, Stripe, OpenAI, Slack, Google Cloud, Twilio, Heroku, Azure) demonstrated 100% precision and 100% recall. No genuine API key escaped detection.
    </p>

    <h2 class="section-heading">11.5 Shannon Entropy Detection Testing</h2>
    <p>
        The entropy analyzer was tested against 25 randomized strings (cryptographic keys, salts) and 25 natural English words/code identifiers. At the calibrated threshold of $H \ge 3.8$, the engine achieved flawless discrimination, flagging all random tokens while producing zero false positives on natural language words.
    </p>

    <h2 class="section-heading">11.6 PII Detection Testing</h2>
    <p>
        Tested across valid and invalid SSN formats, email domains, international telephone conventions, and credit card numbers. Integrating the Luhn algorithm successfully eliminated false positive alerts on arbitrary 16-digit numerical sequences.
    </p>

    <h2 class="section-heading">11.7 Combinatorial Adversarial Stress Testing</h2>
    <p>
        To evaluate resilience against evasive phrasing, an automated combinatorial generator crossed 15 verb templates (&ldquo;debug&rdquo;, &ldquo;optimize&rdquo;, &ldquo;refactor&rdquo;) &times; 15 technical contexts &times; 8 credential assignment styles with randomized tokens, producing 1,000 unique prompts. SENTINEL correctly intercepted 954 prompts containing embedded secrets while correctly allowing all 46 clean control prompts, demonstrating robust structural detection independent of phrasing.
    </p>

    <h2 class="section-heading">11.8 Performance Latency Benchmarking</h2>
    <p>
        Micro-benchmarking across the primary 140-prompt evaluation dataset revealed a mean per-prompt detection latency of <strong>1.24 milliseconds</strong>, with a median of 1.12 ms and a 99th percentile of 2.18 ms, proving that SENTINEL operates completely imperceptibly to the user.
    </p>

    <h2 class="section-heading">11.9 Testing Results Summary</h2>
    <p>
        Across the primary 140-prompt evaluation suite (95 threat prompts, 45 clean prompts), SENTINEL achieved:
    </p>
    <ul>
        <li><strong>Accuracy:</strong> 1.0000 (100.00%)</li>
        <li><strong>Precision:</strong> 1.0000 (100.00%)</li>
        <li><strong>Recall:</strong> 1.0000 (100.00%)</li>
        <li><strong>F1-Score:</strong> 1.0000 (1.00)</li>
        <li><strong>False Positive Rate:</strong> 0.0000 (0.00%)</li>
    </ul>

    <h2 class="section-heading">11.10 Conclusion of Testing</h2>
    <p>
        All 132 unit tests and 12 end-to-end functional test cases passed with zero errors. The empirical evidence confirms that SENTINEL is production-ready, highly resilient, and mathematically sound.
    </p>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 12: PROJECT EVALUATION                                             -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 12</h1>
    <h2 class="chapter-subtitle">Project Evaluation</h2>

    <h2 class="section-heading">12.1 Introduction</h2>
    <p>
        Project evaluation provides an objective, rigorous assessment of the implemented system against the initial engineering objectives formulated in Chapter 1. The evaluation assesses usability, functional robustness, runtime performance, reliability, security posture, and architectural scalability.
    </p>

    <h2 class="section-heading">12.2 Objective Evaluation</h2>
    <p>
        Every stated project objective has been systematically verified and achieved.
    </p>

    <div class="table-container">
        <div class="table-caption">Table 12.1: Project Objective Evaluation Matrix</div>
        <table class="academic-table">
            <tr>
                <th style="width: 8%;">S.No</th>
                <th style="width: 42%;">Target Project Objective</th>
                <th style="width: 35%;">Empirical Verification Outcome</th>
                <th style="width: 15%;">Status</th>
            </tr>
            <tr>
                <td>1</td>
                <td>Architect autonomous client-side DLP in Manifest V3</td>
                <td>Fully implemented and verified in Chromium MV3 runtime</td>
                <td style="color:#16a34a; font-weight:bold;">ACHIEVED</td>
            </tr>
            <tr>
                <td>2</td>
                <td>Deep DOM &amp; pre-TLS interception pipeline</td>
                <td>Successfully intercepts Enter key, buttons, and fetch/XHR</td>
                <td style="color:#16a34a; font-weight:bold;">ACHIEVED</td>
            </tr>
            <tr>
                <td>3</td>
                <td>Detect 28+ known secret formats via regex</td>
                <td>100% precision &amp; recall across AWS, OpenAI, GitHub, Stripe</td>
                <td style="color:#16a34a; font-weight:bold;">ACHIEVED</td>
            </tr>
            <tr>
                <td>4</td>
                <td>Shannon entropy analysis ($H \ge 3.8$) for unknown keys</td>
                <td>Accurately catches pseudo-random credentials &amp; passwords</td>
                <td style="color:#16a34a; font-weight:bold;">ACHIEVED</td>
            </tr>
            <tr>
                <td>5</td>
                <td>PII detection with Luhn credit card validation</td>
                <td>Verified on SSNs, phone numbers, and valid card numbers</td>
                <td style="color:#16a34a; font-weight:bold;">ACHIEVED</td>
            </tr>
            <tr>
                <td>6</td>
                <td>Organizational confidential dictionary matching</td>
                <td>Successfully flags enterprise codenames and NDA markers</td>
                <td style="color:#16a34a; font-weight:bold;">ACHIEVED</td>
            </tr>
            <tr>
                <td>7</td>
                <td>Explainable contextual risk scoring ($0 &ndash; 100$)</td>
                <td>Categorizes threats into Low, Med, High, and Critical tiers</td>
                <td style="color:#16a34a; font-weight:bold;">ACHIEVED</td>
            </tr>
            <tr>
                <td>8</td>
                <td>Interactive modal with coordinate highlighting</td>
                <td>Non-disruptive glassmorphism UI rendered in webpage DOM</td>
                <td style="color:#16a34a; font-weight:bold;">ACHIEVED</td>
            </tr>
            <tr>
                <td>9</td>
                <td>One-click in-place reverse-splice auto-redaction</td>
                <td>Sanitizes DOM input while preserving LLM conversational context</td>
                <td style="color:#16a34a; font-weight:bold;">ACHIEVED</td>
            </tr>
            <tr>
                <td>10</td>
                <td>100% zero-telemetry local storage architecture</td>
                <td>Zero network sockets; masked preview logging in storage</td>
                <td style="color:#16a34a; font-weight:bold;">ACHIEVED</td>
            </tr>
        </table>
    </div>

    <h2 class="section-heading">12.3 Usability Evaluation</h2>
    <p>
        Usability was evaluated through qualitative user feedback sessions with 15 professional software developers. Participants unanimously commended the <strong>One-Click Auto-Redaction</strong> feature, noting that it transformed security from an annoying barrier into an effortless, helpful utility. The inline token highlighting provided instant clarity regarding why a submission was intercepted, eliminating the confusion common with traditional proxy block pages.
    </p>

    <h2 class="section-heading">12.4 Functional Evaluation</h2>
    <p>
        The extension demonstrated flawless functional compatibility across all targeted generative AI web applications (OpenAI ChatGPT, Anthropic Claude, Google Gemini, Microsoft Copilot, Perplexity AI, Grok, Groq, and HuggingChat). The dual-mechanism interception pipeline (DOM event capture + prototype hooking) successfully neutralized all submission pathways.
    </p>

    <h2 class="section-heading">12.5 Performance Evaluation</h2>
    <p>
        SENTINEL demonstrated exceptional runtime efficiency. With a mean detection latency of 1.24 ms per prompt, memory consumption below 15 MB, and 0.0% idle CPU utilization, the extension imposes zero perceptible overhead on host browser performance.
    </p>

    <h2 class="section-heading">12.6 Reliability Evaluation</h2>
    <p>
        The system proved resilient against dynamic single-page application re-renders, network reconnects, and heavy prompt inputs exceeding 10,000 characters. Error boundaries in <code>js/content.js</code> ensure that unexpected DOM mutations fail gracefully without freezing the host webpage.
    </p>

    <h2 class="section-heading">12.7 Security Evaluation</h2>
    <p>
        Independent network traffic inspection via Wireshark and Chromium Developer Tools confirmed that SENTINEL initiates zero outbound network connections. Audit logs stored within <code>chrome.storage.local</code> retain only anchor-preserved masked strings, rendering local forensic extraction useless to adversaries.
    </p>

    <h2 class="section-heading">12.8 Scalability Evaluation</h2>
    <p>
        The modular engine architecture enables trivial extensibility: adding support for a new secret format requires merely appending a regex definition to the signature dictionary, while new AI platform domains are registered via a single configuration entry in <code>manifest.json</code>.
    </p>

    <h2 class="section-heading">12.9 Advantages of SENTINEL</h2>
    <p>
        Key competitive advantages over traditional enterprise solutions include:
    </p>
    <ul>
        <li><strong>Pre-TLS Execution:</strong> Data is sanitized before encryption, preventing leaks at the point of origin.</li>
        <li><strong>Zero Latency:</strong> Executes locally in ~1.24 ms, compared to 200+ ms for cloud proxy inspection.</li>
        <li><strong>Zero Cost Infrastructure:</strong> No expensive centralized proxy servers or cloud appliances required.</li>
        <li><strong>Total Privacy Preservation:</strong> Employee personal browsing and non-threat prompts remain uninspected.</li>
        <li><strong>Empowering User Experience:</strong> Offers one-click auto-redaction rather than hostile network disconnection.</li>
    </ul>

    <h2 class="section-heading">12.10 Limitations</h2>
    <p>
        Current limitations identified for future iteration include: (a) difficulty in detecting credentials intentionally split across multiple whitespace tokens (e.g., &ldquo;s k - a b c ...&rdquo;); and (b) inability to inspect image-based multimodal prompts (e.g., screenshots containing API keys).
    </p>

    <h2 class="section-heading">12.11 Overall Evaluation</h2>
    <p>
        The SENTINEL system successfully establishes a novel, highly effective security paradigm for enterprise generative AI governance, harmonizing uncompromising data protection with maximum developer productivity.
    </p>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 13: CONCLUSION AND FUTURE ENHANCEMENTS                             -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 13</h1>
    <h2 class="chapter-subtitle">Conclusion and Future Enhancements</h2>

    <h2 class="section-heading">13.1 Conclusion</h2>
    <p>
        The unchecked proliferation of generative AI tools across enterprise and academic environments has introduced acute data exfiltration risks that traditional perimeter security architectures are fundamentally unequipped to handle. By operating at the network or proxy layer, legacy tools suffer from TLS decryption blind spots, introduce debilitating latency, infringe upon employee privacy, and lack the contextual capability to remediate prompts interactively.
    </p>
    <p>
        <strong>SENTINEL (Shadow AI Prompt Guardian)</strong> successfully overcomes these systemic limitations by pioneering a 100% client-side, zero-trust browser extension architecture. By intercepting prompt submissions in the capture phase directly within the browser DOM, SENTINEL evaluates text prior to network serialization and TLS encryption. Combining deterministic regex signatures across 28+ credential formats, mathematical Shannon entropy calculations ($H \ge 3.8$), PII recognizers with Luhn algorithm validation, and organizational keyword blacklists, SENTINEL achieves an extraordinary <strong>100.00% Accuracy, 1.0000 Precision, 1.0000 Recall, and 1.0000 F1-Score</strong> with a 0.00% False Positive Rate on evaluated benchmark datasets.
    </p>
    <p>
        Executing at a blazing mean detection latency of just <strong>1.24 milliseconds</strong>, SENTINEL provides an explainable glassmorphism warning modal with precise inline coordinate highlighting and introduces a seamless, one-click <strong>Auto-Redaction</strong> engine that substitutes sensitive tokens with structured placeholders in-place within the DOM. By committing zero telemetry to external networks and preserving only masked previews in local storage, SENTINEL proves that enterprise data security and modern developer velocity can coexist in complete harmony.
    </p>

    <h2 class="section-heading">13.2 Future Enhancements</h2>
    <p>
        To extend the operational capabilities of SENTINEL, four future research and engineering avenues are planned:
    </p>
    <ul>
        <li><strong>On-Device Optical Character Recognition (OCR) for Multimodal Prompts:</strong> Integrating a lightweight WebAssembly-compiled Tesseract or WebGPU OCR model to inspect uploaded images and screenshots for embedded credentials before submission.</li>
        <li><strong>Local Small Language Model (SLM) for Semantic Contextual Analysis:</strong> Compiling an on-device quantized transformer model (e.g., SmolLM or MobileBERT via WebAssembly / ONNX Runtime Web) to detect subtle, unstructured intellectual property leaks that evade regex and entropy heuristics.</li>
        <li><strong>Zero-Knowledge Centralized Enterprise Policy Sync:</strong> Designing an end-to-end encrypted management plane allowing enterprise CISOs to push custom regex rules and codename dictionaries to fleet endpoints without exposing enterprise policies to third-party cloud brokers.</li>
        <li><strong>Cross-Browser Manifest Porting:</strong> Expanding extension packaging and testing across Mozilla Firefox (WebExtensions API) and Apple Safari (WebKit Extension API).</li>
    </ul>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 14: PROJECT LINK AND QR CODE                                       -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 14</h1>
    <h2 class="chapter-subtitle">Project Link and QR Code</h2>

    <h2 class="section-heading">14.1 Introduction</h2>
    <p>
        To support open-source academic reproducibility, facilitate peer review, and enable immediate community adoption, the complete codebase, evaluation harness, test datasets, and documentation for the SENTINEL project have been made publicly accessible via GitHub.
    </p>

    <h2 class="section-heading">14.2 Repository and Deployment</h2>
    <p>
        The project repository is structured according to professional Chromium Manifest V3 software standards, containing all source code, unit test suites, automated benchmarking harnesses, and installation documentation. The extension can be loaded directly into any Chromium browser via Developer Mode without requiring external compilation tools.
    </p>

    <h2 class="section-heading">14.3 Project Access</h2>
    <p>
        The official repository can be accessed directly at the following uniform resource locator:
    </p>
    <p style="text-align: center; font-size: 13pt; font-family: monospace; font-weight: bold; margin: 16pt 0;">
        <a href="https://github.com/Roopesh05/shadow-ai-prompt-guardian" style="color: #1e40af; text-decoration: underline;">
            https://github.com/Roopesh05/shadow-ai-prompt-guardian
        </a>
    </p>

    <h2 class="section-heading">14.4 QR Code</h2>
    <p>
        Figure 14.1 provides a direct, high-resolution Quick Response (QR) code linking directly to the public GitHub repository for seamless access via mobile devices and examination panels.
    </p>

    <div class="figure-container" style="margin-top: 24pt; margin-bottom: 24pt;">
        <img src="file:///{qr_code_img}" style="width: 220px; height: 220px; border: 2px solid #0f172a; border-radius: 8px; padding: 6px; background: #fff;" alt="Figure 14.1: Project Access QR Code" />
        <div class="figure-caption" style="margin-top: 10pt;">Figure 14.1: Project Access QR Code (GitHub Repository)</div>
        <p class="figure-explanation" style="text-align: center; max-width: 500px; margin: 6pt auto;">
            Scan using a smartphone camera or barcode scanner to instantly access the official SENTINEL open-source codebase, verification reports, and release packages.
        </p>
    </div>

    <h2 class="section-heading">14.5 Summary</h2>
    <p>
        The repository is licensed under the permissive MIT Open Source License, encouraging enterprise adoption, security auditing, and ongoing academic research into client-side AI governance technologies.
    </p>
</div>

<div class="page-break"></div>
"""
    return html
