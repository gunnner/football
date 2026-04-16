const F  = 'minmax(max-content, 1fr)'
const PL = 'minmax(max-content, 2fr)'

const PREFIX = [
  { key: 'shirt_number', label: '#',      align: 'center', w: '1.5rem' },
  { key: 'position',     label: 'P',      align: 'center', w: '2rem', tooltip: 'Position' },
  { key: 'team_name',    label: 'Team',   align: 'center', w: '2rem' },
  { key: 'player_name',  label: 'Player', align: 'left',   w: PL },
]

export const PLAYER_TABS = [
  {
    key: 'main', label: 'Main Stats',
    defaultSort: 'match_rating', defaultDir: 'desc',
    columns: [
      ...PREFIX,
      { key: 'match_rating',   label: 'Match Rating',   align: 'center', w: F },
      { key: 'minutes_played', label: 'Minutes Played', align: 'center', w: F },
      { key: 'goals_scored',   label: 'Goals',          align: 'center', w: F },
      { key: 'assists',        label: 'Assists',        align: 'center', w: F },
      { key: 'cards_yellow',   label: 'Yellow Cards',   align: 'center', w: F },
      { key: 'cards_red',      label: 'Red Cards',      align: 'center', w: F },
    ],
  },
  {
    key: 'attack', label: 'Attack',
    defaultSort: 'goals_scored', defaultDir: 'desc',
    columns: [
      ...PREFIX,
      { key: 'goals_scored',    label: 'Goals',          align: 'center', w: F },
      { key: 'expected_goals',  label: 'xG',             align: 'center', w: F, tooltip: 'Expected goals' },
      { key: 'shots_total',     label: 'Shots',          align: 'center', w: F },
      { key: 'shots_on_target', label: 'On Target',      align: 'center', w: F },
      { key: 'shots_accuracy',  label: 'Shots Accuracy', align: 'center', w: F, pct: true },
      { key: 'assists',         label: 'Assists',        align: 'center', w: F },
      { key: 'expected_assists',label: 'xA',             align: 'center', w: F, tooltip: 'Expected assists' },
      { key: 'offsides',        label: 'Offsides',       align: 'center', w: F },
    ],
  },
  {
    key: 'defense', label: 'Defense & Discipline',
    defaultSort: 'tackles_total', defaultDir: 'desc',
    columns: [
      ...PREFIX,
      { key: 'tackles_total',       label: 'Tackles',       align: 'center', w: F },
      { key: 'interceptions_total', label: 'Interceptions', align: 'center', w: F },
      { key: 'fouled_others',       label: 'Fouls',         align: 'center', w: F },
      { key: 'fouled_by_others',    label: 'Fouled',        align: 'center', w: F },
      { key: 'cards_yellow',        label: 'Yellow Cards',  align: 'center', w: F },
      { key: 'cards_red',           label: 'Red Cards',     align: 'center', w: F },
    ],
  },
  {
    key: 'passes', label: 'Passes',
    defaultSort: 'passes_accuracy', defaultDir: 'desc',
    columns: [
      ...PREFIX,
      { key: 'passes_accuracy',   label: 'Passes Accuracy',   align: 'center', w: F, pct: true },
      { key: 'passes_total',      label: 'Total',             align: 'center', w: F },
      { key: 'passes_successful', label: 'Successful Passes', align: 'center', w: F },
      { key: 'passes_failed',     label: 'Failed Passes',     align: 'center', w: F },
      { key: 'passes_key',        label: 'Key Passes',        align: 'center', w: F },
      { key: 'assists',           label: 'Assists',           align: 'center', w: F },
      { key: 'expected_assists',  label: 'xA',                align: 'center', w: F, tooltip: 'Expected assists' },
    ],
  },
  {
    key: 'duels', label: 'Duels',
    defaultSort: 'duel_success_rate', defaultDir: 'desc',
    columns: [
      ...PREFIX,
      { key: 'duel_success_rate',    label: 'Win Duels %',         align: 'center', w: F, pct: true },
      { key: 'duels_total',          label: 'Total Duels',         align: 'center', w: F },
      { key: 'duels_won',            label: 'Duels Won',           align: 'center', w: F },
      { key: 'duels_lost',           label: 'Duels Lost',          align: 'center', w: F },
      { key: 'dribbles_total',       label: 'Dribbles Attempts',   align: 'center', w: F },
      { key: 'dribbles_successful',  label: 'Successful Dribbles', align: 'center', w: F },
      { key: 'dribble_success_rate', label: 'Dribble success%',    align: 'center', w: F, pct: true },
    ],
  },
  {
    key: 'goalkeepers', label: 'Goalkeepers',
    defaultSort: 'expected_goals_prevented', defaultDir: 'desc',
    gkOnly: true,
    columns: [
      { key: 'shirt_number',                      label: '#',             align: 'center', w: '1.5rem' },
      { key: 'position',                          label: 'P',             align: 'center', w: '2rem', tooltip: 'Position' },
      { key: 'team_name',                         label: 'Team',          align: 'center', w: 'max-content' },
      { key: 'player_name',                       label: 'Player',        align: 'left',   w: PL, noSort: true },
      { key: 'expected_goals_prevented',          label: 'xG Prevented',  align: 'center', w: F, tooltip: 'Expected goals prevented' },
      { key: 'goals_saved',                       label: 'Saves',         align: 'center', w: F },
      { key: 'goals_conceded',                    label: 'Conceded',      align: 'center', w: F },
      { key: 'expected_goals_on_target_conceded', label: 'xGOT Conceded', align: 'center', w: F, tooltip: 'Expected goals on target conceded' },
      { key: 'gk_penalties_faced',                label: 'Pen Faced',     align: 'center', w: F, tooltip: 'Penalties faced' },
      { key: 'gk_penalties_saved',                label: 'Pen Saved',     align: 'center', w: F, tooltip: 'Penalties saved' },
      { key: 'gk_penalties_saved_pct',            label: 'Pen Save %',    align: 'center', w: F, tooltip: 'Penalty save rate %', pct: true },
    ],
  },
  {
    key: 'penalties', label: 'Penalties',
    defaultSort: 'penalties_accuracy', defaultDir: 'desc',
    penaltiesOnly: true,
    columns: [
      { key: 'shirt_number',       label: '#',                  align: 'center', w: '1.5rem' },
      { key: 'position',           label: 'P',                  align: 'center', w: '2rem', tooltip: 'Position' },
      { key: 'team_name',          label: 'Team',               align: 'center', w: '2rem' },
      { key: 'player_name',        label: 'Player',             align: 'left',   w: PL },
      { key: 'penalties_accuracy', label: 'Penalties Accuracy', align: 'center', w: F, pct: true },
      { key: 'penalties_total',    label: 'Penalties Total',    align: 'center', w: F },
      { key: 'penalties_scored',   label: 'Penalties Scored',   align: 'center', w: F },
      { key: 'penalties_missed',   label: 'Penalties Missed',   align: 'center', w: F },
    ],
  },
]

