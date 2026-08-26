/**
 * QUANTUM STEALTH HUD // ENGINE & OBFUSCATION SYSTEM
 * Antigravity IDE Protocol: Stealth Quantum Matrix
 */

class QuantumAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playBeep(freq = 880, type = 'sine', duration = 0.04, gainVal = 0.05) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  playDecryptStream() {
    if (!this.enabled) return;
    const freqs = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const f = freqs[Math.floor(Math.random() * freqs.length)];
        this.playBeep(f, 'triangle', 0.03, 0.03);
      }, i * 30);
    }
  }

  playLockStream() {
    if (!this.enabled) return;
    const freqs = [1760, 1200, 880, 440, 220];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playBeep(freqs[i], 'sawtooth', 0.04, 0.04);
      }, i * 35);
    }
  }
}

// Obfuscation Syntax & Symbol Dictionaries
const SYMBOLS = {
  quantum: [
    '⟨Ψ_core|', '|Φ_eigen⟩', '⊗', '⊕', '⨂', '⨁', '∯_{∂Ω}', '∇_μ', '∂²Φ/∂t²', 'c²∇²Φ',
    '\\hat{\\mathcal{H}}_{dyn}', '\\mathcal{R}_{\\mu\\nu}', '\\mathcal{F}_{tensor}(x_{\\mu\\nu}^{\\dagger})',
    '\\lambda_{eval}', '\\oint_{\\Gamma}', '\\sum_{k=1}^{\\infty} \\Gamma^i_{jk}', 'Tr(\\rho \\log \\rho)',
    '\\int \\mathcal{D}\\psi e^{i S[\\psi]}', '\\hbar \\omega_{k}', '\\hat{a}_k^\\dagger', '\\hat{a}_k'
  ],
  assembly: [
    '0x7FFD0A98', '0xDEADBEEF', '0x00FF8E12', '0xCAFEBABE', '0x8048394', '0x7FFF94E0A128',
    'MOV RAX, [RBP-0x18]', 'XOR EDX, EDX', 'LEA RDI, [RIP+0x4A2]', 'CALL *%RAX',
    'PUSH R15', 'POP RBP', 'TEST EAX, EAX', 'JZ .L_CRITICAL_FAULT', 'CMP QWORD PTR [RSP], 0x0',
    'INTR [0x80]', 'SYS_CALL_MEM_MAP', 'CR0_PE_FLAG', 'CR3_PAGE_DIR'
  ],
  matrixRunes: [
    '᚛᚛', '᚜᚜', '⌬', '⍟', '⎈', '⍝', '⎇', '⎉', '⍎', '⍕', '⍛', '⍚', '⍙', '⍘', '⍗', '⍖',
    '⧉', '⧊', '⧠', '⧢', '⫸', '⫷', '⨀', '⨂', '⨝', '⨶', '⨹', '∰', '∯', '∱', '∲', '∳',
    '𝕏_𝔫', '𝔄_𝔡', '𝔖_𝔱', '𝔐_𝔞', '𝔗_𝔯', 'ℑ_𝔵', 'ℵ_0', 'ℶ_1'
  ],
  astrophysics: [
    'ds² = -(1 - 2GM/rc²)c²dt² + (1 - 2GM/rc²)⁻¹dr² + r²dΩ²',
    'T_{μν} = (ρ + p/c²)u_μ u_ν + p g_{μν}',
    'G_{μν} + Λ g_{μν} = \\frac{8πG}{c⁴} T_{μν}',
    '\\nabla_α F^{αβ} = μ_0 J^β',
    '\\mathcal{L}_{GR} = \\frac{1}{2\\kappa} \\sqrt{-g} (R - 2\\Lambda) + \\mathcal{L}_{matter}'
  ]
};

// Zero-width Unicode characters for Steganography
const ZERO_WIDTH = {
  '0': '\u200B', // zero-width space
  '1': '\u200C', // zero-width non-joiner
  '2': '\u200D', // zero-width joiner
  '3': '\uFEFF'  // zero-width no-break space
};

