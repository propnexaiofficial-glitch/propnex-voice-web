const fs = require('fs');
let c = fs.readFileSync('src/features/outbound/types.ts', 'utf8');

if (!c.includes('pausedBy?: string;')) {
  c = c.replace(
    'isReactivation?: boolean;',
    'isReactivation?: boolean;\n  pausedBy?: string;'
  );
  fs.writeFileSync('src/features/outbound/types.ts', c);
}
