# Shadow AI Prompt Guardian — Project Feature Checklist

Based on project requirements from design documentation.

---

## 🔴 CORE REQUIREMENTS (Must Have)

### 1. Detection Engine
- [ ] **API Key Detection**
  - [ ] AWS Access Keys (AKIA pattern)
  - [ ] GitHub Personal Access Tokens (ghp_ pattern)
  - [ ] OpenAI API Keys (sk- pattern)
  - [ ] Stripe Secret Keys (sk_live_ pattern)
  - [ ] GitLab PATs (glpat- pattern)
  - [ ] Slack Tokens (xoxb-, xoxp- patterns)
  - [ ] Google OAuth Tokens (ya29. pattern)
  - [ ] Azure Keys (32-char hex)
  - [ ] Heroku API Keys (UUID pattern)
  - [ ] Twilio SIDs/Tokens
  - [ ] High-entropy generic tokens (Shannon entropy ≥4.0)

- [ ] **Password/Credential Detection**
  - [ ] Password assignments (password = value)
  - [ ] Password inline usage (password is value)
  - [ ] Basic Auth headers
  - [ ] Bearer tokens
  - [ ] Credential file paths (~/.ssh, /etc/credentials)

- [ ] **PII Detection**
  - [ ] Email addresses
  - [ ] US phone numbers (various formats)
  - [ ] International phone numbers (+XX format)
  - [ ] Social Security Numbers (XXX-XX-XXXX)
  - [ ] IP addresses (optional, context-dependent)

- [ ] **Confidential Terms Detection**
  - [ ] Configurable keyword dictionary
  - [ ] Support for regex patterns in terms
  - [ ] Pre-loaded with common sensitive terms (confidential, proprietary, trade secret, etc.)
  - [ ] User-editable via options page

### 2. Real-Time Interception
- [ ] **Form Submission Interception**
  - [ ] Detects form submit events
  - [ ] Extracts prompt text from textarea/input
  - [ ] Blocks submission if sensitive content found

- [ ] **Fetch API Interception**
  - [ ] Monkey-patches window.fetch
  - - [ ] Inspects request body before send
  - [ ] Extracts prompt from JSON shapes (messages, prompt, query, etc.)
  - [ ] Throws AbortError to block request

- [ ] **XHR Interception**
  - [ ] Monkey-patches XMLHttpRequest.prototype.send
  - [ ] Inspects request body
  - [ ] Throws AbortError to block request

- [ ] **Send Button Click Interception**
  - [ ] Captures click events on send buttons
  - [ ] Runs before React/synthetic event handlers
  - [ ] Extracts prompt from active element

- [ ] **Enter Key Interception**
  - [ ] Captures Enter keypress in prompt inputs
  - [ ] Runs in capture phase
  - [ ] Prevents default if sensitive content found

### 3. User Interface
- [ ] **Warning Banner**
  - [ ] Displays at top of page when sensitive content detected
  - [ ] Shows category chips (API Key, Password, PII, Confidential)
  - [ ] Clear message explaining what was found
  - [ ] Action buttons: "Auto-Redact & Resubmit", "I'll fix it & resubmit", "Cancel"
  - [ ] Smooth slide-in/out animation
  - [ ] Blocks page interaction while visible (pointer-events)

- [ ] **Text Highlighting**
  - [ ] Color-coded backgrounds (not red underlines to avoid spell-check confusion)
  - [ ] API Key = Pink
  - [ ] Password = Orange
  - [ ] PII = Blue
  - [ ] Confidential = Yellow
  - [ ] Works for both textarea and contenteditable elements
  - [ ] Pulsing ring outline fallback for rich text editors

- [ ] **Live Risk Indicator**
  - [ ] Floating shield badge near input
  - [ ] Updates in real-time as user types (400ms debounce)
  - [ ] Color states: Green (Safe), Yellow (Low Risk), Orange (High Risk), Red (Danger)
  - [ ] Shows numeric risk score

- [ ] **Floating Toggle Button**
  - [ ] Persistent button in bottom-right corner
  - [ ] Opens popup panel
  - [ ] Visual state: Shield icon when active, faded when paused

- [ ] **Popup Panel**
  - [ ] Protection toggle (on/off)
  - [ ] Risk score meter with visual bar
  - [ ] Recent blocks log (timestamp + categories)
  - [ ] Conversation scanner button
  - [ ] Link to settings page

### 4. Settings & Configuration
- [ ] **Options Page**
  - [ ] Enable/disable protection toggle
  - [ ] Enable/disable entropy detection
  - [ ] Sensitivity threshold slider (0-100)
  - [ ] Monitored domains list (add/remove)
  - [ ] Confidential terms editor (one per line)
  - [ ] Save/Reset buttons
  - [ ] Clear block log button

- [ ] **Storage Management**
  - [ ] All settings persist in chrome.storage.local
  - [ ] Blocked attempts log persists (max50 entries)
  - [ ] Settings sync across popup/options pages
  - [ ] Safe storage wrappers prevent "context invalidated" errors