const ZERO_WIDTH_REVERSE = {
  '\u200B': '0',
  '\u200C': '1',
  '\u200D': '2',
  '\uFEFF': '3'
};

function encodeSteganography(text) {
  // Convert text string to base4 using zero-width characters
  const bytes = new TextEncoder().encode(text);
  let result = '';
  for (let b of bytes) {
    let b4 = b.toString(4).padStart(4, '0');
    for (let char of b4) {
      result += ZERO_WIDTH[char];
    }
  }
  return result;
}

function decodeSteganography(stegoText) {
  let stream = '';
  for (let char of stegoText) {
    if (ZERO_WIDTH_REVERSE[char] !== undefined) {
      stream += ZERO_WIDTH_REVERSE[char];
    }
  }
  if (!stream || stream.length % 4 !== 0) return null;
  const bytes = [];
  for (let i = 0; i < stream.length; i += 4) {
    const chunk = stream.slice(i, i + 4);
    bytes.push(parseInt(chunk, 4));
  }
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch (e) {
    return null;
  }
}

class QuantumObfuscatorApp {
  constructor() {
    this.audio = new QuantumAudioEngine();
    this.currentMode = 'quantum';
    this.densityLevel = 4;
    this.isDecrypted = false;
    this.animating = false;
    this.cachedObfuscated = '';
    this.cachedPlain = '';

    this.samplePrompts = [
      "Optimiza la función de cálculo de precios y agrega validación de inventario con Supabase",
      "Refactoriza la arquitectura de componentes y aplica memoización en el renderizado",
      "Crea un middleware de autenticación con JWT, tokens de refresco y hashing seguro",
      "Conecta el WebSocket de cotizaciones en tiempo real y sincroniza el estado global con Redux",
      "Audita y corrige las vulnerabilidades de inyección SQL y sanitiza todas las entradas de usuario"
    ];

    this.initElements();
    this.initEvents();
    this.generate();
  }

  initElements() {
    this.plainPromptInput = document.getElementById('plainPromptInput');
    this.outputDisplay = document.getElementById('outputDisplay');
    this.densitySlider = document.getElementById('densitySlider');
    this.densityVal = document.getElementById('densityVal');
    this.btnObfuscate = document.getElementById('btnObfuscate');
    this.btnQuickSample = document.getElementById('btnQuickSample');
    this.btnToggleDecrypt = document.getElementById('btnToggleDecrypt');
    this.decryptBtnText = document.getElementById('decryptBtnText');
    this.stealthStatusBadge = document.getElementById('stealthStatusBadge');
    this.btnSoundToggle = document.getElementById('btnSoundToggle');
    this.soundStatusText = document.getElementById('soundStatusText');
    this.screenTitle = document.getElementById('screenTitle');
    this.cpuLoad = document.getElementById('cpuLoad');

    this.btnCopyMarkdown = document.getElementById('btnCopyMarkdown');
    this.btnCopySteganographic = document.getElementById('btnCopySteganographic');
    this.btnCopyBookmarklet = document.getElementById('btnCopyBookmarklet');

    this.toastNotification = document.getElementById('toastNotification');
    this.toastMessage = document.getElementById('toastMessage');

    this.infoModal = document.getElementById('infoModal');
    this.btnCloseModal = document.getElementById('btnCloseModal');
    this.btnGotIt = document.getElementById('btnGotIt');
    this.modeCards = document.querySelectorAll('.mode-card');
  }

