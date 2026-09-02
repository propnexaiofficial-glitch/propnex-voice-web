export default function CoveOrb({
  className = '',
  colors = ['#7eb8ff', '#3b82f6', '#e8f3ff'],
}) {
  return (
    <div 
      className={`overflow-hidden rounded-full ${className}`}
      style={{
        background: `radial-gradient(circle at 45% 45%, ${colors[2]} 0%, ${colors[0]} 40%, ${colors[1]} 80%, #000 100%)`,
        boxShadow: `inset -10px -10px 40px rgba(0,0,0,0.5), inset 10px 10px 40px ${colors[2]}`,
        animation: 'cove-orb-float 6s ease-in-out infinite alternate'
      }}
    >
      <div 
        className="h-full w-full opacity-60 mix-blend-overlay"
        style={{
          background: `radial-gradient(circle at 75% 25%, #ffffff 0%, transparent 40%)`,
          animation: 'cove-orb-shine 4s ease-in-out infinite alternate'
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cove-orb-float {
          0% { transform: scale(0.95) rotate(0deg); }
          100% { transform: scale(1.05) rotate(5deg); }
        }
        @keyframes cove-orb-shine {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
      `}} />
    </div>
  )
}
