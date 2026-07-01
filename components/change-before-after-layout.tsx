import type { ReactNode } from "react"

export function ChangeBeforeAfterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-x-6 border-b border-gray-200 pb-2">
        <h3 className="text-sm font-semibold text-gray-500">変更前</h3>
        <h3 className="text-sm font-semibold text-gray-500">変更後</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

export function ChangeBeforeAfterRow({
  label,
  before,
  after,
}: {
  label: string
  before?: string | null
  after: ReactNode
}) {
  const beforeText = before?.toString().trim() ? before : "—"

  return (
    <div className="grid grid-cols-2 gap-x-6 items-start">
      <div className="space-y-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-800">{beforeText}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-gray-500">{label}</p>
        <div>{after}</div>
      </div>
    </div>
  )
}
