export function calcAge(birthDate) {
  if (!birthDate) return null
  let dob
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
    const [d, m, y] = birthDate.split('/')
    dob = new Date(`${y}-${m}-${d}`)
  } else {
    dob = new Date(birthDate)
  }
  if (isNaN(dob)) return null
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000))
}
