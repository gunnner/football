export const BADGE_SVG = {
  goal: (
    <g>
      <circle r="3.5" fill="white" stroke="#222" strokeWidth="0.3" />
      <polygon points="0,-1.4 1.33,-0.43 0.82,1.13 -0.82,1.13 -1.33,-0.43" fill="#111" />
      <polygon points="0,-3.2 0.9,-2.1 0,-1.4 -0.9,-2.1" fill="#111" />
      <polygon points="2.8,-1.6 2.4,-0.2 1.33,-0.43 1.6,-1.8" fill="#111" />
      <polygon points="1.7,2.8 0.6,2.1 0.82,1.13 2,1.3" fill="#111" />
      <polygon points="-1.7,2.8 -2,1.3 -0.82,1.13 -0.6,2.1" fill="#111" />
      <polygon points="-2.8,-1.6 -1.6,-1.8 -1.33,-0.43 -2.4,-0.2" fill="#111" />
    </g>
  ),
  ownGoal: (
    <g>
      <circle r="3.5" fill="#ef4444" stroke="#222" strokeWidth="0.3" />
      <polygon points="0,-1.4 1.33,-0.43 0.82,1.13 -0.82,1.13 -1.33,-0.43" fill="#111" />
      <polygon points="0,-3.2 0.9,-2.1 0,-1.4 -0.9,-2.1" fill="#111" />
      <polygon points="2.8,-1.6 2.4,-0.2 1.33,-0.43 1.6,-1.8" fill="#111" />
      <polygon points="1.7,2.8 0.6,2.1 0.82,1.13 2,1.3" fill="#111" />
      <polygon points="-1.7,2.8 -2,1.3 -0.82,1.13 -0.6,2.1" fill="#111" />
      <polygon points="-2.8,-1.6 -1.6,-1.8 -1.33,-0.43 -2.4,-0.2" fill="#111" />
    </g>
  ),
  yellow: (
    <rect x="-2.2" y="-3" width="4.4" height="6" rx="0.8" fill="#facc15" />
  ),
  red: (
    <rect x="-2.2" y="-3" width="4.4" height="6" rx="0.8" fill="#ef4444" />
  ),
  sub: (
    <g>
      <circle r="3.5" fill="#f97316" />
      <line x1="0" y1="-2" x2="0" y2="1.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
      <polyline points="-1.4,0.2 0,2 1.4,0.2" fill="none" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  assist: (
    <g>
      <circle r="3.5" fill="#3b82f6" />
      <text textAnchor="middle" dominantBaseline="central" fontSize="3.5" fontWeight="bold" fill="white">A</text>
    </g>
  ),
}

export const SUB_ON_SVG = (
  <g>
    <circle r="3.5" fill="#22c55e" />
    <line x1="0" y1="2" x2="0" y2="-1.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
    <polyline points="-1.4,0 0,-2 1.4,0" fill="none" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
  </g>
)

export function badgeForEvent(e) {
  if (e._assist) return { svgKey: 'assist', key: 'assist', time: null }
  switch (e.type) {
    case 'Goal':
    case 'Penalty':
    case 'VAR Goal Confirmed': return { svgKey: 'goal',    key: `goal-${e.time}`,  time: null }
    case 'Own Goal':           return { svgKey: 'ownGoal', key: `og-${e.time}`,    time: null }
    case 'Yellow Card':        return { svgKey: 'yellow',  key: `yc-${e.time}`,    time: null }
    case 'Red Card':           return { svgKey: 'red',     key: `rc-${e.time}`,    time: null }
    case 'Substitution':       return { svgKey: 'sub',     key: `sub-${e.time}`,   time: e.time }
    default: return null
  }
}
