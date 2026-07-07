/**
 * T070 — EmptyState
 */
interface Props {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ message, actionLabel, onAction }: Props) {
  return (
    <div className="empty-state">
      <p className="empty-state__message">{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn--secondary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
