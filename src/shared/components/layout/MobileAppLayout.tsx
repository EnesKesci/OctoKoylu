import type { PropsWithChildren } from 'react'

export default function MobileAppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* App shell container: full width on mobile, centered with max width on larger screens */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:px-6">
        {children}
      </div>
      {/* Safe bottom spacer for mobile UI (extra padding for home indicator) */}
      <div className="h-6 sm:h-4" />
    </div>
  )
}
