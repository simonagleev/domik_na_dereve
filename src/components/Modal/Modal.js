'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

export default function Modal({ isOpen, onClose, children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="client-modal-overlay" onClick={onClose}>
      <div className="client-modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Закрыть">
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
