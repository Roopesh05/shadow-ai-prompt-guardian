import sys

try:
    from report_builder.styles import REPORT_CSS
    print("styles: OK")
except Exception as e:
    print("styles error:", e)

try:
    from report_builder.front_matter import get_front_matter_html
    res = get_front_matter_html()
    print("front_matter: OK, len =", len(res))
except Exception as e:
    print("front_matter error:", e)

try:
    from report_builder.chapters_intro_reqs import get_chapters_1_to_5_html
    res = get_chapters_1_to_5_html()
    print("chapters_intro_reqs: OK, len =", len(res))
except Exception as e:
    print("chapters_intro_reqs error:", e)

try:
    from report_builder.chapters_design_impl import get_chapters_6_to_10_html
    res = get_chapters_6_to_10_html()
    print("chapters_design_impl: OK, len =", len(res))
except Exception as e:
    print("chapters_design_impl error:", e)

try:
    from report_builder.chapters_eval_conc import get_chapters_11_to_14_html
    res = get_chapters_11_to_14_html()
    print("chapters_eval_conc: OK, len =", len(res))
except Exception as e:
    print("chapters_eval_conc error:", e)

try:
    from report_builder.appendices_refs import get_appendices_and_references_html
    res = get_appendices_and_references_html()
    print("appendices_refs: OK, len =", len(res))
except Exception as e:
    print("appendices_refs error:", e)
