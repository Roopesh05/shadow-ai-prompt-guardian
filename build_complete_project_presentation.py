"""
build_complete_project_presentation.py
======================================
Converts 'Mini project.pdf' into a complete, professional PowerPoint presentation (.pptx).
Features:
- Exactly 26 slides (around 25 pages).
- Includes high-resolution project screenshots (ChatGPT in-browser interception modal,
  Popup dashboard, Auto-redacted prompt, and Zero-trust audit log).
- Verified, correct logos:
  * Left: SNS College of Engineering (blue gear Coimbatore-107, transparent background).
  * Right: SNS Institutions (crisp high-res transparent logo).
- Clean Times New Roman typography, 16:9 widescreen layout, and calibrated positioning.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_paths):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    blank_layout = prs.slide_layouts[6]
    
    logo_left = "logo_left_processed.png"
    logo_right = "logo_right_processed.png"
    diag_path = "extracted_pdf_assets/slide_12_img_1.jpeg"
    thank_you_path = "extracted_pdf_assets/slide_24_img_1.jpeg"
    
    # Screenshots
    modal_img = "generated_figures/fig15_2_chatgpt_modal.png"
    popup_img = "generated_figures/fig15_1_popup.png"
    redact_img = "generated_figures/fig15_4_redacted.png"
    audit_img = "generated_figures/fig15_6_audit_log.png"
    
    def add_header_logos(slide):
        if os.path.exists(logo_left):
            slide.shapes.add_picture(logo_left, Inches(0.4), Inches(0.25), width=Inches(1.15), height=Inches(1.15))
        if os.path.exists(logo_right):
            slide.shapes.add_picture(logo_right, Inches(11.6), Inches(0.2), width=Inches(1.35), height=Inches(0.9))

    def add_title(slide, text, top=Inches(0.4), font_size=32):
        txBox = slide.shapes.add_textbox(Inches(1.8), top, Inches(9.733), Inches(0.9))
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = text
        p.alignment = PP_ALIGN.CENTER
        p.font.name = "Times New Roman"
        p.font.size = Pt(font_size)
        p.font.bold = True
        p.font.color.rgb = RGBColor(0, 0, 0)
        return txBox

    def add_bullet_slide(title, bullets, subheading=None, font_size=18, space_after=8):
        slide = prs.slides.add_slide(blank_layout)
        add_header_logos(slide)
        add_title(slide, title)
        
        content_box = slide.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.333), Inches(5.5))
        tf = content_box.text_frame
        tf.word_wrap = True
        
        first = True
        if subheading:
            p_sub = tf.paragraphs[0]
            p_sub.text = subheading
            p_sub.font.name = "Times New Roman"
            p_sub.font.size = Pt(font_size + 2)
            p_sub.font.bold = True
            p_sub.font.color.rgb = RGBColor(0, 0, 0)
            p_sub.space_after = Pt(10)
            first = False
            
        for b_text in bullets:
            if first:
                p = tf.paragraphs[0]
                first = False
            else:
                p = tf.add_paragraph()
                
            p.font.name = "Times New Roman"
            p.font.size = Pt(font_size)
            p.space_after = Pt(space_after)
            p.line_spacing = 1.2
            
            if "→" in b_text:
                parts = b_text.split("→", 1)
                r_b = p.add_run()
                r_b.text = "• "
                r_pre = p.add_run()
                r_pre.text = parts[0].strip().replace("•", "").strip() + " → "
                r_pre.font.bold = True
                r_pre.font.color.rgb = RGBColor(0, 0, 0)
                r_desc = p.add_run()
                r_desc.text = parts[1].strip()
                r_desc.font.color.rgb = RGBColor(30, 41, 59)
            elif ":" in b_text and not b_text.startswith("http"):
                parts = b_text.split(":", 1)
                r_b = p.add_run()
                r_b.text = "• "
                r_pre = p.add_run()
                r_pre.text = parts[0].strip().replace("•", "").strip() + ": "
                r_pre.font.bold = True
                r_pre.font.color.rgb = RGBColor(0, 0, 0)
                r_desc = p.add_run()
                r_desc.text = parts[1].strip()
                r_desc.font.color.rgb = RGBColor(30, 41, 59)
            else:
                clean = b_text.strip()
                if not clean.startswith("•"):
                    clean = "• " + clean
                r = p.add_run()
                r.text = clean
                r.font.color.rgb = RGBColor(30, 41, 59)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 1: TITLE SLIDE
    # ═════════════════════════════════════════════════════════════════════════
    s1 = prs.slides.add_slide(blank_layout)
    add_header_logos(s1)
    
    t_box = s1.shapes.add_textbox(Inches(1.8), Inches(1.8), Inches(9.733), Inches(1.8))
    tf1 = t_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "Mini Project Review"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.name = "Times New Roman"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(0, 0, 0)
    
    p2 = tf1.add_paragraph()
    p2.text = "Shadow AI Prompt Guardian"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = "Times New Roman"
    p2.font.size = Pt(32)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(0, 0, 0)
    p2.space_before = Pt(14)
    
    g_box = s1.shapes.add_textbox(Inches(0.6), Inches(5.4), Inches(4.5), Inches(1.5))
    gtf = g_box.text_frame
    gtf.word_wrap = True
    gp1 = gtf.paragraphs[0]
    gp1.text = "Under the Guidance of:"
    gp1.font.name = "Times New Roman"
    gp1.font.size = Pt(18)
    gp1.font.color.rgb = RGBColor(0, 0, 0)
    gp2 = gtf.add_paragraph()
    gp2.text = "Mr. NaveenRaj AP/CSE(IOT)"
    gp2.font.name = "Times New Roman"
    gp2.font.size = Pt(18)
    gp2.font.color.rgb = RGBColor(0, 0, 0)
    gp2.space_before = Pt(4)
    
    m_box = s1.shapes.add_textbox(Inches(8.2), Inches(4.5), Inches(4.8), Inches(2.5))
    mtf = m_box.text_frame
    mtf.word_wrap = True
    mp1 = mtf.paragraphs[0]
    mp1.text = "Team Members:"
    mp1.font.name = "Times New Roman"
    mp1.font.size = Pt(18)
    mp1.font.bold = True
    mp1.font.color.rgb = RGBColor(0, 0, 0)
    
    for mem in [
        "Ram Sakthi Sharumathi M (713324SB041)",
        "Roopesh S N (713324SB044)",
        "Sanjeevkumar P (713324SB046)",
        "Saravana Kumar M (713324SB048)"
    ]:
        mp = mtf.add_paragraph()
        mp.text = mem
        mp.font.name = "Times New Roman"
        mp.font.size = Pt(17)
        mp.font.color.rgb = RGBColor(0, 0, 0)
        mp.space_before = Pt(4)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 2: PROBLEM STATEMENT
    # ═════════════════════════════════════════════════════════════════════════
    s2 = prs.slides.add_slide(blank_layout)
    add_header_logos(s2)
    add_title(s2, "Problem Statement")
    
    s2_box = s2.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(10.933), Inches(4.8))
    s2_tf = s2_box.text_frame
    s2_tf.word_wrap = True
    
    p2_1 = s2_tf.paragraphs[0]
    p2_1.text = "The increasing use of public AI chatbots creates a risk of accidentally sharing sensitive information. Users may unknowingly paste API keys, passwords, personal data, source code, or confidential business information into AI prompts. Once the prompt is submitted, this information may be transmitted to an external AI service."
    p2_1.font.name = "Times New Roman"
    p2_1.font.size = Pt(21)
    p2_1.line_spacing = 1.3
    p2_1.space_after = Pt(24)
    p2_1.font.color.rgb = RGBColor(0, 0, 0)
    
    p2_2 = s2_tf.add_paragraph()
    p2_2.text = "Traditional DLP solutions may require additional network infrastructure or centralized monitoring. Therefore, a lightweight client-side solution is needed to detect and prevent sensitive data leakage before the prompt is transmitted."
    p2_2.font.name = "Times New Roman"
    p2_2.font.size = Pt(21)
    p2_2.line_spacing = 1.3
    p2_2.font.color.rgb = RGBColor(0, 0, 0)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 3: ABSTRACT (PART 1)
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Abstract", [
        "SENTINEL is a client-side Data Loss Prevention (DLP) browser extension.",
        "It protects sensitive information entered into public AI chatbots.",
        "It prevents accidental sharing of credentials, PII, source code and confidential data.",
        "It works directly inside the browser before information is transmitted.",
        "It supports browser-based AI platforms such as ChatGPT, Claude and Gemini.",
        "SENTINEL uses a multi-layer detection engine to identify sensitive information.",
        "More than 150 signature patterns are used to detect known sensitive data.",
        "Shannon Entropy is used to identify possible unknown secrets."
    ], font_size=18, space_after=8)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 4: ABSTRACT (PART 2)
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Abstract", [
        "The Luhn Algorithm is used to validate payment-card candidates.",
        "PII, passwords, credentials and confidential information are detected locally.",
        "Text normalization helps detect simple obfuscation techniques.",
        "High-risk prompts can be blocked before they are transmitted.",
        "Explainable warnings show users why their prompt was flagged.",
        "Auto-Redaction replaces sensitive values with safe placeholders.",
        "Masked security events are stored locally using SHA-256 hash chaining.",
        "Prompt data and telemetry are not sent to external servers.",
        "SENTINEL provides a lightweight and privacy-focused approach to AI data protection."
    ], font_size=17, space_after=7)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 5: OBJECTIVES
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Objectives", [
        "To detect sensitive information in AI prompts before it is transmitted to external AI services.",
        "To monitor user inputs and provide real-time security warnings.",
        "To identify API keys, passwords, PII, payment-card data and other confidential information.",
        "To calculate a risk score and classify detected information based on severity.",
        "To block high-risk prompts and prevent accidental data leakage.",
        "To provide automatic redaction so users can safely submit sanitized prompts."
    ], font_size=19, space_after=12)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 6: LITERATURE SURVEY & GAPS (LITERATURE SURVEY)
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Literature Survey & Gaps", [
        "Traditional Data Loss Prevention (DLP) systems mainly use network monitoring, proxy servers and centralized security controls.",
        "Existing security approaches focus on preventing sensitive data from leaving organizational systems.",
        "AI chatbots introduce a new data-leakage risk because users directly enter information into external AI platforms.",
        "Existing solutions may not provide real-time, prompt-level protection directly inside the browser.",
        "There is a need for a lightweight solution specifically designed to inspect AI prompts before transmission."
    ], subheading="Literature Survey", font_size=18, space_after=10)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 7: RESEARCH GAPS
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Literature Survey & Gaps", [
        "Limited client-side protection specifically focused on AI chatbot prompts.",
        "Lack of immediate detection and blocking before sensitive data is transmitted.",
        "Limited user-friendly explanations about why a prompt is flagged.",
        "Lack of simple automatic redaction for detected sensitive information.",
        "Need for a privacy-focused approach that performs detection locally without sending prompt data to external servers."
    ], subheading="Research Gaps", font_size=18, space_after=12)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 8: EXISTING SOLUTIONS & LIMITATIONS (SOLUTIONS)
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Existing Solutions & Limitations", [
        "Traditional DLP Systems: Monitor and control sensitive data moving through organizational networks.",
        "Network Proxies: Inspect network traffic and apply security policies before data reaches external services.",
        "Endpoint Security: Monitors user devices and applications to identify potentially sensitive activities.",
        "Organizational Policies: Depend on user awareness and rules to prevent employees from sharing confidential information.",
        "AI Usage Controls: Organizations can restrict or monitor access to external AI platforms."
    ], subheading="Existing Solutions", font_size=18, space_after=10)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 9: EXISTING SOLUTIONS & LIMITATIONS (LIMITATIONS)
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Existing Solutions & Limitations", [
        "These solutions may require additional infrastructure and configuration.",
        "Manual protection depends heavily on user awareness and careful behavior.",
        "Network-level monitoring may not provide direct prompt-level feedback.",
        "Users may not know which part of a prompt contains sensitive information.",
        "Existing approaches may not provide one-click automatic redaction before submission."
    ], subheading="Limitations", font_size=18, space_after=12)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 10: PROPOSED SOLUTION
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Proposed Solution", [
        "SENTINEL is proposed as a client-side Data Loss Prevention browser extension for AI chatbots.",
        "It monitors user prompts and detects sensitive information before the request is transmitted.",
        "The detection engine uses 150+ signatures, Shannon Entropy, Luhn validation and PII detection.",
        "Detected information is classified according to its type, severity and associated risk score.",
        "High-risk prompts can be blocked, while sensitive values can be removed using Auto-Redaction.",
        "The system processes prompts locally and stores only masked audit information in browser storage."
    ], font_size=18, space_after=10)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 11: TECHNOLOGY STACK
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Technology Stack", [
        "HTML5, CSS3 and JavaScript ES6+ are used to develop the browser extension.",
        "Chrome Manifest V3 provides the extension architecture and security model.",
        "Service Worker handles background processing and extension events.",
        "chrome.storage.local stores configuration and masked audit information locally.",
        "SHA-256 and Luhn Algorithm are used for audit security and payment-card validation.",
        "Node.js is used for testing and evaluating the detection system."
    ], font_size=18, space_after=10)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 12: SYSTEM ARCHITECTURE FLOW (DIAGRAM)
    # ═════════════════════════════════════════════════════════════════════════
    s12 = prs.slides.add_slide(blank_layout)
    if os.path.exists(diag_path):
        s12.shapes.add_picture(diag_path, Inches(0), Inches(0), width=Inches(13.333), height=Inches(7.5))
    else:
        add_header_logos(s12)
        add_title(s12, "SENTINEL – System Architecture Flow")

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 13: WORKING METHODOLOGY
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Working Methodology", [
        "The user enters or pastes a prompt into a supported AI chatbot.",
        "SENTINEL monitors the input and intercepts the request before transmission.",
        "The prompt is normalized and analyzed using multiple detection techniques.",
        "Detected information is classified based on its type, severity and risk score.",
        "The system decides whether to Allow, Block or Redact the prompt.",
        "A masked security event is stored locally for auditing."
    ], font_size=18, space_after=11)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 14: PROBLEM IMPACT (WHY IT MATTERS)
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Problem Impact (Why it Matters)", [
        "Data Leakage → Sensitive information may be exposed to external AI services",
        "Credential Exposure → API keys and passwords may be misused",
        "Privacy Risk → Customer and personal information can be accidentally shared",
        "Intellectual Property Loss → Source code and confidential business data may be exposed",
        "Compliance Issues → Data exposure can lead to privacy and regulatory problems",
        "No Immediate Protection → Users may realize the risk only after submitting the prompt"
    ], font_size=18, space_after=10)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 15: USE CASE SCENARIO
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Use Case Scenario", [
        "Prompt Entry → Developer pastes authentication code into an AI chatbot for debugging.",
        "Sensitive Data → The code accidentally contains an API key and database credentials.",
        "Detection → SENTINEL scans the prompt and identifies the sensitive information.",
        "Warning & Block → A risk warning is displayed and the request is blocked if the risk is critical.",
        "Auto-Redaction → Sensitive values are replaced with safe placeholders such as [API_KEY].",
        "Safe Submission → The sanitized prompt is submitted to the AI chatbot without exposing the original credentials."
    ], font_size=17, space_after=9)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 16: USER FLOW
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("User Flow", [
        "Open AI Chatbot → User opens a supported AI platform in the browser.",
        "Enter Prompt → User types or pastes a prompt into the chatbot.",
        "Monitor & Scan → SENTINEL monitors the input and scans for sensitive information.",
        "Risk Analysis → Detected data is classified and a risk score is calculated.",
        "Decision → Prompt is Allowed, Blocked or Redacted based on the risk level.",
        "Continue Safely → User submits the sanitized prompt, while a masked audit record is stored locally."
    ], font_size=18, space_after=10)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 17: SCREENSHOT 1 — IN-BROWSER INTERCEPTION & MODAL WARNING
    # ═════════════════════════════════════════════════════════════════════════
    s17 = prs.slides.add_slide(blank_layout)
    add_header_logos(s17)
    add_title(s17, "Project Demo: In-Browser Real-Time Interception")
    
    # Left side: Screenshot
    if os.path.exists(modal_img):
        s17.shapes.add_picture(modal_img, Inches(0.8), Inches(1.5), width=Inches(7.2), height=Inches(5.4))
        
    # Right side: Explanatory Card
    t17 = s17.shapes.add_textbox(Inches(8.2), Inches(1.6), Inches(4.7), Inches(5.2))
    tf17 = t17.text_frame
    tf17.word_wrap = True
    
    p17_h = tf17.paragraphs[0]
    p17_h.text = "Key Demonstration Features:"
    p17_h.font.name = "Times New Roman"
    p17_h.font.size = Pt(20)
    p17_h.font.bold = True
    p17_h.space_after = Pt(12)
    
    modal_features = [
        "Pre-Transmission Interception: Automatically halts submission in ChatGPT before data leaves the browser.",
        "Critical Risk Banner: Visually alerts the user with severity badges and detailed explanation.",
        "Matched Secret Breakdown: Identifies Database URI and AWS Access Key with Shannon entropy metrics.",
        "One-Click Auto-Redact: User can immediately sanitize credentials and submit without manual editing.",
        "Zero Cloud Egress: Detection executes 100% locally in under 5 milliseconds."
    ]
    for feat in modal_features:
        pf = tf17.add_paragraph()
        pf.text = "• " + feat
        pf.font.name = "Times New Roman"
        pf.font.size = Pt(15)
        pf.space_after = Pt(8)
        pf.line_spacing = 1.15

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 18: SCREENSHOT 2 — EXTENSION POPUP & DASHBOARD
    # ═════════════════════════════════════════════════════════════════════════
    s18 = prs.slides.add_slide(blank_layout)
    add_header_logos(s18)
    add_title(s18, "Project Demo: Extension Popup Dashboard")
    
    # Left side: Screenshot of popup
    if os.path.exists(popup_img):
        s18.shapes.add_picture(popup_img, Inches(1.2), Inches(1.5), width=Inches(3.8), height=Inches(5.4))
        
    # Right side: Explanatory Card
    t18 = s18.shapes.add_textbox(Inches(5.4), Inches(1.6), Inches(7.3), Inches(5.2))
    tf18 = t18.text_frame
    tf18.word_wrap = True
    
    p18_h = tf18.paragraphs[0]
    p18_h.text = "Dashboard Controls & Metrics:"
    p18_h.font.name = "Times New Roman"
    p18_h.font.size = Pt(20)
    p18_h.font.bold = True
    p18_h.space_after = Pt(12)
    
    popup_features = [
        "Protection Status Toggle: Master on/off switch for real-time prompt protection across all supported AI tools.",
        "Session Exposure Gauge: Visual score reflecting total sensitive data exposure risk in the current browsing session.",
        "Real-Time Telemetry Counter: Tracks total prompts scanned, leaks blocked, and active platform integrations (25+ AI interfaces).",
        "Recent Detections Feed: Displays immediate audit history of blocked attempts without exposing raw confidential text.",
        "Settings & Options Access: Instant navigation to user-defined sensitivity thresholds and custom dictionary lists."
    ]
    for feat in popup_features:
        pf = tf18.add_paragraph()
        pf.text = "• " + feat
        pf.font.name = "Times New Roman"
        pf.font.size = Pt(16)
        pf.space_after = Pt(10)
        pf.line_spacing = 1.2

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 19: SCREENSHOT 3 — AUTO-REDACTION & LOCAL AUDIT LOG
    # ═════════════════════════════════════════════════════════════════════════
    s19 = prs.slides.add_slide(blank_layout)
    add_header_logos(s19)
    add_title(s19, "Project Demo: Auto-Redaction & Audit Logging")
    
    # Top half: Redaction screenshot
    if os.path.exists(redact_img):
        s19.shapes.add_picture(redact_img, Inches(0.8), Inches(1.5), width=Inches(6.6), height=Inches(2.6))
    # Bottom half: Audit screenshot
    if os.path.exists(audit_img):
        s19.shapes.add_picture(audit_img, Inches(0.8), Inches(4.3), width=Inches(6.6), height=Inches(2.8))
        
    # Right side: Details
    t19 = s19.shapes.add_textbox(Inches(7.7), Inches(1.6), Inches(5.1), Inches(5.2))
    tf19 = t19.text_frame
    tf19.word_wrap = True
    
    p19_h = tf19.paragraphs[0]
    p19_h.text = "In-Place Redaction & Audit Trail:"
    p19_h.font.name = "Times New Roman"
    p19_h.font.size = Pt(19)
    p19_h.font.bold = True
    p19_h.space_after = Pt(10)
    
    redact_features = [
        "In-Place Context Preservation: Automatically replaces secrets with placeholder tags (e.g., [REDACTED_GITHUB_KEY_1]) while keeping prompt syntax intact.",
        "Safe Transmission: Reduces risk score from 100 to 0 (CLEAN), enabling safe submission to external LLMs.",
        "Zero-Trust Local Audit Viewer: Encrypted audit log stored solely in chrome.storage.local.",
        "Masked Token Previews: Logs display only masked previews (e.g. sk-proj-••••3xY9, AKIA••••MPLE).",
        "Export Capability: Allows compliance teams to export structured tamper-evident audit logs in JSON format."
    ]
    for feat in redact_features:
        pf = tf19.add_paragraph()
        pf.text = "• " + feat
        pf.font.name = "Times New Roman"
        pf.font.size = Pt(14.5)
        pf.space_after = Pt(7)
        pf.line_spacing = 1.15

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 20: AI MODELS EXPLANATION
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("AI Models Explanation", [
        "Regex Model → Uses predefined patterns to detect known API keys, passwords, tokens and sensitive data.",
        "Shannon Entropy → Measures the randomness of text to identify possible unknown secrets.",
        "Luhn Algorithm → Validates possible payment-card numbers and reduces incorrect detections.",
        "PII Detection → Identifies personal information such as email addresses and phone numbers.",
        "TF-IDF + Logistic Regression → Experimental machine-learning model used to classify prompts based on their text features.",
        "Combined Detection → Multiple techniques work together to improve sensitive-data detection and risk assessment."
    ], font_size=17, space_after=9)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 21: INNOVATION
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Innovation", [
        "Pre-Transmission Protection → Detects sensitive information before the prompt reaches the external AI service.",
        "Multi-Layer Detection → Combines 150+ signatures, entropy, Luhn validation and PII detection.",
        "Privacy-First Processing → Performs prompt analysis locally without sending prompt data to external servers.",
        "Auto-Redaction → Automatically replaces detected sensitive values with safe placeholders.",
        "Explainable Alerts → Clearly shows users what type of sensitive information was detected and why.",
        "Tamper-Evident Audit → Uses SHA-256 hash chaining to maintain secure local audit records."
    ], font_size=17, space_after=9)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 22: DATA FLOW (TECHNICAL)
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Data Flow (Technical)", [
        "Prompt Input → User enters or pastes the prompt into the AI chatbot interface.",
        "Content Script → Monitors the webpage, input fields and user interactions.",
        "Request Interception → fetch and XMLHttpRequest requests are intercepted before transmission.",
        "Detection Engine → Prompt is normalized and scanned using Regex, Shannon Entropy, Luhn and PII detection.",
        "Decision Engine → Calculates the risk level and decides whether to Allow, Block or Redact the request.",
        "Local Storage → Masked audit information and configuration are stored using chrome.storage.local."
    ], font_size=17, space_after=9)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 23: RESULTS & DISCUSSION
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Results & Discussion", [
        "High Detection Accuracy → The system achieved 100% accuracy on the evaluated test dataset.",
        "Reliable Detection → Precision and recall were both reported as 100%, with an F1 score of 1.00.",
        "Low False Positives → The reported false positive rate was 0%, reducing unnecessary security warnings.",
        "Fast Processing → Average detection latency was reported to be under 25 ms.",
        "Test Coverage → The evaluation included 95 prompts covering clean prompts, API keys, passwords, PII and confidential data.",
        "Overall Result → SENTINEL demonstrated effective real-time sensitive-data detection while maintaining local, privacy-focused processing."
    ], font_size=17, space_after=8)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 24: CHALLENGES & SOLUTIONS
    # ═════════════════════════════════════════════════════════════════════════
    add_bullet_slide("Challenges & Solutions", [
        "Dynamic AI Websites → MutationObserver detects changes in webpage elements and maintains monitoring.",
        "React-Controlled Inputs → Native setters and synthetic events help synchronize monitored input fields.",
        "Obfuscated Data → Text normalization handles unusual spacing, invisible characters and Unicode variations.",
        "Encoded Secrets → Base64 content is decoded and scanned again for sensitive information.",
        "False Positives → Entropy thresholds and Luhn validation help improve detection accuracy.",
        "Browser Limitations → The current system focuses on browser-based AI platforms rather than terminal applications."
    ], font_size=17, space_after=8)

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 25: FUTURE SCOPE & CONCLUSION
    # ═════════════════════════════════════════════════════════════════════════
    s25 = prs.slides.add_slide(blank_layout)
    add_header_logos(s25)
    add_title(s25, "Future Scope & Conclusion")
    
    s25_box = s25.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.5))
    tf25_l = s25_box.text_frame
    tf25_l.word_wrap = True
    
    p25_lh = tf25_l.paragraphs[0]
    p25_lh.text = "Future Scope:"
    p25_lh.font.name = "Times New Roman"
    p25_lh.font.size = Pt(20)
    p25_lh.font.bold = True
    p25_lh.space_after = Pt(10)
    
    fs_bullets = [
        "OCR Integration: Detect sensitive data inside screenshots and image attachments.",
        "Enterprise SIEM: Export alerts to centralized corporate monitoring platforms.",
        "Cross-Browser Support: Extend extension support to Firefox and Safari.",
        "On-Device Machine Learning: Lightweight TensorFlow.js models for semantic leaks.",
        "Multi-Platform Coverage: Support emerging enterprise AI platforms and agents."
    ]
    for b in fs_bullets:
        p = tf25_l.add_paragraph()
        p.text = "• " + b
        p.font.name = "Times New Roman"
        p.font.size = Pt(15.5)
        p.space_after = Pt(8)
        p.line_spacing = 1.15
        
    s25_box_r = s25.shapes.add_textbox(Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.5))
    tf25_r = s25_box_r.text_frame
    tf25_r.word_wrap = True
    
    p25_rh = tf25_r.paragraphs[0]
    p25_rh.text = "Conclusion:"
    p25_rh.font.name = "Times New Roman"
    p25_rh.font.size = Pt(20)
    p25_rh.font.bold = True
    p25_rh.space_after = Pt(10)
    
    conc_bullets = [
        "Effective Protection: Prevents irreversible corporate data leakage to public AI chatbots.",
        "Synchronous Pre-TLS Interception: Halts sensitive prompts before network transmission.",
        "Privacy-Preserving Design: 100% client-side evaluation with zero cloud telemetry.",
        "Zero Human-Perceptible Lag: Sub-25ms response time ensures seamless user productivity.",
        "Practical & Deployable: Lightweight Manifest V3 architecture ready for enterprise rollout."
    ]
    for b in conc_bullets:
        p = tf25_r.add_paragraph()
        p.text = "• " + b
        p.font.name = "Times New Roman"
        p.font.size = Pt(15.5)
        p.space_after = Pt(8)
        p.line_spacing = 1.15

    # ═════════════════════════════════════════════════════════════════════════
    # SLIDE 26: THANK YOU SLIDE
    # ═════════════════════════════════════════════════════════════════════════
    s26 = prs.slides.add_slide(blank_layout)
    if os.path.exists(thank_you_path):
        s26.shapes.add_picture(thank_you_path, Inches(2.9), Inches(1.2), width=Inches(7.5), height=Inches(5.1))
    else:
        add_title(s26, "Thank You!", top=Inches(3.0), font_size=48)

    for p in output_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        prs.save(p)
        print(f"Presentation saved successfully to: {p} (Total Slides: {len(prs.slides)})")

if __name__ == "__main__":
    out1 = r"C:\Users\thero\Downloads\Mini_Project.pptx"
    out2 = r"c:\Users\thero\shadow-ai-prompt-guardian\Mini_Project.pptx"
    create_deck([out1, out2])
