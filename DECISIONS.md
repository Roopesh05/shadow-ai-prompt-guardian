# Shadow AI Prompt Guardian — Design Decisions

## 1. Architecture: Content Script + Detection Engine

**Decision:** Use a content script that intercepts form submissions, `fetch`, and `XHR` calls on target AI domains. The detection engine runs entirely in-browser with no external API calls.

**Rationale:**
- Content scripts have access to the DOM and can observe user interactions before data leaves the browser.
- Interception at the content script level ensures detection happens before encryption (TLS) wraps the request.
- No backend service means zero data exfiltration risk from the detection logic itself.
- Manifest V3 is the current Chrome standard and provides service worker support.

**Alternatives considered:**
- *Background service worker interception*: Would require `webRequest` permissions and can't easily access DOM text. Chosen content script approach for better DOM integration.
- *Proxy-based interception*: Would require user-installed proxy software. Too complex for a browser extension.
- *Server-side analysis*: Would transmit prompts to a server before blocking. Contradicts the privacy goal.

---

## 2. Detection Engine Design

**Decision:** Multi-layer detection combining regex patterns, Shannon entropy analysis, and configurable keyword matching.

**Rationale:**
- Regex patterns catch known key formats (AWS, GitHub, Stripe, etc.) with high precision.
- Shannon entropy detection catches unknown high-entropy tokens that don't match known patterns.
- Configurable keyword list lets users add organization-specific terms without code changes.
- Risk scoring with configurable threshold allows tuning between strictness and usability.

**Score weights:**
| Category | Weight | Rationale |
|----------|--------|-----------|
| API Key / Secret | 50 | Critical — keys in prompts are immediately exposed |
| Password / Credential | 50 | Critical — passwords should never leave the browser |
| PII (email, phone, SSN) | 50 | High — PII in AI prompts creates privacy liability |
| Confidential Term | 50 | Medium-High — org-specific terms vary by user |

**Threshold:** Default 30, allowing single high-severity findings to trigger a block while requiring multiple low-severity findings to reach the block threshold at higher settings.

---

## 3. Interception Strategy

**Decision:** Monkey-patch `fetch` and `XMLHttpRequest.prototype.send`, plus observe form `submit` events in capture phase.

**Rationale:**
- Most AI chat interfaces use `fetch` for API calls.
- Some older or custom implementations use XHR.
- Form submission interception catches direct HTML form posts.
- Capture phase ensures our handler runs before any other event listeners.

**SPA handling:** A `MutationObserver` re-scans for new forms after dynamic content loads, covering Single Page Applications like ChatGPT's React-based UI.

---

## 4. Warning UI Design

**Decision:** Show a fixed banner at the top of the page with category chips and action buttons. Text is highlighted with a wavy red underline. An overlay prevents interaction while the warning is visible.

**Rationale:**
- Top-of-page positioning is immediately visible without being intrusive.
- Category chips communicate what was found without revealing the literal secret value.
- "I'll fix it & resubmit" / "Cancel" buttons give the user control.
- The overlay prevents accidental form submission while the warning is displayed.
- Text highlighting in contenteditable elements helps users locate the offending text.

**Why not a popup?** A popup would require the user to click the extension icon, adding friction. The inline banner is non-blocking in terms of workflow — it appears where the user is already looking.

---

## 5. Privacy Guarantees

**Decision:** Zero data leaves the browser. No telemetry, no external API calls from the detection engine, no logging to remote servers.

**Implementation:**
- All detection logic runs in `detection-engine.js` on the client.
- Blocked attempt logs are stored in `chrome.storage.local` (browser-managed, never transmitted).
- Log entries store only masked previews (e.g., `AKIA••••••••••••••LE`), never raw secrets.
- Timestamps and categories are stored; raw prompt text is never persisted.

---

## 6. Test Dataset Design

**Decision:** 80 synthetic prompts split across 5 categories: 30 clean, 15 API key, 9 password, 13 PII, 13 confidential.

**Rationale:**
- Even distribution ensures no single category dominates accuracy metrics.
- Prompts are realistic — they look like things actual users would type.
- Mix of exact pattern matches and near-misses tests precision.
- Clean prompts include common false-positive traps (version numbers, decades, example IPs).

---

## 7. False Positive Management

**Decision:** Exclude common non-sensitive numeric patterns from detection:
- IP addresses in documentation contexts (e.g., `192.0.2.1` RFC documentation range)
- Version numbers (e.g., `2.1.3`)
- Decades (e.g., `1990s`)

**Rationale:** These patterns can coincidentally match regexes but are not sensitive. The current implementation flags IPs as PII (by design — any IP can be tracking data), but the test dataset includes an RFC documentation example that still triggers detection, which is intentional: the tool errs on the side of caution for IPs.

---

## 8. Manifest V3 Constraints

**Decision:** Use `content_scripts` + `storage` permissions. Avoid `webRequest` blocking due to Manifest V3 limitations (service workers can't use `webRequest_blocking`).

**Rationale:**
- MV3 restricts synchronous webRequest handlers.
- Content script interception is the supported approach for MV3.
- The `fetch`/XHR monkey-patch approach works within MV3 constraints.

---

## 9. Configurable Confidential Terms

**Decision:** Store confidential terms as a JSON array in `chrome.storage.local`, loaded at runtime. Users edit via the options page textarea (one term per line).

**Rationale:**
- JSON array allows regex patterns as terms (e.g., `project [a-z]+`).
- Per-user storage means settings persist across browser sessions.
- Options page textarea is simpler than a full JSON editor.

---

## 10. Default Monitored Domains

**Decision:** Start with `chat.openai.com`, `claude.ai`, `gemini.google.com`, `www.perplexity.ai`, `cohere.ai`.

**Rationale:** These are the most commonly used AI tools. Users can add more via the options page.
