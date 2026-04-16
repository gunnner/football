export const EVENT_ICONS = {
  'Goal':                         { emoji: '⚽' },
  'Penalty':                      { emoji: '⚽' },
  'Own Goal':                     { emoji: '⚽' },
  'Yellow Card':                  { emoji: '🟨' },
  'Red Card':                     { emoji: '🟥' },
  'Yellow-Red Card':              { emoji: '🟧' },
  'Substitution':                 { emoji: '🔄' },
  'VAR Goal Confirmed':           { emoji: '✅' },
  'VAR Goal Cancelled':           { emoji: '❌' },
  'VAR Penalty':                  { emoji: '⚽' },
  'VAR Penalty Cancelled':        { emoji: '❌' },
  'VAR Goal Cancelled - Offside': { emoji: '🚩' },
}

export const EVENT_EMOJI = Object.fromEntries(
  Object.entries(EVENT_ICONS).map(([k, v]) => [k, v.emoji])
)

export const EVENT_DOT_COLORS = {
  'Goal':                         '#22c55e',
  'Penalty':                      '#22c55e',
  'Own Goal':                     '#ef4444',
  'Yellow Card':                  '#eab308',
  'Red Card':                     '#ef4444',
  'Yellow-Red Card':              '#f97316',
  'Substitution':                 '#6b7280',
  'VAR Goal Confirmed':           '#22c55e',
  'VAR Goal Cancelled':           '#ef4444',
  'VAR Penalty':                  '#3b82f6',
  'VAR Penalty Cancelled':        '#ef4444',
  'VAR Goal Cancelled - Offside': '#ef4444',
}

export const GOAL_TYPES = new Set(['Goal', 'Penalty', 'Own Goal', 'VAR Goal Confirmed'])
export const CARD_TYPES = new Set(['Yellow Card', 'Red Card', 'Yellow-Red Card'])
export const SUB_TYPES  = new Set(['Substitution'])

export const SHORT_LABELS = {
  'Goal': 'Goal', 'Penalty': 'Pen', 'Own Goal': 'OG',
  'Yellow Card': 'YC', 'Red Card': 'RC', 'Yellow-Red Card': '2Y',
  'Substitution': 'Sub',
  'VAR Goal Confirmed': 'VAR✓', 'VAR Goal Cancelled': 'VAR✗',
  'VAR Penalty': 'VPen', 'VAR Penalty Cancelled': 'VPen✗',
  'VAR Goal Cancelled - Offside': 'OFS', 'Missed Penalty': 'Miss',
}
