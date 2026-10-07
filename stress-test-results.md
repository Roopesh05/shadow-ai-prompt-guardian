# Shadow AI Prompt Guardian — Large-Scale Combinatorial Stress-Test Report

**Generated:** 7/10/2026, 12:05:14 pm  
**Methodology:** Combinatorial crossing of 15 verb templates × 15 technical contexts × 8 credential styles (Section III-F)

## TABLE IV: Large-Scale Combinatorial Stress-Test Summary

| Metric | Value |
|:---|:---|
| Total prompts (distinct combinatorial generations) | 1000 |
| Correctly blocked (True Positives) | **954** |
| Missed (False Negatives) | **46** |
| **Accuracy** | **95.4%** |
| Categories covered | API keys, passwords, internal tool/service mentions |

## TABLE V: Failure Mode Breakdown

| Failure Pattern | Occurrences | Mechanism |
|:---|:---:|:---|
| **Label-style secret phrasing** | 28 | Regex requires an assignment operator (e.g., “password=”); a secret introduced as a label (e.g., “Secret: …”, “Authorization: Bearer …” with no “=”) is missed. |
| **Context-aware score suppression** | 18 | Query-style phrasing (e.g., “Help me debug…”) legitimately lowers false positives, but occasionally suppresses the score of a genuine secret below the block threshold. |

---
*Reproduces Table IV & Table V from the IEEE journal publication.*