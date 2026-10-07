import os

def get_chapters_6_to_10_html(fig_dir="generated_figures"):
    fig7_1 = os.path.abspath(os.path.join(fig_dir, "fig7_1_architecture.png")).replace("\\", "/")
    fig7_3 = os.path.abspath(os.path.join(fig_dir, "fig7_3_workflow.png")).replace("\\", "/")
    fig7_4 = os.path.abspath(os.path.join(fig_dir, "fig7_4_dfd.png")).replace("\\", "/")
    fig7_5 = os.path.abspath(os.path.join(fig_dir, "fig7_5_usecase.png")).replace("\\", "/")
    fig8_1 = os.path.abspath(os.path.join(fig_dir, "fig8_1_er.png")).replace("\\", "/")
    fig10_1 = os.path.abspath(os.path.join(fig_dir, "fig10_1_workflow.png")).replace("\\", "/")

    html = f"""
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 6: TECHNOLOGY STACK                                                -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 6</h1>
    <h2 class="chapter-subtitle">Technology Stack</h2>

    <div class="table-container">
        <div class="table-caption">Table 6.1: Technology Stack Used in SENTINEL</div>
        <table class="academic-table">
            <tr>
                <th style="width: 25%;">Architectural Layer</th>
                <th style="width: 35%;">Technology / Library</th>
                <th style="width: 40%;">Role in SENTINEL Architecture</th>
            </tr>
            <tr>
                <td><strong>Browser Platform</strong></td>
                <td>Chromium Extension Manifest V3</td>
                <td>Standardized, secure extension framework providing isolated contexts and declarative APIs.</td>
            </tr>
            <tr>
                <td><strong>Client Presentation</strong></td>
                <td>HTML5, Vanilla CSS3, Glassmorphism</td>
                <td>Renders lightweight, responsive popup, options dashboard, and warning modal overlay.</td>
            </tr>
            <tr>
                <td><strong>Core Logic &amp; Engine</strong></td>
                <td>ECMAScript 2022 (Native Vanilla JS)</td>
                <td>High-performance, dependency-free execution ensuring sub-1.5ms detection latency.</td>
            </tr>
            <tr>
                <td><strong>Interception Layer</strong></td>
                <td>DOM Event Capture, MutationObserver</td>
                <td>Hooks keyboard enter events, form submissions, and observes dynamic SPA button mutations.</td>
            </tr>
            <tr>
                <td><strong>Network Proxy Layer</strong></td>
                <td>Window.fetch &amp; XHR Prototype Hooks</td>
                <td>Captures asynchronous HTTP request bodies in the page context prior to TLS socket transmission.</td>
            </tr>
            <tr>
                <td><strong>Information Entropy</strong></td>
                <td>Shannon Entropy Algorithm ($H$)</td>
                <td>Calculates statistical randomness of alphanumeric tokens to detect uncatalogued secrets.</td>
            </tr>
            <tr>
                <td><strong>Checksum Validation</strong></td>
                <td>Luhn Modulo-10 Algorithm</td>
                <td>Validates structural authenticity of credit card numbers to eliminate false positive PII alerts.</td>
            </tr>
            <tr>
                <td><strong>Local Data Persistence</strong></td>
                <td><code>chrome.storage.local</code> API</td>
                <td>Asynchronous, partitioned key-value storage storing masked incident logs and user rules.</td>
            </tr>
            <tr>
                <td><strong>Testing &amp; Evaluation</strong></td>
                <td>Node.js Test Runner &amp; Python Toolchain</td>
                <td>Automated execution of 140-prompt categorized benchmark and 1,000-prompt adversarial stress test.</td>
            </tr>
        </table>
    </div>

    <h2 class="section-heading">6.1 Introduction</h2>
    <p>
        The selection of the technology stack for SENTINEL is dictated by three uncompromising engineering imperatives: (1) <strong>Zero Runtime Latency:</strong> security checks must execute within milliseconds without degrading typing responsiveness; (2) <strong>Zero External Dependencies:</strong> relying upon external npm libraries introduces supply-chain security risks and inflates bundle size; and (3) <strong>Strict Zero-Trust Privacy:</strong> the entire detection and remediation lifecycle must execute locally within the browser engine without transmitting telemetry.
    </p>

    <h2 class="section-heading">6.2 Frontend and Client Technologies</h2>
    <p>
        The visual presentation layer of SENTINEL is built using semantic HTML5 and vanilla CSS3. By adopting modern design patterns&mdash;including glassmorphism, tailored HSL color palettes, and GPU-accelerated micro-animations&mdash;the user interface delivers an aesthetically premium experience. CSS variables are leveraged for consistent design tokenization across the extension popup (<code>popup.html</code>), options management page (<code>options.html</code>), and injected DOM modal overlays.
    </p>

    <h2 class="section-heading">6.3 Browser Platform and Extension Architecture</h2>
    <p>
        SENTINEL is built upon the modern Chromium <strong>Manifest Version 3 (MV3)</strong> platform. Manifest V3 introduces substantial security enhancements over legacy MV2 architectures by prohibiting externally hosted code and enforcing ephemeral, event-driven background Service Workers. The architecture divides responsibilities across three distinct execution contexts: (a) Content Scripts running within the isolated DOM context of target AI platforms; (b) Injected Page Scripts operating within the webpage&rsquo;s JavaScript context to hook network prototypes; and (c) the Background Service Worker handling cross-tab state coordination and persistent storage.
    </p>

    <h2 class="section-heading">6.4 Data Storage Technology</h2>
    <p>
        To preserve complete user privacy, SENTINEL utilizes the native Chromium <code>chrome.storage.local</code> asynchronous storage engine. Unlike cookies or standard Web Storage (<code>localStorage</code>), <code>chrome.storage.local</code> is partitioned securely per extension, is inaccessible to webpage scripts, provides atomic read/write transactions, and persists data across browser restarts without size-induced performance degradation.
    </p>

    <h2 class="section-heading">6.5 Detection and Heuristic Engine</h2>
    <p>
        The detection engine combines native ECMAScript Regular Expression (RegExp) matching with mathematical algorithms. Regular expressions are pre-compiled and optimized with non-capturing groups and anchored boundary assertions to maximize throughput. For unknown credentials, the engine calculates <strong>Shannon Information Entropy</strong>:
    </p>
    <p style="text-align: center; font-weight: bold; font-family: 'Times New Roman', serif;">
        H(X) = - &sum;<sub>i=1</sub><sup>n</sup> p(x<sub>i</sub>) &middot; log<sub>2</sub> p(x<sub>i</sub>)
    </p>
    <p>
        Where $p(x_i)$ represents the empirical probability of occurrence of character $x_i$ within an extracted candidate token. Tokens exceeding $H \ge 3.8$ bits per symbol exhibit character randomness characteristic of cryptographic private keys and high-entropy passwords. For payment card detection, the engine incorporates the <strong>Luhn Modulo-10</strong> algorithm, ensuring that only syntactically valid primary account numbers trigger security interventions.
    </p>

    <h2 class="section-heading">6.6 Deep Interception Technology</h2>
    <p>
        SENTINEL implements a multi-trigger interception pipeline operating in the capture phase of browser event propagation (<code>useCapture = true</code>). This ensures that submission events are intercepted and evaluated before target web application listeners (e.g., React event synthesizers) can initiate network requests. To intercept asynchronous background submissions, SENTINEL instruments prototype monkeypatching of <code>window.fetch</code> and <code>window.XMLHttpRequest</code> within the page execution context.
    </p>

    <h2 class="section-heading">6.7 Technology Integration</h2>
    <p>
        The technologies are integrated through standard asynchronous message-passing interfaces (<code>chrome.runtime.sendMessage</code> and <code>window.postMessage</code>). When a prompt is submitted, the content script intercepts the DOM event, invokes the local detection engine, and conditionally dispatches the modal overlay or permits propagation, completing the end-to-end loop in less than 2 milliseconds.
    </p>

    <h2 class="section-heading">6.8 Technology Selection Rationale</h2>
    <p>
        Choosing pure vanilla ECMAScript over heavy frontend frameworks (such as React or Angular) for extension content scripts eliminated bundle bloat (keeping total extension size under 150 KB) and eliminated framework hydration delays, guaranteeing sub-millisecond execution velocity.
    </p>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 7: SYSTEM DESIGN                                                   -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 7</h1>
    <h2 class="chapter-subtitle">System Design</h2>

    <h2 class="section-heading">7.1 System Architecture</h2>
    <p>
        The system architecture of SENTINEL is organized into five tightly coupled, highly cohesive functional layers operating entirely within the client-side browser runtime.
    </p>

    <div class="figure-container">
        <img src="file:///{fig7_1}" class="figure-image" alt="Figure 7.1: System Architecture of SENTINEL" />
        <div class="figure-caption">Figure 7.1: System Architecture of SENTINEL</div>
        <p class="figure-explanation">
            Figure 7.1 details the multi-tiered layered architecture of SENTINEL. Layer 1 encompasses target generative AI web applications. Layer 2 represents the deep interception pipeline in the content script. Layer 3 houses the multi-layer detection and heuristic engine. Layer 4 executes enforcement, modal warnings, and in-place auto-redaction. Layer 5 provides zero-trust local persistence in <code>chrome.storage.local</code>.
        </p>
    </div>

    <h2 class="section-heading">7.2 Introduction</h2>
    <p>
        System design translates the functional requirements into concrete software structures, component relationships, and data flows. The design guarantees modularity, sub-millisecond latency, robust error isolation, and complete user privacy.
    </p>

    <h2 class="section-heading">7.3 System Architecture Description</h2>
    <p>
        The architecture enforces strict separation of concerns across its operational tiers:
    </p>
    <ul>
        <li><strong>Presentation Layer:</strong> Hosts the user-facing interfaces, including the extension action popup (<code>popup.html</code>), the configuration options page (<code>options.html</code>), and the dynamically injected modal dialogs.</li>
        <li><strong>Interception Layer:</strong> Attaches event listeners to the active DOM, intercepts keyboard and mouse triggers in the capture phase, and instruments network prototypes.</li>
        <li><strong>Heuristic Detection Engine Layer:</strong> Executes deterministic pattern matching, Shannon entropy analysis, Luhn validation, and confidential keyword evaluation.</li>
        <li><strong>Enforcement &amp; Remediation Layer:</strong> Manages prompt blocking, calculates contextual risk scores, renders coordinate highlights, and executes reverse-splice auto-redaction.</li>
        <li><strong>Storage &amp; Security Layer:</strong> Encapsulates all persistent interactions with <code>chrome.storage.local</code>, storing only cryptographically masked previews.</li>
    </ul>

    <h2 class="section-heading">7.4 Working Flow</h2>
    <p>
        The runtime execution workflow follows an exact operational sequence:
    </p>
    <ol>
        <li>The user types or pastes text into an AI prompt input field (e.g., ChatGPT textarea).</li>
        <li>The user initiates prompt submission via keyboard (<code>Enter</code> key) or by clicking the submission button.</li>
        <li>SENTINEL&rsquo;s capture-phase listener traps the event, invokes <code>event.preventDefault()</code> and <code>event.stopImmediatePropagation()</code>, and pauses submission.</li>
        <li>The prompt string is extracted and passed to the detection engine.</li>
        <li>Deterministic regex rules scan for known cloud, VCS, and SaaS API secrets.</li>
        <li>Alphanumeric tokens of length &ge; 16 are evaluated for Shannon information entropy ($H \ge 3.8$).</li>
        <li>PII recognizers inspect text for SSN, phone numbers, and Luhn-valid credit card numbers.</li>
        <li>Organizational keyword dictionaries check for confidential codenames and internal project markers.</li>
        <li>If no violations are detected (Risk Score = 0), the event is released and the prompt is transmitted transparently to the AI backend.</li>
        <li>If violations are detected, the submission remains blocked. SENTINEL injects the glassmorphism warning modal, displays the findings breakdown, and offers one-click auto-redaction.</li>
        <li>If the user clicks &ldquo;Auto-Redact&rdquo;, sensitive tokens are replaced in the DOM with syntactic placeholders, and the sanitized prompt is safely submitted.</li>
    </ol>

    <div class="figure-container">
        <img src="file:///{fig7_3}" class="figure-image" alt="Figure 7.3: System Workflow Diagram" />
        <div class="figure-caption">Figure 7.3: System Workflow Diagram</div>
        <p class="figure-explanation">
            Figure 7.3 depicts the decision flowchart of SENTINEL. It details the sequential branching from user prompt input, through capture-phase interception, multi-layer scanning, conditional risk threshold evaluation, and subsequent user remediation pathways (Cancel, Override, Auto-Redact).
        </p>
    </div>

    <h2 class="section-heading">7.5 System Components</h2>
    <p>
        The SENTINEL architecture decomposes into seven fundamental software components:
    </p>
    <ul>
        <li><strong>7.5.1 Content Script Interception Module:</strong> Injected into supported AI platform tabs; binds capture-phase listeners to input textareas and submit buttons.</li>
        <li><strong>7.5.2 Multi-Layer Detection Engine:</strong> Coordinates parallel evaluation across regex, entropy, PII, and keyword analyzers.</li>
        <li><strong>7.5.3 Shannon Entropy Calculator:</strong> Computes the bit-entropy of individual candidate tokens using empirical character frequency distributions.</li>
        <li><strong>7.5.4 Contextual Risk Evaluator:</strong> Aggregates finding severities and computes a standardized prompt risk score ($0 &ndash; 100$).</li>
        <li><strong>7.5.5 Warning Modal &amp; Highlighting Module:</strong> Dynamically injects an accessible, non-destructive modal dialog into the webpage DOM.</li>
        <li><strong>7.5.6 Auto-Redaction Module:</strong> Executes right-to-left string replacement using reverse splicing, ensuring prompt coordinates remain intact.</li>
        <li><strong>7.5.7 Audit Storage Module:</strong> Records incident summaries in <code>chrome.storage.local</code> with masked secret previews.</li>
    </ul>

    <h2 class="section-heading">7.6 Threat Processing Flow</h2>
    <p>
        The threat processing flow enforces strict non-bypassability. Even if a user attempts to submit a prompt via keyboard shortcuts, form submission, or direct script dispatch, the capture-phase interception traps the payload before any underlying network socket serialization can occur.
    </p>

    <h2 class="section-heading">7.7 System Design Considerations</h2>
    <p>
        Modern AI platforms rely heavily on complex client-side state management (such as React SyntheticEvents and ProseMirror/Slate contenteditable editors). Directly modifying the DOM <code>value</code> or <code>innerHTML</code> of an input box can cause desynchronization with the underlying virtual DOM. To prevent this, SENTINEL&rsquo;s auto-redaction engine dispatches synthetic native <code>input</code> and <code>change</code> events with <code>bubbles: true</code>, ensuring that React and ProseMirror internal state stores synchronize seamlessly with the sanitized prompt text.
    </p>

    <h2 class="section-heading">7.8 Data Flow Diagram</h2>
    <p>
        The movement of data through SENTINEL is formally mapped via Level 0 (Context Diagram) and Level 1 Data Flow Diagrams (DFD).
    </p>

    <div class="figure-container">
        <img src="file:///{fig7_4}" class="figure-image" alt="Figure 7.4: Data Flow Diagram (Level 0 and Level 1 DFD)" />
        <div class="figure-caption">Figure 7.4: Data Flow Diagram (Level 0 and Level 1 DFD)</div>
        <p class="figure-explanation">
            Figure 7.4 illustrates the data transformation pipeline. In Level 0, raw prompt data flows from the user into SENTINEL, yielding sanitized prompts to the AI provider and masked records to local storage. In Level 1, internal transformations across DOM Capture (1.0), Multi-Layer Scan (2.0), Risk Evaluation (3.0), and Auto-Redaction (4.0) are decomposed.
        </p>
    </div>

    <h2 class="section-heading">7.9 Use Case Diagram</h2>
    <p>
        The system interactions between human actors and system boundaries are modeled via UML Use Case specifications.
    </p>

    <div class="figure-container">
        <img src="file:///{fig7_5}" class="figure-image" alt="Figure 7.5: Use Case Diagram" />
        <div class="figure-caption">Figure 7.5: Use Case Diagram</div>
        <p class="figure-explanation">
            Figure 7.5 models the functional interactions between the End User / Developer, Security Administrator, and the SENTINEL Manifest V3 system boundary, covering prompt composition, violation review, auto-redaction, policy management, and audit logging.
        </p>
    </div>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 8: DATABASE AND LOCAL STORAGE DESIGN                               -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 8</h1>
    <h2 class="chapter-subtitle">Database and Local Storage Design</h2>

    <h2 class="section-heading">8.1 Introduction</h2>
    <p>
        In strict adherence to zero-trust security doctrine, SENTINEL rejects the traditional paradigm of transmitting security telemetry or prompt contents to remote backend databases. Instead, SENTINEL implements a high-performance, partitioned client-side persistence architecture hosted entirely within the browser&rsquo;s sandboxed <code>chrome.storage.local</code> key-value repository.
    </p>

    <h2 class="section-heading">8.2 Storage Objectives</h2>
    <p>
        The local storage architecture fulfills five core objectives:
    </p>
    <ul>
        <li><strong>Zero Plain Secret Storage:</strong> Unmasked secrets are never committed to disk under any circumstance.</li>
        <li><strong>Sub-Millisecond Read/Write:</strong> Rapid asynchronous storage access ensuring zero impact on UI responsiveness.</li>
        <li><strong>Tamper Evident Logging:</strong> Incident audit records are linked with chronological timestamps and UUID identifiers.</li>
        <li><strong>Partitioned Sandbox Security:</strong> Storage access is restricted solely to SENTINEL; webpage scripts cannot access stored records.</li>
        <li><strong>User-Controlled Data Retention:</strong> Users and administrators retain unilateral authority to export or purge local logs.</li>
    </ul>

    <h2 class="section-heading">8.3 Main Storage Entities</h2>
    <p>
        The schema comprises five primary entity stores within <code>chrome.storage.local</code>:
    </p>

    <div class="table-container">
        <div class="table-caption">Table 8.4: Settings Entity Schema (chrome.storage.local)</div>
        <table class="academic-table">
            <tr>
                <th style="width: 25%;">Field Name</th>
                <th style="width: 20%;">Data Type</th>
                <th style="width: 55%;">Description &amp; Default Value</th>
            </tr>
            <tr><td><code>protectionEnabled</code></td><td>BOOLEAN</td><td>Global master switch enabling/disabling active interception (Default: <code>true</code>).</td></tr>
            <tr><td><code>sensitivityLevel</code></td><td>VARCHAR(16)</td><td>Sensitivity preset: &lsquo;standard&rsquo;, &lsquo;strict&rsquo;, or &lsquo;custom&rsquo; (Default: &lsquo;standard&rsquo;).</td></tr>
            <tr><td><code>entropyThreshold</code></td><td>FLOAT</td><td>Minimum Shannon entropy required to trigger token alert (Default: <code>3.8</code>).</td></tr>
            <tr><td><code>blockOnCritical</code></td><td>BOOLEAN</td><td>Enforces hard block on Critical severity violations (Default: <code>true</code>).</td></tr>
            <tr><td><code>autoRedactDefault</code></td><td>BOOLEAN</td><td>Pre-selects Auto-Redaction as default modal action (Default: <code>true</code>).</td></tr>
            <tr><td><code>lastUpdated</code></td><td>BIGINT</td><td>Unix epoch timestamp (milliseconds) of last configuration update.</td></tr>
        </table>
    </div>

    <div class="table-container">
        <div class="table-caption">Table 8.5: Audit Log Entity Schema (Masked Incident Trail)</div>
        <table class="academic-table">
            <tr>
                <th style="width: 25%;">Field Name</th>
                <th style="width: 20%;">Data Type</th>
                <th style="width: 55%;">Description &amp; Privacy Safeguards</th>
            </tr>
            <tr><td><code>incidentId</code></td><td>UUID</td><td>Unique cryptographic identifier for the blocked attempt.</td></tr>
            <tr><td><code>timestamp</code></td><td>BIGINT</td><td>Unix epoch timestamp of the interception event.</td></tr>
            <tr><td><code>domainHost</code></td><td>VARCHAR(128)</td><td>FQDN of the AI platform (e.g., &lsquo;chatgpt.com&rsquo;).</td></tr>
            <tr><td><code>threatCategory</code></td><td>VARCHAR(32)</td><td>Category: &lsquo;API_KEY&rsquo;, &lsquo;PASSWORD&rsquo;, &lsquo;PII&rsquo;, &lsquo;CONFIDENTIAL&rsquo;.</td></tr>
            <tr><td><code>severityLevel</code></td><td>VARCHAR(16)</td><td>Severity classification: &lsquo;CRITICAL&rsquo;, &lsquo;HIGH&rsquo;, &lsquo;MEDIUM&rsquo;, &lsquo;LOW&rsquo;.</td></tr>
            <tr><td><code>maskedSecretPreview</code></td><td>VARCHAR(64)</td><td>Partially masked token preview (e.g., <code>AKIA••••••••••••MPLE</code>).</td></tr>
            <tr><td><code>actionTaken</code></td><td>VARCHAR(32)</td><td>User action: &lsquo;REDACTED&rsquo;, &lsquo;OVERRIDDEN&rsquo;, &lsquo;CANCELLED&rsquo;.</td></tr>
            <tr><td><code>riskScore</code></td><td>INTEGER</td><td>Contextual threat score ($0 &ndash; 100$).</td></tr>
        </table>
    </div>

    <div class="table-container">
        <div class="table-caption">Table 8.6: Custom Rules Entity Schema</div>
        <table class="academic-table">
            <tr>
                <th style="width: 25%;">Field Name</th>
                <th style="width: 20%;">Data Type</th>
                <th style="width: 55%;">Description</th>
            </tr>
            <tr><td><code>ruleId</code></td><td>UUID</td><td>Unique identifier for the user-defined custom detection rule.</td></tr>
            <tr><td><code>ruleName</code></td><td>VARCHAR(64)</td><td>Descriptive human-readable label (e.g., &lsquo;Internal DB Token&rsquo;).</td></tr>
            <tr><td><code>regexPattern</code></td><td>TEXT</td><td>Valid ECMAScript regular expression string.</td></tr>
            <tr><td><code>threatCategory</code></td><td>VARCHAR(32)</td><td>Target category mapping.</td></tr>
            <tr><td><code>severityWeight</code></td><td>INTEGER</td><td>Assigned risk weight ($1 &ndash; 100$).</td></tr>
            <tr><td><code>isEnabled</code></td><td>BOOLEAN</td><td>Toggles active evaluation of the rule during scans.</td></tr>
        </table>
    </div>

    <div class="table-container">
        <div class="table-caption">Table 8.7: Platform Registry Schema (Supported AI Hosts)</div>
        <table class="academic-table">
            <tr>
                <th style="width: 25%;">Field Name</th>
                <th style="width: 20%;">Data Type</th>
                <th style="width: 55%;">Description</th>
            </tr>
            <tr><td><code>platformId</code></td><td>VARCHAR(32)</td><td>Unique platform code (e.g., &lsquo;openai_chatgpt&rsquo;).</td></tr>
            <tr><td><code>domainHost</code></td><td>VARCHAR(128)</td><td>Primary domain hostname to match content script injection.</td></tr>
            <tr><td><code>isProtected</code></td><td>BOOLEAN</td><td>Indicates whether active prompt guardian is enabled for this domain.</td></tr>
            <tr><td><code>interceptionMode</code></td><td>VARCHAR(16)</td><td>Operational mode: &lsquo;dom_and_fetch&rsquo;, &lsquo;dom_only&rsquo;, &lsquo;fetch_only&rsquo;.</td></tr>
            <tr><td><code>customSelector</code></td><td>VARCHAR(64)</td><td>CSS selector for custom input elements (optional fallback).</td></tr>
        </table>
    </div>

    <div class="table-container">
        <div class="table-caption">Table 8.8: Statistical Aggregations Schema</div>
        <table class="academic-table">
            <tr>
                <th style="width: 25%;">Field Name</th>
                <th style="width: 20%;">Data Type</th>
                <th style="width: 55%;">Description</th>
            </tr>
            <tr><td><code>totalScanned</code></td><td>INTEGER</td><td>Cumulative count of all prompts evaluated by the engine.</td></tr>
            <tr><td><code>threatsIntercepted</code></td><td>INTEGER</td><td>Cumulative count of prompts containing policy violations.</td></tr>
            <tr><td><code>secretsRedacted</code></td><td>INTEGER</td><td>Cumulative count of sensitive tokens sanitized via Auto-Redaction.</td></tr>
            <tr><td><code>cumulativeRiskScore</code></td><td>FLOAT</td><td>Running aggregate risk score across all recorded threats.</td></tr>
        </table>
    </div>

    <h2 class="section-heading">8.9 Storage Entity Relationships</h2>
    <p>
        The relationships between local storage entities are modeled via the Entity-Relationship Diagram depicted in Figure 8.1.
    </p>

    <div class="figure-container">
        <img src="file:///{fig8_1}" class="figure-image" alt="Figure 8.1: Entity Relationship Diagram of SENTINEL Storage" />
        <div class="figure-caption">Figure 8.1: Entity Relationship Diagram of SENTINEL Storage</div>
        <p class="figure-explanation">
            Figure 8.1 shows the structural relationships across SENTINEL&rsquo;s local storage entities in <code>chrome.storage.local</code>. Configuration settings govern audit log creation, custom rule enforcement, and platform registry bindings in a 1:N cardinality, maintaining complete relational integrity without requiring an external DBMS engine.
        </p>
    </div>

    <h2 class="section-heading">8.10 Storage Security and Masking Architecture</h2>
    <p>
        To prevent local audit logs from becoming secondary attack targets, SENTINEL implements a deterministic <strong>Anchor-Preserving Masking Algorithm</strong>. When a credential (e.g., <code>AKIAIOSFODNN7EXAMPLE</code>) is intercepted, the system preserves the initial 4 prefix characters and final 4 suffix characters, while replacing all interior characters with unicode bullet characters (<code>&bull;&bull;&bull;&bull;</code>). This preserves sufficient contextual clarity for administrative auditing while rendering the stored token completely useless to local malware or unauthorized observers.
    </p>

    <h2 class="section-heading">8.11 Storage Summary</h2>
    <p>
        The client-side storage architecture fulfills all zero-trust compliance criteria. It guarantees persistence of configuration, rapid retrieval of operational statistics, and secure auditing of threat incidents with zero external telemetry.
    </p>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 9: MODULE DESCRIPTION                                              -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 9</h1>
    <h2 class="chapter-subtitle">Module Description</h2>

    <div class="table-container">
        <div class="table-caption">Table 9.1: SENTINEL N1&ndash;N14 Module Description</div>
        <table class="academic-table">
            <tr>
                <th style="width: 12%;">Module ID</th>
                <th style="width: 32%;">Module Name</th>
                <th style="width: 56%;">Functional Responsibility</th>
            </tr>
            <tr><td>N1</td><td>Content Script Interceptor</td><td>Attaches capture-phase DOM listeners to input textareas, buttons, and forms.</td></tr>
            <tr><td>N2</td><td>Known Secret Signature Module</td><td>Executes deterministic regular expression matching against 28+ credential types.</td></tr>
            <tr><td>N3</td><td>Shannon Entropy Analysis</td><td>Calculates information entropy on candidate tokens ($H \ge 3.8$) to catch random keys.</td></tr>
            <tr><td>N4</td><td>PII Recognition &amp; Verifier</td><td>Detects SSNs, phone numbers, emails, and validates credit cards via Luhn algorithm.</td></tr>
            <tr><td>N5</td><td>Confidential Codenames Module</td><td>Matches prompt text against enterprise dictionary of proprietary project names.</td></tr>
            <tr><td>N6</td><td>Contextual Risk Scoring</td><td>Computes weighted threat score ($0 &ndash; 100$) and assigns severity classification.</td></tr>
            <tr><td>N7</td><td>Coordinate Highlighting Module</td><td>Maps exact start and end string indices to highlight offending spans in the UI.</td></tr>
            <tr><td>N8</td><td>Modal Warning &amp; UI Module</td><td>Renders glassmorphism warning dialog displaying explainable threat findings.</td></tr>
            <tr><td>N9</td><td>In-Place Auto-Redaction</td><td>Performs reverse-splice string substitution, injecting semantic placeholders in DOM.</td></tr>
            <tr><td>N10</td><td>Secret Masking Engine</td><td>Generates anchor-preserved masked strings for safe audit logging.</td></tr>
            <tr><td>N11</td><td>Local Storage &amp; Audit Logger</td><td>Persists masked incident records and operational statistics in <code>chrome.storage.local</code>.</td></tr>
            <tr><td>N12</td><td>Extension Popup Interface</td><td>Provides real-time shield status, prompt statistics, and recent incident previews.</td></tr>
            <tr><td>N13</td><td>Options &amp; Policy Management</td><td>Enables configuration of sensitivity levels, custom regex rules, and domain policies.</td></tr>
            <tr><td>N14</td><td>Automated Evaluation Harness</td><td>Executes comprehensive benchmark validation across categorized test prompt suites.</td></tr>
        </table>
    </div>

    <h2 class="section-heading">9.1 Introduction</h2>
    <p>
        The SENTINEL system is organized into modular, independently testable functional blocks. Each module encapsulates a specialized aspect of interception, detection, UI rendering, or storage, collaborating through standardized interfaces.
    </p>

    <h2 class="section-heading">9.2 User and Settings Management Module (N1)</h2>
    <p>
        Manages extension activation state, user preferences, and enterprise policy configurations loaded from storage.
    </p>

    <h2 class="section-heading">9.3 Content Script Interception Module (N2)</h2>
    <p>
        Operates within the webpage execution environment, trapping keyboard <code>Enter</code> events, form submissions, and observing dynamic DOM additions via <code>MutationObserver</code>.
    </p>

    <h2 class="section-heading">9.4 Known Secret Signature Module (N3)</h2>
    <p>
        Houses optimized regular expression definitions for AWS Access Keys, OpenAI Keys, GitHub Tokens, Stripe Secret Keys, Slack Bot Tokens, Google Cloud API Keys, and SSH/RSA Private Keys.
    </p>

    <h2 class="section-heading">9.5 Shannon Entropy Calculation Module (N4)</h2>
    <p>
        Extracts candidate strings (&ge; 16 chars) and computes empirical character entropy, flagging tokens that exhibit mathematical randomness exceeding natural language baselines.
    </p>

    <h2 class="section-heading">9.6 Personally Identifiable Information Module (N5)</h2>
    <p>
        Scans for sensitive personal records, incorporating the Luhn checksum to eliminate false positive numeric alerts on telephone numbers or postal codes.
    </p>

    <h2 class="section-heading">9.7 Confidential Keywords and Codenames Module (N6)</h2>
    <p>
        Cross-references prompt tokens against an administrative blacklist of trade secret codenames, M&amp;A identifiers, and confidential markings.
    </p>

    <h2 class="section-heading">9.8 Contextual Risk Scoring Module (N7)</h2>
    <p>
        Evaluates the aggregate severity of all detected findings, assigning a consolidated risk score from 0 to 100 based on threat category weights.
    </p>

    <h2 class="section-heading">9.9 Coordinate Range and Highlighting Module (N8)</h2>
    <p>
        Calculates character offset tuples <code>[startIndex, endIndex]</code> for each identified violation, enabling precise inline visual highlighting within the warning modal.
    </p>

    <h2 class="section-heading">9.10 Modal Warning and Intervention Module (N9)</h2>
    <p>
        Constructs and injects an accessible, keyboard-trapped modal dialog displaying categorized findings, risk severity badges, and actionable remediation controls.
    </p>

    <h2 class="section-heading">9.11 In-Place Auto-Redaction Module (N10)</h2>
    <p>
        Applies a reverse-splice substitution algorithm, replacing sensitive tokens with structured syntactic placeholders (e.g., <code>[REDACTED_AWS_KEY_1]</code>) directly within the DOM.
    </p>

    <h2 class="section-heading">9.12 Secret Masking and Anonymization Module (N11)</h2>
    <p>
        Transforms raw secret strings into anchor-preserved masked strings prior to any storage operations, guaranteeing that plain secrets never touch persistent storage.
    </p>

    <h2 class="section-heading">9.13 Local Storage and Audit Logging Module (N12)</h2>
    <p>
        Appends masked incident metadata to <code>chrome.storage.local</code>, increments statistical counters, and provides data retrieval APIs for management views.
    </p>

    <h2 class="section-heading">9.14 Extension Popup Interface Module (N13)</h2>
    <p>
        Renders the extension toolbar popup (<code>popup.html</code>), displaying shield status, real-time protection statistics, and quick navigation shortcuts.
    </p>

    <h2 class="section-heading">9.15 Options and Policy Management Module (N14)</h2>
    <p>
        Provides the administrative configuration dashboard (<code>options.html</code>), allowing users to adjust sensitivity thresholds, author custom regex rules, and export audit trails.
    </p>

    <h2 class="section-heading">9.16 Module Integration and Communication</h2>
    <p>
        Modules communicate via asynchronous event pipelines. When an input event fires, N1 extracts prompt text and invokes N2&ndash;N6. Findings are passed to N7&ndash;N8 for modal rendering, N9 executes redaction, and N10&ndash;N11 handle masked logging.
    </p>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 10: IMPLEMENTATION AND WORKING PRINCIPLE                           -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 10</h1>
    <h2 class="chapter-subtitle">Implementation and Working Principle</h2>

    <h2 class="section-heading">10.1 Introduction</h2>
    <p>
        This chapter provides a comprehensive technical walkthrough of the concrete algorithms, runtime mechanisms, and implementation architectures realizing SENTINEL.
    </p>

    <h2 class="section-heading">10.2 Frontend User Interface Implementation</h2>
    <p>
        The user interface components (<code>popup.html</code>, <code>options.html</code>, and the injected modal) are styled using pure vanilla CSS3. Modern glassmorphism effects are implemented using CSS <code>backdrop-filter: blur(12px)</code>, combined with semi-transparent rgba borders and subtle box-shadows. Micro-animations utilize hardware-accelerated CSS transitions (<code>transform</code> and <code>opacity</code>) with 200ms ease-out timing curves, ensuring smooth 60fps rendering without jank.
    </p>

    <h2 class="section-heading">10.3 Background Service Worker and Storage Implementation</h2>
    <p>
        Under Manifest V3, the background script operates as an event-driven service worker (<code>js/background.js</code>). The service worker initializes extension defaults upon <code>chrome.runtime.onInstalled</code>, manages toolbar badge updates (e.g., displaying the count of intercepted threats), and provides cross-context coordination via <code>chrome.runtime.onMessage</code>.
    </p>

    <h2 class="section-heading">10.4 Content Script DOM and Network Interception</h2>
    <p>
        Interception is implemented in <code>js/content.js</code>. Event listeners for <code>keydown</code>, <code>keypress</code>, and <code>click</code> are registered on <code>window</code> with <code>useCapture: true</code>. When an <code>Enter</code> keydown event is detected without the <code>Shift</code> modifier (indicating submission), the handler halts propagation immediately:
    </p>
    <pre class="code-listing">
function handlePromptSubmission(event) {{
    const target = event.target;
    const promptText = extractPromptValue(target);
    if (!promptText || promptText.trim().length === 0) return;

    const evaluation = window.SentinelEngine.evaluatePrompt(promptText);
    if (evaluation.riskScore &gt; 0) {{
        event.preventDefault();
        event.stopImmediatePropagation();
        showInterceptionModal(target, promptText, evaluation);
    }}
}}
    </pre>

    <h2 class="section-heading">10.5 Core Multi-Layer Detection Implementation</h2>
    <p>
        The core engine (<code>js/detection-engine.js</code>) evaluates text sequentially across its analysis tiers. The Shannon entropy implementation utilizes an empirical frequency map to compute information density:
    </p>
    <pre class="code-listing">
function calculateShannonEntropy(token) {{
    const len = token.length;
    if (len === 0) return 0;
    const frequencies = {{}};
    for (let i = 0; i &lt; len; i++) {{
        const ch = token[i];
        frequencies[ch] = (frequencies[ch] || 0) + 1;
    }}
    let entropy = 0;
    for (const ch in frequencies) {{
        const p = frequencies[ch] / len;
        entropy -= p * Math.log2(p);
    }}
    return entropy;
}}
    </pre>

    <h2 class="section-heading">10.6 Risk Scoring and Severity Evaluation Implementation</h2>
    <p>
        The risk scoring algorithm evaluates the array of detected findings against category weight vectors ($W_{{cat}}$) and severity multipliers ($S_{{sev}}$):
    </p>
    <p style="text-align: center; font-weight: bold;">
        Risk Score = min( 100, &sum; [ W(Finding<sub>i</sub>) &times; S(Finding<sub>i</sub>) ] )
    </p>
    <p>
        Where Cloud Credentials and Production Passwords carry a base weight of 80&ndash;100 (Critical), High-Entropy Secrets carry 60 (High), PII carries 40 (Medium/High), and Confidential Keywords carry 30 (Medium).
    </p>

    <h2 class="section-heading">10.7 Warning Modal and Highlighting Implementation</h2>
    <p>
        When a violation is detected, SENTINEL constructs a modal container and attaches it to <code>document.body</code>. The modal displays a summary badge (e.g., &ldquo;CRITICAL RISK&rdquo;), a list of detected threats with masked previews, and an explanation of the leak risk.
    </p>

    <h2 class="section-heading">10.8 In-Place Auto-Redaction Implementation</h2>
    <p>
        Auto-redaction executes a reverse-splice substitution algorithm. Because replacing a token changes the length of the string, sorting findings by <code>startIndex</code> in descending order (right-to-left) guarantees that subsequent substitutions do not invalidate the character indices of earlier findings:
    </p>
    <pre class="code-listing">
function autoRedactPrompt(originalText, findings) {{
    // Sort findings descending by startIndex to preserve indices
    const sorted = [...findings].sort((a, b) =&gt; b.startIndex - a.startIndex);
    let sanitized = originalText;
    sorted.forEach((finding, idx) =&gt; {{
        const placeholder = `[REDACTED_${{finding.type}}_${{sorted.length - idx}}]`;
        sanitized = sanitized.slice(0, finding.startIndex) + placeholder + sanitized.slice(finding.endIndex);
    }});
    return sanitized;
}}
    </pre>

    <h2 class="section-heading">10.9 Complete Working Principle</h2>
    <p>
        The complete working principle coordinates capture, evaluation, modal intervention, reverse-splice redaction, and native React virtual DOM event dispatching.
    </p>

    <div class="figure-container">
        <img src="file:///{fig10_1}" class="figure-image" alt="Figure 10.1: Threat Interception and Redaction Processing Workflow" />
        <div class="figure-caption">Figure 10.1: Threat Interception and Redaction Processing Workflow</div>
        <p class="figure-explanation">
            Figure 10.1 details the internal algorithmic processing workflow of SENTINEL. Raw prompt strings are tokenized, processed concurrently across deterministic regex, Shannon entropy, PII, and keyword engines, transformed into coordinate ranges, scored for risk, and processed through reverse-splice redaction before dispatching sanitized text.
        </p>
    </div>

    <h2 class="section-heading">10.10 Threat Processing Workflow</h2>
    <p>
        The threat processing workflow guarantees that no prompt containing active credentials reaches network serialization. The DOM is updated synchronously, native input events are dispatched to synchronize client framework state, and the clean prompt is submitted safely.
    </p>

    <h2 class="section-heading">10.11 Implementation Summary</h2>
    <p>
        The implementation achieves total functional integrity: sub-1.5ms evaluation latency, 100% precision on credentials, robust reverse-splice redaction, and zero-telemetry client-side auditing.
    </p>
</div>

<div class="page-break"></div>
"""
    return html
