REPORT_CSS = """
@page {
    size: A4 portrait;
    margin: 1in;
    @bottom-center {
        content: "";
    }
}

*, *::before, *::after {
    box-sizing: border-box;
}

body {
    font-family: 'Times New Roman', 'TeX Gyre Termes', 'Nimbus Roman No9 L', serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #111827;
    background: #ffffff;
    margin: 0;
    padding: 0;
}

p {
    text-align: justify;
    text-justify: inter-word;
    margin-top: 0;
    margin-bottom: 12pt;
    line-height: 1.5;
}

h1.chapter-title {
    font-size: 17pt;
    font-weight: bold;
    text-align: center;
    margin-top: 24pt;
    margin-bottom: 8pt;
    text-transform: capitalize;
}

h2.chapter-subtitle {
    font-size: 17pt;
    font-weight: bold;
    text-align: center;
    margin-top: 0;
    margin-bottom: 24pt;
    text-transform: capitalize;
}

h2.section-heading {
    font-size: 14pt;
    font-weight: bold;
    margin-top: 20pt;
    margin-bottom: 10pt;
    text-align: left;
    page-break-after: avoid;
}

h3.subsection-heading {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 14pt;
    margin-bottom: 6pt;
    text-align: left;
    page-break-after: avoid;
}

h4.subsubsection-heading {
    font-size: 11.5pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 10pt;
    margin-bottom: 4pt;
    text-align: left;
    page-break-after: avoid;
}

ul, ol {
    margin-top: 0;
    margin-bottom: 12pt;
    padding-left: 28pt;
}

li {
    text-align: justify;
    margin-bottom: 6pt;
    line-height: 1.5;
}

.page-break {
    page-break-before: always;
    break-before: page;
}

.avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
}

/* ─── Table Styling ─── */
.table-container {
    width: 100%;
    margin: 18pt 0 14pt 0;
    page-break-inside: avoid;
    break-inside: avoid;
}

.table-caption {
    font-size: 11pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 6pt;
}

table.academic-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 auto;
    font-size: 10.5pt;
    line-height: 1.35;
}

table.academic-table th {
    border-top: 1.5pt solid #0f172a;
    border-bottom: 1.5pt solid #0f172a;
    padding: 6pt 8pt;
    text-align: left;
    font-weight: bold;
    background-color: #f8fafc;
}

table.academic-table td {
    border-bottom: 0.5pt solid #cbd5e1;
    padding: 5pt 8pt;
    text-align: left;
    vertical-align: top;
}

table.academic-table tr:last-child td {
    border-bottom: 1.5pt solid #0f172a;
}

/* ─── Figure Styling ─── */
.figure-container {
    width: 100%;
    text-align: center;
    margin: 18pt 0 14pt 0;
    page-break-inside: avoid;
    break-inside: avoid;
}

.figure-image {
    max-width: 95%;
    height: auto;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    margin-bottom: 8pt;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.figure-caption {
    font-size: 11pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 8pt;
}

.figure-explanation {
    font-size: 11pt;
    text-align: justify;
    line-height: 1.45;
    margin-top: 6pt;
    margin-bottom: 14pt;
}

/* ─── Code Listing ─── */
pre.code-listing {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 9.5pt;
    background-color: #f8fafc;
    border: 1pt solid #cbd5e1;
    border-radius: 4px;
    padding: 10pt;
    line-height: 1.4;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    margin-top: 6pt;
    margin-bottom: 14pt;
    page-break-inside: avoid;
    break-inside: avoid;
}

/* ─── Cover Page Specifics ─── */
.cover-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
}

.logo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24pt;
}

.logo-header img {
    height: 52pt;
    width: auto;
}

.cover-title {
    font-size: 20pt;
    font-weight: bold;
    letter-spacing: 0.5pt;
    margin-bottom: 6pt;
    text-transform: uppercase;
}

.cover-subtitle {
    font-size: 13pt;
    font-weight: bold;
    color: #334155;
    margin-bottom: 20pt;
}

.report-type {
    font-size: 13pt;
    font-weight: bold;
    margin-bottom: 18pt;
    letter-spacing: 0.5pt;
}

.submitted-by-label {
    font-size: 12pt;
    font-style: italic;
    margin-bottom: 10pt;
}

.students-table {
    margin: 0 auto 20pt auto;
    border-collapse: collapse;
    font-size: 12pt;
    line-height: 1.6;
}

.students-table td {
    padding: 2pt 12pt;
    border: none;
    font-weight: bold;
}

.fulfillment-text {
    font-size: 11.5pt;
    font-style: italic;
    margin-bottom: 6pt;
}

.degree-text {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 4pt;
}

.branch-text {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 16pt;
}

.college-text {
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 2pt;
}

.location-text {
    font-size: 12pt;
    font-weight: bold;
    margin-bottom: 14pt;
}

.date-text {
    font-size: 12pt;
    font-weight: bold;
}

/* ─── Bonafide Certificate Specifics ─── */
.bonafide-title {
    font-size: 15pt;
    font-weight: bold;
    text-align: center;
    margin-top: 16pt;
    margin-bottom: 20pt;
    letter-spacing: 0.5pt;
}

.certificate-body {
    font-size: 12pt;
    line-height: 1.7;
    text-align: justify;
    text-justify: inter-word;
    margin-bottom: 40pt;
}

.signature-grid {
    display: flex;
    justify-content: space-between;
    margin-top: 40pt;
    margin-bottom: 40pt;
}

.signature-block {
    width: 45%;
    font-size: 11.5pt;
    line-height: 1.4;
}

.viva-section {
    margin-top: 30pt;
    font-size: 11.5pt;
    line-height: 1.5;
}

.examiners-row {
    display: flex;
    justify-content: space-between;
    margin-top: 50pt;
    font-size: 12pt;
    font-weight: bold;
}

/* ─── Front Matter Lists ─── */
.front-matter-title {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-top: 10pt;
    margin-bottom: 24pt;
    text-transform: uppercase;
}

.toc-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11pt;
    line-height: 1.5;
}

.toc-table th {
    border-bottom: 1.5pt solid #0f172a;
    padding: 6pt 4pt;
    font-weight: bold;
    text-transform: uppercase;
}

.toc-table td {
    padding: 3.5pt 4pt;
    border-bottom: 0.5pt dotted #cbd5e1;
}

.toc-table tr.toc-chapter td {
    font-weight: bold;
    border-bottom: 1pt solid #94a3b8;
    padding-top: 8pt;
}

.toc-table td.toc-page {
    text-align: right;
    font-variant-numeric: tabular-nums;
}
"""
