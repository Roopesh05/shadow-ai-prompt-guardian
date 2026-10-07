"""
build_technical_explanation_pdf.py
==================================
Generates a publication-grade, 3-page Technical Architecture & Defense Guide
document (.docx and .pdf) for SHADOW AI PROMPT GUARDIAN (SENTINEL).
Calibrated so every page is perfectly balanced and structured.
"""

import os
from datetime import datetime
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=50, bottom=50, left=80, right=80):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, border_color="CBD5E1"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>'
        f'<w:left w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
        f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def make_callout(doc, title, text, bg="F8FAFC", border_color="0284C7"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(7.3)
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg)
    set_cell_margins(cell, top=50, bottom=50, left=90, right=90)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
        f'<w:left w:val="single" w:sz="16" w:space="0" w:color="{border_color}"/>'
        f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r_t = p.add_run(title)
    r_t.font.bold = True
    r_t.font.size = Pt(9.2)
    r_t.font.color.rgb = RGBColor(15, 23, 42)
    
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_after = Pt(0)
    p2.paragraph_format.line_spacing = 1.12
    r_b = p2.add_run(text)
    r_b.font.size = Pt(8.8)
    r_b.font.color.rgb = RGBColor(51, 65, 85)

def add_section_header(doc, number, title):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2.5)
    p.paragraph_format.keep_with_next = True
    
    r_num = p.add_run(f"{number}. ")
    r_num.font.bold = True
    r_num.font.size = Pt(11.5)
    r_num.font.color.rgb = RGBColor(2, 132, 199)
    
    r_title = p.add_run(title)
    r_title.font.bold = True
    r_title.font.size = Pt(11.5)
    r_title.font.color.rgb = RGBColor(15, 23, 42)

