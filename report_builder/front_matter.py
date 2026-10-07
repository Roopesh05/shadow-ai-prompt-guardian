import os

def get_front_matter_html(asset_dir="extracted_assets"):
    logo1 = os.path.abspath(os.path.join(asset_dir, "img_p1_219.jpeg")).replace("\\", "/")
    logo2 = os.path.abspath(os.path.join(asset_dir, "img_p1_220.jpeg")).replace("\\", "/")

    html = f"""
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- PAGE i: COVER / TITLE PAGE                                                -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div class="cover-wrapper">
    <div class="logo-header">
        <img src="file:///{logo1}" alt="SNS Logo" />
        <img src="file:///{logo2}" alt="College Emblem" />
    </div>

    <div>
        <div class="cover-title">SHADOW AI PROMPT GUARDIAN</div>
        <div class="cover-subtitle">SENTINEL: A Zero-Trust Client-Side Data Loss Prevention (DLP) and Sensitive Data Interception System for Generative AI Platforms</div>
    </div>

    <div>
        <div class="report-type">A MINI PROJECT REPORT</div>
        <div class="submitted-by-label">Submitted by</div>
        <table class="students-table">
            <tr><td>RAM SAKTHI SHARUMATHI M</td><td>713324SB041</td></tr>
            <tr><td>ROOPESH S N</td><td>713324SB044</td></tr>
            <tr><td>SANJEEVKUMAR P</td><td>713324SB046</td></tr>
            <tr><td>SARAVANA KUMAR M</td><td>713324SB048</td></tr>
        </table>
    </div>

    <div>
        <div class="fulfillment-text">in partial fulfillment for the award of the degree of</div>
        <div class="degree-text">BACHELOR OF TECHNOLOGY</div>
        <div class="fulfillment-text">in</div>
        <div class="branch-text">COMPUTER SCIENCE AND BUSINESS SYSTEMS</div>
        <div class="college-text">SNS COLLEGE OF TECHNOLOGY / SNS COLLEGE OF ENGINEERING</div>
        <div class="location-text">COIMBATORE 641035</div>
        <div class="date-text">November 2026</div>
    </div>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- PAGE ii: BONAFIDE CERTIFICATE                                             -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <div class="logo-header">
        <img src="file:///{logo1}" alt="SNS Logo" />
        <img src="file:///{logo2}" alt="College Emblem" />
    </div>

    <div style="text-align: center; margin-bottom: 20pt;">
        <div class="college-text" style="font-size: 15pt;">SNS COLLEGE OF TECHNOLOGY / SNS COLLEGE OF ENGINEERING</div>
        <div class="location-text" style="font-size: 13pt;">COIMBATORE 641035</div>
    </div>

    <div class="bonafide-title" style="margin-top: 10pt; margin-bottom: 12pt;">BONAFIDE CERTIFICATE</div>

    <div class="certificate-body" style="margin-bottom: 16pt; line-height: 1.6;">
        Certified that this mini Project Report titled, <strong>&ldquo;SHADOW AI PROMPT GUARDIAN &mdash; SENTINEL: A Zero-Trust Client-Side Data Loss Prevention (DLP) and Sensitive Data Interception System for Generative AI Platforms&rdquo;</strong> is the bonafide record of <strong>&ldquo;Ram Sakthi Sharumathi M (713324SB041), Roopesh S N (713324SB044), Sanjeevkumar P (713324SB046), Saravana Kumar M (713324SB048)&rdquo;</strong> who carried out the mini Project Work under our supervision. Certified further, that to the best of my knowledge the work reported herein does not form part of any other mini project report or dissertation on the basis of which a degree or award was conferred on an earlier occasion on this or any other candidate.
    </div>

    <div class="signature-grid" style="margin-top: 24pt; margin-bottom: 24pt;">
        <div class="signature-block">
            <strong>PROJECT GUIDE</strong><br><br><br>
            <strong>Ms. V. Vaishnavee</strong><br>
            Assistant Professor,<br>
            Department of AI &amp; DS,<br>
            SNS College of Technology / Engineering,<br>
            Coimbatore-641035.
        </div>
        <div class="signature-block" style="text-align: right;">
            <strong>HEAD OF THE DEPARTMENT</strong><br><br><br>
            <strong>Dr. M. Shobana</strong><br>
            Associate Professor &amp; Head,<br>
            Department of CSE / CSBS,<br>
            SNS College of Technology / Engineering,<br>
            Coimbatore-641035.
        </div>
    </div>

    <div class="viva-section" style="margin-top: 20pt; margin-bottom: 24pt;">
        Submitted for the Viva-Voce examination held at SNS COLLEGE OF TECHNOLOGY / ENGINEERING, held on ............................................................
    </div>

    <div class="examiners-row" style="margin-top: 28pt;">
        <div>Internal Examiner</div>
        <div>External Examiner</div>
    </div>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- PAGE iii: ABSTRACT                                                        -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <h1 class="chapter-title" style="margin-top: 10pt; margin-bottom: 18pt;">ABSTRACT</h1>

    <p style="margin-bottom: 10pt; line-height: 1.55;">
        The rapid enterprise adoption of Large Language Models (LLMs) and Generative AI platforms&mdash;such as OpenAI ChatGPT, Anthropic Claude, Google Gemini, and Microsoft Copilot&mdash;has catalyzed substantial productivity gains while precipitating an acute cybersecurity threat known as <strong>Shadow AI</strong>: the unmonitored exfiltration of proprietary source code, database credentials, API keys, Personally Identifiable Information (PII), and trade secrets into third-party AI models. Conventional perimeter defense tools, including Cloud Access Security Brokers (CASBs) and Secure Web Gateways (SWGs), operate at the network layer and are fundamentally ineffective against single-page applications secured via end-to-end TLS. Network proxies suffer from TLS decryption blind spots, introduce high latency, violate user privacy, and cannot remediate prompts interactively within the browser Document Object Model (DOM).
    </p>
    <p style="margin-bottom: 10pt; line-height: 1.55;">
        To eliminate this vulnerability, this project presents <strong>SENTINEL (Shadow AI Prompt Guardian)</strong>: an autonomous, client-side, zero-trust Data Loss Prevention (DLP) browser extension developed under the Chromium Manifest V3 specification. Operating directly within the browser runtime prior to network serialization, SENTINEL traps form submissions, keyboard <code>Enter</code> events, dynamic button clicks, and capture-phase <code>fetch</code>/<code>XHR</code> calls. Captured prompts are evaluated in real-time by a multi-layer detection engine combining: (1) deterministic regular expression signatures across 28+ production cloud, VCS, and payment credential types (AWS, OpenAI, GitHub, Stripe, Slack, Azure); (2) a Shannon Information Entropy calculator ($H \ge 3.8$) detecting unknown random cryptographic keys; (3) compliance-grade PII detectors with Luhn algorithm credit card verification; and (4) an organizational trade secret dictionary. Threats trigger contextual risk scoring, an explainable glassmorphism modal with inline token highlighting, and a one-click <strong>Auto-Redaction</strong> engine that substitutes sensitive tokens with structured placeholders (e.g., <code>[REDACTED_AWS_KEY_1]</code>) in-place within the DOM. Operating with zero external telemetry and logging only masked previews in <code>chrome.storage.local</code>, empirical benchmarks across a 140-prompt categorized suite demonstrate <strong>100.00% Accuracy, 1.0000 Precision, 1.0000 Recall, and a 1.0000 F1-Score</strong> at a mean latency of <strong>1.24 ms per prompt</strong>.
    </p>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- PAGES iv - xii: TABLE OF CONTENTS (EXACT PAGE NUMBER MAPPINGS)             -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <div class="front-matter-title">TABLE OF CONTENTS</div>

    <table class="toc-table">
        <tr>
            <th style="width: 15%;">CHAPTER NO.</th>
            <th style="width: 72%;">TITLE</th>
            <th style="width: 13%; text-align: right;">PAGE NO.</th>
        </tr>
        <tr><td></td><td><strong>ABSTRACT</strong></td><td class="toc-page"><strong>iii</strong></td></tr>
        <tr><td></td><td><strong>LIST OF TABLES</strong></td><td class="toc-page"><strong>x</strong></td></tr>
        <tr><td></td><td><strong>LIST OF FIGURES</strong></td><td class="toc-page"><strong>xi</strong></td></tr>
        <tr><td></td><td><strong>LIST OF SYMBOLS AND ABBREVIATIONS</strong></td><td class="toc-page"><strong>xii</strong></td></tr>

        <!-- Chapter 1 -->
        <tr class="toc-chapter"><td>1.</td><td>INTRODUCTION</td><td class="toc-page">1</td></tr>
        <tr><td></td><td>1.1 Background</td><td class="toc-page">1</td></tr>
        <tr><td></td><td>1.2 Project Overview</td><td class="toc-page">1</td></tr>
        <tr><td></td><td>1.3 Motivation</td><td class="toc-page">2</td></tr>
        <tr><td></td><td>1.4 Objectives</td><td class="toc-page">2</td></tr>
        <tr><td></td><td>1.5 Scope</td><td class="toc-page">3</td></tr>

        <!-- Chapter 2 -->
        <tr class="toc-chapter"><td>2.</td><td>PROBLEM IDENTIFICATION</td><td class="toc-page">5</td></tr>
        <tr><td></td><td>2.1 Existing Scenario</td><td class="toc-page">5</td></tr>
        <tr><td></td><td>2.2 Existing System</td><td class="toc-page">5</td></tr>
        <tr><td></td><td>2.3 Existing System Drawbacks</td><td class="toc-page">5</td></tr>
        <tr><td></td><td>2.4 Problem Statement</td><td class="toc-page">6</td></tr>
        <tr><td></td><td>2.5 Proposed Solution</td><td class="toc-page">6</td></tr>

        <!-- Chapter 3 -->
        <tr class="toc-chapter"><td>3.</td><td>EMPATHIZE AND DEFINE</td><td class="toc-page">8</td></tr>
        <tr><td></td><td>3.1 Empathy Study</td><td class="toc-page">8</td></tr>
        <tr><td></td><td>3.2 User Identification</td><td class="toc-page">8</td></tr>
        <tr><td></td><td>3.3 Primary Users</td><td class="toc-page">8</td></tr>
        <tr><td></td><td>3.4 Secondary Users</td><td class="toc-page">9</td></tr>
        <tr><td></td><td>3.5 User Needs</td><td class="toc-page">9</td></tr>
        <tr><td></td><td>3.6 Pain Points</td><td class="toc-page">9</td></tr>
        <tr><td></td><td>3.7 User Persona</td><td class="toc-page">10</td></tr>
        <tr><td></td><td>3.8 User Expectations</td><td class="toc-page">11</td></tr>
        <tr><td></td><td>3.9 Refined Problem Definition</td><td class="toc-page">11</td></tr>

        <!-- Chapter 4 -->
        <tr class="toc-chapter"><td>4.</td><td>IDEATION</td><td class="toc-page">12</td></tr>
        <tr><td></td><td>4.1 Idea Generation</td><td class="toc-page">12</td></tr>
        <tr><td></td><td>4.2 Brainstorming</td><td class="toc-page">12</td></tr>
        <tr><td></td><td>4.3 Evaluation of Ideas</td><td class="toc-page">13</td></tr>
        <tr><td></td><td>4.4 Selected Idea</td><td class="toc-page">13</td></tr>
        <tr><td></td><td>4.5 Key Features Identified</td><td class="toc-page">13</td></tr>
        <tr><td></td><td>4.6 Final Concept</td><td class="toc-page">14</td></tr>

        <!-- Chapter 5 -->
        <tr class="toc-chapter"><td>5.</td><td>REQUIREMENTS ANALYSIS</td><td class="toc-page">15</td></tr>
        <tr><td></td><td>5.1 Introduction</td><td class="toc-page">15</td></tr>
        <tr><td></td><td>5.2 Functional Requirements</td><td class="toc-page">15</td></tr>
        <tr><td></td><td>5.3 Non-Functional Requirements</td><td class="toc-page">16</td></tr>
        <tr><td></td><td>5.4 Hardware Requirements</td><td class="toc-page">18</td></tr>
        <tr><td></td><td>5.5 Software Requirements</td><td class="toc-page">18</td></tr>
        <tr><td></td><td>5.6 User Roles and Permissions</td><td class="toc-page">20</td></tr>
        <tr><td></td><td>5.7 System Constraints</td><td class="toc-page">21</td></tr>
        <tr><td></td><td>5.8 Requirement Summary</td><td class="toc-page">21</td></tr>

        <!-- Chapter 6 -->
        <tr class="toc-chapter"><td>6.</td><td>TECHNOLOGY STACK</td><td class="toc-page">22</td></tr>
        <tr><td></td><td>6.1 Introduction</td><td class="toc-page">22</td></tr>
        <tr><td></td><td>6.2 Frontend and Client Technologies</td><td class="toc-page">23</td></tr>
        <tr><td></td><td>6.3 Browser Platform and Extension Architecture</td><td class="toc-page">23</td></tr>
        <tr><td></td><td>6.4 Data Storage Technology</td><td class="toc-page">23</td></tr>
        <tr><td></td><td>6.5 Detection and Heuristic Engine</td><td class="toc-page">24</td></tr>
        <tr><td></td><td>6.6 Deep Interception Technology</td><td class="toc-page">24</td></tr>
        <tr><td></td><td>6.7 Technology Integration</td><td class="toc-page">24</td></tr>
        <tr><td></td><td>6.8 Technology Selection Rationale</td><td class="toc-page">24</td></tr>

        <!-- Chapter 7 -->
        <tr class="toc-chapter"><td>7.</td><td>SYSTEM DESIGN</td><td class="toc-page">25</td></tr>
        <tr><td></td><td>7.1 System Architecture</td><td class="toc-page">25</td></tr>
        <tr><td></td><td>7.2 Introduction</td><td class="toc-page">25</td></tr>
        <tr><td></td><td>7.3 System Architecture Description</td><td class="toc-page">26</td></tr>
        <tr><td></td><td>7.4 Working Flow</td><td class="toc-page">26</td></tr>
        <tr><td></td><td>7.5 System Components</td><td class="toc-page">27</td></tr>
        <tr><td></td><td>7.6 Threat Processing Flow</td><td class="toc-page">28</td></tr>
        <tr><td></td><td>7.7 System Design Considerations</td><td class="toc-page">28</td></tr>
        <tr><td></td><td>7.8 Data Flow Diagram</td><td class="toc-page">28</td></tr>
        <tr><td></td><td>7.9 Use Case Diagram</td><td class="toc-page">29</td></tr>

        <!-- Chapter 8 -->
        <tr class="toc-chapter"><td>8.</td><td>DATABASE AND LOCAL STORAGE DESIGN</td><td class="toc-page">31</td></tr>
        <tr><td></td><td>8.1 Introduction</td><td class="toc-page">31</td></tr>
        <tr><td></td><td>8.2 Storage Objectives</td><td class="toc-page">31</td></tr>
        <tr><td></td><td>8.3 Main Storage Entities</td><td class="toc-page">31</td></tr>
        <tr><td></td><td>8.4 Settings Entity Schema</td><td class="toc-page">32</td></tr>
        <tr><td></td><td>8.5 Audit Log Entity Schema</td><td class="toc-page">32</td></tr>
        <tr><td></td><td>8.6 Custom Rule Entity Schema</td><td class="toc-page">33</td></tr>
        <tr><td></td><td>8.7 Platform Registry Schema</td><td class="toc-page">33</td></tr>
        <tr><td></td><td>8.8 Statistical Aggregation Schema</td><td class="toc-page">34</td></tr>
        <tr><td></td><td>8.9 Storage Entity Relationships</td><td class="toc-page">34</td></tr>
        <tr><td></td><td>8.10 Storage Security and Masking Architecture</td><td class="toc-page">35</td></tr>
        <tr><td></td><td>8.11 Storage Summary</td><td class="toc-page">35</td></tr>

        <!-- Chapter 9 -->
        <tr class="toc-chapter"><td>9.</td><td>MODULE DESCRIPTION</td><td class="toc-page">36</td></tr>
        <tr><td></td><td>9.1 Introduction</td><td class="toc-page">38</td></tr>
        <tr><td></td><td>9.2 User and Settings Management Module</td><td class="toc-page">38</td></tr>
        <tr><td></td><td>9.3 Content Script Interception Module</td><td class="toc-page">38</td></tr>
        <tr><td></td><td>9.4 Known Secret Signature Module</td><td class="toc-page">38</td></tr>
        <tr><td></td><td>9.5 Shannon Entropy Calculation Module</td><td class="toc-page">38</td></tr>
        <tr><td></td><td>9.6 Personally Identifiable Information Module</td><td class="toc-page">38</td></tr>
        <tr><td></td><td>9.7 Confidential Keywords and Codenames Module</td><td class="toc-page">38</td></tr>
        <tr><td></td><td>9.8 Contextual Risk Scoring Module</td><td class="toc-page">39</td></tr>
        <tr><td></td><td>9.9 Coordinate Range and Highlighting Module</td><td class="toc-page">39</td></tr>
        <tr><td></td><td>9.10 Modal Warning and Intervention Module</td><td class="toc-page">39</td></tr>
        <tr><td></td><td>9.11 In-Place Auto-Redaction Module</td><td class="toc-page">39</td></tr>
        <tr><td></td><td>9.12 Secret Masking and Anonymization Module</td><td class="toc-page">39</td></tr>
        <tr><td></td><td>9.13 Local Storage and Audit Logging Module</td><td class="toc-page">39</td></tr>
        <tr><td></td><td>9.14 Extension Popup Interface Module</td><td class="toc-page">39</td></tr>
        <tr><td></td><td>9.15 Options and Policy Management Module</td><td class="toc-page">39</td></tr>
        <tr><td></td><td>9.16 Module Integration and Communication</td><td class="toc-page">40</td></tr>

        <!-- Chapter 10 -->
        <tr class="toc-chapter"><td>10.</td><td>IMPLEMENTATION AND WORKING PRINCIPLE</td><td class="toc-page">41</td></tr>
        <tr><td></td><td>10.1 Introduction</td><td class="toc-page">41</td></tr>
        <tr><td></td><td>10.2 Frontend User Interface Implementation</td><td class="toc-page">41</td></tr>
        <tr><td></td><td>10.3 Background Service Worker and Storage Implementation</td><td class="toc-page">41</td></tr>
        <tr><td></td><td>10.4 Content Script DOM and Network Interception</td><td class="toc-page">41</td></tr>
        <tr><td></td><td>10.5 Core Multi-Layer Detection Implementation</td><td class="toc-page">42</td></tr>
        <tr><td></td><td>10.6 Risk Scoring and Severity Evaluation Implementation</td><td class="toc-page">42</td></tr>
        <tr><td></td><td>10.7 Warning Modal and Highlighting Implementation</td><td class="toc-page">43</td></tr>
        <tr><td></td><td>10.8 In-Place Auto-Redaction Implementation</td><td class="toc-page">43</td></tr>
        <tr><td></td><td>10.9 Complete Working Principle</td><td class="toc-page">43</td></tr>
        <tr><td></td><td>10.10 Threat Processing Workflow</td><td class="toc-page">44</td></tr>
        <tr><td></td><td>10.11 Implementation Summary</td><td class="toc-page">44</td></tr>

        <!-- Chapter 11 -->
        <tr class="toc-chapter"><td>11.</td><td>TESTING AND QUALITY ASSURANCE</td><td class="toc-page">45</td></tr>
        <tr><td></td><td>11.1 Introduction</td><td class="toc-page">45</td></tr>
        <tr><td></td><td>11.2 Objectives of Testing</td><td class="toc-page">45</td></tr>
        <tr><td></td><td>11.3 Types of Testing</td><td class="toc-page">45</td></tr>
        <tr><td></td><td>11.4 Known Secret Detection Testing</td><td class="toc-page">47</td></tr>
        <tr><td></td><td>11.5 Shannon Entropy Detection Testing</td><td class="toc-page">48</td></tr>
        <tr><td></td><td>11.6 PII Detection Testing</td><td class="toc-page">48</td></tr>
        <tr><td></td><td>11.7 Combinatorial Adversarial Stress Testing</td><td class="toc-page">48</td></tr>
        <tr><td></td><td>11.8 Performance Latency Benchmarking</td><td class="toc-page">48</td></tr>
        <tr><td></td><td>11.9 Testing Results Summary</td><td class="toc-page">48</td></tr>
        <tr><td></td><td>11.10 Conclusion of Testing</td><td class="toc-page">49</td></tr>

        <!-- Chapter 12 -->
        <tr class="toc-chapter"><td>12.</td><td>PROJECT EVALUATION</td><td class="toc-page">50</td></tr>
        <tr><td></td><td>12.1 Introduction</td><td class="toc-page">50</td></tr>
        <tr><td></td><td>12.2 Objective Evaluation</td><td class="toc-page">50</td></tr>
        <tr><td></td><td>12.3 Usability Evaluation</td><td class="toc-page">51</td></tr>
        <tr><td></td><td>12.4 Functional Evaluation</td><td class="toc-page">52</td></tr>
        <tr><td></td><td>12.5 Performance Evaluation</td><td class="toc-page">52</td></tr>
        <tr><td></td><td>12.6 Reliability Evaluation</td><td class="toc-page">52</td></tr>
        <tr><td></td><td>12.7 Security Evaluation</td><td class="toc-page">52</td></tr>
        <tr><td></td><td>12.8 Scalability Evaluation</td><td class="toc-page">52</td></tr>
        <tr><td></td><td>12.9 Advantages of SENTINEL</td><td class="toc-page">52</td></tr>
        <tr><td></td><td>12.10 Limitations</td><td class="toc-page">53</td></tr>
        <tr><td></td><td>12.11 Overall Evaluation</td><td class="toc-page">53</td></tr>

        <!-- Chapter 13 -->
        <tr class="toc-chapter"><td>13.</td><td>CONCLUSION AND FUTURE ENHANCEMENTS</td><td class="toc-page">54</td></tr>
        <tr><td></td><td>13.1 Conclusion</td><td class="toc-page">54</td></tr>
        <tr><td></td><td>13.2 Future Enhancements</td><td class="toc-page">54</td></tr>

        <!-- Chapter 14 -->
        <tr class="toc-chapter"><td>14.</td><td>PROJECT LINK AND QR CODE</td><td class="toc-page">56</td></tr>
        <tr><td></td><td>14.1 Introduction</td><td class="toc-page">56</td></tr>
        <tr><td></td><td>14.2 Repository and Deployment</td><td class="toc-page">56</td></tr>
        <tr><td></td><td>14.3 Project Access</td><td class="toc-page">56</td></tr>
        <tr><td></td><td>14.4 QR Code</td><td class="toc-page">56</td></tr>
        <tr><td></td><td>14.5 Summary</td><td class="toc-page">57</td></tr>

        <!-- Appendices -->
        <tr class="toc-chapter"><td></td><td>APPENDIX I &mdash; RESULTS AND SCREENSHOTS</td><td class="toc-page">58</td></tr>
        <tr class="toc-chapter"><td></td><td>APPENDIX II &mdash; CORE FUNCTIONALITY CODE</td><td class="toc-page">64</td></tr>
        <tr class="toc-chapter"><td></td><td>REFERENCES</td><td class="toc-page">73</td></tr>
    </table>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- PAGE xiii: LIST OF TABLES                                                 -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <div class="front-matter-title">LIST OF TABLES</div>

    <table class="toc-table">
        <tr>
            <th style="width: 15%;">TABLE NO.</th>
            <th style="width: 72%;">TITLE</th>
            <th style="width: 13%; text-align: right;">PAGE NO.</th>
        </tr>
        <tr><td>2.1</td><td>Comparison of Proposed Solutions (Traditional vs. SENTINEL)</td><td class="toc-page">7</td></tr>
        <tr><td>3.1</td><td>User Pain Points and Proposed Solutions</td><td class="toc-page">10</td></tr>
        <tr><td>5.1</td><td>Functional Requirements of SENTINEL</td><td class="toc-page">16</td></tr>
        <tr><td>5.2</td><td>Non-Functional Requirements of SENTINEL</td><td class="toc-page">17</td></tr>
        <tr><td>5.3</td><td>Threat Categories, Signatures, and Descriptions</td><td class="toc-page">19</td></tr>
        <tr><td>5.4</td><td>Threat Severity Levels and Risk Thresholds</td><td class="toc-page">20</td></tr>
        <tr><td>5.5</td><td>User Roles and Permissions Matrix</td><td class="toc-page">21</td></tr>
        <tr><td>6.1</td><td>Technology Stack Used in SENTINEL</td><td class="toc-page">22</td></tr>
        <tr><td>8.4</td><td>Settings Entity Schema (chrome.storage.local)</td><td class="toc-page">32</td></tr>
        <tr><td>8.5</td><td>Audit Log Entity Schema (Masked Incident Trail)</td><td class="toc-page">32</td></tr>
        <tr><td>8.6</td><td>Custom Rules Entity Schema</td><td class="toc-page">33</td></tr>
        <tr><td>8.7</td><td>Platform Registry Schema (Supported AI Hosts)</td><td class="toc-page">33</td></tr>
        <tr><td>8.8</td><td>Statistical Aggregations Schema</td><td class="toc-page">34</td></tr>
        <tr><td>9.1</td><td>SENTINEL N1&ndash;N14 Module Description</td><td class="toc-page">37</td></tr>
        <tr><td>11.1</td><td>Functional Test Cases and Verification Results</td><td class="toc-page">47</td></tr>
        <tr><td>12.1</td><td>Project Objective Evaluation Matrix</td><td class="toc-page">51</td></tr>
    </table>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- PAGE xiv: LIST OF FIGURES                                                 -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <div class="front-matter-title">LIST OF FIGURES</div>

    <table class="toc-table">
        <tr>
            <th style="width: 15%;">FIGURE NO.</th>
            <th style="width: 72%;">TITLE</th>
            <th style="width: 13%; text-align: right;">PAGE NO.</th>
        </tr>
        <tr><td>1.1</td><td>Overview Architecture of SENTINEL</td><td class="toc-page">4</td></tr>
        <tr><td>7.1</td><td>System Architecture of SENTINEL</td><td class="toc-page">25</td></tr>
        <tr><td>7.3</td><td>System Workflow Diagram</td><td class="toc-page">27</td></tr>
        <tr><td>7.4</td><td>Data Flow Diagram (Level 0 and Level 1 DFD)</td><td class="toc-page">29</td></tr>
        <tr><td>7.5</td><td>Use Case Diagram</td><td class="toc-page">30</td></tr>
        <tr><td>8.1</td><td>Entity Relationship Diagram of SENTINEL Storage</td><td class="toc-page">34</td></tr>
        <tr><td>10.1</td><td>Threat Interception and Redaction Processing Workflow</td><td class="toc-page">44</td></tr>
        <tr><td>14.1</td><td>Project Access QR Code (GitHub Repository)</td><td class="toc-page">57</td></tr>
        <tr><td>15.1</td><td>SENTINEL Extension Popup Interface</td><td class="toc-page">59</td></tr>
        <tr><td>15.2</td><td>Interception Warning Modal on ChatGPT Interface</td><td class="toc-page">60</td></tr>
        <tr><td>15.3</td><td>Inline Token Highlighting and Finding Details</td><td class="toc-page">60</td></tr>
        <tr><td>15.4</td><td>Sanitized In-Place Auto-Redacted Prompt Ready for Submission</td><td class="toc-page">61</td></tr>
        <tr><td>15.5</td><td>Options and Configuration Management Dashboard</td><td class="toc-page">61</td></tr>
        <tr><td>15.6</td><td>Zero-Trust Local Audit Log Viewer</td><td class="toc-page">62</td></tr>
        <tr><td>15.7</td><td>Automated Evaluation Harness Console Output (100% F1-Score)</td><td class="toc-page">62</td></tr>
    </table>
</div>

<div class="page-break"></div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- PAGE xv: LIST OF SYMBOLS AND ABBREVIATIONS                                -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->
<div>
    <div class="front-matter-title">LIST OF SYMBOLS AND ABBREVIATIONS</div>

    <table class="academic-table" style="margin-top: 14pt;">
        <tr>
            <th style="width: 25%;">ABBREVIATION</th>
            <th style="width: 75%;">EXPANSION / MEANING</th>
        </tr>
        <tr><td><strong>AI</strong></td><td>Artificial Intelligence</td></tr>
        <tr><td><strong>API</strong></td><td>Application Programming Interface</td></tr>
        <tr><td><strong>CASB</strong></td><td>Cloud Access Security Broker</td></tr>
        <tr><td><strong>CSP</strong></td><td>Content Security Policy</td></tr>
        <tr><td><strong>CSS</strong></td><td>Cascading Style Sheets</td></tr>
        <tr><td><strong>DFD</strong></td><td>Data Flow Diagram</td></tr>
        <tr><td><strong>DLP</strong></td><td>Data Loss Prevention</td></tr>
        <tr><td><strong>DOM</strong></td><td>Document Object Model</td></tr>
        <tr><td><strong>ER</strong></td><td>Entity Relationship</td></tr>
        <tr><td><strong>FPR</strong></td><td>False Positive Rate</td></tr>
        <tr><td><strong>GDPR</strong></td><td>General Data Protection Regulation</td></tr>
        <tr><td><strong>HIPAA</strong></td><td>Health Insurance Portability and Accountability Act</td></tr>
        <tr><td><strong>HTML</strong></td><td>HyperText Markup Language</td></tr>
        <tr><td><strong>HTTP</strong></td><td>HyperText Transfer Protocol</td></tr>
        <tr><td><strong>HTTPS</strong></td><td>HyperText Transfer Protocol Secure</td></tr>
        <tr><td><strong>JSON</strong></td><td>JavaScript Object Notation</td></tr>
        <tr><td><strong>LLM</strong></td><td>Large Language Model</td></tr>
        <tr><td><strong>MV3</strong></td><td>Manifest Version 3 (Chromium Extension Platform)</td></tr>
        <tr><td><strong>NFR</strong></td><td>Non-Functional Requirement</td></tr>
        <tr><td><strong>PCI-DSS</strong></td><td>Payment Card Industry Data Security Standard</td></tr>
        <tr><td><strong>PII</strong></td><td>Personally Identifiable Information</td></tr>
        <tr><td><strong>RFC</strong></td><td>Request for Comments (IETF Technical Standard)</td></tr>
        <tr><td><strong>SPA</strong></td><td>Single-Page Application</td></tr>
        <tr><td><strong>SSN</strong></td><td>Social Security Number</td></tr>
        <tr><td><strong>SWG</strong></td><td>Secure Web Gateway</td></tr>
        <tr><td><strong>TLS</strong></td><td>Transport Layer Security</td></tr>
        <tr><td><strong>UI</strong></td><td>User Interface</td></tr>
        <tr><td><strong>UX</strong></td><td>User Experience</td></tr>
        <tr><td><strong>VCS</strong></td><td>Version Control System</td></tr>
        <tr><td><strong>XHR</strong></td><td>XMLHttpRequest</td></tr>
    </table>
</div>

<div class="page-break"></div>
"""
    return html
