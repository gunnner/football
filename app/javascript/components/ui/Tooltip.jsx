import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Tooltip({ text, logo, children }) {
  const [rect, setRect] = useState(null)
  const triggerRef      = useRef(null)
  const hasContent      = text || logo

  const show = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
  }
  const hide = () => setRect(null)

  return (
    <span ref={triggerRef} className="inline-flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}>
      {children}
      {rect && hasContent && createPortal(
        <span
          style={{
            position:  'fixed',
            top:       rect.top - 8,
            left:      rect.left + rect.width / 2,
            transform: 'translate(-50%, -100%)',
            zIndex:    9999,
          }}
          className="px-2 py-1 bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded whitespace-nowrap pointer-events-none flex items-center gap-1.5"
        >
          {logo && <img src={logo} alt="" className="w-4 h-4 object-contain" />}
          {text && <span>{text}</span>}
        </span>,
        document.body
      )}
    </span>
  )
}
