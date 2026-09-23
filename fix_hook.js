const fs = require('fs');
let c = fs.readFileSync('src/features/outbound/hooks/use-campaign.ts', 'utf8');

c = c.replace(
  'isReactivation: data.isReactivation !== undefined ? !!data.isReactivation : prev.isReactivation,',
  'isReactivation: data.isReactivation !== undefined ? !!data.isReactivation : prev.isReactivation,\n                  pausedBy: data.pausedBy || prev.pausedBy,'
);

c = c.replace(
  'isReactivation: data.isReactivation !== undefined ? !!data.isReactivation : prev.isReactivation,',
  'isReactivation: data.isReactivation !== undefined ? !!data.isReactivation : prev.isReactivation,\n          pausedBy: data.pausedBy || prev.pausedBy,'
);

fs.writeFileSync('src/features/outbound/hooks/use-campaign.ts', c);
