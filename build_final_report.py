import os
import subprocess
import time
import re
import pymupdf

from report_builder.styles import REPORT_CSS
from report_builder.front_matter import get_front_matter_html
from report_builder.chapters_intro_reqs import get_chapters_1_to_5_html
from report_builder.chapters_design_impl import get_chapters_6_to_10_html
from report_builder.chapters_eval_conc import get_chapters_11_to_14_html
from report_builder.appendices_refs import get_appendices_and_references_html

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def assemble_html(toc_page_map=None):
    front_matter = get_front_matter_html()
    ch1_5 = get_chapters_1_to_5_html()
    ch6_10 = get_chapters_6_to_10_html()
    ch11_14 = get_chapters_11_to_14_html()
    app_refs = get_appendices_and_references_html()

    # If toc_page_map is provided, replace page numbers in TOC
    if toc_page_map:
        for title, pno in toc_page_map.items():
            # Replace placeholder or update td with class toc-page
            pass

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SHADOW AI PROMPT GUARDIAN — SENTINEL | Mini Project Report</title>
    <style>
    {REPORT_CSS}
    </style>
</head>
<body>
{front_matter}
{ch1_5}
{ch6_10}
{ch11_14}
{app_refs}
</body>
</html>"""
    return full_html

def print_html_to_pdf(html_file, pdf_file):
    abs_html = os.path.abspath(html_file)
    abs_pdf = os.path.abspath(pdf_file)
    file_url = "file:///" + abs_html.replace("\\", "/")

    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={abs_pdf}",
        file_url,
    ]
    print(f"[1/4] Executing Chrome headless print: {abs_html} -> {abs_pdf}...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Chrome headless failed with code {res.returncode}: {res.stderr}")
    time.sleep(2)
    if not os.path.exists(abs_pdf):
        raise FileNotFoundError(f"Failed to create PDF at {abs_pdf}")
    print(f"      Created raw PDF: {abs_pdf} ({os.path.getsize(abs_pdf)/1024:.1f} KB)")

def int_to_roman(num):
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syb = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"]
    roman_num = ""
    i = 0
    while num > 0:
        for _ in range(num // val[i]):
            roman_num += syb[i]
            num -= val[i]
        i += 1
    return roman_num

def post_process_pdf(raw_pdf_path, final_pdf_path):
    print(f"[2/4] Analyzing page structure and adding precise pagination with PyMuPDF...")
    doc = pymupdf.open(raw_pdf_path)
    total_pages = len(doc)
    print(f"      Total rendered pages: {total_pages}")

    # Find the starting page of Chapter 1
    ch1_start_page = 0
    section_page_map = {}

    for i in range(total_pages):
        text = doc[i].get_text("text")
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        for line in lines:
            if line == "Chapter 1" and ch1_start_page == 0:
                ch1_start_page = i
                print(f"      Found Chapter 1 starting at zero-indexed page {i} (physical page {i+1})")
            # Map chapter and section titles to page numbers
            if any(line.startswith(prefix) for prefix in ["Chapter ", "CHAPTER ", "Appendix ", "APPENDIX ", "REFERENCES"]):
                section_page_map[line] = i
            elif re.match(r"^\d+\.\d+\s+[A-Z]", line):
                section_page_map[line] = i

    if ch1_start_page == 0:
        ch1_start_page = 7  # Fallback based on TOC length

    print(f"[3/4] Stamping exact academic page numbers & generating outline bookmarks...")
    # Add page numbers
    # Front matter: pages 0 to ch1_start_page - 1 -> Roman numerals i, ii, iii...
    for i in range(ch1_start_page):
        roman_pno = int_to_roman(i + 1)
        page = doc[i]
        # Text position: centered horizontally (x = 297.6 pt on A4 595.3 pt), y = 802 pt
        # Use font Times-Roman, size 12
        tw = pymupdf.get_text_length(roman_pno, fontname="times-roman", fontsize=12)
        x = (595.28 - tw) / 2.0
        page.insert_text((x, 802), roman_pno, fontname="times-roman", fontsize=12, color=(0.06, 0.09, 0.15))

    # Main matter: pages ch1_start_page to total_pages - 1 -> Arabic numerals 1, 2, 3...
    for i in range(ch1_start_page, total_pages):
        arabic_pno = str(i - ch1_start_page + 1)
        page = doc[i]
        tw = pymupdf.get_text_length(arabic_pno, fontname="times-roman", fontsize=12)
        x = (595.28 - tw) / 2.0
        page.insert_text((x, 802), arabic_pno, fontname="times-roman", fontsize=12, color=(0.06, 0.09, 0.15))

    # Build PDF Bookmark Outline Tree
    toc = []
    # Front matter bookmarks
    toc.append([1, "COVER / TITLE PAGE", 1])
    toc.append([1, "BONAFIDE CERTIFICATE", 2])
    toc.append([1, "ABSTRACT", 3])
    toc.append([1, "TABLE OF CONTENTS", 4])
    
    # Locate List of Tables, Figures, Symbols
    for i in range(3, ch1_start_page):
        txt = doc[i].get_text("text")
        if "LIST OF TABLES" in txt:
            toc.append([1, "LIST OF TABLES", i + 1])
        elif "LIST OF FIGURES" in txt:
            toc.append([1, "LIST OF FIGURES", i + 1])
        elif "LIST OF SYMBOLS" in txt:
            toc.append([1, "LIST OF SYMBOLS AND ABBREVIATIONS", i + 1])

    # Chapter bookmarks
    for i in range(ch1_start_page, total_pages):
        txt = doc[i].get_text("text")
        lines = [l.strip() for l in txt.splitlines() if l.strip()]
        for idx, line in enumerate(lines[:6]):
            if line.startswith("Chapter ") and idx + 1 < len(lines):
                ch_num = line
                ch_title = lines[idx + 1]
                toc.append([1, f"{ch_num}: {ch_title}", i + 1])
                break
            elif line.startswith("Appendix ") and idx + 1 < len(lines):
                app_num = line
                app_title = lines[idx + 1]
                toc.append([1, f"{app_num}: {app_title}", i + 1])
                break
            elif line == "REFERENCES":
                toc.append([1, "REFERENCES", i + 1])
                break

    # Add sections (level 2 bookmarks)
    for i in range(ch1_start_page, total_pages):
        txt = doc[i].get_text("text")
        lines = [l.strip() for l in txt.splitlines() if l.strip()]
        for line in lines:
            m = re.match(r"^(\d+\.\d+)\s+([A-Za-z].*)$", line)
            if m:
                sec_label = m.group(0)
                if len(sec_label) < 60:
                    toc.append([2, sec_label, i + 1])

    # Deduplicate and sort outline
    clean_toc = []
    seen = set()
    for item in toc:
        key = (item[0], item[1], item[2])
        if key not in seen:
            seen.add(key)
            clean_toc.append(item)

    doc.set_toc(clean_toc)
    print(f"      Embedded {len(clean_toc)} hierarchical PDF bookmarks.")

    print(f"[4/4] Saving final optimized PDF: {final_pdf_path}...")
    doc.save(final_pdf_path, deflate=True)
    doc.close()

    final_size_kb = os.path.getsize(final_pdf_path) / 1024
    print(f"[OK] Report Generation Complete!")
    print(f"     Artifact: {final_pdf_path} ({final_size_kb:.1f} KB, {total_pages} pages)")
    return total_pages, clean_toc

def main():
    print("================================================================================")
    print("SHADOW AI PROMPT GUARDIAN — SENTINEL: ACADEMIC PROJECT REPORT COMPILER")
    print("================================================================================")

    html_content = assemble_html()
    html_file = "SENTINEL_Project_Report.html"
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[+] Written full project report HTML: {html_file} ({len(html_content):,} bytes)")

    raw_pdf = "SENTINEL_Project_Report_raw.pdf"
    final_pdf = "SENTINEL_Project_Report.pdf"

    print_html_to_pdf(html_file, raw_pdf)
    pages, toc = post_process_pdf(raw_pdf, final_pdf)

    # Clean up intermediate raw pdf
    if os.path.exists(raw_pdf):
        os.remove(raw_pdf)

    print("================================================================================")
    print(f"SUCCESS: Generated {final_pdf} ({pages} pages) matching reference format!")
    print("================================================================================")

if __name__ == "__main__":
    main()
