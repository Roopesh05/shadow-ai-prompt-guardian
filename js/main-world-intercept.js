/**
 * Shadow AI Prompt Guardian — Main World Interceptor
 *
 * This script is injected into the PAGE's main world (not the extension's
 * isolated content script world) so it can intercept the real window.fetch
 * and XMLHttpRequest.prototype.send that the AI sites actually use.
 *
 * It communicates with the content script via window.postMessage.
 */
(function () {
  'use strict';

  // Guard against double-injection
  if (window.__sapg_main_world_injected) return;
  window.__sapg_main_world_injected = true;

  var protectionEnabled = true;

  // Listen for control messages from the content script
  window.addEventListener('message', function (event) {
    if (event.source !== window) return;
    if (event.data && event.data.type === 'SAPG_SET_PROTECTION') {
      protectionEnabled = event.data.enabled;
    }
  });

  // ─── URL Guard: only check actual AI chat completion endpoints ───────────────
  // We ONLY intercept requests going to known AI chat APIs.
  // All other page requests (auth, session, analytics, CDN, etc.) are allowed through.
  var AI_CHAT_URL_PATTERNS = [
    /\/backend-api\//,                        // All ChatGPT backend API endpoints
    /\/backend-anon\//,                       // ChatGPT anonymous conversation
    /\/api\/chat\/completions/,               // OpenAI-compatible
    /\/v1\/chat\/completions/,                // OpenAI API
    /\/v1\/messages/,                         // Anthropic Claude API
    /\/chat\/completions/,                    // Generic
    /\/completions/,                          // Legacy OpenAI
    /api\.anthropic\.com/,                    // Claude
    /generativelanguage\.googleapis\.com/,   // Gemini
    /\/api\/generate/,                        // Ollama, Perplexity
    /\/ask/,                                  // Perplexity
    /\/chat\/send/,                           // Cohere
    /\/coral\/create/,                        // Cohere Coral
    /\/chat\/new/,                            // Various
  ];

  function isAiChatUrl(url) {
    if (!url) return false;
    for (var i = 0; i < AI_CHAT_URL_PATTERNS.length; i++) {
      if (AI_CHAT_URL_PATTERNS[i].test(url)) return true;
    }
    return false;
  }

  // ─── Prompt text extraction (duplicated here for main world) ────────────────
  // IMPORTANT: Only extract structured user message content from known fields.
  // Never return raw non-JSON bodies — those could be HTML, binary, auth tokens.
  function extractPromptFromBody(body) {
    if (!body || typeof body !== 'string' || body.length === 0) return null;
    body = body.trim();

    // Only process JSON bodies — raw form-data, HTML, binary are not user prompts
    if (!body.startsWith('{') && !body.startsWith('[')) return null;

    try {
      var data = JSON.parse(body);

      // OpenAI / Anthropic messages array format
      if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
        var lastMsg = data.messages[data.messages.length - 1];
        if (lastMsg) {
          var role = lastMsg.role || (lastMsg.author && lastMsg.author.role);
          if (role && role !== 'user') return null;
          if (typeof lastMsg.content === 'string' && lastMsg.content.length > 5)
            return lastMsg.content.trim();
          if (typeof lastMsg.text === 'string' && lastMsg.text.length > 5)
            return lastMsg.text.trim();
          if (lastMsg.content && Array.isArray(lastMsg.content.parts)) {
            var extracted = lastMsg.content.parts.map(function (p) {
              return typeof p === 'string' ? p : (p && p.text ? p.text : '');
            }).filter(Boolean).join('\n').trim();
            if (extracted.length > 5) return extracted;
          }
        }
      }

      // Gemini format
      if (data.contents && Array.isArray(data.contents) && data.contents.length > 0) {
        var lastContent = data.contents[data.contents.length - 1];
        if (lastContent && lastContent.role && lastContent.role !== 'user') return null;
        var parts = lastContent && lastContent.parts;
        if (parts && parts[0] && parts[0].text && parts[0].text.length > 5)
          return parts[0].text.trim();
      }

      // Perplexity / direct prompt
      if (data.query && typeof data.query === 'string' && data.query.length > 5)
        return data.query.trim();

      // Cohere
      if (data.message && typeof data.message === 'string' && data.message.length > 5)
        return data.message.trim();

      if (data.prompt && typeof data.prompt === 'string' && data.prompt.length > 5)
        return data.prompt.trim();

      if (data.input && typeof data.input === 'string' && data.input.length > 5)
        return data.input.trim();

      return null;
    } catch (_) {
      return null;
    }
  }

  // Validate extracted text before sending for detection
  function isHumanText(text) {
    if (!text || typeof text !== 'string') return false;
    text = text.trim();
    return text.length >= 5;
  }

  // ─── Synchronous check via postMessage + blocking ──────────────────────────
  function requestBlockDecision(promptText, context) {
    return new Promise(function (resolve) {
      var requestId = 'sapg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      function onResponse(event) {
        if (event.source !== window) return;
        if (event.data && event.data.type === 'SAPG_BLOCK_DECISION' && event.data.requestId === requestId) {
          window.removeEventListener('message', onResponse);
          resolve(event.data.shouldBlock);
        }
      }
      window.addEventListener('message', onResponse);

      window.postMessage({
        type: 'SAPG_CHECK_PROMPT',
        requestId: requestId,
        promptText: promptText,
        context: context,
      }, '*');

      // Timeout fallback — if content script doesn't respond in 2s, allow the request
      setTimeout(function () {
        window.removeEventListener('message', onResponse);
        resolve(false);
      }, 2000);
    });
  }

  // ─── Intercept Fetch ──────────────────────────────────────────────────────
  var originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = async function (resource, init) {
      if (!protectionEnabled) return originalFetch.apply(this, arguments);

      var url = '';
      try { url = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : ''); } catch (_) {}

      // Only intercept known AI chat completion endpoints
      if (!isAiChatUrl(url)) return originalFetch.apply(this, arguments);

      var body = init && init.body;
      if (!body && resource && typeof resource !== 'string') {
        try {
          if (resource.body && !resource.bodyUsed) {
            body = await resource.clone().text();
          }
        } catch (_) {}
      }
      if (!body || typeof body !== 'string') return originalFetch.apply(this, arguments);

      var promptText = extractPromptFromBody(body);
      if (!promptText || !isHumanText(promptText)) return originalFetch.apply(this, arguments);

      var shouldBlock = await requestBlockDecision(promptText, '[fetch] ' + url.substring(0, 80));
      if (shouldBlock) {
        throw new DOMException('Shadow AI Prompt Guardian: request blocked — sensitive content detected.', 'AbortError');
      }
      return originalFetch.apply(this, arguments);
    };
  }

  // ─── Intercept XHR ────────────────────────────────────────────────────────
  var origOpen = XMLHttpRequest.prototype.open;
  var origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this._sapr_url = url || '';
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    if (!protectionEnabled) return origSend.apply(this, arguments);

    // Only intercept known AI chat endpoints
    if (!isAiChatUrl(this._sapr_url || '')) return origSend.apply(this, arguments);

    if (!body || typeof body !== 'string') return origSend.apply(this, arguments);

    var promptText = extractPromptFromBody(body);
    if (!promptText || !isHumanText(promptText)) return origSend.apply(this, arguments);

    var shouldBlock = quickSyncCheck(promptText);
    if (shouldBlock) {
      window.postMessage({
        type: 'SAPG_CHECK_PROMPT',
        requestId: 'sapg_xhr_' + Date.now(),
        promptText: promptText,
        context: '[XHR] ' + (this._sapr_url || '').substring(0, 80),
      }, '*');
      throw new DOMException('Shadow AI Prompt Guardian: XHR blocked — sensitive content detected.', 'AbortError');
    }
    return origSend.apply(this, arguments);
  };

  // ─── Quick Synchronous Check (for XHR, critical patterns only) ────────────
  function quickSyncCheck(text) {
    if (!text || text.length < 5) return false;
    var patterns = [
      /AKIA(?:\s*[0-9A-Z]){16}/,
      /ghp_[A-Za-z0-9]{36}/,
      /sk-[A-Za-z0-9\-]{20,}/i,
      /sk_live_[0-9a-zA-Z]{24,}/,
      /pk_live_[0-9a-zA-Z]{24,}/,
      /glpat-[A-Za-z0-9\-]{20,}/,
      /xoxb-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{30,}/,
      /xoxp-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{20,}/,
      /ya29\.[A-Za-z0-9_-]{10,}/,
      /(?:password|passwd|pwd|secret)\s*[:=]\s*[^\s]{6,}/i,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      /\d{3}-\d{2}-\d{4}/,
      /\bAC[a-f0-9]{32}\b/i,
    ];
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].test(text)) return true;
    }
    return false;
  }

  console.log('[SAPG] Main-world interception active (AI chat endpoints only).');
})();
