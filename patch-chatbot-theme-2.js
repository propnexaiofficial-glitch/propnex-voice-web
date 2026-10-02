const fs = require('fs');
let code = fs.readFileSync('src/components/layout/sidebar-chatbot.tsx', 'utf8');

const themeVars = `
        :root {
          --td-bg: #ffffff;
          --td-bg-hover: #f4f4f5;
          --td-border: rgba(0,0,0,0.1);
          --td-text: #09090b;
          --td-text-mut: #71717a;
          --td-fab: #ffffff;
          --td-fab-border: rgba(0,0,0,0.15);
          --td-ring: rgba(0,0,0,0.08);
          --td-input: #f4f4f5;
          --td-msg-bot: #f4f4f5;
          --td-msg-bot-text: #09090b;
          --td-msg-usr: #000000;
          --td-msg-usr-text: #ffffff;
          --td-tag-bg: rgba(0,0,0,0.04);
          --td-tag-hover: rgba(0,0,0,0.08);
          --td-shadow: rgba(0,0,0,0.1);
          --td-hover-border: rgba(0,0,0,0.3);
          --td-hover-shadow: 0 16px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
          --td-ring-2: rgba(0,0,0,0.04);
          --td-ring-3: rgba(0,0,0,0.02);
          --td-glow: rgba(0,0,0,0.1);
          --td-scan: rgba(0,0,0,0.2);
          --td-bubble-arrow: rgba(0,0,0,0.15);
        }
        .dark {
          --td-bg: #111113;
          --td-bg-hover: rgba(255,255,255,0.1);
          --td-border: rgba(255,255,255,0.07);
          --td-text: #f4f4f5;
          --td-text-mut: #a1a1aa;
          --td-fab: #18181b;
          --td-fab-border: rgba(255,255,255,0.13);
          --td-ring: rgba(255,255,255,0.12);
          --td-input: transparent;
          --td-msg-bot: rgba(255,255,255,0.04);
          --td-msg-bot-text: #d4d4d8;
          --td-msg-usr: #ffffff;
          --td-msg-usr-text: #000000;
          --td-tag-bg: rgba(255,255,255,0.04);
          --td-tag-hover: rgba(255,255,255,0.11);
          --td-shadow: rgba(0,0,0,0.8);
          --td-hover-border: rgba(255,255,255,0.4);
          --td-hover-shadow: 0 16px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1);
          --td-ring-2: rgba(255,255,255,0.06);
          --td-ring-3: rgba(255,255,255,0.03);
          --td-glow: rgba(255,255,255,0.35);
          --td-scan: rgba(255,255,255,0.8);
          --td-bubble-arrow: rgba(255,255,255,0.13);
        }
`;

// reset to original first before we re-patch if needed, but we can just regex replace on current code
code = code.replace(/:root\s*{[^}]+}\s*\.dark\s*{[^}]+}/, themeVars.trim());

// We need to replace the remaining hardcoded values that we didn't touch
code = code.replace(/border-color:rgba\(255,255,255,\.4\)/g, 'border-color:var(--td-hover-border)');
code = code.replace(/box-shadow:0 16px 40px rgba\(0,0,0,\.8\),0 0 0 1px rgba\(255,255,255,\.1\)/g, 'box-shadow:var(--td-hover-shadow)');
code = code.replace(/border-color:rgba\(255,255,255,\.06\)/g, 'border-color:var(--td-ring-2)');
code = code.replace(/border-color:rgba\(255,255,255,\.03\)/g, 'border-color:var(--td-ring-3)');
code = code.replace(/rgba\(255,255,255,\.35\)/g, 'var(--td-glow)');
code = code.replace(/background:#18181b/g, 'background:var(--td-fab)'); // for glow mask
code = code.replace(/rgba\(255,255,255,\.8\)/g, 'var(--td-scan)');
code = code.replace(/border-top-color:rgba\(255,255,255,\.13\)/g, 'border-top-color:var(--td-bubble-arrow)');

fs.writeFileSync('src/components/layout/sidebar-chatbot.tsx', code);
console.log('Styles updated deeply.');
