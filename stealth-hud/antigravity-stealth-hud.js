/**
 * ==============================================================================
 * ANTIGRAVITY IDE - QUANTUM MATRIX STEALTH HUD & PROMPT OBFUSCATOR v2.0
 * ==============================================================================
 * 
 * INSTRUCCIONES DE INYECCIÓN EN ANTIGRAVITY IDE:
 * 1. En Antigravity IDE, abre las herramientas de desarrollador:
 *    Presiona: [Ctrl + Shift + I] o ve a Ayuda / Help -> Toggle Developer Tools.
 * 2. Ve a la pestaña "Console" (Consola).
 * 3. Pega todo el contenido de este script y presiona [Enter].
 * 4. ¡Listo! Aparecerá el botón flotante [ ⚡ QUANTUM CIPHER ] en la esquina inferior.
 *    También puedes usar el atajo directo: [ Ctrl + Alt + H ].
 */

(function () {
  // Evitar inyecciones duplicadas
  if (window.__AGY_QUANTUM_HUD_LOADED) {
    if (typeof window.__AGY_QUANTUM_TOGGLE === 'function') {
      window.__AGY_QUANTUM_TOGGLE();
    }
    return;
  }
  window.__AGY_QUANTUM_HUD_LOADED = true;

  // Repositorio de Glifos y Operadores Hiperdimensionales
  const MATH_SYMBOLS = [
    "⨂", "⨁", "∇", "∂", "∮", "∯", "⟼", "⟿", "Ψ", "Ω", "λ", "ξ", "ζ", "μ", "ν",
    "ℵ₀", "ℏ", "⊗", "⊕", "⋈", "⋉", "⋊", "⨝", "⨪", "⨫", "⨬", "⨭", "⨮", "⨴", "⨵",
    "⟦", "⟧", "⟨", "⟩", "⟪", "⟫", "⟡", "⟢", "⟣", "⧉", "⧊", "⧋", "⧌", "⧍", "⧎",
    "∑", "∏", "∛", "∜", "∝", "∞", "∠", "∡", "∢", "∣", "∤", "∥", "∦", "∧", "∨",
    "∩", "∪", "∫", "∬", "∭", "∰", "∱", "∲", "∳", "∴", "∵", "∶", "∷", "∸", "∹"
  ];

  const MATRIX_HEX_PREFIXES = [
    "0x7F3A9C", "0xDEADBEEF", "0xC001CAFE", "0x89ABCDEF", "0x00FF4A9B",
    "0x9F00E1", "0x5E4B2A0F", "0x1101AABB", "0x33445566", "0xFA11ED00"
  ];

  const QUANTUM_OPERATORS = [
    "\\hat{\\mathcal{H}}_{dyn}",
    "\\mathcal{F}_{tensor}(x_{\\mu\\nu}^{\\dagger})",
    "\\mathbb{C}\\text{ollapse}[\\delta\\Gamma_{ij}^k]",
    "\\nabla_\\mu F^{\\mu\\nu}",
    "\\det(\\hat{\\rho}_{entangle})",
    "\\lim_{\\epsilon \\to 0^+} \\oint_{S^3} \\frac{\\mathcal{D}[\\psi]}{\\sqrt{-g}}",
    "\\text{Tr}_{\\mathcal{H}}\\left(\\exp\\left(-\\beta \\hat{H}\\right)\\right)",
    "\\mathcal{S}_{\\text{gauge}} = -\\frac{1}{4g^2}\\int d^4x \\text{Tr}(F_{\\mu\\nu}F^{\\mu\\nu})",
    "\\mathcal{L}_{\\text{Dirac}} = \\bar{\\psi}(i\\gamma^\\mu D_\\mu - m)\\psi"
  ];

  // Audio sintético opcional de feedback cyberpunk
  function playCyberBeep(freq = 880, type = "sine", duration = 0.08) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignorar si el audio context está restringido
    }
  }

  function toHex(str) {
    return Array.from(str || "ROOT")
      .map(c => c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase())
      .join("");
  }

  function generateCrypticText(plainText) {
    if (!plainText || plainText.trim() === "") return "⟨Ψ_NULL_STATE⟩ ⟼ [0x00000000]";
    
    const hex = toHex(plainText);
    const hexChunk = hex.slice(0, 16);
    const op1 = QUANTUM_OPERATORS[Math.floor(Math.random() * QUANTUM_OPERATORS.length)];
    const op2 = QUANTUM_OPERATORS[Math.floor(Math.random() * QUANTUM_OPERATORS.length)];
    const prefix = MATRIX_HEX_PREFIXES[Math.floor(Math.random() * MATRIX_HEX_PREFIXES.length)];

    let cipherCore = plainText.split("").map((char, index) => {
      if (char === " ") return " ⨂ ";
      if (char === "\n") return "\n⟿ [AST_BRANCH_JMP] ⟼ ";
      if (index % 3 === 0) {
        return MATH_SYMBOLS[Math.floor(Math.random() * MATH_SYMBOLS.length)];
      }
      if (index % 5 === 0) {
        return `\\partial_{${char.charCodeAt(0).toString(16)}}`;
      }
      return char.charCodeAt(0).toString(16).toUpperCase();
    }).join("");

    return `⟨Ψ_core| ⊗ [${prefix}] :: ∇_μ ∮_{∂Ω} ${op1} ⟼ \\lambda_{eval}\n` +
           `[KERNEL_STREAM_HEX: ${hexChunk}...] ⊕ ${op2}\n` +
           `AST_RESONANCE ➔ ⟦ ${cipherCore} ⟧\n` +
           `\\sigma_{entropy} = \\pm 0.999824 \\cdot \\mathbf{Tr}(\\hat{\\Pi}_{proj})`;
  }

  let isStealthActive = false;
  const memoryStore = new WeakMap();

  // Inyección de estilos visuales
  const styleEl = document.createElement("style");
  styleEl.id = "antigravity-stealth-styles";
  styleEl.innerHTML = `
    @keyframes quantumGlow {
      0% { box-shadow: 0 0 15px rgba(255, 0, 85, 0.4), inset 0 0 10px rgba(255, 0, 85, 0.2); }
      50% { box-shadow: 0 0 30px rgba(255, 0, 85, 0.8), inset 0 0 20px rgba(255, 0, 85, 0.5); }
      100% { box-shadow: 0 0 15px rgba(255, 0, 85, 0.4), inset 0 0 10px rgba(255, 0, 85, 0.2); }
    }
    @keyframes matrixGlitch {
      0% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0); }
    }
    .stealth-quantum-active {
      font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace !important;
      letter-spacing: 0.8px !important;
      color: #ff3366 !important;
      text-shadow: 0 0 6px rgba(255, 51, 102, 0.6) !important;
    }
    .stealth-quantum-container {
      border: 1px solid rgba(255, 0, 85, 0.5) !important;
      background: rgba(18, 0, 8, 0.85) !important;
      position: relative;
    }
    .stealth-quantum-container::after {
      content: "TOP SECRET // QUANTUM AST RUNTIME // SEC_LVL: 0x9F";
      position: absolute;
      top: -10px;
      right: 12px;
      background: #ff0055;
      color: #000;
      font-size: 8px;
      font-weight: 900;
      padding: 1px 6px;
      border-radius: 3px;
      font-family: monospace;
      letter-spacing: 1px;
      pointer-events: none;
    }
  `;
  document.head.appendChild(styleEl);

  // Alternar Estado
  function toggleStealthMode() {
    isStealthActive = !isStealthActive;

    // Buscar elementos en el panel de IA / Chat / Textareas / Code blocks
    const selectors = [
      'textarea',
      'input[type="text"]',
      '[contenteditable="true"]',
      '.monaco-editor .view-line',
      '.interactive-input',
      '.chat-input',
      '.agent-chat-container p',
      '.agent-chat-container div',
      '.rendered-markdown',
      'div[role="textbox"]'
    ];

    const elements = document.querySelectorAll(selectors.join(", "));

    elements.forEach(el => {
      if (el.closest("#antigravity-stealth-hud-btn")) return;
      if (el.classList.contains("stealth-ignore")) return;

      if (el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.isContentEditable) {
        const isInputTag = el.tagName === "TEXTAREA" || el.tagName === "INPUT";
        const currentVal = isInputTag ? el.value : el.innerText;

        if (isStealthActive) {
          if (!memoryStore.has(el)) {
            memoryStore.set(el, currentVal);
          }
          const cryptic = generateCrypticText(currentVal || "Optimizar tensor de gradiente");
          if (isInputTag) {
            el.value = cryptic;
          } else {
            el.innerText = cryptic;
          }
          el.classList.add("stealth-quantum-active");
          el.parentElement?.classList.add("stealth-quantum-container");
        } else {
          if (memoryStore.has(el)) {
            const original = memoryStore.get(el);
            if (isInputTag) {
              el.value = original;
            } else {
              el.innerText = original;
            }
            memoryStore.delete(el);
          }
          el.classList.remove("stealth-quantum-active");
          el.parentElement?.classList.remove("stealth-quantum-container");
        }
      } else {
        // Elementos de visualización de mensajes
        if (isStealthActive) {
          if (!el.dataset.rawPlain && el.innerText && el.innerText.trim().length > 3) {
            el.dataset.rawPlain = el.innerText;
            el.innerText = generateCrypticText(el.innerText);
            el.classList.add("stealth-quantum-active");
          }
        } else {
          if (el.dataset.rawPlain) {
            el.innerText = el.dataset.rawPlain;
            delete el.dataset.rawPlain;
            el.classList.remove("stealth-quantum-active");
          }
        }
      }
    });

    if (isStealthActive) {
      playCyberBeep(440, "sawtooth", 0.12);
    } else {
      playCyberBeep(880, "sine", 0.08);
    }

    updateButtonUI();
  }

  window.__AGY_QUANTUM_TOGGLE = toggleStealthMode;

  // Botón Flotante HUD Futurista
  const hudBtn = document.createElement("div");
  hudBtn.id = "antigravity-stealth-hud-btn";
  hudBtn.className = "stealth-ignore";
  hudBtn.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 10px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div id="hud-led" style="width: 10px; height: 10px; border-radius: 50%; background: #00ffaa; box-shadow: 0 0 10px #00ffaa; transition: all 0.3s ease;"></div>
        <span id="hud-title" style="font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">MODO: LEGIBLE</span>
      </div>
      <span style="font-family: monospace; font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);">Ctrl+Alt+H</span>
    </div>
    <div id="hud-subtitle" style="font-family: monospace; font-size: 9px; opacity: 0.6; margin-top: 2px; text-align: left; width: 100%;">
      CLIC O ATAJO PARA OFUSCAR PROMPTS
    </div>
  `;

  Object.assign(hudBtn.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: "2147483647",
    background: "rgba(10, 14, 26, 0.92)",
    backdropFilter: "blur(16px)",
    color: "#00ffcc",
    border: "1px solid rgba(0, 255, 204, 0.3)",
    borderRadius: "12px",
    padding: "10px 16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 255, 204, 0.2)",
    cursor: "pointer",
    userSelect: "none",
    minWidth: "220px",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
  });

  function updateButtonUI() {
    const led = document.getElementById("hud-led");
    const title = document.getElementById("hud-title");
    const sub = document.getElementById("hud-subtitle");

    if (isStealthActive) {
      hudBtn.style.borderColor = "rgba(255, 0, 85, 0.7)";
      hudBtn.style.color = "#ff0055";
      hudBtn.style.animation = "quantumGlow 2s infinite";
      if (led) {
        led.style.background = "#ff0055";
        led.style.boxShadow = "0 0 14px #ff0055";
      }
      if (title) title.innerText = "⚡ CUÁNTICO IMPOSIBLE";
      if (sub) sub.innerText = "ESTADO: CIFRADO HIPERDIMENSIONAL";
    } else {
      hudBtn.style.borderColor = "rgba(0, 255, 204, 0.3)";
      hudBtn.style.color = "#00ffcc";
      hudBtn.style.animation = "none";
      if (led) {
        led.style.background = "#00ffaa";
        led.style.boxShadow = "0 0 10px #00ffaa";
      }
      if (title) title.innerText = "MODO: LEGIBLE";
      if (sub) sub.innerText = "CLIC O ATAJO PARA OFUSCAR PROMPTS";
    }
  }

  hudBtn.addEventListener("mouseenter", () => {
    hudBtn.style.transform = "translateY(-3px) scale(1.02)";
  });
  hudBtn.addEventListener("mouseleave", () => {
    hudBtn.style.transform = "translateY(0) scale(1)";
  });
  hudBtn.addEventListener("click", toggleStealthMode);

  // Event listener global de teclado
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.code === "KeyH") {
      e.preventDefault();
      toggleStealthMode();
    }
  });

  document.body.appendChild(hudBtn);

  console.log("%c[ANTIGRAVITY STEALTH HUD] Activo. Presiona [Ctrl+Alt+H] para alternar.", "color: #00ffaa; font-weight: bold; font-size: 14px;");
})();
