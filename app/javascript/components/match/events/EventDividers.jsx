export function SystemRow({ label, sub }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2 border-b border-gray-800 last:border-0">
      <div className="flex-1 h-px bg-gray-800" />
      <div className="text-center">
        <span className="text-xs font-semibold text-gray-400">{label}</span>
        {sub && <span className="text-[10px] text-gray-600 ml-1.5">{sub}</span>}
      </div>
      <div className="flex-1 h-px bg-gray-800" />
    </div>
  )
}

export function SectionDivider({ title, isLive }) {
  return (
    <div className="flex items-center gap-2 -mx-4 px-4 py-1.5 bg-gray-800/60 border-y border-gray-800/80">
      <span className="text-xs text-gray-400 font-semibold">{title}</span>
      {isLive && (
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
          <span className="text-[10px] text-red-400 font-semibold">LIVE</span>
        </span>
      )}
    </div>
  )
}