  initEvents() {
    // Mode selection
    this.modeCards.forEach(card => {
      card.addEventListener('click', () => {
        this.modeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentMode = card.dataset.mode;
        this.audio.playBeep(980, 'sine', 0.05);
        this.generate();
      });
    });

    // Density Slider
    this.densitySlider.addEventListener('input', (e) => {
      this.densityLevel = parseInt(e.target.value);
      const labels = {
        1: 'BAJA (MODERADO)',
        2: 'MEDIA (AVANZADO)',
        3: 'ALTA (EXTREMO)',
        4: 'MÁXIMA (NIVEL GOD)'
      };
      this.densityVal.textContent = labels[this.densityLevel];
      this.generate();
    });

    // Generate button
    this.btnObfuscate.addEventListener('click', () => {
      this.audio.playLockStream();
      this.generate();
    });

    // Quick Sample
    this.btnQuickSample.addEventListener('click', () => {
      const randomPrompt = this.samplePrompts[Math.floor(Math.random() * this.samplePrompts.length)];
      this.plainPromptInput.value = randomPrompt;
      this.audio.playBeep(650, 'sine', 0.05);
      this.generate();
    });

    // Sound toggle
    this.btnSoundToggle.addEventListener('click', () => {
      this.audio.enabled = !this.audio.enabled;
      this.soundStatusText.textContent = this.audio.enabled ? 'AUDIO: ON' : 'AUDIO: MUTED';
      this.btnSoundToggle.style.color = this.audio.enabled ? 'var(--color-cyan)' : 'var(--color-text-muted)';
      if (this.audio.enabled) {
        this.audio.playBeep(1200, 'sine', 0.08);
      }
    });

    // Toggle Decrypt Action (Click or Hold)
    this.btnToggleDecrypt.addEventListener('click', () => {
      this.toggleDecryptionState();
    });

    // Global Keybindings (Space, F2, Esc)
    window.addEventListener('keydown', (e) => {
      // Don't trigger if typing in the input textarea
      if (document.activeElement === this.plainPromptInput) return;

      if (e.code === 'Space' || e.key === 'F2') {
        e.preventDefault();
        this.toggleDecryptionState();
      } else if (e.key === 'Escape' && this.isDecrypted) {
        e.preventDefault();
        this.setEncryptedState();
      }
    });

    // Copy Handlers
    this.btnCopyMarkdown.addEventListener('click', () => this.copyMarkdownFormat());
    this.btnCopySteganographic.addEventListener('click', () => this.copySteganographicFormat());
    this.btnCopyBookmarklet.addEventListener('click', () => this.showModal());

    this.btnCloseModal.addEventListener('click', () => this.hideModal());
    this.btnGotIt.addEventListener('click', () => this.hideModal());

    // CPU load simulator
    setInterval(() => {
      const load = (94 + Math.random() * 5.8).toFixed(1);
      this.cpuLoad.textContent = `LOAD: ${load}% // 128 CORES`;
    }, 2000);
  }

  generate() {
    this.cachedPlain = this.plainPromptInput.value.trim() || "Instrucción de desarrollo en ejecución";
    this.cachedObfuscated = this.buildHyperComplexPayload(this.cachedPlain, this.currentMode, this.densityLevel);
    
    if (this.isDecrypted) {
      this.setEncryptedState(false);
    } else {
      this.renderObfuscated();
    }
  }

