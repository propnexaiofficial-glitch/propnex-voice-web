const fs = require('fs');
let c = fs.readFileSync('src/features/outbound/hooks/use-campaign.ts', 'utf8');

c = c.replace(
  /          pausedBy: data\.pausedBy \|\| prev\.pausedBy,\r?\n                  pausedBy: data\.pausedBy \|\| prev\.pausedBy,/g,
  '          pausedBy: data.pausedBy || prev.pausedBy,'
);

fs.writeFileSync('src/features/outbound/hooks/use-campaign.ts', c);
