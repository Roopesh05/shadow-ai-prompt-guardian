import re
import html

with open("SENTINEL_Project_Report.html", "r", encoding="utf-8") as f:
    raw_html = f.read()

# Extract body
body_match = re.search(r"<body>(.*?)</body>", raw_html, re.DOTALL)
body = body_match.group(1) if body_match else raw_html

# Clean transformations
md = re.sub(r'<h1 class="chapter-title">(.*?)</h1>\s*<h2 class="chapter-subtitle">(.*?)</h2>', r"\n# \1: \2\n", body)
md = re.sub(r'<h1 class="chapter-title"[^>]*>(.*?)</h1>', r"\n# \1\n", md)
md = re.sub(r'<div class="bonafide-title"[^>]*>(.*?)</div>', r"\n# \1\n", md)
md = re.sub(r'<div class="front-matter-title"[^>]*>(.*?)</div>', r"\n# \1\n", md)
md = re.sub(r'<h2 class="section-heading">(.*?)</h2>', r"\n## \1\n", md)
md = re.sub(r'<h3 class="subsection-heading">(.*?)</h3>', r"\n### \1\n", md)
md = re.sub(r'<div class="table-caption">(.*?)</div>', r"\n**\1**\n", md)
md = re.sub(r'<div class="figure-caption"[^>]*>(.*?)</div>', r"\n**\1**\n", md)
md = re.sub(r'<p[^>]*>(.*?)</p>', r"\1\n\n", md, flags=re.DOTALL)
md = re.sub(r"<strong>(.*?)</strong>", r"**\1**", md)
md = re.sub(r"<em>(.*?)</em>", r"*\1*", md)
md = re.sub(r"<code>(.*?)</code>", r"`\1`", md)
md = re.sub(r'<pre class="code-listing">\s*(.*?)\s*</pre>', r"\n```javascript\n\1\n```\n", md, flags=re.DOTALL)
md = re.sub(r"<li>(.*?)</li>", r"- \1", md)
md = re.sub(r'<div class="page-break"></div>', r"\n---\n", md)

# Strip remaining HTML tags
md = re.sub(r"<[^>]+>", " ", md)
md = html.unescape(md)
md = re.sub(r"[ \t]+", " ", md)
md = re.sub(r" \n", "\n", md)
md = re.sub(r"\n{3,}", "\n\n", md)

header = """# SHADOW AI PROMPT GUARDIAN — SENTINEL
## A Zero-Trust Client-Side Data Loss Prevention (DLP) and Sensitive Data Interception System for Generative AI Platforms
### A MINI PROJECT REPORT

**Submitted by:**
1. Ram Sakthi Sharumathi M (713324SB041)
2. Roopesh S N (713324SB044)
3. Sanjeevkumar P (713324SB046)
4. Saravana Kumar M (713324SB048)

**Degree:** Bachelor of Technology in Computer Science and Business Systems  
**Institution:** SNS College of Technology / SNS College of Engineering, Coimbatore 641035  
**Date:** November 2026  

---
"""

with open("SENTINEL_Project_Report.md", "w", encoding="utf-8") as f:
    f.write(header + md.strip())

print(f"Exported SENTINEL_Project_Report.md ({len(md):,} characters)")
