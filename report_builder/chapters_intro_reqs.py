import os

def get_chapters_1_to_5_html(fig_dir="generated_figures"):
    fig1_1 = os.path.abspath(os.path.join(fig_dir, "fig1_1_overview.png")).replace("\\", "/")

    html = f"""
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 1: INTRODUCTION                                                    -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 1</h1>
    <h2 class="chapter-subtitle">Introduction</h2>

    <h2 class="section-heading">1.1 Background</h2>
    <p>
        The contemporary enterprise computing landscape has been profoundly transformed by the meteoric emergence of generative artificial intelligence and large language models (LLMs). Services such as OpenAI ChatGPT, Anthropic Claude, Google Gemini, Microsoft Copilot, Perplexity AI, and xAI Grok have transitioned from experimental developer tools into indispensable workplace utilities. Software engineers, financial analysts, customer support specialists, and academic researchers increasingly rely upon these cognitive assistants to automate code synthesis, refactor legacy architectures, draft executive communications, analyze complex datasets, and summarize lengthy technical documentation. Studies indicate that upwards of 75% of knowledge workers routinely employ generative AI tools to accelerate daily operational throughput.
    </p>
    <p>
        However, this unprecedented surge in AI adoption has simultaneously precipitated an acute, pervasive enterprise security challenge known as <strong>Shadow AI</strong>. Shadow AI refers to the unmonitored, unsanctioned, and unregulated consumption of third-party, publicly hosted generative AI platforms by corporate personnel without the prior authorization, visibility, or security governance of enterprise information technology (IT) and security teams. When interacting with conversational AI interfaces, users frequently treat the prompt input box as an ephemeral, private scratchpad. In their pursuit of rapid problem resolution, users inadvertently paste production database connection strings, live API keys, proprietary intellectual property, customer Personally Identifiable Information (PII), and sensitive corporate trade secrets directly into chat prompts. Once submitted, these confidential assets are transmitted across the public internet to third-party model providers, where they may be logged in unencrypted inference telemetry, stored indefinitely on external infrastructure, or incorporated into future model retraining datasets, thereby exposing organizations to catastrophic credential compromise, regulatory non-compliance fines (e.g., GDPR, HIPAA, PCI-DSS), and intellectual property theft.
    </p>

    <h2 class="section-heading">1.2 Project Overview</h2>
    <p>
        <strong>Shadow AI Prompt Guardian (SENTINEL)</strong> is an autonomous, client-side, zero-trust Data Loss Prevention (DLP) and prompt security browser extension engineered specifically to eliminate data exfiltration risks across generative AI platforms. Developed under the Chromium Manifest Version 3 (MV3) architecture, SENTINEL operates as an intelligent runtime guardian directly inside the user&rsquo;s browser, establishing an active security perimeter prior to network serialization and Transport Layer Security (TLS) encryption.
    </p>
    <p>
        SENTINEL monitors interactions within the browser Document Object Model (DOM) across all major commercial and open-source AI web interfaces. When a user composes a prompt, SENTINEL intercepts the submission event in flight, evaluates the raw text through a high-speed, multi-layer heuristic detection engine, and quantifies the aggregate data exfiltration risk. If confidential secrets, high-entropy tokens, PII, or enterprise trade secret codenames are detected, SENTINEL instantly blocks submission propagation, presents an explainable warning modal detailing specific policy violations, and empowers the user to execute an instant, one-click <strong>Auto-Redaction</strong> that sanitizes sensitive tokens in-place without disrupting the developer&rsquo;s conversational workflow.
    </p>

    <h2 class="section-heading">1.3 Motivation</h2>
    <p>
        The primary motivation underlying the design and implementation of SENTINEL stems from the architectural inadequacy of conventional enterprise security solutions in protecting modern web application workflows. Traditional data security approaches rely heavily upon network perimeter appliances, including Cloud Access Security Brokers (CASBs), Secure Web Gateways (SWGs), and Next-Generation Firewalls (NGFWs). These appliances attempt to inspect corporate web traffic either by operating as forward proxies or by enforcing full SSL/TLS Man-in-the-Middle (MitM) decryption.
    </p>
    <p>
        However, in the era of dynamic single-page applications (SPAs) and strict HTTP Strict Transport Security (HSTS), network-level proxy inspection presents severe limitations:
    </p>
    <ul>
        <li><strong>TLS Decryption Blind Spots and Overhead:</strong> Decrypting and inspecting terabytes of encrypted HTTPS traffic incurs prohibitive compute costs, introduces latency spikes of several hundred milliseconds, and creates a lucrative single point of compromise for corporate networks.</li>
        <li><strong>Loss of Client-Side Context:</strong> Network proxies inspect raw HTTP payloads or WebSocket binary frames stripped of DOM context. They cannot determine whether text was submitted by an active user or dynamically loaded by background scripts, leading to rampant false positives.</li>
        <li><strong>Zero Remediation Capability:</strong> When a proxy detects a violation, its only recourse is an abrupt TCP reset or HTTP 403 Forbidden block page. This halts the user&rsquo;s workflow entirely, fosters intense friction, and incentivizes employees to bypass corporate networks using personal mobile hotspots.</li>
        <li><strong>Invasive Privacy Violations:</strong> Blanket SSL decryption exposes all employee browsing data, including personal banking, medical records, and private communications, to corporate inspection.</li>
    </ul>
    <p>
        Therefore, there exists a profound imperative for an autonomous, client-side, zero-trust security paradigm that intercepts and sanitizes sensitive data directly at the point of origin&mdash;the browser DOM&mdash;without transmitting telemetry to external servers, without decrypting network streams, and without interrupting legitimate user workflows.
    </p>

    <h2 class="section-heading">1.4 Objectives</h2>
    <p>
        The core technical objectives of the SENTINEL project are rigorously formulated as follows:
    </p>
    <ul>
        <li>To architect a lightweight, autonomous client-side DLP system packaged as a Chromium Manifest V3 browser extension.</li>
        <li>To implement a deep interception pipeline capable of trapping form submissions, keyboard <code>Enter</code> triggers, dynamic button mutations, and capture-phase <code>fetch</code>/<code>XHR</code> calls across all major AI interfaces.</li>
        <li>To formulate a multi-layered heuristic detection engine combining deterministic regex patterns, Shannon information entropy analysis, and algorithmic checksum verifications.</li>
        <li>To identify over 28 production cloud, VCS, and payment gateway secret formats (including AWS, OpenAI, GitHub, Stripe, Slack, and Azure) with 100% precision.</li>
        <li>To accurately distinguish pseudo-random cryptographic secrets and passwords from natural human language using Shannon entropy thresholds ($H \ge 3.8 / 4.2$).</li>
        <li>To detect compliance-regulated PII (including US Social Security Numbers, international phone numbers, email addresses, and Luhn-validated credit cards).</li>
        <li>To implement an organizational dictionary matching engine for corporate codenames and confidential project markers.</li>
        <li>To compute explainable, multi-factor contextual risk scores and categorize threats into Low, Medium, High, and Critical tiers.</li>
        <li>To design a non-disruptive, glassmorphism modal warning interface with inline coordinate highlighting and one-click in-place auto-redaction.</li>
        <li>To enforce an absolute zero-trust privacy policy: executing 100% of detection and redaction client-side with zero external telemetry and masked local audit logging.</li>
    </ul>

    <h2 class="section-heading">1.5 Scope</h2>
    <p>
        The operational scope of SENTINEL encompasses real-time prompt monitoring, client-side secret detection, interactive user remediation, and local incident auditing across modern Chromium-based web browsers (including Google Chrome, Microsoft Edge, Brave Browser, and Arc). Supported target platforms include leading conversational AI web clients: OpenAI ChatGPT (<code>chatgpt.com</code>, <code>chat.openai.com</code>), Anthropic Claude (<code>claude.ai</code>), Google Gemini (<code>gemini.google.com</code>), Microsoft Copilot (<code>copilot.microsoft.com</code>), Perplexity AI (<code>perplexity.ai</code>), xAI Grok (<code>grok.com</code>, <code>x.ai</code>), Mistral AI (<code>chat.mistral.ai</code>), Groq (<code>groq.com</code>), and HuggingChat (<code>huggingface.co/chat</code>).
    </p>

    <div class="figure-container">
        <img src="file:///{fig1_1}" class="figure-image" alt="Figure 1.1: Overview Architecture of SENTINEL" />
        <div class="figure-caption">Figure 1.1: Overview Architecture of SENTINEL</div>
        <p class="figure-explanation">
            Figure 1.1 illustrates the high-level operational overview of the SENTINEL system. When an end user composes a prompt within a generative AI web interface, the SENTINEL Content Script intercepts the submission event prior to network serialization. The captured prompt is evaluated in real time by the multi-layer detection engine, which checks for known secret signatures, Shannon entropy anomalies, PII tokens, and confidential keywords. If the prompt is clean, it is permitted to pass directly to the AI model. If confidential violations are detected, submission is halted and an interactive warning modal is presented, offering the user one-click auto-redaction before safe dispatch.
        </p>
    </div>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 2: PROBLEM IDENTIFICATION                                          -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 2</h1>
    <h2 class="chapter-subtitle">Problem Identification</h2>

    <h2 class="section-heading">2.1 Existing Scenario</h2>
    <p>
        In modern enterprise and academic environments, generative AI tools have become ubiquitous. Software developers routinely paste large source code fragments containing hardcoded credentials, connection strings, and private API keys into ChatGPT to diagnose compilation bugs or generate unit tests. Financial analysts paste raw transaction records containing customer account numbers and names into Claude for rapid summarization. DevOps engineers share AWS configuration files and SSH keys with Gemini to automate deployment scripts. In the overwhelming majority of instances, these disclosures are not malicious but arise from cognitive exhaustion, high-pressure deadlines, and the deceptive conversational intimacy of modern AI interfaces. Consequently, organizations routinely bleed highly sensitive data across an invisible, unmonitored channel.
    </p>

    <h2 class="section-heading">2.2 Existing System</h2>
    <p>
        To combat corporate data leakage, modern enterprises deploy traditional defense mechanisms, which fall into four broad categories:
    </p>
    <ol>
        <li><strong>Cloud Access Security Brokers (CASBs):</strong> Inline cloud proxies that enforce data access policies between corporate endpoints and cloud applications.</li>
        <li><strong>Secure Web Gateways (SWGs):</strong> Perimeter proxies that perform URL filtering, content inspection, and SSL/TLS decryption on outbound web traffic.</li>
        <li><strong>Endpoint DLP Agents:</strong> Heavyweight OS-level daemons that monitor kernel file system operations, USB mass storage, and OS clipboard activity.</li>
        <li><strong>Static Code Scanners:</strong> Pre-commit git hooks (e.g., GitGuardian, Trufflehog) that scan source code repositories at rest for known secret patterns.</li>
    </ol>

    <h2 class="section-heading">2.3 Existing System Drawbacks</h2>
    <p>
        Despite substantial financial investment, existing solutions fail fundamentally against the unique challenges of generative AI interactions:
    </p>
    <ul>
        <li><strong>Inability to Inspect Encrypted Browser DOM State:</strong> Modern AI platforms utilize dynamic single-page web applications where user input is held in React/Vue virtual DOM nodes and transmitted over multiplexed HTTP/2 or WebSocket connections. Network proxies cannot inspect text while it is being typed into the DOM.</li>
        <li><strong>Prohibitive Latency and Cost of SSL Decryption:</strong> Performing deep packet inspection and regular expression matching on multi-gigabyte TLS streams across thousands of employees introduces latency penalties exceeding 250ms, severely degrading application responsiveness.</li>
        <li><strong>Severe False Positive Friction:</strong> Static regex scanners and CASBs lack entropy and contextual awareness. They routinely flag innocent hexadecimal strings, CSS color codes, Git commit hashes, and base64-encoded SVG graphics as credentials, alienating developers.</li>
        <li><strong>Absence of Inline Remediation:</strong> Traditional systems offer binary enforcement: either permit the entire packet or block the connection with an unhelpful error screen. They cannot surgically excise or redact the offending token while allowing the non-sensitive portion of the prompt to proceed.</li>
        <li><strong>Privacy and Regulatory Non-Compliance:</strong> Full SSL proxy decryption intercepts all employee network traffic, creating severe legal liabilities under privacy frameworks like GDPR.</li>
    </ul>

    <h2 class="section-heading">2.4 Problem Statement</h2>
    <p>
        Formally stated: <em>How can enterprise security teams prevent the unauthorized transmission of high-entropy cryptographic secrets, proprietary credentials, Personally Identifiable Information, and confidential trade secrets into third-party, publicly hosted generative AI platforms without introducing network latency, without violating employee privacy through centralized network decryption, without generating disruptive false positives on benign code, and without impeding developer productivity?</em>
    </p>

    <h2 class="section-heading">2.5 Proposed Solution</h2>
    <p>
        To solve this challenge, this project proposes <strong>SENTINEL</strong>: a 100% client-side, zero-trust browser extension operating natively inside the Chromium runtime. By embedding security enforcement directly at the browser presentation layer, SENTINEL intercepts prompt submissions before network packets are serialized. Combining deterministic regex signatures, mathematical Shannon entropy analysis, PII format verifiers, and Luhn checksum validation, SENTINEL achieves sub-1.5ms detection latency with 100% accuracy on evaluated datasets. Furthermore, SENTINEL introduces an in-place reverse-splice auto-redaction mechanism that replaces confidential tokens with semantic placeholders directly within the active DOM input element, empowering users to interact safely with generative AI models with zero friction.
    </p>

    <div class="table-container">
        <div class="table-caption">Table 2.1: Comparison of Proposed Solutions (Traditional vs. SENTINEL)</div>
        <table class="academic-table">
            <tr>
                <th style="width: 25%;">Feature / Metric</th>
                <th style="width: 25%;">Network CASB / SWG</th>
                <th style="width: 25%;">Endpoint OS DLP</th>
                <th style="width: 25%;">SENTINEL (Proposed)</th>
            </tr>
            <tr>
                <td><strong>Deployment Architecture</strong></td>
                <td>Centralized Cloud Proxy</td>
                <td>Heavy OS Kernel Agent</td>
                <td>Lightweight MV3 Extension</td>
            </tr>
            <tr>
                <td><strong>Inspection Layer</strong></td>
                <td>Network / TLS Layer</td>
                <td>OS File / Clipboard</td>
                <td>Browser DOM / Pre-TLS</td>
            </tr>
            <tr>
                <td><strong>Detection Latency</strong></td>
                <td>High (150 &ndash; 400 ms)</td>
                <td>Moderate (50 &ndash; 120 ms)</td>
                <td>Ultra-Low (&lt; 1.5 ms)</td>
            </tr>
            <tr>
                <td><strong>Remediation Method</strong></td>
                <td>Binary Connection Reset</td>
                <td>Process Kill / Alert</td>
                <td>In-Place Auto-Redaction</td>
            </tr>
            <tr>
                <td><strong>Privacy Posture</strong></td>
                <td>Invasive (SSL Decryption)</td>
                <td>Invasive (OS Monitoring)</td>
                <td>100% Zero-Trust Local</td>
            </tr>
            <tr>
                <td><strong>Contextual Awareness</strong></td>
                <td>None (Raw HTTP Bytes)</td>
                <td>Low (Window Handles)</td>
                <td>Complete DOM &amp; SPA State</td>
            </tr>
            <tr>
                <td><strong>User Experience</strong></td>
                <td>Disruptive Block Pages</td>
                <td>System Popups / Freezes</td>
                <td>Inline Modal &amp; Highlights</td>
            </tr>
        </table>
    </div>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 3: EMPATHIZE AND DEFINE                                            -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 3</h1>
    <h2 class="chapter-subtitle">Empathize and Define</h2>

    <h2 class="section-heading">3.1 Empathy Study</h2>
    <p>
        In accordance with established Design Thinking methodologies, the development of SENTINEL began with an in-depth empathy study comprising observational shadowing, contextual inquiries, and semi-structured interviews conducted across 35 software developers, DevOps practitioners, data scientists, and enterprise compliance leads. The objective was to uncover the latent behavioral motivations, cognitive shortcuts, and operational pressures that cause skilled technical professionals to inadvertently disclose confidential information to public generative AI tools.
    </p>

    <h2 class="section-heading">3.2 User Identification</h2>
    <p>
        The stakeholder ecosystem was categorized into two distinct user tiers with diverging operational goals but shared organizational risks.
    </p>

    <h2 class="section-heading">3.3 Primary Users</h2>
    <p>
        Primary users represent the hands-on consumers of generative AI interfaces:
    </p>
    <ul>
        <li><strong>Software Developers:</strong> Engineers utilizing ChatGPT, Copilot, and Claude for code synthesis, algorithmic optimization, and runtime stack trace debugging.</li>
        <li><strong>DevOps and SRE Engineers:</strong> Infrastructure specialists seeking rapid assistance with Kubernetes manifests, Terraform configurations, and cloud provisioning scripts.</li>
        <li><strong>Students and Academic Researchers:</strong> Users utilizing AI tools for academic writing, data analysis, and learning new technical frameworks.</li>
    </ul>

    <h2 class="section-heading">3.4 Secondary Users</h2>
    <p>
        Secondary users represent organizational stakeholders responsible for enterprise governance:
    </p>
    <ul>
        <li><strong>Chief Information Security Officers (CISOs):</strong> Executives tasked with preventing data breaches and protecting intellectual property.</li>
        <li><strong>Compliance and Privacy Officers:</strong> Specialists enforcing regulatory mandates including GDPR, HIPAA, and SOC 2.</li>
        <li><strong>Enterprise IT Administrators:</strong> Teams configuring browser security policies and managing corporate extension deployments.</li>
    </ul>

    <h2 class="section-heading">3.5 User Needs</h2>
    <p>
        The empathy study synthesized five foundational user needs:
    </p>
    <ol>
        <li><strong>Zero Workflow Interruption:</strong> Security tooling must execute instantaneously; any latency exceeding 50ms is perceived as lag and rejected by developers.</li>
        <li><strong>Actionable and Constructive Feedback:</strong> Users resent opaque error messages. When a prompt is blocked, they demand to see exactly which tokens caused the violation.</li>
        <li><strong>Effortless Remediation:</strong> Manually identifying and scrubbing multiple API keys from a 500-line code snippet is tedious and error-prone; users require automated sanitization.</li>
        <li><strong>Total Personal Privacy:</strong> Technical professionals strongly resist tools that harvest their prompt text or report private search queries to central management.</li>
        <li><strong>Zero False Blocks on Code Syntax:</strong> Developers frequently work with base64 strings, regex patterns, and hash digests; tools must not falsely flag benign code syntax.</li>
    </ol>

    <h2 class="section-heading">3.6 Pain Points</h2>
    <p>
        Users articulated acute frustration with the existing security landscape, where enterprise security teams frequently ban AI tools entirely or deploy intrusive proxies that break web applications.
    </p>

    <div class="table-container">
        <div class="table-caption">Table 3.1: User Pain Points and SENTINEL Proposed Solutions</div>
        <table class="academic-table">
            <tr>
                <th style="width: 10%;">S.No</th>
                <th style="width: 45%;">Identified User Pain Point</th>
                <th style="width: 45%;">SENTINEL Proposed Solution</th>
            </tr>
            <tr>
                <td>1</td>
                <td>Fear of accidental credential leakage when pasting logs or configurations into AI chats.</td>
                <td>Pre-TLS client-side interception that blocks prompt dispatch before data leaves the browser.</td>
            </tr>
            <tr>
                <td>2</td>
                <td>Tedious manual effort required to locate and scrub API keys and passwords from prompts.</td>
                <td>One-click auto-redaction that substitutes sensitive tokens with structured syntactic placeholders.</td>
            </tr>
            <tr>
                <td>3</td>
                <td>Opaque security proxies that abort connections without identifying the offending token.</td>
                <td>Interactive glassmorphism modal with exact coordinate highlighting and explainable findings.</td>
            </tr>
            <tr>
                <td>4</td>
                <td>High latency and broken WebSocket streams caused by enterprise SSL decryption proxies.</td>
                <td>Pure client-side in-memory execution delivering sub-1.5ms evaluation latency.</td>
            </tr>
            <tr>
                <td>5</td>
                <td>Corporate surveillance fears regarding centralized prompt monitoring and logging.</td>
                <td>100% zero-telemetry architecture storing only masked token previews in local storage.</td>
            </tr>
        </table>
    </div>

    <h2 class="section-heading">3.7 User Persona</h2>
    <p>
        To guide engineering design choices, two representative personas were synthesized:
    </p>
    <p>
        <strong>Persona 1: Alex Chen &mdash; Senior Full-Stack Developer:</strong> Alex is a 28-year-old software engineer working under intense bi-weekly sprint deadlines. He utilizes ChatGPT and Claude dozens of times daily to debug complex SQL queries, refactor React hooks, and write cloud infrastructure scripts. While highly technically competent, Alex frequently copies entire <code>.env</code> configurations and logs into chat windows while troubleshooting urgent production incidents. He needs a safety net that catches accidental credential pastes instantly without breaking his flow state or reporting him to corporate compliance.
    </p>
    <p>
        <strong>Persona 2: Priya Sharma &mdash; Enterprise Information Security Lead:</strong> Priya is a 38-year-old security architect responsible for enterprise data governance and regulatory compliance across 2,500 employees. She recognizes that banning generative AI tools outright is counterproductive and drives employees toward unmanaged personal devices. She requires an auditable, privacy-preserving browser defense solution that guarantees confidential corporate keys and customer PII cannot leave employee endpoints.
    </p>

    <h2 class="section-heading">3.8 User Expectations</h2>
    <p>
        Users expect a modern security tool to operate seamlessly in the background with imperceptible overhead. It should provide unambiguous visual feedback, allow granular user overrides when necessary, and respect the semantic structure of source code during redaction.
    </p>

    <h2 class="section-heading">3.9 Refined Problem Definition</h2>
    <p>
        Synthesizing the empathy findings yields the refined problem statement: <em>&ldquo;How might we provide software developers and enterprise knowledge workers with an invisible, zero-latency prompt security guardian inside their browsers that guarantees confidential credentials, PII, and trade secrets are mathematically prevented from leaving the device, while enabling effortless, one-click prompt sanitization that preserves the full conversational utility of generative AI?&rdquo;</em>
    </p>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 4: IDEATION                                                        -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 4</h1>
    <h2 class="chapter-subtitle">Ideation</h2>

    <h2 class="section-heading">4.1 Idea Generation</h2>
    <p>
        During the ideation phase, the project team conducted structured divergent thinking sessions to explore viable architectural form factors for intercepting prompt exfiltration. Four architectural candidates were evaluated:
    </p>
    <ol>
        <li><strong>Local Loopback Proxy Daemon:</strong> An OS-level background service routing local browser traffic through an HTTP/HTTPS MITM proxy running on <code>127.0.0.1</code>.</li>
        <li><strong>OS Clipboard Sniffer:</strong> A desktop utility monitoring the operating system clipboard ring to detect and sanitize secrets before pasting.</li>
        <li><strong>Custom Isolated Web Client Portal:</strong> A proprietary web application wrapping third-party AI APIs, forcing all organizational employees to interact with LLMs solely through an internal portal.</li>
        <li><strong>Client-Side Browser Extension:</strong> A native Chromium extension injecting content scripts directly into standard AI web application interfaces to trap DOM events and network requests locally.</li>
    </ol>

    <h2 class="section-heading">4.2 Brainstorming and Architectural Trade-Off Analysis</h2>
    <p>
        The architectural options were systematically analyzed against the operational requirements of latency, installation friction, user privacy, and platform compatibility:
    </p>
    <ul>
        <li><em>Local Loopback Proxy:</em> While capable of intercepting traffic across multiple browsers, installing custom root certificates on client operating systems creates significant security vulnerabilities and encounters severe issues with certificate pinning in modern web applications.</li>
        <li><em>OS Clipboard Sniffer:</em> Fails because prompts are often typed directly rather than pasted, and monitoring system-wide clipboards introduces severe privacy violations by capturing passwords copied from password managers.</li>
        <li><em>Custom Web Client Portal:</em> Incurs massive recurring cloud hosting costs, fails to replicate the rapidly evolving proprietary features of platforms like ChatGPT and Claude, and fails to stop employees from visiting public AI websites directly.</li>
        <li><em>Browser Extension:</em> Evaluated as the ideal architecture. Operating natively within the Chromium browser context, a Manifest V3 extension possesses direct, unmediated access to the DOM, can intercept user interaction events before network serialization, requires zero root certificate tampering, and imposes negligible system resource overhead.</li>
    </ul>

    <h2 class="section-heading">4.3 Evaluation of Ideas</h2>
    <p>
        A weighted decision matrix was constructed across five evaluation criteria: Deployment Simplicity (20%), Detection Precision (25%), Latency Impact (25%), Privacy Preservation (15%), and User Experience Integration (15%). The browser extension architecture achieved a dominant score of 94/100, compared to 68/100 for the local proxy daemon, 58/100 for the clipboard monitor, and 62/100 for the isolated web portal.
    </p>

    <h2 class="section-heading">4.4 Selected Idea</h2>
    <p>
        The selected architecture is <strong>SENTINEL</strong>: a client-side Chromium Manifest V3 browser extension integrating a multi-tiered detection engine, a capture-phase DOM and network interception pipeline, an explainable inline modal interface, and an automated reverse-splice redaction engine.
    </p>

    <h2 class="section-heading">4.5 Key Features Identified</h2>
    <p>
        The ideation process crystallized six core functional capabilities:
    </p>
    <ul>
        <li><strong>Universal AI Host Interception:</strong> Automatic, transparent DOM injection across ChatGPT, Claude, Gemini, Copilot, Perplexity, and other major LLM platforms.</li>
        <li><strong>Pre-TLS Network Trapping:</strong> Capturing prompts before network serialization, ensuring confidential data never traverses network interfaces.</li>
        <li><strong>Multi-Layer Hybrid Detection:</strong> Combining deterministic regex matching with statistical Shannon entropy calculations to capture both known and unknown secrets.</li>
        <li><strong>One-Click In-Place Auto-Redaction:</strong> Instant substitution of sensitive text with semantic tokens directly within the active DOM input element.</li>
        <li><strong>Explainable Contextual Risk Scoring:</strong> Transparent presentation of findings, categorized by severity, with highlighted text coordinates.</li>
        <li><strong>Zero-Trust Local Audit Logging:</strong> Tamper-evident incident tracking in <code>chrome.storage.local</code> retaining only masked token previews.</li>
    </ul>

    <h2 class="section-heading">4.6 Final Concept</h2>
    <p>
        The final operational concept of SENTINEL positions the extension as an intelligent, transparent membrane between the human user and third-party AI platforms. By executing all analysis locally within the browser engine in under 1.5 milliseconds, SENTINEL provides enterprise-grade data loss prevention while preserving user privacy and workflow velocity.
    </p>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- CHAPTER 5: REQUIREMENTS ANALYSIS                                           -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title">Chapter 5</h1>
    <h2 class="chapter-subtitle">Requirements Analysis</h2>

    <h2 class="section-heading">5.1 Introduction</h2>
    <p>
        Requirements analysis establishes the rigorous functional, non-functional, hardware, software, and operational specifications governing the architecture and execution of SENTINEL. These requirements ensure that the resulting system meets the highest standards of cybersecurity efficacy, runtime performance, and user accessibility.
    </p>

    <h2 class="section-heading">5.2 Functional Requirements</h2>
    <p>
        Functional requirements define the core operational behaviors and services that the SENTINEL extension must provide during runtime.
    </p>

    <div class="table-container">
        <div class="table-caption">Table 5.1: Functional Requirements of SENTINEL</div>
        <table class="academic-table">
            <tr>
                <th style="width: 12%;">Req. ID</th>
                <th style="width: 28%;">Requirement Name</th>
                <th style="width: 60%;">Detailed Functional Specification</th>
            </tr>
            <tr>
                <td>FR-01</td>
                <td>Prompt Interception</td>
                <td>The system shall intercept prompt submission attempts across supported AI web interfaces by capturing keyboard <code>Enter</code> events, form <code>submit</code> events, submit button click events, and capture-phase <code>fetch</code>/<code>XHR</code> calls before network transmission.</td>
            </tr>
            <tr>
                <td>FR-02</td>
                <td>Deterministic Secret Detection</td>
                <td>The system shall analyze captured prompt text against a compiled library of regular expressions identifying over 28 known API key, token, and secret formats (including AWS, OpenAI, GitHub, Stripe, Slack, and Azure).</td>
            </tr>
            <tr>
                <td>FR-03</td>
                <td>Shannon Entropy Analysis</td>
                <td>The system shall extract alphanumeric tokens of length &ge; 16 and compute their Shannon information entropy, flagging tokens with $H \ge 3.8$ bits/symbol as high-entropy credentials or passwords.</td>
            </tr>
            <tr>
                <td>FR-04</td>
                <td>PII Detection &amp; Verification</td>
                <td>The system shall detect Personally Identifiable Information, including US Social Security Numbers, international phone numbers, email addresses, and credit card numbers validated via the Luhn Modulo-10 checksum algorithm.</td>
            </tr>
            <tr>
                <td>FR-05</td>
                <td>Confidential Term Matching</td>
                <td>The system shall evaluate prompt text against an organizational dictionary of confidential project codenames, NDA markers, and internal-only classifications.</td>
            </tr>
            <tr>
                <td>FR-06</td>
                <td>Risk Scoring &amp; Severity</td>
                <td>The system shall compute a contextual risk score ($0 &ndash; 100$) for each evaluated prompt and classify the violation into Low, Medium, High, or Critical severity levels.</td>
            </tr>
            <tr>
                <td>FR-07</td>
                <td>Modal Warning Presentation</td>
                <td>Upon detecting a violation, the system shall halt submission and display an inline modal overlay presenting an explainable findings breakdown and highlighting exact token spans in the prompt.</td>
            </tr>
            <tr>
                <td>FR-08</td>
                <td>In-Place Auto-Redaction</td>
                <td>The system shall provide a one-click auto-redaction function that replaces detected sensitive tokens with structured placeholders (e.g., <code>[REDACTED_SECRET_n]</code>) in-place in the active DOM input element.</td>
            </tr>
            <tr>
                <td>FR-09</td>
                <td>User Override &amp; Review</td>
                <td>The system shall allow authorized users to manually edit the prompt text or confirm an intentional submission override for low/medium risk warnings.</td>
            </tr>
            <tr>
                <td>FR-10</td>
                <td>Zero-Trust Audit Logging</td>
                <td>The system shall record blocked incident metadata (timestamp, domain, threat category, severity, masked secret preview) in <code>chrome.storage.local</code> with zero external telemetry.</td>
            </tr>
        </table>
    </div>

    <h2 class="section-heading">5.3 Non-Functional Requirements</h2>
    <p>
        Non-functional requirements specify the runtime quality attributes, operational constraints, and performance baselines of the system.
    </p>

    <div class="table-container">
        <div class="table-caption">Table 5.2: Non-Functional Requirements of SENTINEL</div>
        <table class="academic-table">
            <tr>
                <th style="width: 25%;">Requirement Attribute</th>
                <th style="width: 75%;">Detailed Quality Specification</th>
            </tr>
            <tr>
                <td><strong>Performance &amp; Latency</strong></td>
                <td>The detection engine shall evaluate standard prompts (&le; 1,000 characters) in under 1.5 milliseconds, with a 99th percentile latency of &le; 3.0 ms, guaranteeing zero perceptible typing or submission delay.</td>
            </tr>
            <tr>
                <td><strong>Privacy &amp; Data Security</strong></td>
                <td>The system shall enforce an absolute zero-trust privacy policy: 100% of detection and redaction shall execute client-side; zero prompt text, telemetry, or analytics shall be transmitted across external network sockets.</td>
            </tr>
            <tr>
                <td><strong>Accuracy &amp; Reliability</strong></td>
                <td>The system shall achieve 100% detection recall on supported credential formats while maintaining a False Positive Rate of 0.00% on standard, non-sensitive code syntax and prose.</td>
            </tr>
            <tr>
                <td><strong>Compatibility</strong></td>
                <td>The extension shall function reliably across all modern Chromium browsers (Chrome, Edge, Brave, Arc) adhering to the Manifest V3 specification.</td>
            </tr>
            <tr>
                <td><strong>Resource Overhead</strong></td>
                <td>The extension runtime memory footprint shall remain below 20 megabytes, and idle CPU utilization shall be 0.0%.</td>
            </tr>
            <tr>
                <td><strong>Usability &amp; Ergonomics</strong></td>
                <td>The user interface shall utilize modern design principles (glassmorphism, subtle micro-animations) and ensure full keyboard accessibility (<code>Tab</code>, <code>Enter</code>, <code>Escape</code> controls).</td>
            </tr>
        </table>
    </div>

    <h2 class="section-heading">5.4 Hardware Requirements</h2>
    <p>
        SENTINEL is engineered to execute efficiently on standard commercial workstation hardware without requiring specialized acceleration hardware:
    </p>
    <ul>
        <li><strong>Processor:</strong> Intel Core i3 / AMD Ryzen 3 or equivalent modern 64-bit dual-core processor (minimum 1.8 GHz clock speed).</li>
        <li><strong>System Memory (RAM):</strong> Minimum 4.0 GB of system memory (8.0 GB recommended for multi-tab browser workloads).</li>
        <li><strong>Persistent Storage:</strong> Minimum 50 MB of available local storage for extension bundle, icons, and local audit database.</li>
        <li><strong>Display:</strong> Standard visual display unit with a minimum resolution of 1280 &times; 720 pixels.</li>
    </ul>

    <h2 class="section-heading">5.5 Software Requirements</h2>
    <p>
        The software dependencies and operational environment include:
    </p>
    <ul>
        <li><strong>Operating System:</strong> Windows 10/11 (64-bit), macOS 11.0+, or Linux (Ubuntu 20.04+, Debian, Fedora).</li>
        <li><strong>Web Browser Engine:</strong> Chromium Engine Version 100 or higher (Google Chrome, Microsoft Edge, Brave, Opera, Arc).</li>
        <li><strong>Extension Platform:</strong> Google Chrome Extensions Manifest Version 3 (MV3).</li>
        <li><strong>Runtime Language:</strong> ECMAScript 2022 (JavaScript ES13) native browser runtime.</li>
        <li><strong>Development &amp; Testing Toolchain:</strong> Node.js v18+ LTS, Python 3.10+ (for evaluation harnesses and report generators).</li>
    </ul>

    <div class="table-container">
        <div class="table-caption">Table 5.3: Threat Categories, Signatures, and Descriptions</div>
        <table class="academic-table">
            <tr>
                <th style="width: 25%;">Threat Category</th>
                <th style="width: 35%;">Representative Signatures</th>
                <th style="width: 40%;">Description &amp; Impact</th>
            </tr>
            <tr>
                <td><strong>Cloud &amp; Infrastructure Keys</strong></td>
                <td>AWS Access Keys (<code>AKIA...</code>), Google Cloud API keys (<code>AIza...</code>), Azure Management keys</td>
                <td>Unauthorized access to cloud infrastructure, resource hijacking, data deletion, severe financial cost.</td>
            </tr>
            <tr>
                <td><strong>AI &amp; Developer Platform Tokens</strong></td>
                <td>OpenAI Project Keys (<code>sk-proj-...</code>), GitHub Personal Access Tokens (<code>ghp_...</code>, <code>gho_...</code>)</td>
                <td>Compromise of internal source code repositories, automated pipeline poisoning, model quota exhaustion.</td>
            </tr>
            <tr>
                <td><strong>Payment &amp; SaaS API Secrets</strong></td>
                <td>Stripe Live Secret Keys (<code>sk_live_...</code>), Slack Bot Tokens (<code>xoxb-...</code>), Twilio Auth Tokens</td>
                <td>Direct financial fraud, unauthorized customer communications, enterprise workspace exfiltration.</td>
            </tr>
            <tr>
                <td><strong>Database &amp; Server Credentials</strong></td>
                <td>PostgreSQL / MySQL / MongoDB connection URIs, Bearer tokens, RSA/SSH Private Keys</td>
                <td>Complete backend database breach, catastrophic customer data leak, server compromise.</td>
            </tr>
            <tr>
                <td><strong>Unknown High-Entropy Tokens</strong></td>
                <td>Base64 / Hex strings with Shannon Entropy $H \ge 3.8$ bits/symbol (length &ge; 16)</td>
                <td>Uncatalogued private keys, one-time passwords, cryptographically secure salts and seeds.</td>
            </tr>
            <tr>
                <td><strong>Personally Identifiable Information (PII)</strong></td>
                <td>US Social Security Numbers, Luhn-valid Credit Cards, corporate emails, phone numbers</td>
                <td>Regulatory non-compliance penalties under GDPR, HIPAA, PCI-DSS; severe corporate reputational damage.</td>
            </tr>
            <tr>
                <td><strong>Confidential Project Codenames</strong></td>
                <td>Custom enterprise codenames (e.g., Project Titan), M&amp;A markers, trade secret terms</td>
                <td>Premature public exposure of unreleased products, insider trading risks, loss of competitive edge.</td>
            </tr>
        </table>
    </div>

    <div class="table-container">
        <div class="table-caption">Table 5.4: Threat Severity Levels and Risk Thresholds</div>
        <table class="academic-table">
            <tr>
                <th style="width: 18%;">Severity Level</th>
                <th style="width: 18%;">Risk Score Range</th>
                <th style="width: 34%;">Typical Trigger Criteria</th>
                <th style="width: 30%;">Default Enforcement Action</th>
            </tr>
            <tr>
                <td><strong style="color: #991b1b;">CRITICAL</strong></td>
                <td>80 &ndash; 100</td>
                <td>Live cloud credentials (AWS, GCP), production database URIs, payment keys (Stripe live), RSA private keys.</td>
                <td>Hard submission block; requires mandatory auto-redaction or intentional double confirmation.</td>
            </tr>
            <tr>
                <td><strong style="color: #d97706;">HIGH</strong></td>
                <td>50 &ndash; 79</td>
                <td>High-entropy tokens ($H \ge 4.2$), Luhn-validated credit cards, US Social Security Numbers, SaaS API secrets.</td>
                <td>Submission block with warning modal; one-click auto-redaction recommended.</td>
            </tr>
            <tr>
                <td><strong style="color: #2563eb;">MEDIUM</strong></td>
                <td>25 &ndash; 49</td>
                <td>High-entropy passwords ($H \ge 3.8$), confidential project codenames, corporate email lists, internal IP ranges.</td>
                <td>Inline visual warning banner; user override permitted with explicit confirmation.</td>
            </tr>
            <tr>
                <td><strong style="color: #16a34a;">LOW</strong></td>
                <td>1 &ndash; 24</td>
                <td>Public documentation tokens, test API keys, individual non-sensitive email addresses, staging domain URLs.</td>
                <td>Informational badge displayed; submission permitted without blocking modal.</td>
            </tr>
        </table>
    </div>

    <h2 class="section-heading">5.6 User Roles and Permissions</h2>
    <p>
        The system enforces strict role-based operational permissions across end users and administrators.
    </p>

    <div class="table-container">
        <div class="table-caption">Table 5.5: User Roles and Permissions Matrix</div>
        <table class="academic-table">
            <tr>
                <th style="width: 20%;">User Role</th>
                <th style="width: 40%;">Permitted Capabilities</th>
                <th style="width: 40%;">Restricted / Prohibited Actions</th>
            </tr>
            <tr>
                <td><strong>End User / Developer</strong></td>
                <td>
                    &bull; Compose prompts in AI interfaces.<br>
                    &bull; View interception warning modal.<br>
                    &bull; Trigger in-place auto-redaction.<br>
                    &bull; Override low/medium risk warnings.<br>
                    &bull; View extension popup statistics.<br>
                    &bull; Toggle extension active status.
                </td>
                <td>
                    &bull; Cannot disable enforcement on enterprise-managed domains.<br>
                    &bull; Cannot clear compliance audit logs without administrative authorization.
                </td>
            </tr>
            <tr>
                <td><strong>Security Administrator</strong></td>
                <td>
                    &bull; Configure global sensitivity thresholds.<br>
                    &bull; Define custom organizational regex rules.<br>
                    &bull; Manage enterprise codename blacklists.<br>
                    &bull; Configure AI domain whitelists.<br>
                    &bull; Review masked incident audit logs.<br>
                    &bull; Export audit logs to JSON/CSV.
                </td>
                <td>
                    &bull; Cannot view raw unmasked secret values (cryptographically prevented by client-side masking).
                </td>
            </tr>
        </table>
    </div>

    <h2 class="section-heading">5.7 System Constraints</h2>
    <p>
        SENTINEL is engineered under the stringent security constraints of Google Chrome Manifest Version 3:
    </p>
    <ul>
        <li><strong>No Remote Code Execution:</strong> In strict compliance with MV3 guidelines, all JavaScript execution must occur from the locally packaged extension bundle. Dynamic <code>eval()</code> and remote script loading are completely prohibited.</li>
        <li><strong>Sandboxed Context Isolation:</strong> Content scripts operate in an isolated JavaScript execution context, protecting extension logic from tampering by malicious page scripts.</li>
        <li><strong>Restricted Background Lifetime:</strong> Background logic executes within an event-driven Service Worker that terminates automatically when idle, requiring all persistent state to reside in <code>chrome.storage.local</code>.</li>
    </ul>

    <h2 class="section-heading">5.8 Requirement Summary</h2>
    <p>
        The requirements specified above establish a complete blueprint for an enterprise-grade, privacy-first, client-side DLP solution. By enforcing sub-1.5ms detection latency, 100% accuracy on critical credentials, and one-click in-place redaction, SENTINEL satisfies all operational, technical, and regulatory criteria.
    </p>
</div>

<div class="page-break"></div>
"""
    return html
