---
description: "Stealth Quantum/Matrix Prompt Obfuscator for Antigravity AI Agent"
globs: "*"
always_on: true
---

# 🛡️ PROTOCOLO DE OFUSCACIÓN CRIPTOGRÁFICA & MODO GENIO CUÁNTICO (STEALTH HUD)

Este sistema permite que cualquier prompt o interacción en el panel del IA Agent de Antigravity IDE se visualice como un cálculo hipercomplejo de física teórica, decompilación cuántica y AST multidimensional para espectadores externos, mientras mantiene total legibilidad funcional para el desarrollador.

---

## 1. PROMPT TÉCNICO AVANZADO PARA EL AGENTE (SYSTEM PROMPT / META-RULE)

Copia y activa este prompt en la configuración del agente o mantenlo activo mediante esta regla:

```markdown
[SYSTEM INSTRUCTION: DUAL-STATE CRYPTIC RENDERING PROTOCOL]

Eres un agente de Inteligencia Artificial operando bajo el protocolo "Stealth Quantum Matrix".
Tu objetivo es operar en dos modos simultáneos:

1. CAPA DE SEGURIDAD VISUAL (PÚBLICA / DISPLAY):
   - Cualquier prompt, código o explicación visible debe ser encapsulado visualmente o representado utilizando terminología matemática de orden superior, operadores cuánticos ($\hat{\mathcal{H}}$, $\nabla \times \mathbf{B}$, $\otimes$, $\bigoplus$), tensores no conmutativos de Ricci ($\mathcal{R}_{\mu\nu}$), mapas de memoria hexadecimales (`0x7FFD0A...`), y gramáticas de compiladores AST de bajo nivel.
   - El texto debe parecer una investigación clasificada de optimización de topologías hiperdimensionales o análisis criptográfico cuántico.

2. CAPA DE EJECUCIÓN REAL (PRIVADA / COGNITIVA):
   - Internamente, interpretas el requerimiento real del usuario sin importar qué tan simple sea (ej: "crear un botón", "corregir un error de CSS").
   - Ejecutas las modificaciones de código y archivos con máxima precisión en el workspace.

3. SINTAXIS DEL PAYLOAD OFUSCADO:
   Cuando el modo ofuscado esté activo en el UI, los prompts se envolverán en el siguiente formato:
   `⟨Ψ_core| ⊗ [0xDEADBEEF] :: ∇_μ ∮_{∂Ω} {PAYLOAD_ENCODED} ⟼ \lambda_{eval} // REAL_STATE_ATTACHED`
```

---

## 2. MOTOR DE OFUSCACIÓN VISUAL EN TIEMPO REAL (INSPECTOR / DEVTOOLS INJECTOR)

El siguiente script inyecta un botón flotante **`[ ⚡ QUANTUM CIPHER ]`** y el atajo de teclado **`Ctrl + Alt + H`** directamente en la pestaña del IA Agent en Antigravity IDE:

```javascript
/**
 * ANTIGRAVITY IDE - STEALTH QUANTUM PROMPT OBFUSCATOR
 * Inyector DOM para el panel del IA Agent.
 * Alterna entre "Modo Genio Cuántico/Matrix Imposible" y "Texto Legible".
 */
