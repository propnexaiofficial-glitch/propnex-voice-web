const fs = require('fs');
const path = require('path');

const files = [
  'src/features/landing/components/AgentPlayground.jsx',
  'src/features/landing/components/AIInterview.jsx',
  'src/features/landing/components/CompleteStack.jsx',
  'src/features/landing/components/FAQ.jsx',
  'src/features/landing/components/FinalCTA.jsx',
  'src/features/landing/components/Footer.jsx',
  'src/features/landing/components/Hero.jsx',
  'src/features/landing/components/HowItWorks.jsx',
  'src/features/landing/components/IsometricStackDiagram.jsx',
  'src/features/landing/components/Logo.jsx',
  'src/features/landing/components/Navbar.jsx',
  'src/features/landing/components/PhoneShowcase.jsx',
  'src/features/landing/components/Solutions.jsx',
  'src/features/landing/components/Testimonials.jsx',
  'src/features/landing/pages/AboutPage.jsx',
  'src/features/landing/pages/CareersApplyPage.jsx',
  'src/features/landing/pages/CareersPage.jsx',
  'src/features/landing/pages/CustomersPage.jsx',
  'src/features/landing/pages/DocsPage.jsx',
  'src/features/landing/pages/FeaturesPage.jsx',
  'src/features/landing/pages/LiveDemoPage.jsx',
  'src/features/landing/pages/PartnerPage.jsx',
  'src/features/landing/pages/ProductPage.jsx',
  'src/features/landing/pages/TestimonialsPage.jsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if already importing useBrand (except for Navbar which might already have it)
  if (!content.includes('useBrand')) {
    // Add import
    content = `import { useBrand } from '@/components/providers/brand-provider'\n` + content;
    
    // Inject const brand = useBrand() into the default export function
    // Regex matches export default function ComponentName(props) {
    content = content.replace(/(export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)/, `$1\n  const brand = useBrand();\n  const companyName = brand.companyName || "PropNex AI";\n`);
  } else {
    // If it has useBrand, just make sure companyName is defined
    if (!content.includes('const companyName =')) {
      content = content.replace(/(const brand = useBrand\(\);)/, `$1\n  const companyName = brand.companyName || "PropNex AI";\n`);
    }
  }

  // Replace text instances (safe ones)
  // Text inside tags: >PropNex AI< -> >{companyName}<
  content = content.replace(/>\s*PropNex AI\s*</gi, `>{companyName}<`);
  
  // "PropNex AI" inside quotes -> {companyName}
  // Wait, if it's inside quotes like "PropNex AI is great", we should use JSX `{companyName} is great` or backticks if it's a string literal.
  
  // Let's manually replace some known exact phrases in the files
  content = content.replace(/PropNex AI/gi, `{companyName}`);
  
  // This simplistic replace will turn `import ... from "PropNex AI"` into `import ... from "{companyName}"` which is bad, but PropNex AI isn't an npm package.
  // Wait, `PropNex AI` is not an npm package, but what about `propnexai`? (lowercase)
  // Let's only replace PropNex AI (case-insensitive with space).
  // Oh, `{companyName}` inside a string literal like `'Working with PropNex AI'` will become `'Working with {companyName}'` which is invalid JS! It should be \`Working with \${companyName}\`
  // This is too risky. I will just write a highly specific search and replace script for the exact text occurrences found.

  // Let's just output the matches first to see how many there are.
}

console.log("Done");
