const fs = require('fs');
const path = require('path');

const files = [
  'src/features/landing/pages/TestimonialsPage.jsx',
  'src/features/landing/pages/ProductPage.jsx',
  'src/features/landing/pages/PartnerPage.jsx',
  'src/features/landing/pages/LiveDemoPage.jsx',
  'src/features/landing/pages/FeaturesPage.jsx',
  'src/features/landing/pages/DocsPage.jsx',
  'src/features/landing/pages/CustomersPage.jsx',
  'src/features/landing/pages/CareersPage.jsx',
  'src/features/landing/pages/CareersApplyPage.jsx',
  'src/features/landing/pages/AboutPage.jsx',
  'src/features/landing/components/Testimonials.jsx',
  'src/features/landing/components/Solutions.jsx',
  'src/features/landing/components/PhoneShowcase.jsx',
  'src/features/landing/components/IsometricStackDiagram.jsx',
  'src/features/landing/components/HowItWorks.jsx',
  'src/features/landing/components/Hero.jsx',
  'src/features/landing/components/Footer.jsx',
  'src/features/landing/components/CompleteStack.jsx',
  'src/features/landing/components/AIInterview.jsx',
  'src/features/landing/components/AgentPlayground.jsx',
  'src/features/landing/components/FAQ.jsx',
  'src/features/landing/components/FinalCTA.jsx'
];

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - does not exist.`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // 1. Add useBrand import if missing
  if (!content.includes('useBrand')) {
    content = `import { useBrand } from '@/components/providers/brand-provider';\n` + content;
  }
  
  // 2. Add const { companyName } = useBrand(); inside the default exported function component
  // Regex to match "export default function ComponentName(props) {"
  if (!content.includes('const { companyName }')) {
    content = content.replace(/(export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)/, `$1\n  const { companyName = 'PropNex AI' } = useBrand() || {};`);
  }

  // Now the tricky part: string replacements.
  // In JSX text nodes: `PropNex AI` -> `{companyName}`
  // In single quotes: `'... PropNex AI ...'` -> `` \`... \${companyName} ...\` `` (using backticks)
  // In double quotes (if used as props): `"PropNex AI"` -> `companyName` (with brackets if needed)
  
  // To be safe, we will process line by line or with specific regexes.
  // For JSX Text:
  // PropNex AI inside JSX tags
  content = content.replace(/>([^<]*)PropNex AI([^<]*)</g, function(match, p1, p2) {
    // Check if we are inside a string literal (crude check: if the match contains quotes, we might not be in JSX text)
    if (p1.includes("'") || p2.includes("'") || p1.includes('"') || p2.includes('"')) {
      return match; // Skip, handle string literals later
    }
    return `>${p1}{companyName}${p2}<`;
  });

  content = content.replace(/>([^<]*)PropNex([^<]*)</g, function(match, p1, p2) {
    if (p1.includes("'") || p2.includes("'") || p1.includes('"') || p2.includes('"')) {
      return match;
    }
    // We already replaced PropNex AI, so anything left might be just PropNex
    if (p1.includes('{companyName}')) return match; 
    return `>${p1}{companyName}${p2}<`;
  });

  // For string literals single quotes containing PropNex AI
  content = content.replace(/'([^']*)PropNex AI([^']*)'/g, "`$1${companyName}$2`");
  // Again for just PropNex in single quotes
  content = content.replace(/'([^']*)PropNex([^']*)'/g, function(match, p1, p2) {
    if (p1.includes('${companyName}')) return match;
    return `\`${p1}\${companyName}${p2}\``;
  });

  // For string literals in backticks containing PropNex AI
  content = content.replace(/`([^`]*)PropNex AI([^`]*)`/g, "`$1${companyName}$2`");
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
