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
        }
`;

if (!code.includes('--td-bg')) {
  code = code.replace('/*  ROUND FAB WIDGET  */', themeVars + '\n        /*  ROUND FAB WIDGET  */');

  code = code.replace(/background:#18181b/g, 'background:var(--td-fab)');
  code = code.replace(/border:1px solid rgba\(255,255,255,\.13\)/g, 'border:1px solid var(--td-fab-border)');
  code = code.replace(/color:#f4f4f5/g, 'color:var(--td-text)');
  code = code.replace(/border-top-color:#18181b/g, 'border-top-color:var(--td-fab)');
  code = code.replace(/border:1px solid rgba\(255,255,255,\.12\)/g, 'border:1px solid var(--td-ring)');
  code = code.replace(/color:#a1a1aa/g, 'color:var(--td-text-mut)');
  code = code.replace(/background:#111113/g, 'background:var(--td-bg)');
  code = code.replace(/border:1px solid rgba\(255,255,255,\.07\)/g, 'border:1px solid var(--td-border)');
  code = code.replace(/background:rgba\(255,255,255,\.04\)/g, 'background:var(--td-tag-bg)');
  code = code.replace(/background:rgba\(255,255,255,\.11\)/g, 'background:var(--td-tag-hover)');
  code = code.replace(/color:#52525b/g, 'color:var(--td-text-mut)');
  code = code.replace(/color:#d4d4d8/g, 'color:var(--td-msg-bot-text)');
  code = code.replace(/background:#fff/g, 'background:var(--td-msg-usr)');
  code = code.replace(/color:#000/g, 'color:var(--td-msg-usr-text)');
  code = code.replace(/box-shadow:0 8px 24px rgba\(0,0,0,\.5\)/g, 'box-shadow:0 8px 24px var(--td-shadow)');
  code = code.replace(/box-shadow:0 40px 80px rgba\(0,0,0,\.8\)/g, 'box-shadow:0 40px 80px var(--td-shadow)');
  code = code.replace(/box-shadow:0 4px 20px rgba\(0,0,0,\.5\)/g, 'box-shadow:0 4px 20px var(--td-shadow)');

  fs.writeFileSync('src/components/layout/sidebar-chatbot.tsx', code);
  console.log('Styles updated.');
} else {
  console.log('Styles already updated.');
}
