"use client";

import { usePathname, useRouter } from 'next/navigation';
import NextLink from 'next/link';
import Logo from './Logo';

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Products & Services', to: '/product' },
      { label: 'Features', to: '/features' },
      { label: 'AI Interview', to: '/#ai-interview' },
      { label: 'Live Demo', to: '/live-demo' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Partners', to: '/partners' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Customers', to: '/customers' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs Hub', to: '/docs' },
      { label: 'APIs', to: '/docs/apis' },
      { label: 'Voice Cloning', to: '/docs/voice-cloning' },
      { label: 'Telephony', to: '/docs/telephony' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
      { label: 'Security', to: '/features#privacy' },
    ],
  },
]

function FooterLink({ to, children, className }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e) => {
    const hashIndex = to.indexOf('#');
    if (hashIndex === -1) {
      // No hash — scroll to top when navigating to a new page
      if (pathname !== to) {
        // Let Next.js handle it normally, we just ensure top scroll
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      }
      return;
    }

    e.preventDefault();
    const targetPath = to.slice(0, hashIndex) || '/';
    const hash = to.slice(hashIndex + 1);

    const scrollToHash = () => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (pathname === targetPath) {
      // Already on the correct page — just scroll to the section
      scrollToHash();
    } else {
      // Navigate to the page, then scroll after it renders
      router.push(targetPath);
      setTimeout(scrollToHash, 500);
    }
  };

  return (
    <NextLink
      href={to}
      onClick={handleClick}
      className={className}
    >
      {children}
    </NextLink>
  );
}

import { useBrand } from "@/components/providers/brand-provider";

export default function Footer() {
  const brand = useBrand();
  const isCustomDomain = brand.companyName !== "PropNex AI";

  const filteredCols = cols.map(col => {
    return {
      ...col,
      links: col.links.filter(l => {
        if (!isCustomDomain) return true;
        const key = l.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Default rules: if they have a custom domain but didn't specify some links, hide them by default unless true
        if (brand.pagesConfig[key] === true) return true;
        if (col.title === 'Company' && (brand.pagesConfig['company'] === true || brand.pagesConfig['about'] === true)) return true;
        if (col.title === 'Legal') return true; // Keep legal links
        // Default to hide for custom domain if not matched, or maybe show?
        return brand.pagesConfig[key] === true;
      })
    };
  }).filter(col => col.links.length > 0);

  return (
    <footer className="border-t border-white/10 pb-10 pt-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Logo size="footer" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              AI voice agents that qualify leads, book appointments, and follow
              up — for Real Estate, EdTech, FinTech, HealthTech & more.
            </p>
          </div>

          {filteredCols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-4 text-sm font-semibold text-white">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink
                      to={l.to}
                      className="text-sm text-slate-500 transition hover:text-white"
                    >
                      {l.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} {brand.companyName || "PropNex AI"}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {brand.instagramUrl ? (
              <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-slate-500 transition hover:text-white">Instagram</a>
            ) : !isCustomDomain ? (
              <a href="#" className="text-xs font-medium text-slate-500 transition hover:text-white">Instagram</a>
            ) : null}
            {brand.linkedinUrl ? (
              <a href={brand.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-slate-500 transition hover:text-white">LinkedIn</a>
            ) : !isCustomDomain ? (
              <a href="https://www.linkedin.com/company/propnex-technology/" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-slate-500 transition hover:text-white">LinkedIn</a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