export const GENERAL_SECTIONS = [
  { title: 'Summary',    stats: ['Possession', 'Expected Goals', 'Big Chances Created'] },
  { title: 'Shots',      stats: ['Shots total', 'Shots on target', 'Shots off target', 'Blocked shots', 'Shots within penalty area', 'Shots outside penalty area', 'Shots accuracy'] },
  { title: 'Passing',    stats: ['Successful passes', 'Passes successful', 'Key Passes', 'Passes Into Final Third', 'Passes Own Half', 'Passes Opposition Half', 'Successful Long Passes', 'Long Passes', 'Crosses', 'Successful Crosses', 'Expected Assists', 'Throw-Ins', 'Goal Kicks', 'Goalkeeper saves', 'Failed passes', 'Passes total', 'Total passes'] },
  { title: 'Defending',  stats: ['Tackles', 'Tackles total', 'Successful Tackles', 'Interceptions total', 'Interceptions', 'Clearances', 'Backward Passes'] },
  { title: 'Duels',      stats: ['Aerial Duels', 'Successful Aerial Duels', 'Dribbles', 'Successful Dribbles'] },
  { title: 'Discipline', stats: ['Fouls', 'Yellow cards', 'Red cards', 'Offsides', 'Corners', 'Free Kicks'] },
]
