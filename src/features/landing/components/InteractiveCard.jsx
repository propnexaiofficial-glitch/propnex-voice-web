

/**
 * Elegant interactive card — soft tilt on hover, press on click.
 */
export default function InteractiveCard({
  as: Tag = 'article',
  className = '',
  children,
  tilt = true, // Ignored in CSS version, kept for prop compatibility
  onClick,
  ...props
}) {
  return (
    <Tag
      className={`card-panel card-interactive gsap-card relative group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] ${className}`}
      onClick={onClick}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.25),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative z-[1] h-full">{children}</div>
    </Tag>
  )
}