def generate_document(docx_path):
    doc = docx.Document()
    
    for s in doc.sections:
        s.page_width = Inches(8.5)
        s.page_height = Inches(11.0)
        s.top_margin = Inches(0.48)
        s.bottom_margin = Inches(0.48)
        s.left_margin = Inches(0.60)
        s.right_margin = Inches(0.60)
        
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(9.2)
    style.font.color.rgb = RGBColor(30, 41, 59)
    style.paragraph_format.line_spacing = 1.12
    style.paragraph_format.space_after = Pt(3.0)
    style.paragraph_format.space_before = Pt(0)
    
    # ══════════════════════════════════════════
    # PAGE 1: HEADER, THREAT MODEL & ARCHITECTURE OVERVIEW
    # ══════════════════════════════════════════
    header_table = doc.add_table(rows=1, cols=1)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_table.autofit = False
    header_table.columns[0].width = Inches(7.3)
    h_cell = header_table.cell(0, 0)
    set_cell_background(h_cell, "0F172A")
    set_cell_margins(h_cell, top=90, bottom=80, left=130, right=130)
    
    tcPr = h_cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:bottom w:val="single" w:sz="16" w:space="0" w:color="0284C7"/>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p_badge = h_cell.paragraphs[0]
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_badge.paragraph_format.space_after = Pt(1)
    r_badge = p_badge.add_run("TECHNICAL ARCHITECTURE & PROJECT EXPLANATION GUIDE")
    r_badge.font.bold = True
    r_badge.font.size = Pt(8.2)
    r_badge.font.color.rgb = RGBColor(56, 189, 248)
    
    p_title = h_cell.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(2)
    r_title = p_title.add_run("Shadow AI Prompt Guardian (SENTINEL)")
    r_title.font.bold = True
    r_title.font.size = Pt(15.0)
    r_title.font.color.rgb = RGBColor(255, 255, 255)
    
    p_sub = h_cell.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(3)
    r_sub = p_sub.add_run("Browser-Level Real-Time Detection and Risk Assessment of Unauthorized AI Usage")
    r_sub.font.italic = True
    r_sub.font.size = Pt(9.5)
    r_sub.font.color.rgb = RGBColor(203, 213, 225)
    
    p_meta = h_cell.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.space_after = Pt(0)
    r_meta1 = p_meta.add_run("Authors: ")
    r_meta1.font.bold = True
    r_meta1.font.size = Pt(8.0)
    r_meta1.font.color.rgb = RGBColor(148, 163, 184)
    r_meta2 = p_meta.add_run("Sreegokul S., Roopesh S. N., Ram Sakthi Sharumathi M., Sanjeev Kumar P., Saravana Kumar M.\n")
    r_meta2.font.size = Pt(8.0)
    r_meta2.font.color.rgb = RGBColor(226, 232, 240)
    r_meta3 = p_meta.add_run("Affiliation: ")
    r_meta3.font.bold = True
    r_meta3.font.size = Pt(8.0)
    r_meta3.font.color.rgb = RGBColor(148, 163, 184)
    r_meta4 = p_meta.add_run("Department of CSE (IoT & Cyber Security), SNS College of Engineering, Tamil Nadu, India")
    r_meta4.font.size = Pt(8.0)
    r_meta4.font.color.rgb = RGBColor(226, 232, 240)

    # Section 1
    add_section_header(doc, "1", "The Problem Space & Architectural Paradigm Shift")
    
    p_intro = doc.add_paragraph()
    p_intro.add_run(
        "Modern enterprise employees increasingly leverage public Generative AI interfaces—such as ChatGPT, Claude, Gemini, Perplexity, and Cohere—to accelerate drafting, coding, and debugging. While productivity rises, it introduces a severe corporate threat termed "
    )
    r_sh = p_intro.add_run("\"Shadow AI\": ")
    r_sh.font.bold = True
    p_intro.add_run(
        "the unmanaged, unauthorized transmission of proprietary corporate assets through public AI tools without governance or oversight."
    )
    
    make_callout(
        doc,
        "CRITICAL VULNERABILITY: THE IRREVERSIBILITY OF SHADOW AI LEAKS",
        "Unlike traditional data transmission or file sharing, prompt submissions to public generative-AI interfaces are permanent and irreversible. Once proprietary source code, credentials, or customer PII are submitted, the data cannot be revoked or erased from remote inference caches. The information becomes subject to the host platform's data retention policies and model retraining pipelines. Effective mitigation must prevent sensitive content from exiting the browser boundary, rather than detecting its loss after the fact.",
        bg="FEF2F2",
        border_color="DC2626"
    )
    
    p_flaws = doc.add_paragraph()
    p_flaws.paragraph_format.space_before = Pt(3)
    r_flaws_h = p_flaws.add_run("Why Legacy Defensive Solutions Fail:\n")
    r_flaws_h.font.bold = True
    r_flaws_h.font.color.rgb = RGBColor(15, 23, 42)
    
    points = [
        ("Network & DNS-Level Blocklists: ", "Traditional firewalls and DNS sinkholes filter by destination domain. They check where traffic is going, completely ignoring what is being transmitted. Consequently, newly launched, unlisted, or mirror AI endpoints remain fully accessible, while blanket domain bans break legitimate employee workflows."),
        ("SaaS & CASB Discovery Platforms: ", "Cloud Access Security Brokers (CASB) inspect OAuth grants and email accounts after usage occurs. Because they operate post-facto, they notify security teams days or weeks after data has already departed corporate custody."),
        ("The Guardian's Solution: ", "Client-side, pre-transmission content inspection. By deploying a Manifest V3 browser extension, the inspection engine operates directly within the browser execution context, analyzing prompt text synchronously at keystroke and submission time with zero external network dependencies.")
    ]
    for p_title, p_desc in points:
        p_pt = doc.add_paragraph()
        p_pt.paragraph_format.left_indent = Inches(0.15)
        p_pt.paragraph_format.space_after = Pt(2.0)
        r_t = p_pt.add_run("• " + p_title)
        r_t.font.bold = True
        r_t.font.size = Pt(8.8)
        r_d = p_pt.add_run(p_desc)
        r_d.font.size = Pt(8.8)

    add_section_header(doc, "2", "Three-Stage Technical Pipeline Architecture")
    
    p_arch_desc = doc.add_paragraph()
    p_arch_desc.add_run(
        "The Shadow AI Prompt Guardian executes via a modular, synchronous 3-stage pipeline implemented in client-side JavaScript, ensuring sub-5ms evaluation without introducing human-perceptible input latency:"
    )
    
    wf_box = doc.add_table(rows=1, cols=1)
    wf_box.alignment = WD_TABLE_ALIGNMENT.CENTER
    wf_box.columns[0].width = Inches(7.3)
    wf_cell = wf_box.cell(0, 0)
    set_cell_background(wf_cell, "0F172A")
    set_cell_margins(wf_cell, top=50, bottom=50, left=80, right=80)
    
    p_wf = wf_cell.paragraphs[0]
    p_wf.paragraph_format.space_after = Pt(0)
    p_wf.paragraph_format.line_spacing = 1.05
    r_wf = p_wf.add_run(
        "USER PROMPT INPUT ──▶ STAGE 1: 6-Layer Interception (content.js)\n"
        "                    [Fetch / XHR Hooks | Click / Keydown Listeners | MutationObserver]\n"
        "                         │\n"
        "                         ▼ (Intercepted Plaintext Payload)\n"
        "                    STAGE 2: Multi-Vector Detection Engine (detection-engine.js)\n"
        "                    [Regex Signatures | Auth Headers | PII Parsers | Shannon Entropy | Context Scoring]\n"
        "                         │\n"
        "                         ▼ (Risk Score vs Threshold Evaluation)\n"
        "                    STAGE 3: Real-Time Enforcement & Privacy Preservation\n"
        "                    • High Risk: e.preventDefault() + Inject Warning Banner (Submission Blocked)\n"
        "                    • Low Risk: Transparent Pass-Through (<5ms local latency)\n"
        "                    • Audit Trail: Masked Tokens Only (AKIA••••••••••••LE) | Zero Network Calls"
    )
    r_wf.font.name = "Consolas"
    r_wf.font.size = Pt(7.8)
    r_wf.font.color.rgb = RGBColor(56, 189, 248)

    # PAGE BREAK TO PAGE 2
    doc.add_page_break()

    # ══════════════════════════════════════════
    # PAGE 2: ENGINE DEEP-DIVE & EMPIRICAL BENCHMARKS
    # ══════════════════════════════════════════
    p_p2_hdr = doc.add_paragraph()
    p_p2_hdr.paragraph_format.space_before = Pt(0)
    p_p2_hdr.paragraph_format.space_after = Pt(4)
    r_p2_h = p_p2_hdr.add_run("DETAILED ENGINE IMPLEMENTATION & EMPIRICAL BENCHMARKS")
    r_p2_h.font.bold = True
    r_p2_h.font.size = Pt(11.5)
    r_p2_h.font.color.rgb = RGBColor(2, 132, 199)

    p_stg1 = doc.add_paragraph()
    r_s1_h = p_stg1.add_run("Stage 1: The 6-Layer Synchronous Interception Engine (content.js)\n")
    r_s1_h.font.bold = True
    r_s1_h.font.size = Pt(10)
    r_s1_h.font.color.rgb = RGBColor(15, 23, 42)
    p_stg1.add_run(
        "Modern AI web frontends are single-page applications (SPAs) built with React, Next.js, and custom event handlers that bypass standard HTML form submission. To guarantee comprehensive capture across ChatGPT, Claude, Gemini, Perplexity, and Cohere, the extension deploys six concurrent interception hooks:"
    )
    
    interception_layers = [
        ("Fetch API Hook: ", "Monkey-patches window.fetch to inspect outgoing request bodies immediately prior to serialization."),
        ("XMLHttpRequest (XHR) Hook: ", "Overrides XMLHttpRequest.prototype.send to capture asynchronous AJAX transmissions."),
        ("Click Event Detection: ", "Attaches capture-phase event listeners (useCapture: true) to AI submit buttons, preempting web handlers."),
        ("Keyboard Enter Detection: ", "Intercepts Enter and Shift+Enter keydown events within textareas and prompt input fields."),
        ("Form Submission Hook: ", "Hooks standard HTML form submit events for legacy server-rendered interfaces."),
        ("MutationObserver: ", "Continuously tracks dynamic DOM additions, observing contenteditable divs and newly rendered input elements in reactive SPAs.")
    ]
    for l_title, l_desc in interception_layers:
        p_l = doc.add_paragraph()
        p_l.paragraph_format.left_indent = Inches(0.15)
        p_l.paragraph_format.space_after = Pt(1.8)
        r_lt = p_l.add_run("1." + str(interception_layers.index((l_title, l_desc))+1) + " " + l_title)
        r_lt.font.bold = True
        r_lt.font.size = Pt(8.8)
        r_ld = p_l.add_run(l_desc)
        r_ld.font.size = Pt(8.8)

    p_stg2 = doc.add_paragraph()
    p_stg2.paragraph_format.space_before = Pt(4)
    r_s2_h = p_stg2.add_run("Stage 2: Multi-Vector Detection Engine (detection-engine.js)\n")
    r_s2_h.font.bold = True
    r_s2_h.font.size = Pt(10)
    r_s2_h.font.color.rgb = RGBColor(15, 23, 42)
    p_stg2.add_run(
        "The extracted text payload is evaluated across five complementary inspection layers entirely in local memory:"
    )
    
    engine_layers = [
        ("Deterministic Regex Signatures: ", "Tailored high-precision regular expressions targeting 10+ cloud platforms (AWS AKIA..., GitHub ghp_..., OpenAI sk-..., Stripe sk_live_..., Slack xoxb-..., Azure, Google OAuth, Twilio, GitLab)."),
        ("Credential & Auth Parsing: ", "Detects Bearer authorization tokens, Basic Auth base64 strings, and explicit password assignment syntax (e.g., password=, passwd:, api_secret=)."),
        ("Syntactic PII Detection: ", "Validates structural integrity of emails, US and international phone numbers, Social Security Numbers (SSNs), and IPv4/IPv6 addresses."),
        ("Shannon Entropy Mathematical Metric: ", "Calculates character probability H = -∑ P(xᵢ) log₂(P(xᵢ)) across token substrings. High-randomness strings (≥20 characters, H ≥ 4.0 bits/char) are flagged as unknown secrets, cryptographic hashes, or unclassified API tokens."),
        ("Context-Aware Score Suppression: ", "Suppresses false positives by dampening risk scores when sensitive keywords occur within educational queries (e.g., 'What is an API key?') or inert code syntax.")
    ]
    for e_title, e_desc in engine_layers:
        p_e = doc.add_paragraph()
        p_e.paragraph_format.left_indent = Inches(0.15)
        p_e.paragraph_format.space_after = Pt(1.8)
        r_et = p_e.add_run("2." + str(engine_layers.index((e_title, e_desc))+1) + " " + e_title)
        r_et.font.bold = True
        r_et.font.size = Pt(8.8)
        r_ed = p_e.add_run(e_desc)
        r_ed.font.size = Pt(8.8)

    p_stg3 = doc.add_paragraph()
    p_stg3.paragraph_format.space_before = Pt(4)
    r_s3_h = p_stg3.add_run("Stage 3: Real-Time Enforcement & Zero-Exfiltration Design\n")
    r_s3_h.font.bold = True
    r_s3_h.font.size = Pt(10)
    r_s3_h.font.color.rgb = RGBColor(15, 23, 42)
    p_stg3.add_run(
        "If the composite risk score equals or exceeds the blocking threshold, the extension invokes e.preventDefault() and e.stopImmediatePropagation(), immediately halting submission. A warning banner is injected directly above the prompt box, detailing the detected risk categories. Crucially, the extension performs zero external network telemetry, stores zero raw prompt text, and records only irreversibly masked audit tokens (e.g., AKIA••••••••••••LE), guaranteeing total enterprise confidentiality."
    )

    add_section_header(doc, "3", "Empirical Evaluation & Stress-Test Benchmarks")
    
    p_bench = doc.add_paragraph()
    p_bench.add_run(
        "The system was evaluated through two distinct testing methodologies: a primary categorized enterprise benchmark and a large-scale combinatorial adversarial stress test designed to probe detection boundaries."
    )
    
    tbl_bench = doc.add_table(rows=3, cols=6)
    tbl_bench.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_bench.columns[0].width = Inches(1.5)
    tbl_bench.columns[1].width = Inches(0.7)
    tbl_bench.columns[2].width = Inches(1.8)
    tbl_bench.columns[3].width = Inches(0.8)
    tbl_bench.columns[4].width = Inches(0.8)
    tbl_bench.columns[5].width = Inches(1.7)
    set_table_borders(tbl_bench, border_color="CBD5E1")
    
    b_headers = ["Evaluation Scope", "Prompts", "Categories Evaluated", "Accuracy", "Recall / F1", "Key Empirical Findings"]
    for idx, bh in enumerate(b_headers):
        cell = tbl_bench.cell(0, idx)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=30, bottom=30, left=45, right=45)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if idx in (1, 3, 4) else WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(bh)
        r.font.bold = True
        r.font.size = Pt(7.8)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    b_data = [
        ("Primary Categorized Dataset", "140", "Clean (45), API Keys (30), PII (23), Terms (23), Pwd (19)", "100.0%", "1.00 / 1.00", "Zero FP & Zero FN; perfect classification across recognizable syntaxes."),
        ("Combinatorial Stress Test", "1,000", "15 templates × 15 contexts × 8 credential styles", "95.4%", "95.4% / —", "Intercepted 954/1000 TP; surfaced 46 FN across two reproducible boundaries.")
    ]
    for r_i, r_vals in enumerate(b_data, start=1):
        bg = "F8FAFC" if r_i % 2 == 1 else "FFFFFF"
        for c_i, val in enumerate(r_vals):
            cell = tbl_bench.cell(r_i, c_i)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=25, bottom=25, left=45, right=45)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_i in (1, 3, 4) else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(7.8)
            if c_i in (3, 4):
                r.font.bold = True
                r.font.color.rgb = RGBColor(16, 185, 129) if "100" in val else RGBColor(2, 132, 199)
            elif c_i == 0:
                r.font.bold = True
                
    p_fm = doc.add_paragraph()
    p_fm.paragraph_format.space_before = Pt(4)
    r_fm_h = p_fm.add_run("Characterization of the Two Failure Modes:\n")
    r_fm_h.font.bold = True
    r_fm_h.font.size = Pt(9.2)
    r_fm_h.font.color.rgb = RGBColor(15, 23, 42)
    
    fm_points = [
        ("Label-Style Secret Phrasing (Syntactic Boundary): ", "When credentials are introduced via plain labels without assignment operators (e.g., 'Secret: <key>' instead of 'password=<key>'), standard assignment regexes are bypassed. This accounted for the majority of the 46 missed cases."),
        ("Context-Aware Score Suppression (Damping Side-Effect): ", "While context scoring effectively eliminates false positives on benign queries, query-style technical prefixes (e.g., 'Help me debug this token...') occasionally dampen risk scores of genuine secrets below the critical blocking threshold.")
    ]
    for fm_t, fm_d in fm_points:
        p_f = doc.add_paragraph()
        p_f.paragraph_format.left_indent = Inches(0.15)
        p_f.paragraph_format.space_after = Pt(1.8)
        r_ft = p_f.add_run("• " + fm_t)
        r_ft.font.bold = True
        r_ft.font.size = Pt(8.8)
        r_fd = p_f.add_run(fm_d)
        r_fd.font.size = Pt(8.8)

    # PAGE BREAK TO PAGE 3
    doc.add_page_break()

    # ══════════════════════════════════════════
    # PAGE 3: DEFENSE FAQS, ROADMAP & COMPATIBILITY MATRIX
    # ══════════════════════════════════════════
    p_p3_hdr = doc.add_paragraph()
    p_p3_hdr.paragraph_format.space_before = Pt(0)
    p_p3_hdr.paragraph_format.space_after = Pt(4)
    r_p3_h = p_p3_hdr.add_run("DEFENSE GUIDE, FREQUENTLY ASKED QUESTIONS & ROADMAP")
    r_p3_h.font.bold = True
    r_p3_h.font.size = Pt(11.5)
    r_p3_h.font.color.rgb = RGBColor(2, 132, 199)

    add_section_header(doc, "4", "Frequently Asked Technical Questions (Defense & Review Guide)")
    
    faqs = [
        ("Q1: Why not use a cloud LLM to detect prompt leaks?", 
         "A1: Three critical reasons: (1) Latency: Cloud LLMs introduce 500ms–2000ms latency, ruining interactive user typing. (2) Cost: Per-token API costs scale unsustainably with enterprise prompt volume. (3) Privacy Paradox: Sending prompts to an external cloud model to check for leaks violates the very confidentiality standard being enforced. Our client-side JS engine executes in <5ms locally with zero network egress."),
        ("Q2: Why can't a corporate proxy or Web Application Firewall (WAF) solve this?", 
         "A2: Modern browser traffic utilizes TLS 1.3 with certificate pinning or WebSocket connections. Network proxies cannot inspect encrypted payloads without deploying invasive enterprise root certificates. Furthermore, proxies lack DOM context to distinguish between active typing, reading, or drafts, whereas client-side hooks capture data at the moment of submission."),
        ("Q3: Why choose Manifest V3 over Manifest V2?", 
         "A3: Manifest V3 is Google Chrome's modern extension standard. It enforces enhanced security by prohibiting arbitrary remote code execution, migrates background pages to ephemeral service workers, and provides isolated world script execution that prevents malicious website scripts from tampering with the Guardian's detection logic."),
        ("Q4: How does Shannon Entropy prevent false positives on normal text?", 
         "A4: Natural language English text exhibits an entropy of ~1.5 to 3.0 bits/character due to character frequency distributions. Cryptographic keys and base64 tokens exhibit high uniformity and randomness (H >= 4.0 bits/char). By pairing this mathematical threshold with a minimum length constraint (>= 20 chars), common words are excluded while random keys are flagged.")
    ]
    for q, a in faqs:
        p_faq = doc.add_paragraph()
        p_faq.paragraph_format.space_after = Pt(2.5)
        r_q = p_faq.add_run(q + "\n")
        r_q.font.bold = True
        r_q.font.size = Pt(8.8)
        r_q.font.color.rgb = RGBColor(2, 132, 199)
        r_a = p_faq.add_run(a)
        r_a.font.size = Pt(8.6)
        r_a.font.color.rgb = RGBColor(51, 65, 85)

    add_section_header(doc, "5", "Identified Limitations & Engineering Roadmap")
    
    roadmap = [
        ("Multi-Turn Context Window Analysis: ", "Aggregating conversational history across multi-message threads to prevent 'slow-drip' data exfiltration split across sequential prompts."),
        ("Client-Side Document Scanning: ", "Extending synchronous inspection to local file uploads (PDF, CSV, DOCX) before transfer to AI platforms."),
        ("Embedded Lightweight ML (TensorFlow.js): ", "Integrating client-side on-device models to detect paraphrased or semantic leaks without cloud calls."),
        ("Tiered Severity Classification: ", "Implementing graduated alert levels (Critical Block, Warning Confirmation, Informational Notice) to optimize user workflow and eliminate alert fatigue.")
    ]
    for rm_t, rm_d in roadmap:
        p_rm = doc.add_paragraph()
        p_rm.paragraph_format.left_indent = Inches(0.15)
        p_rm.paragraph_format.space_after = Pt(1.8)
        r_rmt = p_rm.add_run("→ " + rm_t)
        r_rmt.font.bold = True
        r_rmt.font.size = Pt(8.8)
        r_rmt.font.color.rgb = RGBColor(15, 23, 42)
        r_rmd = p_rm.add_run(rm_d)
        r_rmd.font.size = Pt(8.8)
        r_rmd.font.color.rgb = RGBColor(71, 85, 105)

    add_section_header(doc, "6", "Platform Support & Architectural Implementation Matrix")
    
    plat_tbl = doc.add_table(rows=6, cols=4)
    plat_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    plat_tbl.columns[0].width = Inches(1.5)
    plat_tbl.columns[1].width = Inches(2.2)
    plat_tbl.columns[2].width = Inches(2.3)
    plat_tbl.columns[3].width = Inches(1.3)
    set_table_borders(plat_tbl, border_color="CBD5E1")
    
    p_headers = ["AI Platform", "Input Container Type", "Interception Mechanism", "Operational Status"]
    for idx, ph in enumerate(p_headers):
        cell = plat_tbl.cell(0, idx)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=25, bottom=25, left=35, right=35)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if idx in (0, 3) else WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(ph)
        r.font.bold = True
        r.font.size = Pt(7.8)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    p_data = [
        ("OpenAI ChatGPT", "contenteditable / textarea #prompt-textarea", "Fetch hook + Send button click + Keydown", "Verified Active"),
        ("Anthropic Claude", "div.ProseMirror contenteditable", "MutationObserver + Fetch hook + Enter key", "Verified Active"),
        ("Google Gemini", "rich-textarea, div[role='textbox']", "XHR/Fetch hook + Click event preemption", "Verified Active"),
        ("Perplexity AI", "textarea[placeholder*='Ask anything']", "Fetch API monkeypatch + Form submit", "Verified Active"),
        ("Cohere Coral", "div.coral-input / input[type='text']", "DOM MutationObserver + Keydown hook", "Verified Active")
    ]
    for r_i, r_vals in enumerate(p_data, start=1):
        bg = "F8FAFC" if r_i % 2 == 1 else "FFFFFF"
        for c_i, val in enumerate(r_vals):
            cell = plat_tbl.cell(r_i, c_i)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=20, bottom=20, left=35, right=35)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_i in (0, 3) else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(7.6)
            if c_i == 3:
                r.font.bold = True
                r.font.color.rgb = RGBColor(16, 185, 129)
            elif c_i == 0:
                r.font.bold = True

    p_ft = doc.add_paragraph()
    p_ft.paragraph_format.space_before = Pt(6)
    p_ft.paragraph_format.space_after = Pt(0)
    p_ft.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_ft = p_ft.add_run("Shadow AI Prompt Guardian (SENTINEL)  |  Technical Architecture & Defense Reference  |  September 2026")
    r_ft.font.size = Pt(7.8)
    r_ft.font.color.rgb = RGBColor(148, 163, 184)
    
    doc.save(docx_path)
    print(f"Generated DOCX: {docx_path}")

if __name__ == "__main__":
    downloads_docx = r"C:\Users\thero\Downloads\Technical_Architecture_and_Project_Explanation.docx"
    workspace_docx = r"c:\Users\thero\shadow-ai-prompt-guardian\Technical_Architecture_and_Project_Explanation.docx"
    
    generate_document(downloads_docx)
    generate_document(workspace_docx)