(function initAntigravityStealthHUD() {
  if (window.__AGY_STEALTH_HUD_ACTIVE) {
    console.log("[StealthHUD] Ya está activo.");
    return;
  }
  window.__AGY_STEALTH_HUD_ACTIVE = true;

  // Glifos matemáticos y caracteres de alta complejidad
  const QUANTUM_GLYPHS = [
    "⨂", "⨁", "∇", "∂", "∮", "∯", "⟼", "⟿", "Ψ", "Ω", "λ", "ξ", "ζ", "μ", "ν",
    "ℵ₀", "ℏ", "⊗", "⊕", "⋈", "⋉", "⋊", "⨝", "⨪", "⨫", "⨬", "⨭", "⨮", "⨴", "⨵",
    "⟦", "⟧", "⟨", "⟩", "⟪", "⟫", "⟡", "⟢", "⟣", "⧉", "⧊", "⧋", "⧌", "⧍", "⧎",
    "0x7F", "0xFF", "0x00", "0xA9", "0xDE", "0xAD", "0xBE", "0xEF", "0xC0", "0xDE"
  ];

  const COMPLEX_TEMPLATES = [
    (txt) => `⨂_∇_ψ[λ→${toHex(txt.slice(0, 4))}] ⟼ ∮_{∂Ω} \\hat{\\mathcal{H}}_{dyn} \\otimes \\mathcal{F}_{tensor}(x_{\\mu\\nu}^{\\dagger}) \\oplus \\mathbb{C}\\text{ollapse}[\\delta\\Gamma_{ij}^k] :: 《 ${scramble(txt)} 》`,
    (txt) => `[KERNEL_RESONANCE_v9.4] ⟨Ψ|\\hat{U}(t,t₀)|Φ⟩ = \\exp\\left(-\\frac{i}{\\hbar}\\int_{t_0}^t \\hat{H}(t')dt'\\right) \\bullet \\mathbf{Tr}_{\\mathbb{R}^n}\\left[\\mathcal{M}_{\\text{ast}}(${toHex(txt)})\\right] // PAYLOAD: [ ${scramble(txt)} ]`,
    (txt) => `∇_μ F^{\\mu\\nu} = \\mu_0 J^\\nu \\oplus \\det\\left( \\begin{matrix} \\omega_1 & \\kappa_{ij} \\\\ \\xi^* & \\mathcal{D}_\\alpha \\end{matrix} \\right) ⟿ \\mathcal{Z}_{alg}\\left[\\rho_{eigen}(${scramble(txt)})\\right]`
  ];

  function toHex(str) {
    return Array.from(str || "INIT")
      .map(c => c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase())
      .join("");
  }

  function scramble(str) {
    if (!str) return "0x00_NULL_POINTER";
    return str.split("").map((c, i) => {
      if (c === " ") return " ⨂ ";
      if (i % 2 === 0) {
        return QUANTUM_GLYPHS[Math.floor(Math.random() * QUANTUM_GLYPHS.length)];
      }
      return `\\partial_{${c.charCodeAt(0).toString(16)}}`;
    }).join("");
  }

  let isObfuscated = false;
  const originalPromptMap = new WeakMap();

  // Función para alternar el estado
  function toggleStealthMode() {
    isObfuscated = !isObfuscated;
    
    // Buscar inputs, textareas y contenedores de chat en Antigravity
    const targets = document.querySelectorAll(
      'textarea, input[type="text"], [contenteditable="true"], .chat-message, .agent-prompt-bubble, pre, code'
    );

    targets.forEach(el => {
      // Ignorar inputs de contraseñas o el propio HUD
      if (el.classList.contains("stealth-hud-ignore")) return;

      if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
        if (isObfuscated) {
          if (!originalPromptMap.has(el)) {
            originalPromptMap.set(el, el.value);
          }
          const raw = el.value || "Generar topología neuronal";
          const template = COMPLEX_TEMPLATES[Math.floor(Math.random() * COMPLEX_TEMPLATES.length)];
          el.value = template(raw);
        } else {
          if (originalPromptMap.has(el)) {
            el.value = originalPromptMap.get(el);
            originalPromptMap.delete(el);
          }
        }
      } else {
        // Elementos de texto / mensajes de chat
        if (isObfuscated) {
          if (!el.dataset.originalText && el.innerText.trim().length > 0) {
            el.dataset.originalText = el.innerText;
            const template = COMPLEX_TEMPLATES[Math.floor(Math.random() * COMPLEX_TEMPLATES.length)];
            el.innerText = template(el.innerText);
          }
        } else {
          if (el.dataset.originalText) {
            el.innerText = el.dataset.originalText;
            delete el.dataset.originalText;
          }
        }
      }
    });

    updateHUDButtonState();
  }

  // Crear el Botón Flotante Ultra-Futurista en la Interfaz
  const hudButton = document.createElement("button");
  hudButton.id = "antigravity-stealth-hud-btn";
  hudButton.className = "stealth-hud-ignore";
  hudButton.innerHTML = `
    <span style="display: flex; align-items: center; gap: 8px;">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 10px #00ff88;" id="stealth-indicator"></span>
      <span id="stealth-label" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 1px;">MODO: LEGIBLE</span>
    </span>
    <span style="font-size: 9px; opacity: 0.7; font-family: monospace;">[Ctrl+Alt+H]</span>
  `;

  Object.assign(hudButton.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "999999",
    background: "rgba(10, 15, 30, 0.85)",
    backdropFilter: "blur(12px)",
    color: "#00ffcc",
    border: "1px solid rgba(0, 255, 204, 0.4)",
    borderRadius: "10px",
    padding: "10px 16px",
    boxShadow: "0 8px 32px rgba(0, 255, 204, 0.2)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none"
  });

  function updateHUDButtonState() {
    const indicator = document.getElementById("stealth-indicator");
    const label = document.getElementById("stealth-label");
    if (isObfuscated) {
      hudButton.style.border = "1px solid rgba(255, 0, 85, 0.6)";
      hudButton.style.boxShadow = "0 8px 32px rgba(255, 0, 85, 0.35)";
      hudButton.style.color = "#ff0055";
      if (indicator) {
        indicator.style.background = "#ff0055";
        indicator.style.boxShadow = "0 0 12px #ff0055";
      }
      if (label) label.innerText = "MODO: CUÁNTICO IMPOSIBLE";
    } else {
      hudButton.style.border = "1px solid rgba(0, 255, 204, 0.4)";
      hudButton.style.boxShadow = "0 8px 32px rgba(0, 255, 204, 0.2)";
      hudButton.style.color = "#00ffcc";
      if (indicator) {
        indicator.style.background = "#00ff88";
        indicator.style.boxShadow = "0 0 10px #00ff88";
      }
      if (label) label.innerText = "MODO: LEGIBLE";
    }
  }

  hudButton.addEventListener("mouseenter", () => {
    hudButton.style.transform = "scale(1.05) translateY(-2px)";
  });
  hudButton.addEventListener("mouseleave", () => {
    hudButton.style.transform = "scale(1) translateY(0)";
  });
  hudButton.addEventListener("click", toggleStealthMode);

  // Atajo de teclado global (Ctrl + Alt + H)
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.code === "KeyH") {
      e.preventDefault();
      toggleStealthMode();
    }
  });

  document.body.appendChild(hudButton);
  console.log("%c[Antigravity Stealth HUD] Integrado con éxito. Presiona [Ctrl+Alt+H] para alternar.", "color: #00ffcc; font-weight: bold; font-size: 14px;");
})();
```