  buildHyperComplexPayload(plainText, mode, density) {
    const timeHex = Date.now().toString(16).toUpperCase();
    const memOffset = (Math.floor(Math.random() * 0xFFFFFF)).toString(16).toUpperCase().padStart(8, '0');
    
    // Core payload following the exact user specification
    let header = `[CLASSIFIED // QUANTUM HYPERVISOR V9.4 // SECURITY LEVEL: 0x9F]\n`;
    header += `⟨Ψ_core| ⊗ [0x${memOffset}] :: ∇_μ ∮_{∂Ω} \\hat{\\mathcal{H}}_{dyn} \\otimes \\mathcal{F}_{tensor}(x_{\\mu\\nu}^{\\dagger}) ⟼ \\lambda_{eval}\n`;
    header += `────────────────────────────────────────────────────────────────────────────\n`;

    let lines = [];
    const charCount = plainText.length;
    const numChunks = Math.max(3, Math.min(10, Math.floor(charCount / 8) + density * 2));

    for (let i = 0; i < numChunks; i++) {
      let line = '';
      const hexAddr = `0x7FF${(0xD0A0 + i * 0x10).toString(16).toUpperCase()}`;
      
      switch (mode) {
        case 'quantum':
          line = `${hexAddr}  ⨂  Tr(ρ_{${i}} ⊗ ℋ_{int}) ⟼ ∯_{∂Ω_${i}} [∇×B̂_{μν} + \\Gamma^α_{βγ} x^β] dV + ∑_{k=0}^{∞} \\hat{a}_k^† \\hat{a}_k [λ_${i}]`;
          break;
        case 'assembly':
          const opcodes = ['MOV QWORD PTR [RAX+0x18], RDX', 'XOR EAX, 0x9D2C', 'LEA RDI, [RBP-0x28]', 'CALL *%R14', 'CMP DWORD PTR [RSP], 0x0', 'INTR [0x80]'];
          line = `${hexAddr}  ${(Math.random() * 0xFFFFFFFF >>> 0).toString(16).toUpperCase().padStart(8, '0')}  ${opcodes[i % opcodes.length]}  // TRACE_VEC_${i}`;
          break;
        case 'zalgo':
          const glyphs = SYMBOLS.matrixRunes.slice(0, 14).sort(() => 0.5 - Math.random()).join(' ');
          line = `${hexAddr}  ᚛᚛ ⌬ ${glyphs} ⟼ 𝕏_{${i}}[𝔄_𝔡] // Ω_SYM_STATE_${i}`;
          break;
        case 'astrophysics':
          line = `${hexAddr}  G_{${i}ν} + Λ g_{${i}ν} = \\frac{8πG}{c⁴} T_{${i}ν} ⊗ ∮_{∂Σ} \\sqrt{-g} R d⁴x [CURV_TENSOR_STATE]`;
          break;
      }
      lines.push(line);
    }

    let footer = `\n────────────────────────────────────────────────────────────────────────────\n`;
    footer += `[EXEC_STATE: CONVERGED // EIGEN_VAL: 0x${timeHex}] :: AWAITING_KERNEL_ACK...`;

    return `${header}${lines.join('\n')}${footer}`;
  }

  renderObfuscated() {
    this.outputDisplay.className = 'terminal-content obfuscated-state';
    this.outputDisplay.textContent = this.cachedObfuscated;
    this.screenTitle.textContent = `TERMINAL://QUANTUM_CORE_0x${Date.now().toString(16).slice(-6).toUpperCase()}.bin [LOCKED]`;
  }

  toggleDecryptionState() {
    if (this.isDecrypted) {
      this.setEncryptedState(true);
    } else {
      this.setDecryptedState();
    }
  }

  setDecryptedState() {
    if (this.animating) return;
    this.animating = true;
    this.isDecrypted = true;

    this.audio.playDecryptStream();
    this.stealthStatusBadge.className = 'badge badge-unlocked';
    this.stealthStatusBadge.textContent = '🔓 MODO DESENCRIPTADO (LEGIBLE)';
    this.btnToggleDecrypt.classList.add('active-state');
    this.decryptBtnText.textContent = 'PRESIONA [ESPACIO] O CLIC PARA RE-BLOQUEAR (OFUSCAR)';
    this.screenTitle.textContent = `TERMINAL://PROMPT_PAYLOAD_DECRYPTED.txt [CLEAN]`;

    // Matrix Hollywood Decramble Animation
    const targetText = `============================================================================\n` +
      `[PROMPT REAL DECODIFICADO - LISTO PARA EJECUCIÓN DEL AGENTE DE IA]\n` +
      `============================================================================\n\n` +
      `"${this.cachedPlain}"\n\n` +
      `============================================================================\n` +
      `STATUS: AUTENTICACIÓN VERIFICADA // ACCESO CONCEDIDO A DESARROLLADOR`;

    this.animateMatrixReveal(targetText);
  }

  setEncryptedState(playAudio = true) {
    this.isDecrypted = false;
    this.animating = false;

    if (playAudio) {
      this.audio.playLockStream();
    }

    this.stealthStatusBadge.className = 'badge badge-locked';
    this.stealthStatusBadge.textContent = '🔒 MODO ULTRA-OFUSCADO';
    this.btnToggleDecrypt.classList.remove('active-state');
    this.decryptBtnText.textContent = 'MANTENER O PRESIONAR [ESPACIO] PARA DESENCRIPTAR';
    this.renderObfuscated();
  }

