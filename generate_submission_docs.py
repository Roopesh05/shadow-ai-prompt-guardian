"""
generate_submission_docs.py
===========================
Generates the 3 mandatory academic journal submission documents for:
"ShadowAI Detection Pipeline: Browser-Level Detection and Risk Assessment of Unauthorized AI Usage"

1. Author Statement (with CRediT Contributor Roles) — Calibrated 1-Page Document
2. Cover Letter to the Editor-in-Chief — Calibrated 1-Page Document
3. Declaration of Interest Statement (ICMJE / Elsevier format) — Calibrated 1-Page Document
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

def set_horizontal_rule(table, border_color="0F172A"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

# ═════════════════════════════════════════════════════════════════════════════
# DOCUMENT 1: AUTHOR STATEMENT (CREDIT CONTRIBUTOR ROLES)
# ═════════════════════════════════════════════════════════════════════════════
def generate_author_statement(paths):
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.45)
        s.bottom_margin = Inches(0.45)
        s.left_margin = Inches(0.60)
        s.right_margin = Inches(0.60)
        
    style = doc.styles['Normal']
    style.font.name = 'Times New Roman'
    style.font.size = Pt(9.5)
    style.font.color.rgb = RGBColor(15, 23, 42)
    style.paragraph_format.line_spacing = 1.10
    style.paragraph_format.space_after = Pt(2.5)
    style.paragraph_format.space_before = Pt(0)
    
    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(1)
    r_title = p_title.add_run("CRediT Author Statement")
    r_title.font.bold = True
    r_title.font.size = Pt(14)
    r_title.font.color.rgb = RGBColor(15, 23, 42)
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(6)
    r_sub = p_sub.add_run("Contributor Roles Taxonomy (CRediT) Official Submission Statement")
    r_sub.font.italic = True
    r_sub.font.size = Pt(9.5)
    r_sub.font.color.rgb = RGBColor(71, 85, 105)
    
    # Manuscript Details Block
    detail_tbl = doc.add_table(rows=2, cols=2)
    detail_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    detail_tbl.columns[0].width = Inches(1.4)
    detail_tbl.columns[1].width = Inches(5.9)
    set_horizontal_rule(detail_tbl, border_color="0F172A")
    
    details = [
        ("Manuscript:", "ShadowAI Detection Pipeline: Browser-Level Detection and Risk Assessment of Unauthorized AI Usage"),
        ("Authors & Inst.:", "Sreegokul S., Roopesh S. N., Ram Sakthi Sharumathi M., Sanjeev Kumar P., Saravana Kumar M.  |  Department of Computer Science and Engineering (IoT & Cyber Security), SNS College of Engineering, Tamil Nadu, India")
    ]
    for idx, (label, val) in enumerate(details):
        c0, c1 = detail_tbl.cell(idx, 0), detail_tbl.cell(idx, 1)
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, top=35, bottom=35, left=60, right=60)
        set_cell_margins(c1, top=35, bottom=35, left=60, right=60)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(label)
        r0.font.bold = True
        r0.font.size = Pt(8.8)
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(val)
        r1.font.size = Pt(8.8)
        
    p_h1 = doc.add_paragraph()
    p_h1.paragraph_format.space_before = Pt(6)
    p_h1.paragraph_format.space_after = Pt(2.5)
    r_h1 = p_h1.add_run("Author Contributions (CRediT Formal Statement):")
    r_h1.font.bold = True
    r_h1.font.size = Pt(10)
    
    contributors = [
        ("Sreegokul S: ", "Conceptualization, Methodology, Software (Detection Engine Architecture & Content Script Interception Pipeline), Writing - Original Draft."),
        ("Roopesh S N: ", "Software (DOM Hooking, Shannon Entropy Engine, Chrome Manifest V3 Integration), Investigation, Validation (Combinatorial Stress-Testing Execution), Data Curation, Writing - Original Draft."),
        ("Ram Sakthi Sharumathi M: ", "Formal Analysis (Statistical Evaluation, Confusion Matrix & Error Boundary Metrics), Validation (Categorized 140-Prompt Benchmark), Writing - Review & Editing."),
        ("Sanjeev Kumar P: ", "Resources (Adversarial Prompt Testbed & Corpus), Software (Popup UI, Injected Warning Banner, Threat Log Storage), Visualization (Workflow & Architecture Diagrams), Writing - Review & Editing."),
        ("Saravana Kumar M: ", "Supervision, Project Administration, Methodology Validation, Theoretical Framework Review, Writing - Review & Editing.")
    ]
    for auth, text in contributors:
        p_c = doc.add_paragraph()
        p_c.paragraph_format.space_after = Pt(2.0)
        p_c.paragraph_format.left_indent = Inches(0.15)
        r_a = p_c.add_run(auth)
        r_a.font.bold = True
        r_a.font.size = Pt(8.8)
        r_t = p_c.add_run(text)
        r_t.font.size = Pt(8.8)
        
    # CRediT Matrix Table
    p_h2 = doc.add_paragraph()
    p_h2.paragraph_format.space_before = Pt(5)
    p_h2.paragraph_format.space_after = Pt(2.5)
    r_h2 = p_h2.add_run("CRediT Contributor Roles Matrix Overview:")
    r_h2.font.bold = True
    r_h2.font.size = Pt(10)
    
    roles = [
        ("Conceptualization", "✓", "", "", "", ""),
        ("Methodology", "✓", "", "", "", "✓"),
        ("Software (Core Engine & Hooks)", "✓", "✓", "", "✓", ""),
        ("Validation & Benchmarking", "", "✓", "✓", "", ""),
        ("Formal Analysis & Metrics", "", "", "✓", "", ""),
        ("Investigation & Testing", "", "✓", "✓", "", ""),
        ("Resources & Datasets", "", "", "", "✓", ""),
        ("Data Curation", "", "✓", "", "", ""),
        ("Writing - Original Draft", "✓", "✓", "", "", ""),
        ("Writing - Review & Editing", "", "", "✓", "✓", "✓"),
        ("Visualization & Diagrams", "", "", "", "✓", ""),
        ("Supervision & Administration", "", "", "", "", "✓")
    ]
    
    matrix_tbl = doc.add_table(rows=len(roles)+1, cols=6)
    matrix_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    matrix_tbl.columns[0].width = Inches(2.3)
    for c_i in range(1, 6):
        matrix_tbl.columns[c_i].width = Inches(1.0)
    set_table_borders(matrix_tbl, border_color="CBD5E1")
    
    headers = ["CRediT Contributor Role", "Sreegokul S", "Roopesh S N", "Ram Sakthi S M", "Sanjeev K P", "Saravana K M"]
    for idx, h in enumerate(headers):
        cell = matrix_tbl.cell(0, idx)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=25, bottom=25, left=30, right=30)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if idx > 0 else WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(7.8)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    for r_idx, r_data in enumerate(roles, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            cell = matrix_tbl.cell(r_idx, c_idx)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=18, bottom=18, left=30, right=30)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx > 0 else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.size = Pt(7.8)
            if val == "✓":
                r.font.bold = True
                r.font.color.rgb = RGBColor(2, 132, 199)
                
    # Affirmation
    p_aff = doc.add_paragraph()
    p_aff.paragraph_format.space_before = Pt(5)
    p_aff.paragraph_format.space_after = Pt(0)
    r_aff = p_aff.add_run(
        "All authors have read, reviewed, and approved the final submitted manuscript and agree with the author contributions listed above."
    )
    r_aff.font.italic = True
    r_aff.font.size = Pt(8.5)
    r_aff.font.color.rgb = RGBColor(71, 85, 105)
    
    for path in paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        doc.save(path)
        print(f"Author Statement saved to: {path}")

# ═════════════════════════════════════════════════════════════════════════════
# DOCUMENT 2: COVER LETTER
# ═════════════════════════════════════════════════════════════════════════════
def generate_cover_letter(paths):
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.45)
        s.bottom_margin = Inches(0.45)
        s.left_margin = Inches(0.60)
        s.right_margin = Inches(0.60)
        
    style = doc.styles['Normal']
    style.font.name = 'Times New Roman'
    style.font.size = Pt(9.3)
    style.font.color.rgb = RGBColor(15, 23, 42)
    style.paragraph_format.line_spacing = 1.12
    style.paragraph_format.space_after = Pt(3.0)
    style.paragraph_format.space_before = Pt(0)
    
    # Sender Header (2 columns or compact block)
    header_tbl = doc.add_table(rows=1, cols=2)
    header_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_tbl.columns[0].width = Inches(4.5)
    header_tbl.columns[1].width = Inches(2.8)
    set_horizontal_rule(header_tbl, border_color="0F172A")
    
    c0 = header_tbl.cell(0, 0)
    c1 = header_tbl.cell(0, 1)
    set_cell_margins(c0, top=25, bottom=25, left=40, right=40)
    set_cell_margins(c1, top=25, bottom=25, left=40, right=40)
    
    p0 = c0.paragraphs[0]
    p0.paragraph_format.space_after = Pt(0)
    r0_h = p0.add_run("Roopesh S N / Sreegokul S\n")
    r0_h.font.bold = True
    p0.add_run("Department of Computer Science and Engineering (IoT & Cyber Security)\nSNS College of Engineering, Coimbatore - 641035, Tamil Nadu, India")
    
    p1 = c1.paragraphs[0]
    p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p1.paragraph_format.space_after = Pt(0)
    p1.add_run(f"Date: {datetime.now().strftime('%B %d, %Y')}\n")
    r_corr = p1.add_run("Corresponding Submission\n")
    r_corr.font.italic = True
    p1.add_run("Email: author.correspondence@snsgroups.com")
    
    # Recipient
    p_to = doc.add_paragraph()
    p_to.paragraph_format.space_before = Pt(5)
    p_to.paragraph_format.space_after = Pt(3)
    r_to1 = p_to.add_run("To: The Editor-in-Chief / Editorial Board")
    r_to1.font.bold = True
    
    # Subject Line
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(2)
    p_sub.paragraph_format.space_after = Pt(4)
    r_sub = p_sub.add_run("Subject: Submission of Research Article — \"ShadowAI Detection Pipeline: Browser-Level Detection and Risk Assessment of Unauthorized AI Usage\"")
    r_sub.font.bold = True
    r_sub.font.size = Pt(9.6)
    
    # Salutation
    p_sal = doc.add_paragraph()
    p_sal.paragraph_format.space_after = Pt(3)
    p_sal.add_run("Dear Editor-in-Chief and Esteemed Editorial Board Members,")
    
    # Body Paragraphs
    p1 = doc.add_paragraph()
    p1.add_run(
        "We are pleased to submit our original research manuscript titled "
    )
    r1_b = p1.add_run("\"ShadowAI Detection Pipeline: Browser-Level Detection and Risk Assessment of Unauthorized AI Usage\" ")
    r1_b.font.bold = True
    p1.add_run(
        "for consideration for publication as a regular research article. All co-authors have reviewed and approved this submission."
    )
    
    p2 = doc.add_paragraph()
    p2.add_run(
        "Motivation & Problem Statement: The rapid adoption of generative AI interfaces (ChatGPT, Claude, Gemini, Perplexity, Cohere) by enterprise employees has given rise to \"Shadow AI\"—unauthorized data submission that creates irreversible exfiltration risks because ingested prompts cannot be retracted. Existing enterprise safeguards rely on DNS blocklists (easily bypassed by unlisted/new tools) or SaaS discovery platforms (which expose leaks only post-egress). The underlying defensive failure is that existing tools inspect destinations rather than prompt content in real time."
    )
    
    p3 = doc.add_paragraph()
    p3.add_run(
        "Key Contributions & Technical Novelty: Our paper presents the Shadow AI Prompt Guardian (SENTINEL), a client-side Manifest V3 browser extension that intercepts prompts synchronously at the browser boundary before network transmission with zero latency. Core contributions include:"
    )
    
    bullets = [
        ("Multi-Layer Synchronous Interception: ", "A 6-layer pipeline hooking Fetch API, XMLHttpRequest (XHR), send-button clicks, Enter/Shift+Enter keydowns, form submissions, and MutationObserver for reactive SPAs."),
        ("Multi-Vector Engine & Shannon Entropy: ", "Combines high-precision regex for 10+ cloud platforms (AWS, GitHub, OpenAI, Stripe, Slack, Azure, Google, Twilio, GitLab), credential/PII patterns, Shannon entropy (H >= 4.0 bits/char on tokens >= 20 chars), and context-aware false-positive suppression."),
        ("Strict Client-Side Privacy: ", "Operates with zero external API calls, zero telemetry, and zero raw prompt persistence, ensuring enterprise compliance."),
        ("Empirical Rigor & Stress-Testing: ", "Achieved 1.00 accuracy, precision, recall, and F1 score on a 140-prompt categorized benchmark across five classes. A complementary 1,000-prompt combinatorial stress test achieved 95.4% accuracy, surfacing two reproducible, mechanistically characterized detection boundaries (label-style phrasing and query-context suppression).")
    ]
    for b_title, b_text in bullets:
        p_b = doc.add_paragraph()
        p_b.paragraph_format.left_indent = Inches(0.15)
        p_b.paragraph_format.space_after = Pt(1.8)
        r_bt = p_b.add_run("• " + b_title)
        r_bt.font.bold = True
        r_bt.font.size = Pt(8.8)
        r_bx = p_b.add_run(b_text)
        r_bx.font.size = Pt(8.8)
        
    p4 = doc.add_paragraph()
    p4.paragraph_format.space_before = Pt(2)
    p4.add_run(
        "Declarations: This manuscript is original, has not been published previously, and is not currently under consideration elsewhere. We declare no conflicts of interest. Suggested Reviewer Fields: Data Loss Prevention (DLP), Browser Security, Generative AI Governance, and Applied Security Analytics."
    )
    
    p_close = doc.add_paragraph()
    p_close.paragraph_format.space_before = Pt(4)
    p_close.paragraph_format.space_after = Pt(1)
    p_close.add_run("Thank you for your consideration.\n\nSincerely,")
    
    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_after = Pt(0)
    r_sig = p_sig.add_run(
        "Roopesh S N & Sreegokul S (On behalf of all authors: Sreegokul S., Roopesh S. N., Ram Sakthi Sharumathi M., Sanjeev Kumar P., Saravana Kumar M.)\n"
        "Department of Computer Science and Engineering (IoT & Cyber Security), SNS College of Engineering, Tamil Nadu, India"
    )
    r_sig.font.bold = True
    r_sig.font.size = Pt(8.5)
    
    for path in paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        doc.save(path)
        print(f"Cover Letter saved to: {path}")

# ═════════════════════════════════════════════════════════════════════════════
# DOCUMENT 3: DECLARATION OF INTEREST STATEMENT
# ═════════════════════════════════════════════════════════════════════════════
def generate_declaration_of_interest(paths):
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.45)
        s.bottom_margin = Inches(0.45)
        s.left_margin = Inches(0.60)
        s.right_margin = Inches(0.60)
        
    style = doc.styles['Normal']
    style.font.name = 'Times New Roman'
    style.font.size = Pt(9.5)
    style.font.color.rgb = RGBColor(15, 23, 42)
    style.paragraph_format.line_spacing = 1.12
    style.paragraph_format.space_after = Pt(2.5)
    style.paragraph_format.space_before = Pt(0)
    
    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(1)
    r_title = p_title.add_run("Declaration of Competing Interests")
    r_title.font.bold = True
    r_title.font.size = Pt(14)
    r_title.font.color.rgb = RGBColor(15, 23, 42)
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(6)
    r_sub = p_sub.add_run("Declaration of Interest Statement (ICMJE / Elsevier Guidelines)")
    r_sub.font.italic = True
    r_sub.font.size = Pt(9.5)
    r_sub.font.color.rgb = RGBColor(71, 85, 105)
    
    # Manuscript Details Block
    detail_tbl = doc.add_table(rows=2, cols=2)
    detail_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    detail_tbl.columns[0].width = Inches(1.4)
    detail_tbl.columns[1].width = Inches(5.9)
    set_horizontal_rule(detail_tbl, border_color="0F172A")
    
    details = [
        ("Manuscript:", "ShadowAI Detection Pipeline: Browser-Level Detection and Risk Assessment of Unauthorized AI Usage"),
        ("Authors & Inst.:", "Sreegokul S., Roopesh S. N., Ram Sakthi Sharumathi M., Sanjeev Kumar P., Saravana Kumar M.  |  Department of Computer Science and Engineering (IoT & Cyber Security), SNS College of Engineering, Tamil Nadu, India")
    ]
    for idx, (label, val) in enumerate(details):
        c0, c1 = detail_tbl.cell(idx, 0), detail_tbl.cell(idx, 1)
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, top=35, bottom=35, left=60, right=60)
        set_cell_margins(c1, top=35, bottom=35, left=60, right=60)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(label)
        r0.font.bold = True
        r0.font.size = Pt(8.8)
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(val)
        r1.font.size = Pt(8.8)
        
    # Mandatory Elsevier / COPE Checklist Option
    box = doc.add_table(rows=1, cols=1)
    box.alignment = WD_TABLE_ALIGNMENT.CENTER
    box.columns[0].width = Inches(7.3)
    cell = box.cell(0, 0)
    set_cell_background(cell, "F0FDF4") # Subtle green tint
    set_cell_margins(cell, top=50, bottom=50, left=80, right=80)
    
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="16A34A"/>'
        f'<w:left w:val="single" w:sz="16" w:space="0" w:color="16A34A"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="16A34A"/>'
        f'<w:right w:val="single" w:sz="6" w:space="0" w:color="16A34A"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)
    
    p_b1 = cell.paragraphs[0]
    p_b1.paragraph_format.space_after = Pt(2)
    r_b1 = p_b1.add_run("[X] Declarations of interest: NONE")
    r_b1.font.bold = True
    r_b1.font.size = Pt(10)
    r_b1.font.color.rgb = RGBColor(22, 101, 52)
    
    p_b2 = cell.add_paragraph()
    p_b2.paragraph_format.space_after = Pt(0)
    r_b2 = p_b2.add_run(
        "The authors declare that they have no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper."
    )
    r_b2.font.size = Pt(9.2)
    r_b2.font.color.rgb = RGBColor(15, 23, 42)
    
    # Detailed Disclosures
    p_det_h = doc.add_paragraph()
    p_det_h.paragraph_format.space_before = Pt(6)
    p_det_h.paragraph_format.space_after = Pt(2.5)
    r_dh = p_det_h.add_run("Detailed Declarations & Disclosure Categories:")
    r_dh.font.bold = True
    r_dh.font.size = Pt(10)
    
    disclosures = [
        ("Financial Interests & Funding: ", "The authors declare that they have not received any commercial, private, or corporate research funding, honoraria, consultancy fees, or commercial sponsorship from third parties related to the development, evaluation, or benchmarking of the Shadow AI Prompt Guardian system."),
        ("Employment & Affiliations: ", "All authors are affiliated with SNS College of Engineering, Tamil Nadu, India. The authors maintain no current or past employment, advisory, or governing relationships with any commercial generative-AI platform vendors (such as OpenAI, Anthropic, Google, Perplexity AI, or Cohere) or DLP security software vendors mentioned in this paper."),
        ("Intellectual Property & Patents: ", "The authors declare that no patent applications, proprietary commercial software licenses, or commercial licensing agreements are currently pending or hold financial stake in the outcome of this published research."),
        ("Non-Financial & Personal Competing Interests: ", "The authors declare no personal, political, religious, academic, or professional affiliations that could be perceived as biasing the empirical findings, stress-test methodology, or failure mode analysis reported in this manuscript.")
    ]
    for d_title, d_text in disclosures:
        p_d = doc.add_paragraph()
        p_d.paragraph_format.left_indent = Inches(0.15)
        p_d.paragraph_format.space_after = Pt(2.0)
        r_dt = p_d.add_run("• " + d_title)
        r_dt.font.bold = True
        r_dt.font.size = Pt(8.8)
        r_dx = p_d.add_run(d_text)
        r_dx.font.size = Pt(8.8)
        
    # Sign-off Confirmation Table
    p_sig_h = doc.add_paragraph()
    p_sig_h.paragraph_format.space_before = Pt(5)
    p_sig_h.paragraph_format.space_after = Pt(2.5)
    r_sh = p_sig_h.add_run("Author Sign-Off and Certification:")
    r_sh.font.bold = True
    r_sh.font.size = Pt(10)
    
    sig_tbl = doc.add_table(rows=6, cols=4)
    sig_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_tbl.columns[0].width = Inches(1.8)
    sig_tbl.columns[1].width = Inches(2.4)
    sig_tbl.columns[2].width = Inches(1.6)
    sig_tbl.columns[3].width = Inches(1.5)
    set_table_borders(sig_tbl, border_color="CBD5E1")
    
    sig_headers = ["Author Name", "Affiliation", "Status / Role", "Declaration Date"]
    for idx, sh in enumerate(sig_headers):
        cell = sig_tbl.cell(0, idx)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=25, bottom=25, left=35, right=35)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if idx > 1 else WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(sh)
        r.font.bold = True
        r.font.size = Pt(8.0)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    authors_data = [
        ("Sreegokul S", "SNS College of Engineering", "Author / Researcher", "September 2026"),
        ("Roopesh S N", "SNS College of Engineering", "Author / Researcher", "September 2026"),
        ("Ram Sakthi Sharumathi M", "SNS College of Engineering", "Author / Researcher", "September 2026"),
        ("Sanjeev Kumar P", "SNS College of Engineering", "Author / Researcher", "September 2026"),
        ("Saravana Kumar M", "SNS College of Engineering", "Author / Faculty Mentor", "September 2026")
    ]
    for r_idx, r_data in enumerate(authors_data, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(r_data):
            cell = sig_tbl.cell(r_idx, c_idx)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=20, bottom=20, left=35, right=35)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx > 1 else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.size = Pt(8.0)
            if c_idx == 0:
                r.font.bold = True
                
    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(4)
    p_end.paragraph_format.space_after = Pt(0)
    r_end = p_end.add_run(
        "By submitting this document, the corresponding author certifies that all co-authors have reviewed and affirmed this declaration of competing interests."
    )
    r_end.font.italic = True
    r_end.font.size = Pt(8.2)
    r_end.font.color.rgb = RGBColor(100, 116, 139)
    
    for path in paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        doc.save(path)
        print(f"Declaration of Interest saved to: {path}")

if __name__ == "__main__":
    downloads_dir = r"C:\Users\thero\Downloads"
    workspace_dir = r"c:\Users\thero\shadow-ai-prompt-guardian"
    
    # 1. Author Statement
    p1 = [os.path.join(downloads_dir, "Author_Statement.docx"), os.path.join(workspace_dir, "Author_Statement.docx")]
    generate_author_statement(p1)
    
    # 2. Cover Letter
    p2 = [os.path.join(downloads_dir, "Cover_Letter.docx"), os.path.join(workspace_dir, "Cover_Letter.docx")]
    generate_cover_letter(p2)
    
    # 3. Declaration of Interest
    p3 = [os.path.join(downloads_dir, "Declaration_of_Interest_Statement.docx"), os.path.join(workspace_dir, "Declaration_of_Interest_Statement.docx")]
    generate_declaration_of_interest(p3)
