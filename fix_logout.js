const fs = require('fs');
const files = [
  'src/components/layout/sidebar.tsx',
  'src/components/layout/dashboard-shell.tsx',
  'src/components/common/user-menu.tsx'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    // We want to replace exactly window.location.replace("/auth/sign-in");
    c = c.replace(
      /window\.location\.replace\(["']\/auth\/sign-in["']\);/g,
      'window.location.replace("https://propnexai.com/");'
    );
    // There may also be window.location.href = "/auth/sign-in";
    c = c.replace(
      /window\.location\.href = ["']\/auth\/sign-in["'];/g,
      'window.location.href = "https://propnexai.com/";'
    );
    fs.writeFileSync(f, c);
  }
}