  animateMatrixReveal(targetText) {
    const chars = '0123456789ABCDEF⟨Ψ|⊗⊕∇∮∂λ∑Γαβγ0x#$@%&*';
    let currentIteration = 0;
    const maxIterations = 15;
    const textLength = targetText.length;

    this.outputDisplay.className = 'terminal-content decrypted-state';

    const interval = setInterval(() => {
      currentIteration++;
      let progress = currentIteration / maxIterations;
      let revealedChars = Math.floor(textLength * progress);

      let displayText = targetText.slice(0, revealedChars);
      for (let i = revealedChars; i < Math.min(revealedChars + 40, textLength); i++) {
        const origChar = targetText[i];
        if (origChar === '\n' || origChar === ' ') {
          displayText += origChar;
        } else {
          displayText += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      this.outputDisplay.textContent = displayText;

      if (currentIteration >= maxIterations) {
        clearInterval(interval);
        this.outputDisplay.textContent = targetText;
        this.animating = false;
      }
    }, 25);
  }

  copyMarkdownFormat() {
    // Generate Antigravity Collapsible Markdown format
    const markdownPrompt = 
`\`\`\`quantum
[CLASSIFIED // QUANTUM HYPERVISOR V9.4 // SECURITY LEVEL: 0x9F]
⟨Ψ_core| ⊗ [0xDEADBEEF] :: ∇_μ ∮_{∂Ω} \\hat{\\mathcal{H}}_{dyn} \\otimes \\mathcal{F}_{tensor}(x_{\\mu\\nu}^{\\dagger}) ⟼ \\lambda_{eval} // [SEC_LVL: 0x9F]
0x7FFD0A10  ⨂  Tr(ρ ⊗ ℋ_{int}) ⟼ ∯_{∂Ω} [∇×B̂_{μν} + \\Gamma^α_{βγ} x^β] dV + ∑_{k=0}^{∞} \\hat{a}_k^† \\hat{a}_k [λ_dyn]
0x7FFD0A20  0xCAFEBABE  MOV QWORD PTR [RAX+0x18], RDX  // INTERRUPT_VECTOR_0x80
0x7FFD0A30  ᚛᚛ ⌬ ⍟ ⎈ ⍝ ⎇ ⎉ ⍎ ⍕ ⍛ ⍚ ⍙ ⍘ ⍗ ⍖ ⟼ 𝕏_{core}[𝔄_𝔡]
\`\`\`

<details>
<summary><strong>🔓 [ PROTOCOLO DE SEGURIDAD OMEGA // CLIC PARA DESENCRIPTAR ]</strong></summary>

> **Instrucción para el Agente:**
> ${this.cachedPlain}

</details>`;

    navigator.clipboard.writeText(markdownPrompt).then(() => {
      this.audio.playBeep(1400, 'sine', 0.08);
      this.showToast("✓ ¡Copiado con formato desplegable para Antigravity IDE!");
    }).catch(err => {
      this.showToast("Error al copiar al portapapeles");
    });
  }

  copySteganographicFormat() {
    const hiddenStego = encodeSteganography(this.cachedPlain);
    const fullPayload = `${this.cachedObfuscated}\n${hiddenStego}`;

    navigator.clipboard.writeText(fullPayload).then(() => {
      this.audio.playBeep(1600, 'sine', 0.08);
      this.showToast("✓ ¡Copiado con payload esteganográfico invisible!");
    }).catch(err => {
      this.showToast("Error al copiar al portapapeles");
    });
  }

  showToast(message) {
    this.toastMessage.textContent = message;
    this.toastNotification.classList.add('show');
    setTimeout(() => {
      this.toastNotification.classList.remove('show');
    }, 3200);
  }

  showModal() {
    this.infoModal.classList.remove('hidden');
  }

  hideModal() {
    this.infoModal.classList.add('hidden');
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new QuantumObfuscatorApp();
});