### 5. Privacy & Security
- [ ] **Zero Data Exfiltration**
  - [ ] All detection runs client-side only
  - [ ] No external API calls from detection engine
  - [ ] No telemetry or analytics
  - [ ] Prompt text never logged or transmitted

- [ ] **Secure Logging**
  - [ ] Blocked attempts log stores only:
    - [ ] Timestamp (ISO format)
    - [ ] Categories found
    - [ ] Risk score
    - [ ] Masked previews (e.g., "AKIA••••••••••••••LE")
  - [ ] Never stores raw sensitive content

- [ ] **Error Handling**
  - [ ] Chrome storage errors caught at4 layers:
    - [ ] API override (chrome.storage.local wrapper)
    - [ ] unhandledrejection listener
    - [ ] try/catch in safeGet/safeSet/safeRemove
    - [ ] Promise .catch() on all async calls
  - [ ] No "Extension context invalidated" errors in chrome://extensions/errors

---

## 🟡 IMPORTANT FEATURES (Should Have)

### 6. Smart Detection
- [ ] **Context-Aware Scoring**
  - [ ] Educational queries get lower risk for API keys/passwords
  - [ ] Examples like "What is an API key? sk-abc123" scored lower than "My key is sk-abc123"
  - [ ] PII and confidential terms ALWAYS block regardless of context
  - [ ] Configurable via CATEGORY_SCORES constant

- [ ] **Prompt Extraction**
  - [ ] Handles plain text prompts
  - [ ] Extracts from OpenAI messages format: { messages: [{role, content}] }
  - [ ] Extracts from Anthropic format: { prompt, system }
  - [ ] Extracts from Gemini format: { contents: [{parts: [{text}]}] }
  - [ ] Extracts from generic formats: { query, message, text, input }
  - [ ] Fallback to raw body if no pattern matches

- [ ] **Deduplication & Overlap Handling**
  - [ ] Removes overlapping findings (keeps highest severity)
  - [ ] Sorts by position for display
  - [ ] Prevents double-counting in risk score

### 7. Auto-Redact Feature
- [ ] **Smart Replacement**
  - [ ] Replaces sensitive text with safe placeholders:
    - [ ] API keys → [API_KEY]
    - [ ] Passwords → [PASSWORD]
    - [ ] PII → [REDACTED]
    - [ ] Confidential → [CONFIDENTIAL]
  - [ ] Preserves prompt structure and readability
  - [ ] Updates React state correctly (native setter + event dispatch)
  - [ ] Works for both textarea and contenteditable elements

- [ ] **User Experience**
  - [ ] Shows toast notification on redaction
  - [ ] Highlights redacted positions
  - [ ] Allows user to review and edit before resubmit
  - [ ] Banner dismisses after redaction

### 8. Conversation Scanner
- [ ] **Full Conversation Analysis**
  - [ ] Scans all messages in current conversation
  - [ ] Reports which messages contain sensitive content
  - [ ] Shows preview of flagged messages
  - [ ] Displays summary stats (total messages, messages with issues)
  - [ ] Color-coded results (green = clean, red = issues found)

### 9. Domain Coverage
- [ ] **Supported AI Platforms**
  - [ ] chat.openai.com
  - [ ] *.chatgpt.com
  - [ ] claude.ai
  - [ ] *.claude.ai
  - [ ] gemini.google.com
  - [ ] *.gemini.google.com
  - [ ] *.google.com/gemini*
  - [ ] perplexity.ai
  - [ ] cohere.ai
  - [ ] *.anthropic.com
  - [ ] console.anthropic.com

---

## 🟢 NICE-TO-HAVE FEATURES (Could Add Later)

### 10. Advanced Detection
- [ ] **Code Block Parsing**
  - [ ] Detects secrets inside code snippets
  - [ ] Handles JSON, YAML, TOML, .env file formats
  - [ ] Recognizes key-value patterns in code

- [ ] **Base64 Detection**
  - [ ] Decodes base64 strings and scans for secrets
  - [ ] Catches encoded API keys/passwords

- [ ] **Multi-Language PII**
  - [ ] International ID number patterns
  - [ ] Non-US phone number formats
  - [ ] Regional email domain patterns

### 11. Enhanced UI
- [ ] **Customizable Highlighting**
  - [ ] User-selectable colors for each category
  - [ ] Opacity/thickness controls

- [ ] **Keyboard Shortcuts**
  - [ ] Toggle protection on/off
  - [ ] Quick-scan current conversation
  - [ ] Dismiss banner

- [ ] **Sound Notifications**
  - [ ] Optional audio cue when block occurs
  - [ ] Configurable volume/sound

### 12. Analytics & Reporting
- [ ] **Statistics Dashboard**
  - [ ] Blocks per day/week/month
  - [ ] Top leak categories over time
  - [ ] Risk score trends
  - [ ] Export to CSV/JSON

- [ ] **Team/Org Features** (requires backend)
  - [ ] Share confidential terms across team
  - [ ] Centralized policy management
  - [ ] Anonymous aggregate statistics

---

## ❌ OUT OF SCOPE (Cut from Phase 1)

