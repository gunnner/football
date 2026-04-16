const TZ_COUNTRY = {
  'Europe/Kiev':        'UA', 'Europe/Kyiv':        'UA',
  'Europe/London':      'GB', 'Europe/Berlin':      'DE',
  'Europe/Paris':       'FR', 'Europe/Madrid':      'ES',
  'Europe/Rome':        'IT', 'Europe/Warsaw':      'PL',
  'Europe/Lisbon':      'PT', 'Europe/Amsterdam':   'NL',
  'Europe/Brussels':    'BE', 'Europe/Vienna':      'AT',
  'Europe/Zurich':      'CH', 'Europe/Prague':      'CZ',
  'Europe/Budapest':    'HU', 'Europe/Bucharest':   'RO',
  'Europe/Sofia':       'BG', 'Europe/Athens':      'GR',
  'Europe/Helsinki':    'FI', 'Europe/Stockholm':   'SE',
  'Europe/Oslo':        'NO', 'Europe/Copenhagen':  'DK',
  'Europe/Dublin':      'IE', 'Europe/Belgrade':    'RS',
  'Europe/Zagreb':      'HR', 'Europe/Sarajevo':    'BA',
  'Europe/Ljubljana':   'SI', 'Europe/Skopje':      'MK',
  'America/New_York':   'US', 'America/Chicago':    'US',
  'America/Los_Angeles':'US', 'America/Toronto':    'CA',
  'Asia/Tokyo':         'JP', 'Asia/Seoul':         'KR',
  'Asia/Shanghai':      'CN', 'Australia/Sydney':   'AU',
  'America/Sao_Paulo':  'BR',
}

export function getCountryCode() {
  try {
    return TZ_COUNTRY[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? null
  } catch {
    return null
  }
}
