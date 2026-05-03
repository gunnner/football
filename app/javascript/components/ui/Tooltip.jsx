import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './Tooltip.module.css'

export default function Tooltip({ text, logo, children }) {
  const [rect, setRect] = useState(null)
  const triggerRef      = useRef(null)
  const hasContent      = text || logo

  const show = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
  }
  const hide = () => setRect(null)

  return (
    <span ref={triggerRef} className={styles.trigger}
      onMouseEnter={show}
      onMouseLeave={hide}>
      {children}
      {rect && hasContent && createPortal(
        <span
          className={styles.popup}
          style={{
            position:  'fixed',
            top:       rect.top - 8,
            left:      rect.left + rect.width / 2,
            transform: 'translate(-50%, -100%)',
            zIndex:    9999,
          }}
        >
          {logo && <img src={logo} alt="" className={styles.logo} />}
          {text && <span>{text}</span>}
        </span>,
        document.body
      )}
    </span>
  )
}