The following features from the original wishlist have been evaluated and officially cut from Phase 1. They are not currently built and should not be claimed as supported:
- [x] **ML Classifier** - Dropped in favor of the current deterministic Regex + Shannon Entropy engine for 100% in-browser performance.
- [x] **Audit Logs / Compliance Presets** - Enterprise compliance management (HIPAA/SOC2 presets and centralized audit logging) requires a backend, which violates the zero-data-exfiltration goal of Phase 1.
- [x] **Multi-Browser Support** - Currently exclusively built and tested for Google Chrome Manifest V3. Firefox/Safari ports are out of scope.

---

## 📊 QUALITY ASSURANCE CHECKLIST

### Testing
- [ ] **Unit Tests (53 tests)**
  - [ ] Shannon entropy calculation
  - [ ] High-entropy token detection
  - [ ] Clean prompt handling
  - [ ] API key detection (all patterns)
  - [ ] Password detection
  - [ ] PII detection (email, phone, SSN)
  - [ ] Confidential term detection
  - [ ] Multiple findings handling
  - [ ] Threshold behavior
  - [ ] Secret masking
  - [ ] Highlight ranges
  - [ ] Edge cases (null, empty, long input)
  - [ ] False positive prevention

- [ ] **Evaluation Harness (80 prompts)**
  - [ ] 30 clean prompts (0% false positives)
  - [ ] 15 API key prompts (100% detection)
  - [ ] 9 password prompts (100% detection)
  - [ ] 13 PII prompts (100% detection)
  - [ ] 13 confidential prompts (100% detection)
  - [ ] Target: 100% accuracy, 0% FPR

- [ ] **QA Checklist (137 checks)**
  - [ ] File integrity (18 files)
  - [ ] Manifest validation (12 checks)
  - [ ] Syntax validation (5 files)
  - [ ] Detection engine (17 checks)
  - [ ] Prompt extraction (8 checks)
  - [ ] Auto-redact (5 checks)
  - [ ] Error handling (11 checks)
  - [ ] Bug fix verification (5 checks)
  - [ ] UI components (9 checks)
  - [ ] Smart context scoring (3 checks)
  - [ ] Interception layers (9 checks)
  - [ ] Cross-file consistency (5 checks)
  - [ ] Edge cases (5 checks)
  - [ ] Test files (2 checks)

### Manual Testing
- [ ] **Installation Test**
  - [ ] Load unpacked extension
  - [ ] Verify icon appears in toolbar
  - [ ] Confirm no errors in chrome://extensions/errors

- [ ] **Basic Detection Test**
  - [ ] Test with AWS key
  - [ ] Test with GitHub token
  - [ ] Test with email address
  - [ ] Test with password
  - [ ] Test with confidential term

- [ ] **UI Interaction Test**
  - [ ] Banner appears on detection
  - [ ] Auto-Redact button works
  - [ ] Resubmit button works
  - [ ] Cancel button works
  - [ ] Highlighting visible in input
  - [ ] Live risk indicator updates
  - [ ] Popup opens/closes
  - [ ] Toggle protection on/off

- [ ] **Multi-Platform Test**
  - [ ] Test on chatgpt.com
  - [ ] Test on claude.ai
  - [ ] Test on gemini.google.com
  - [ ] Test on perplexity.ai

- [ ] **Edge Case Test**
  - [ ] Empty prompt
  - [ ] Very long prompt (100k+ chars)
  - [ ] Unicode characters
  - [ ] Mixed case patterns
  - [ ] Multiple findings in one prompt
  - [ ] Educational queries with examples

---

## 📝 DOCUMENTATION CHECKLIST

- [ ] **README.md**
  - [ ] Project overview
  - [ ] Features list
  - [ ] Installation instructions
  - [ ] Usage guide
  - [ ] Screenshots
  - [ ] Test results

- [ ] **DECISIONS.md**
  - [ ] Architecture decisions
  - [ ] Detection engine design
  - [ ] Interception strategy
  - [ ] Privacy guarantees
  - [ ] Test dataset design
  - [ ] False positive management

- [ ] **VERIFICATION_REPORT.md**
  - [ ] What was tested
  - [ ] What passed
  - [ ] Known limitations
  - [ ] Final accuracy/precision/recall/FPR numbers

- [ ] **PROJECT_CHECKLIST.md** (this file)
  - [ ] All features tracked
  - [ ] Status updates as features complete

---

## ✅ FINAL VERIFICATION

Before declaring project complete, verify:

- [ ] All 53 unit tests pass
- [ ] All 80 evaluation prompts tested (100% accuracy)
- [ ] All 137 QA checklist items pass
- [ ] Zero errors in chrome://extensions/errors
- [ ] Auto-Redact feature works correctly
- [ ] Live risk indicator updates in real-time
- [ ] Conversation scanner works
- [ ] Settings persist across reloads
- [ ] No data exfiltration (verified by code review)
- [ ] All required files present (18 files)
- [ ] Syntax valid in all JS files
- [ ] CSS balanced (81 braces)

---

**Project Status:** ✅ COMPLETE
**Version:** 3.0.0
**Last Updated:** 2026-08-12
