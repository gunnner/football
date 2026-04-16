export async function signIn(email, password) {
  const response = await fetch('/api/v1/auth/sign_in', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify({ user: { email, password } })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  return data
}

export async function signUp(email, password, passwordConfirmation, firstName, lastName) {
  const response = await fetch('/api/v1/auth/sign_up', {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify({ user: { email, password, password_confirmation: passwordConfirmation, first_name: firstName, last_name: lastName } })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  return data
}

export async function signOut() {
  await fetch('/api/v1/auth/sign_out', {
    method:      'DELETE',
    credentials: 'include'
  })
}

export async function getMe() {
  const response = await fetch('/api/v1/auth/me', {
    credentials: 'include'
  })
  if (!response.ok) return null
  return response.json()
}
