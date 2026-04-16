import { useState } from 'react'
import { signIn, signUp } from '../../services/auth'

export default function AuthForm({ onSuccess, defaultMode = 'sign_in' }) {
  const [mode,    setMode]    = useState(defaultMode)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  const [fields, setFields] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
  })

  function set(key) {
    return e => setFields(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let data
      if (mode === 'sign_in') {
        data = await signIn(fields.email, fields.password)
      } else {
        data = await signUp(
          fields.email, fields.password, fields.password_confirmation,
          fields.first_name, fields.last_name
        )
      }
      onSuccess?.(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm mx-auto">
      <h2 className="text-xl font-bold text-white mb-6 text-center">
        {mode === 'sign_in' ? 'Sign in' : 'Create account'}
      </h2>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'sign_up' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">First name</label>
              <input
                type="text"
                value={fields.first_name}
                onChange={set('first_name')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Last name</label>
              <input
                type="text"
                value={fields.last_name}
                onChange={set('last_name')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={fields.email}
            onChange={set('email')}
            required
            autoFocus
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={fields.password}
            onChange={set('password')}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {mode === 'sign_up' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Confirm password</label>
            <input
              type="password"
              value={fields.password_confirmation}
              onChange={set('password_confirmation')}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
        >
          {loading ? '...' : mode === 'sign_in' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        {mode === 'sign_in' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => { setMode(mode === 'sign_in' ? 'sign_up' : 'sign_in'); setError(null) }}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          {mode === 'sign_in' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
