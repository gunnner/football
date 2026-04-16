export function ChevronLeft({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

export function ChevronRight({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

export const GoalSVG = () => (
  <svg width="14" height="14" viewBox="-3.5 -3.5 7 7" className="flex-shrink-0 inline-block">
    <circle r="3.5" fill="white" stroke="#222" strokeWidth="0.3" />
    <polygon points="0,-1.4 1.33,-0.43 0.82,1.13 -0.82,1.13 -1.33,-0.43" fill="#111" />
    <polygon points="0,-3.2 0.9,-2.1 0,-1.4 -0.9,-2.1" fill="#111" />
    <polygon points="2.8,-1.6 2.4,-0.2 1.33,-0.43 1.6,-1.8" fill="#111" />
    <polygon points="1.7,2.8 0.6,2.1 0.82,1.13 2,1.3" fill="#111" />
    <polygon points="-1.7,2.8 -2,1.3 -0.82,1.13 -0.6,2.1" fill="#111" />
    <polygon points="-2.8,-1.6 -1.6,-1.8 -1.33,-0.43 -2.4,-0.2" fill="#111" />
  </svg>
)

export const OwnGoalSVG = () => (
  <svg width="14" height="14" viewBox="-3.5 -3.5 7 7" className="flex-shrink-0 inline-block">
    <circle r="3.5" fill="#ef4444" stroke="#222" strokeWidth="0.3" />
    <polygon points="0,-1.4 1.33,-0.43 0.82,1.13 -0.82,1.13 -1.33,-0.43" fill="#111" />
    <polygon points="0,-3.2 0.9,-2.1 0,-1.4 -0.9,-2.1" fill="#111" />
    <polygon points="2.8,-1.6 2.4,-0.2 1.33,-0.43 1.6,-1.8" fill="#111" />
    <polygon points="1.7,2.8 0.6,2.1 0.82,1.13 2,1.3" fill="#111" />
    <polygon points="-1.7,2.8 -2,1.3 -0.82,1.13 -0.6,2.1" fill="#111" />
    <polygon points="-2.8,-1.6 -1.6,-1.8 -1.33,-0.43 -2.4,-0.2" fill="#111" />
  </svg>
)
