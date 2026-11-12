export default function CopyIcon({ copied = false }: { copied?: boolean }) {
  if (copied) {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M2 6.5 4.8 9 10 3" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <rect x="3.5" y="3.5" width="8" height="8" rx="1" />
      <path d="M8.5 3.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
    </svg>
  )
}
