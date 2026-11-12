import { useEffect, useRef, useState } from 'react'

/** Copies text to the clipboard and flags `copied` for a moment. */
export function useCopy(resetAfter = 1600) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), resetAfter)
      })
      .catch(() => {})
  }

  return { copied, copy }
}
