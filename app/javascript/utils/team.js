const SHORT_NAMES = {
  'Manchester City':         'Man City',
  'Manchester United':       'Man United',
  'Tottenham Hotspur':       'Tottenham',
  'Nottingham Forest':       "Nott'm Forest",
  'Crystal Palace':          'C. Palace',
  'Brighton & Hove Albion':  'Brighton',
  'Wolverhampton Wanderers': 'Wolves',
  'West Bromwich Albion':    'West Brom',
  'Sheffield United':        'Sheffield Utd',
  'Sheffield Wednesday':     'Sheffield Wed',
  'Leicester City':          'Leicester',
  'Queens Park Rangers':     'QPR',
  'Huddersfield Town':       'Huddersfield',
  'Blackburn Rovers':        'Blackburn',
  'Stoke City':              'Stoke',
  'Swansea City':            'Swansea',
  'Norwich City':            'Norwich',
  'Ipswich Town':            'Ipswich',
  'Luton Town':              'Luton',
}

export function shortTeamName(name) {
  return SHORT_NAMES[name] ?? name
}
