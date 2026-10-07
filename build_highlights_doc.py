"""
build_highlights_doc.py
=======================
Generates a publication-grade, 1-page executive summary / project highlights
Word document (.docx) based on the journal paper:
"ShadowAI Detection Pipeline: Browser-Level Detection and Risk Assessment of Unauthorized AI Usage"
for project SHADOW AI PROMPT GUARDIAN (SENTINEL).
"""

import os
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

def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
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

def set_cell_border(cell, **kwargs):
    """
    kwargs: top, bottom, left, right
    values: dict(val='single', sz='4', color='CBD5E1', space='0')
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    for edge in ('top', 'left', 'bottom', 'right'):
        edge_data = kwargs.get(edge)
        if edge_data:
            b_xml = parse_xml(
                f'<w:{edge} {nsdecls("w")} w:val="{edge_data.get("val", "single")}" '
                f'w:sz="{edge_data.get("sz", "4")}" w:space="0" '
                f'w:color="{edge_data.get("color", "CBD5E1")}"/>'
            )
            tcBorders.append(b_xml)
        else:
            b_xml = parse_xml(f'<w:{edge} {nsdecls("w")} w:val="none"/>')
            tcBorders.append(b_xml)
    tcPr.append(tcBorders)

def set_table_borders_none(table):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="none"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def set_table_borders_custom(table, border_color="CBD5E1"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{border_color}"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def make_callout_box(doc, bg_color="F8FAFC", border_color="0284C7", border_sz="12"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(7.4)
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=65, bottom=65, left=120, right=120)
    set_cell_border(cell, 
                    left=dict(val="single", sz=border_sz, color=border_color),
                    top=dict(val="single", sz="4", color="E2E8F0"),
                    right=dict(val="single", sz="4", color="E2E8F0"),
                    bottom=dict(val="single", sz="4", color="E2E8F0"))
    return cell

def create_highlights_document(output_paths):
    doc = docx.Document()
    
    # Page Setup: Letter, 0.40" Top/Bottom, 0.55" Left/Right margins for clean 1-page fit
    for section in doc.sections:
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
        section.top_margin = Inches(0.40)
        section.bottom_margin = Inches(0.40)
        section.left_margin = Inches(0.55)
        section.right_margin = Inches(0.55)
        section.header_distance = Inches(0.2)
        section.footer_distance = Inches(0.2)
    
    # Set default style font
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(9.2)
    normal_style.font.color.rgb = RGBColor(30, 41, 59) # Slate 800
    normal_style.paragraph_format.line_spacing = 1.12
    normal_style.paragraph_format.space_after = Pt(2.5)
    normal_style.paragraph_format.space_before = Pt(0)
    
    # ==========================================
    # 1. HEADER BANNER
    # ==========================================
    header_table = doc.add_table(rows=1, cols=1)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_table.autofit = False
    header_table.columns[0].width = Inches(7.4)
    h_cell = header_table.cell(0, 0)
    set_cell_background(h_cell, "0F172A") # Deep Navy / Slate 900
    set_cell_margins(h_cell, top=95, bottom=85, left=140, right=140)
    set_cell_border(h_cell, 
                    bottom=dict(val="single", sz="16", color="0284C7"), # Cyan accent underline
                    top=dict(val="none"), left=dict(val="none"), right=dict(val="none"))
    
    p_badge = h_cell.paragraphs[0]
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_badge.paragraph_format.space_after = Pt(1)
    r_badge = p_badge.add_run("PROJECT HIGHLIGHTS & EXECUTIVE SUMMARY")
    r_badge.font.name = 'Calibri'
    r_badge.font.size = Pt(8.0)
    r_badge.font.bold = True
    r_badge.font.color.rgb = RGBColor(56, 189, 248) # Sky 400
    
    p_title = h_cell.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(2)
    r_title = p_title.add_run("Shadow AI Prompt Guardian (SENTINEL)")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(14.5)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(255, 255, 255)
    
    p_sub = h_cell.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(3)
    r_sub = p_sub.add_run("Browser-Level Real-Time Detection and Risk Assessment of Unauthorized AI Usage")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(9.5)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(203, 213, 225) # Slate 300
    
    p_meta = h_cell.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.space_after = Pt(0)
    r_meta1 = p_meta.add_run("Authors: ")
    r_meta1.font.bold = True
    r_meta1.font.size = Pt(8.2)
    r_meta1.font.color.rgb = RGBColor(148, 163, 184)
    r_meta2 = p_meta.add_run("Sreegokul S., Roopesh S. N., Ram Sakthi Sharumathi M., Sanjeev Kumar P., Saravana Kumar M.  |  ")
    r_meta2.font.size = Pt(8.2)
    r_meta2.font.color.rgb = RGBColor(226, 232, 240)
    r_meta3 = p_meta.add_run("Affiliation: ")
    r_meta3.font.bold = True
    r_meta3.font.size = Pt(8.2)
    r_meta3.font.color.rgb = RGBColor(148, 163, 184)
    r_meta4 = p_meta.add_run("Dept. of CSE (IoT & Cyber Security), SNS College of Engineering, Tamil Nadu, India")
    r_meta4.font.size = Pt(8.2)
    r_meta4.font.color.rgb = RGBColor(226, 232, 240)

    # Spacing between header and content
    p_sep = doc.add_paragraph()
    p_sep.paragraph_format.space_before = Pt(2.5)
    p_sep.paragraph_format.space_after = Pt(1.5)
    p_sep.paragraph_format.line_spacing = Pt(1)

    # ==========================================
    # 2. PROBLEM & CORE INNOVATION CALLOUT
    # ==========================================
    prob_cell = make_callout_box(doc, bg_color="F8FAFC", border_color="0284C7", border_sz="14")
    p_p1 = prob_cell.paragraphs[0]
    p_p1.paragraph_format.space_after = Pt(2)
    r_p_h = p_p1.add_run("THE CORE PROBLEM & OUR PARADIGM SHIFT: ")
    r_p_h.font.bold = True
    r_p_h.font.size = Pt(8.8)
    r_p_h.font.color.rgb = RGBColor(2, 132, 199) # Blue accent
    r_p_t = p_p1.add_run(
        "\"Shadow AI\"—unauthorized employee use of public generative-AI interfaces (ChatGPT, Claude, Gemini, Perplexity, Cohere)—creates an irreversible data-leakage risk because submitted information cannot be recalled once ingested by external models. Existing enterprise DLP relies on domain blocklists (easily bypassed by unlisted tools) or SaaS discovery platforms (which expose breaches only after data has already escaped). "
    )
    r_p_t.font.size = Pt(8.7)
    
    r_p_t2 = p_p1.add_run(
        "Our Solution: A privacy-preserving Manifest V3 browser extension that performs synchronous, pre-transmission content inspection at the browser boundary, intercepting sensitive prompts before network egress with zero cloud dependency."
    )
    r_p_t2.font.bold = True
    r_p_t2.font.size = Pt(8.7)
    r_p_t2.font.color.rgb = RGBColor(15, 23, 42)

    # Spacing
    p_sep2 = doc.add_paragraph()
    p_sep2.paragraph_format.space_before = Pt(2)
    p_sep2.paragraph_format.space_after = Pt(2)
    p_sep2.paragraph_format.line_spacing = Pt(1)

    # ==========================================
    # 3. TWO-COLUMN DASHBOARD: ARCHITECTURE & RESULTS
    # ==========================================
    grid_tbl = doc.add_table(rows=1, cols=2)
    grid_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    grid_tbl.autofit = False
    grid_tbl.columns[0].width = Inches(3.63)
    grid_tbl.columns[1].width = Inches(3.63)
    set_table_borders_none(grid_tbl)
    
    col1 = grid_tbl.cell(0, 0)
    col2 = grid_tbl.cell(0, 1)
    
    # Style Col 1 (Architecture)
    set_cell_background(col1, "FFFFFF")
    set_cell_margins(col1, top=40, bottom=40, left=60, right=60)
    set_cell_border(col1, 
                    top=dict(val="single", sz="6", color="0284C7"),
                    left=dict(val="single", sz="4", color="E2E8F0"),
                    right=dict(val="single", sz="4", color="E2E8F0"),
                    bottom=dict(val="single", sz="4", color="E2E8F0"))
    
    p_c1_h = col1.paragraphs[0]
    p_c1_h.paragraph_format.space_after = Pt(3)
    r_c1_h = p_c1_h.add_run("SYSTEM ARCHITECTURE & ENGINE")
    r_c1_h.font.bold = True
    r_c1_h.font.size = Pt(9.5)
    r_c1_h.font.color.rgb = RGBColor(15, 23, 42)
    
    c1_bullets = [
        ("6-Layer Interception: ", "Monitors Fetch API, XMLHttpRequest (XHR), send-button clicks, Enter/Shift+Enter keydowns, form submissions, and MutationObserver for dynamic SPAs."),
        ("Multi-Tier Secret Detection: ", "Regex signatures for AWS (AKIA...), GitHub (ghp_...), OpenAI (sk-...), Stripe (sk_live_...), Slack, Azure, Google OAuth, Twilio, and GitLab."),
        ("Credentials & PII Recognition: ", "Identifies Basic/Bearer auth tokens, password assignments, emails, phone numbers, SSNs, and IPv4/IPv6 addresses."),
        ("Shannon Entropy Analysis: ", "Calculates character probability H = -∑ P(xᵢ) log₂(P(xᵢ)) to flag unclassified high-randomness tokens (≥20 chars, H ≥ 4.0 bits/char)."),
        ("False-Positive Suppression: ", "Context-aware scoring downweights educational queries (e.g., 'what is an API key') and legitimate code block references."),
        ("100% Privacy-Preserving: ", "Purely client-side execution; zero telemetry, zero external network calls, and masked audit logs only (e.g., AKIA••••••••••••LE).")
    ]
    
    for title, desc in c1_bullets:
        p_b = col1.add_paragraph()
        p_b.paragraph_format.space_after = Pt(2.2)
        p_b.paragraph_format.line_spacing = 1.10
        r_bt = p_b.add_run("• " + title)
        r_bt.font.bold = True
        r_bt.font.size = Pt(8.4)
        r_bt.font.color.rgb = RGBColor(30, 41, 59)
        r_bd = p_b.add_run(desc)
        r_bd.font.size = Pt(8.2)
        r_bd.font.color.rgb = RGBColor(71, 85, 105)

    # Style Col 2 (Empirical Results)
    set_cell_background(col2, "FFFFFF")
    set_cell_margins(col2, top=40, bottom=40, left=60, right=60)
    set_cell_border(col2, 
                    top=dict(val="single", sz="6", color="16A34A"), # Green top accent
                    left=dict(val="single", sz="4", color="E2E8F0"),
                    right=dict(val="single", sz="4", color="E2E8F0"),
                    bottom=dict(val="single", sz="4", color="E2E8F0"))
    
    p_c2_h = col2.paragraphs[0]
    p_c2_h.paragraph_format.space_after = Pt(3)
    r_c2_h = p_c2_h.add_run("EMPIRICAL BENCHMARKS & FINDINGS")
    r_c2_h.font.bold = True
    r_c2_h.font.size = Pt(9.5)
    r_c2_h.font.color.rgb = RGBColor(15, 23, 42)
    
    c2_bullets = [
        ("Primary 140-Prompt Test: ", "Evaluated across 5 realistic enterprise classes: Clean (45), API Key (30), PII (23), Confidential Terms (23), Password (19)."),
        ("Flawless Categorized Metrics: ", "Achieved 1.00 Accuracy, 1.00 Precision, 1.00 Recall, and 1.00 F1-score across all 5 categories with zero false positives/negatives."),
        ("1,000-Prompt Adversarial Stress Test: ", "Combinatorially generated via 15 verb templates × 15 technical contexts × 8 credential formats to test boundary conditions."),
        ("At-Scale Stress-Test Accuracy: ", "Achieved 95.4% accuracy (954 / 1,000 True Positives correctly intercepted; 46 False Negatives) at high combinatorial complexity."),
        ("Mechanistic Failure Characterization: ", "Quantified two root causes: (1) label-style secret phrasing lacking '=' operator; (2) context score suppression on query-style debugging prefixes."),
        ("Production Latency: ", "Synchronous in-browser execution introduces no human-perceptible input lag across ChatGPT, Claude, Gemini, Perplexity, and Cohere.")
    ]
    
    for title, desc in c2_bullets:
        p_b = col2.add_paragraph()
        p_b.paragraph_format.space_after = Pt(2.2)
        p_b.paragraph_format.line_spacing = 1.10
        r_bt = p_b.add_run("• " + title)
        r_bt.font.bold = True
        r_bt.font.size = Pt(8.4)
        r_bt.font.color.rgb = RGBColor(22, 101, 52) # Dark green
        r_bd = p_b.add_run(desc)
        r_bd.font.size = Pt(8.2)
        r_bd.font.color.rgb = RGBColor(71, 85, 105)

    # Spacing
    p_sep3 = doc.add_paragraph()
    p_sep3.paragraph_format.space_before = Pt(2)
    p_sep3.paragraph_format.space_after = Pt(2)
    p_sep3.paragraph_format.line_spacing = Pt(1)

    # ==========================================
    # 4. QUANTITATIVE PERFORMANCE SUMMARY TABLE
    # ==========================================
    p_tbl_lbl = doc.add_paragraph()
    p_tbl_lbl.paragraph_format.space_after = Pt(1.5)
    r_tl = p_tbl_lbl.add_run("SUMMARY TABLE: EVALUATION DATASET PERFORMANCE COMPARISON")
    r_tl.font.bold = True
    r_tl.font.size = Pt(8.8)
    r_tl.font.color.rgb = RGBColor(15, 23, 42)
    
    eval_tbl = doc.add_table(rows=3, cols=6)
    eval_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    eval_tbl.autofit = False
    
    col_widths = [Inches(1.5), Inches(0.7), Inches(1.8), Inches(0.8), Inches(0.8), Inches(1.8)]
    for row in eval_tbl.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = width
            
    set_table_borders_custom(eval_tbl, border_color="CBD5E1")
    
    headers = ["Evaluation Scope", "Prompts", "Categories Evaluated", "Accuracy", "Recall / F1", "Key Empirical Outcome"]
    for i, title in enumerate(headers):
        cell = eval_tbl.cell(0, i)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=40, bottom=40, left=60, right=60)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(title)
        r.font.bold = True
        r.font.size = Pt(7.8)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    table_data = [
        ("Primary Categorized Dataset", "140", "Clean (45), API Keys (30), PII (23), Terms (23), Pwd (19)", "100.0%", "1.00 / 1.00", "Zero FP & Zero FN; flawless syntactic secret & PII classification."),
        ("Large-Scale Stress Test", "1,000", "API keys, passwords, internal tools across 15×15×8 templates", "95.4%", "95.4% / —", "Surfaced 46 FN: label-style formats & query-context suppression.")
    ]
    
    for row_idx, row_vals in enumerate(table_data, start=1):
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, val in enumerate(row_vals):
            cell = eval_tbl.cell(row_idx, col_idx)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=35, bottom=35, left=60, right=60)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            
            if col_idx in (1, 3, 4):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                
            r = p.add_run(val)
            r.font.size = Pt(7.8)
            if col_idx in (3, 4):
                r.font.bold = True
                r.font.color.rgb = RGBColor(16, 185, 129) if "100" in val else RGBColor(2, 132, 199)
            elif col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = RGBColor(15, 23, 42)
            else:
                r.font.color.rgb = RGBColor(71, 85, 105)

    # Spacing
    p_sep4 = doc.add_paragraph()
    p_sep4.paragraph_format.space_before = Pt(2)
    p_sep4.paragraph_format.space_after = Pt(2)
    p_sep4.paragraph_format.line_spacing = Pt(1)

    # ==========================================
    # 5. BOTTOM 2-COLUMN: DIFFERENTIATORS & FUTURE ROADMAP
    # ==========================================
    bot_tbl = doc.add_table(rows=1, cols=2)
    bot_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    bot_tbl.autofit = False
    bot_tbl.columns[0].width = Inches(3.63)
    bot_tbl.columns[1].width = Inches(3.63)
    set_table_borders_none(bot_tbl)
    
    b_col1 = bot_tbl.cell(0, 0)
    b_col2 = bot_tbl.cell(0, 1)
    
    # Left Bottom: Key Differentiators
    set_cell_background(b_col1, "F8FAFC")
    set_cell_margins(b_col1, top=40, bottom=40, left=70, right=70)
    set_cell_border(b_col1, 
                    top=dict(val="single", sz="6", color="0284C7"),
                    left=dict(val="single", sz="4", color="CBD5E1"),
                    right=dict(val="single", sz="4", color="CBD5E1"),
                    bottom=dict(val="single", sz="4", color="CBD5E1"))
    
    p_diff_h = b_col1.paragraphs[0]
    p_diff_h.paragraph_format.space_after = Pt(2)
    r_dh = p_diff_h.add_run("KEY INNOVATIONS & DIFFERENTIATORS")
    r_dh.font.bold = True
    r_dh.font.size = Pt(8.8)
    r_dh.font.color.rgb = RGBColor(2, 132, 199)
    
    differentiators = [
        ("Pre-Transmission Blocking: ", "Prevents irreversible leaks at keystroke/submit time; unlike DNS/SaaS discovery tools which only flag breaches after data has escaped."),
        ("Zero Network & Telemetry Footprint: ", "Does not transmit user prompts to any cloud server for inspection, meeting strict enterprise privacy & compliance standards."),
        ("Hybrid Heuristic & Entropy Engine: ", "Pairs high-precision deterministic regex rules with Shannon entropy to flag custom/unknown secret formats."),
        ("Multi-Platform Universal Coverage: ", "Shields ChatGPT, Claude, Gemini, Perplexity, and Cohere through unified DOM & API interception hooks.")
    ]
    for d_title, d_desc in differentiators:
        p_d = b_col1.add_paragraph()
        p_d.paragraph_format.space_after = Pt(1.8)
        p_d.paragraph_format.line_spacing = 1.08
        r_dt = p_d.add_run("✓ " + d_title)
        r_dt.font.bold = True
        r_dt.font.size = Pt(7.9)
        r_dt.font.color.rgb = RGBColor(15, 23, 42)
        r_dd = p_d.add_run(d_desc)
        r_dd.font.size = Pt(7.8)
        r_dd.font.color.rgb = RGBColor(71, 85, 105)

    # Right Bottom: Roadmap
    set_cell_background(b_col2, "F8FAFC")
    set_cell_margins(b_col2, top=40, bottom=40, left=70, right=70)
    set_cell_border(b_col2, 
                    top=dict(val="single", sz="6", color="6366F1"), # Indigo top accent
                    left=dict(val="single", sz="4", color="CBD5E1"),
                    right=dict(val="single", sz="4", color="CBD5E1"),
                    bottom=dict(val="single", sz="4", color="CBD5E1"))
    
    p_road_h = b_col2.paragraphs[0]
    p_road_h.paragraph_format.space_after = Pt(2)
    r_rh = p_road_h.add_run("LIMITATIONS & ENGINEERING ROADMAP")
    r_rh.font.bold = True
    r_rh.font.size = Pt(8.8)
    r_rh.font.color.rgb = RGBColor(99, 102, 241)
    
    roadmap_items = [
        ("Multi-Turn Context Window Analysis: ", "Aggregating conversational history across multiple messages to prevent slow-drip distributed data exfiltration."),
        ("Client-Side Document Scanning: ", "Extending inspection to file uploads (PDF, CSV, DOCX) directly in the browser before transfer."),
        ("Local ML Model Integration: ", "Embedding lightweight TensorFlow.js models for semantic & paraphrased leak detection beyond regex boundaries."),
        ("Tiered Severity Scoring: ", "Implementing graduated alert levels (Critical / Warning / Info) to streamline workflow and eliminate alert fatigue.")
    ]
    for r_title, r_desc in roadmap_items:
        p_r = b_col2.add_paragraph()
        p_r.paragraph_format.space_after = Pt(1.8)
        p_r.paragraph_format.line_spacing = 1.08
        r_rt = p_r.add_run("→ " + r_title)
        r_rt.font.bold = True
        r_rt.font.size = Pt(7.9)
        r_rt.font.color.rgb = RGBColor(15, 23, 42)
        r_rd = p_r.add_run(r_desc)
        r_rd.font.size = Pt(7.8)
        r_rd.font.color.rgb = RGBColor(71, 85, 105)

    # ==========================================
    # 6. COMPACT FOOTER BAR
    # ==========================================
    p_foot = doc.add_paragraph()
    p_foot.paragraph_format.space_before = Pt(4)
    p_foot.paragraph_format.space_after = Pt(0)
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_foot = p_foot.add_run("Shadow AI Prompt Guardian (SENTINEL)  |  Manifest V3 Chrome Extension  |  Academic Journal Publication Highlights  |  Page 1 of 1")
    r_foot.font.size = Pt(7.4)
    r_foot.font.color.rgb = RGBColor(148, 163, 184)

    # Save to all destination paths
    for path in output_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        doc.save(path)
        print(f"Saved document to: {path}")

if __name__ == "__main__":
    out1 = r"c:\Users\thero\shadow-ai-prompt-guardian\Project_Highlights.docx"
    out2 = r"C:\Users\thero\Downloads\Project_Highlights.docx"
    create_highlights_document([out1, out2])
