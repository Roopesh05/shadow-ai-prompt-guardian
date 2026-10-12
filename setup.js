import { generateTeamCode, createTeamAsLeader, joinTeamAsMember, getCurrentTeamConfig } from './team.js';

function initSetup() {
  // ─── Ambient Particle Background ──────────────────────────────────────────
  const pContainer = document.getElementById('particles-container');
  if (pContainer) {
    pContainer.innerHTML = '';
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = (Math.random() * 5) + 's';
      pContainer.appendChild(p);
    }
  }

  // ─── Wizard Step Navigation ────────────────────────────────────────────────
  const steps = {
    role: document.getElementById('step-role-select'),
    tl: document.getElementById('step-tl-config'),
    member: document.getElementById('step-member-config'),
    success: document.getElementById('step-success')
  };

  function showStep(stepKey) {
    Object.values(steps).forEach((s) => {
      if (s) s.classList.remove('active');
    });
    if (steps[stepKey]) {
      steps[stepKey].classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  let activeGeneratedCode = '';

  // ─── Role 1: Team Leader Selection ─────────────────────────────────────────
  const selectTl = () => {
    activeGeneratedCode = generateTeamCode();
    const codeDisplay = document.getElementById('display-team-code');
    if (codeDisplay) {
      codeDisplay.textContent = activeGeneratedCode;
    }
    const tlFeedback = document.getElementById('tl-feedback');
    if (tlFeedback) tlFeedback.style.display = 'none';

    showStep('tl');

    const nameInput = document.getElementById('input-tl-name');
    if (nameInput) setTimeout(() => nameInput.focus(), 150);
  };

  const btnSelectTl = document.getElementById('btn-select-tl');
  if (btnSelectTl) {
    btnSelectTl.addEventListener('click', selectTl);
    btnSelectTl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectTl();
      }
    });
  }

  const tlBtnInner = btnSelectTl?.querySelector('.role-select-btn');
  if (tlBtnInner) {
    tlBtnInner.addEventListener('click', (e) => {
      e.stopPropagation();
      selectTl();
    });
  }

  // ─── Role 2: Team Member Selection ─────────────────────────────────────────
  const selectMember = () => {
    const memberFeedback = document.getElementById('member-feedback');
    if (memberFeedback) memberFeedback.style.display = 'none';

    showStep('member');

    const codeInput = document.getElementById('input-member-code');
    if (codeInput) setTimeout(() => codeInput.focus(), 150);
  };

  const btnSelectMember = document.getElementById('btn-select-member');
  if (btnSelectMember) {
    btnSelectMember.addEventListener('click', selectMember);
    btnSelectMember.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMember();
      }
    });
  }

  const memberBtnInner = btnSelectMember?.querySelector('.role-select-btn');
  if (memberBtnInner) {
    memberBtnInner.addEventListener('click', (e) => {
      e.stopPropagation();
      selectMember();
    });
  }

  // ─── Back Buttons ──────────────────────────────────────────────────────────
  const btnBackTl = document.getElementById('btn-back-from-tl');
  if (btnBackTl) {
    btnBackTl.addEventListener('click', () => showStep('role'));
  }

  const btnBackMember = document.getElementById('btn-back-from-member');
  if (btnBackMember) {
    btnBackMember.addEventListener('click', () => showStep('role'));
  }

  // ─── Copy Team Code ────────────────────────────────────────────────────────
  const btnCopy = document.getElementById('btn-copy-code');
  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      try {
        if (!activeGeneratedCode) {
          activeGeneratedCode = document.getElementById('display-team-code')?.textContent || '';
        }
        await navigator.clipboard.writeText(activeGeneratedCode);
        const span = btnCopy.querySelector('span');
        if (span) {
          const original = span.textContent;
          span.textContent = 'Copied!';
          setTimeout(() => { span.textContent = original; }, 2000);
        }
      } catch (_) {}
    });
  }

  // ─── Auto-Format Member Code Input ─────────────────────────────────────────
  const memberCodeInput = document.getElementById('input-member-code');
  if (memberCodeInput) {
    memberCodeInput.addEventListener('input', () => {
      memberCodeInput.value = memberCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
  }

  // ─── Submit Team Leader ────────────────────────────────────────────────────
  const btnSubmitTl = document.getElementById('btn-submit-tl');
  const tlFeedback = document.getElementById('tl-feedback');

  if (btnSubmitTl) {
    btnSubmitTl.addEventListener('click', async () => {
      const nameInput = document.getElementById('input-tl-name');
      const name = nameInput ? nameInput.value.trim() : '';

      if (!name) {
        if (tlFeedback) {
          tlFeedback.style.display = 'block';
          tlFeedback.className = 'feedback-banner error';
          tlFeedback.textContent = 'Please enter your name or call-sign.';
        }
        nameInput?.focus();
        return;
      }

      btnSubmitTl.disabled = true;
      const span = btnSubmitTl.querySelector('span');
      if (span) span.textContent = 'Initializing Team...';
      if (tlFeedback) tlFeedback.style.display = 'none';

      try {
        const res = await createTeamAsLeader(activeGeneratedCode, name);
        btnSubmitTl.disabled = false;
        if (span) span.textContent = 'Create Team & Start Monitoring';

        if (!res.success) {
          if (tlFeedback) {
            tlFeedback.style.display = 'block';
            tlFeedback.className = 'feedback-banner error';
            tlFeedback.textContent = res.error || 'Failed to initialize team.';
          }
          return;
        }

        const headline = document.getElementById('success-headline');
        const message = document.getElementById('success-message');
        const roleEl = document.getElementById('summary-role');
        const codeEl = document.getElementById('summary-code');

        if (headline) headline.textContent = 'Team Created Successfully';
        if (message) message.textContent = `Share code ${activeGeneratedCode} with your team members to centralize telemetry.`;
        if (roleEl) roleEl.textContent = 'TEAM LEADER';
        if (codeEl) codeEl.textContent = activeGeneratedCode;

        showStep('success');
      } catch (err) {
        btnSubmitTl.disabled = false;
        if (span) span.textContent = 'Create Team & Start Monitoring';
        if (tlFeedback) {
          tlFeedback.style.display = 'block';
          tlFeedback.className = 'feedback-banner error';
          tlFeedback.textContent = err.message || 'An unexpected error occurred.';
        }
      }
    });
  }

  const tlNameInput = document.getElementById('input-tl-name');
  if (tlNameInput) {
    tlNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        btnSubmitTl?.click();
      }
    });
  }

  // ─── Submit Member ─────────────────────────────────────────────────────────
  const btnSubmitMember = document.getElementById('btn-submit-member');
  const memberFeedback = document.getElementById('member-feedback');
  const memberNameInput = document.getElementById('input-member-name');

  if (btnSubmitMember) {
    btnSubmitMember.addEventListener('click', async () => {
      const code = memberCodeInput ? memberCodeInput.value.trim().toUpperCase() : '';
      const name = memberNameInput ? memberNameInput.value.trim() : '';

      if (code.length !== 6) {
        if (memberFeedback) {
          memberFeedback.style.display = 'block';
          memberFeedback.className = 'feedback-banner error';
          memberFeedback.textContent = 'Team code must be exactly 6 characters.';
        }
        memberCodeInput?.focus();
        return;
      }

      if (!name) {
        if (memberFeedback) {
          memberFeedback.style.display = 'block';
          memberFeedback.className = 'feedback-banner error';
          memberFeedback.textContent = 'Please enter your name or identifier.';
        }
        memberNameInput?.focus();
        return;
      }

      btnSubmitMember.disabled = true;
      const span = btnSubmitMember.querySelector('span');
      if (span) span.textContent = 'Connecting...';
      if (memberFeedback) memberFeedback.style.display = 'none';

      try {
        const res = await joinTeamAsMember(code, name);
        btnSubmitMember.disabled = false;
        if (span) span.textContent = 'Join Team';

        if (!res.success) {
          if (memberFeedback) {
            memberFeedback.style.display = 'block';
            memberFeedback.className = 'feedback-banner error';
            memberFeedback.textContent = res.error || 'Team code invalid or connection failed.';
          }
          return;
        }

        const headline = document.getElementById('success-headline');
        const message = document.getElementById('success-message');
        const roleEl = document.getElementById('summary-role');
        const codeEl = document.getElementById('summary-code');

        if (headline) headline.textContent = 'Connected to Team';
        if (message) message.textContent = `Connected to team ${code}. Your Team Leader is now monitoring outbound telemetry.`;
        if (roleEl) roleEl.textContent = 'TEAM MEMBER';
        if (codeEl) codeEl.textContent = code;

        showStep('success');
      } catch (err) {
        btnSubmitMember.disabled = false;
        if (span) span.textContent = 'Join Team';
        if (memberFeedback) {
          memberFeedback.style.display = 'block';
          memberFeedback.className = 'feedback-banner error';
          memberFeedback.textContent = err.message || 'An unexpected error occurred.';
        }
      }
    });
  }

  [memberCodeInput, memberNameInput].forEach((input) => {
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          btnSubmitMember?.click();
        }
      });
    }
  });

  // ─── Finish Setup ──────────────────────────────────────────────────────────
  const btnFinish = document.getElementById('btn-finish-setup');
  if (btnFinish) {
    btnFinish.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.getCurrent) {
        chrome.tabs.getCurrent((tab) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            window.close();
            return;
          }
          if (tab && tab.id) {
            chrome.tabs.remove(tab.id, () => {
              if (chrome.runtime && chrome.runtime.lastError) {}
              window.close();
            });
          } else {
            window.close();
          }
        });
      } else {
        window.close();
      }
    });
  }

  // Pre-load current team config if already set
  getCurrentTeamConfig().then((cfg) => {
    if (cfg && cfg.role) {
      const summaryRole = document.getElementById('summary-role');
      const summaryCode = document.getElementById('summary-code');
      if (summaryRole) summaryRole.textContent = cfg.role === 'TL' ? 'TEAM LEADER' : 'TEAM MEMBER';
      if (summaryCode) summaryCode.textContent = cfg.teamCode || '—';
    }
  }).catch(() => {});
}

// ─── Immediate or Deferred Execution ─────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSetup);
} else {
  initSetup();
}
