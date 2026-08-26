/**
 * ANTIGRAVITY IDE // INYECTOR STEALTH MATRIX
 * 
 * Puedes ejecutar este script en la consola de herramientas de desarrollador (F12)
 * o guardarlo como un Marcador / Bookmarklet para alternar el modo sigilo
 * directamente en la interfaz del Agente de IA.
 * 
 * Atajo de teclado: Ctrl + Shift + S
 */

(function() {
  if (window.__antigravityStealthLoaded) {
    alert("Stealth Matrix ya está activo. Presiona Ctrl + Shift + S o haz clic en el botón flotante.");
    return;
  }
  window.__antigravityStealthLoaded = true;

  // Create floating stealth button
  const btn = document.createElement('div');
  btn.id = 'agy-stealth-floating-btn';
  btn.innerHTML = '🔒 <span>STEALTH: ON</span>';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '999999',
    background: '#040d1a',
    border: '2px solid #00f0ff',
    color: '#00f0ff',
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: 'bold',
    padding: '10px 16px',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0, 240, 255, 0.5), inset 0 0 10px rgba(0, 240, 255, 0.2)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  // Inject CSS Matrix styling
  const style = document.createElement('style');
  style.id = 'agy-stealth-css';
  style.textContent = `
    .agy-stealth-obfuscated {
      filter: blur(4px) contrast(150%) hue-rotate(90deg) !important;
      transition: filter 0.2s ease !important;
      position: relative !important;
    }
    .agy-stealth-obfuscated:hover {
      filter: blur(0px) contrast(100%) hue-rotate(0deg) !important;
    }
    .agy-stealth-badge {
      position: absolute;
      top: 5px;
      right: 5px;
      background: #ff2a55;
      color: #fff;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
  `;
  document.head.appendChild(style);

  let isStealthActive = false;

  function toggleStealth() {
    isStealthActive = !isStealthActive;
    
    // Target common chat text selectors in IDE webviews
    const targets = document.querySelectorAll('.chat-bubble, .message-content, textarea, p, [role="textbox"], .markdown-body');
    
    targets.forEach(el => {
      if (isStealthActive) {
        el.classList.add('agy-stealth-obfuscated');
      } else {
        el.classList.remove('agy-stealth-obfuscated');
      }
    });

    if (isStealthActive) {
      btn.innerHTML = '🔒 <span>STEALTH: ACTIVO</span>';
      btn.style.borderColor = '#ff2a55';
      btn.style.color = '#ff2a55';
      btn.style.boxShadow = '0 0 15px rgba(255, 42, 85, 0.6)';
    } else {
      btn.innerHTML = '🔓 <span>STEALTH: OFF</span>';
      btn.style.borderColor = '#00ff66';
      btn.style.color = '#00ff66';
      btn.style.boxShadow = '0 0 15px rgba(0, 255, 102, 0.6)';
    }
  }

  btn.addEventListener('click', toggleStealth);
  document.body.appendChild(btn);

  // Global Keyboard Shortcut: Ctrl + Shift + S
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      toggleStealth();
    }
  });

  console.log("🕶️ Antigravity Stealth Matrix cargado con éxito. Atajo: Ctrl+Shift+S");
})();
