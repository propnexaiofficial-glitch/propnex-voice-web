/** Update with Tanishq's real mobile when ready */
export const TANISHQ_SALES_TEL = 'tel:+919889479110'
export const TANISHQ_SALES_DISPLAY = '98894 79110'

export const plans = [
  {
    id: 'payg',
    name: 'Pay-as-you-go',
    subtitle: 'Prepaid · flexible credits',
    context: 'Perfect for getting started:',
    features: [
      '₹4 per minute — Prepaid',
      'One-time setup fee ₹24,999',
      'White Labelling — On Demand',
      'Top-up when balance is low',
      'No monthly commitment',
    ],
    cta: 'Get started',
    popular: false,
    icon: 'rocket',
    accent: 'cyan',
  },
  {
    id: 'volume',
    name: 'Volume Plan',
    subtitle: 'Discounted per-minute pricing',
    context: null,
    features: [
      '₹3.5 per minute',
      'One-time setup fee ₹24,999',
      'White Labelling — On Demand',
      'Pre-configured voice agents',
      'Priority support',
    ],
    cta: 'Get started',
    popular: true,
    icon: 'bolt',
    accent: 'violet',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    subtitle: 'Custom scalable plans',
    context: 'For high-volume teams:',
    features: [
      'Custom per-minute pricing',
      'One-time setup fee ₹24,999',
      'White Labelling — On Demand',
      'Customised integrations & deployment',
      'Dedicated account manager',
      `Talk to sales — ${TANISHQ_SALES_DISPLAY}`,
    ],
    cta: 'Talk to sales',
    popular: false,
    icon: 'building',
    accent: 'amber',
    ctaHref: TANISHQ_SALES_TEL,
  },
]

export const planThemes = {
  cyan: {
    icon: 'text-cyan-300',
    iconWrap:
      'border-cyan-400/40 bg-cyan-500/15 group-hover:bg-cyan-400/25 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.45)]',
    check: 'text-cyan-300',
    card: 'border-cyan-400/25 bg-gradient-to-b from-cyan-500/10 to-[#0f1418] hover:border-cyan-300/70 hover:shadow-[0_0_36px_rgba(34,211,238,0.35)] hover:-translate-y-1',
    selected:
      'border-cyan-300 bg-gradient-to-b from-cyan-400/20 to-[#0f1418] shadow-[0_0_40px_rgba(34,211,238,0.4)] -translate-y-1',
    badge: 'bg-cyan-300 text-black',
    btn: 'bg-cyan-400 text-black hover:bg-cyan-300',
    btnIdle:
      'border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-400 hover:text-black',
  },
  violet: {
    icon: 'text-fuchsia-200',
    iconWrap:
      'border-fuchsia-400/40 bg-fuchsia-500/15 group-hover:bg-fuchsia-400/25 group-hover:shadow-[0_0_20px_rgba(232,121,249,0.45)]',
    check: 'text-fuchsia-300',
    card: 'border-fuchsia-400/40 bg-gradient-to-b from-violet-500/20 to-[#14101c] hover:border-fuchsia-300/80 hover:shadow-[0_0_42px_rgba(168,85,247,0.45)] hover:-translate-y-1',
    selected:
      'border-fuchsia-300 bg-gradient-to-b from-violet-400/25 to-[#14101c] shadow-[0_0_48px_rgba(168,85,247,0.5)] -translate-y-1',
    badge: 'bg-gradient-to-r from-violet-400 to-fuchsia-400 text-black',
    btn: 'bg-gradient-to-r from-violet-400 to-fuchsia-400 text-black hover:from-violet-300 hover:to-fuchsia-300',
    btnIdle:
      'border border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-100 hover:bg-fuchsia-400 hover:text-black',
  },
  amber: {
    icon: 'text-amber-300',
    iconWrap:
      'border-amber-400/40 bg-amber-500/15 group-hover:bg-amber-400/25 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    check: 'text-amber-300',
    card: 'border-amber-400/25 bg-gradient-to-b from-amber-500/10 to-[#16120c] hover:border-amber-300/70 hover:shadow-[0_0_36px_rgba(251,191,36,0.35)] hover:-translate-y-1',
    selected:
      'border-amber-300 bg-gradient-to-b from-amber-400/20 to-[#16120c] shadow-[0_0_40px_rgba(251,191,36,0.4)] -translate-y-1',
    badge: 'bg-amber-300 text-black',
    btn: 'bg-amber-300 text-black hover:bg-amber-200',
    btnIdle:
      'border border-amber-400/40 bg-amber-500/10 text-amber-100 hover:bg-amber-300 hover:text-black',
  },
}
