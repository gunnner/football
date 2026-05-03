import { useState } from 'react'
import { signIn, signUp } from '../../services/auth'
import styles from './AuthForm.module.css'

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
    <div className={styles.card}>
      <h2 className={styles.title}>
        {mode === 'sign_in' ? 'Sign in' : 'Create account'}
      </h2>

      {error && (
        <div className={styles.errorBox}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {mode === 'sign_up' && (
          <div className={styles.nameGrid}>
            <div className={styles.field}>
              <label className={styles.label}>First name</label>
              <input
                type="text"
                value={fields.first_name}
                onChange={set('first_name')}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last name</label>
              <input
                type="text"
                value={fields.last_name}
                onChange={set('last_name')}
                className={styles.input}
              />
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={fields.email}
            onChange={set('email')}
            required
            autoFocus
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            value={fields.password}
            onChange={set('password')}
            required
            className={styles.input}
          />
        </div>

        {mode === 'sign_up' && (
          <div className={styles.field}>
            <label className={styles.label}>Confirm password</label>
            <input
              type="password"
              value={fields.password_confirmation}
              onChange={set('password_confirmation')}
              required
              className={styles.input}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={styles.submitBtn}
        >
          {loading ? '...' : mode === 'sign_in' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className={styles.footer}>
        {mode === 'sign_in' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => { setMode(mode === 'sign_in' ? 'sign_up' : 'sign_in'); setError(null) }}
          className={styles.switchBtn}
        >
          {mode === 'sign_in' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
