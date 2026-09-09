const fs = require('fs');

function run() {
  let content = fs.readFileSync('src/components/layout/sidebar-chatbot.tsx', 'utf8');

  // Fix fab-circle
  content = content.replace(
    /\.fab-circle\{[\s\S]*?box-shadow:0 4px 20px rgba\(0,0,0,\.5\);\n        \}/,
    `.fab-circle{
          width:56px;height:56px;border-radius:50%;
          background:#18181b;
          border:1px solid rgba(255,255,255,.13);
          display:flex;align-items:center;justify-content:center;
          position:relative;z-index:2;
          animation:fab-float 4s ease-in-out infinite;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s,border-color .3s;
          box-shadow:0 4px 20px rgba(0,0,0,.5);
        }`
  );

  // Fix fab-icon
  content = content.replace(
    /\.fab-icon\{font-size:1\.35rem;z-index:3;position:relative;animation:icon-pulse 3s ease-in-out infinite;transition:transform 0\.2s;display:flex;align-items:center;justify-content:center;\}/,
    `.fab-icon{font-size:1.35rem;z-index:3;position:relative;animation:icon-pulse 3s ease-in-out infinite;}`
  );

  // Fix mav
  content = content.replace(
    /\.mav\{width:28px;height:28px;border-radius:50%;background:#18181b;border:1\.5px solid rgba\(255,255,255,\.13\);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;overflow:hidden;box-shadow:0 2px 8px rgba\(0,0,0,\.4\)\}/,
    `.mav{width:26px;height:26px;border-radius:8px;background:#18181b;border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0;margin-top:2px;}`
  );

  // Fix ch-av
  content = content.replace(
    /\.ch-av\{\n[\s\S]*?animation:ch-av-float 5s ease-in-out infinite;\n        \}/,
    `.ch-av{
          width:52px;height:52px;border-radius:50%;
          background:#18181b;
          border:1px solid rgba(255,255,255,.13);
          display:flex;align-items:center;justify-content:center;
          font-size:1.5rem;
          animation:ch-av-float 5s ease-in-out infinite;
        }`
  );
  
  // Also remove the hardcoded inline styles for font size if they exist since we set them in CSS
  content = content.replace(
    /<div className="ch-av" style=\{\{fontSize: "1\.5rem"\}\}>🤖<\/div>/,
    `<div className="ch-av">🤖</div>`
  );
  
  content = content.replace(
    /<span className="fab-icon" style=\{\{fontSize: "1\.35rem"\}\}>🤖<\/span>/,
    `<span className="fab-icon">🤖</span>`
  );
  
  content = content.replace(
    /<div className="mav" style=\{\{fontSize: "0\.8rem"\}\}>🤖<\/div>/g,
    `<div className="mav">🤖</div>`
  );

  content = content.replace(
    /<div className="mav" style=\{\{ flexShrink: 0, opacity: isTyping \? 1 : 0, transition: 'opacity 0\.2s', fontSize: "0\.8rem" \}\}>🤖<\/div>/g,
    `<div className="mav" style={{ opacity: isTyping ? 1 : 0, transition: 'opacity 0.2s' }}>🤖</div>`
  );

  fs.writeFileSync('src/components/layout/sidebar-chatbot.tsx', content);
  console.log('Fixed styling in sidebar-chatbot.tsx');
}

run();
