import React, { useMemo, useState } from 'react'
import { logoCandidates } from '../utils/logoResolver'

export default function StockAvatar({ symbol, name }){
  const [idx, setIdx] = useState(0)
  const cands = useMemo(() => logoCandidates({ symbol, name }), [symbol, name])

  // if all fail → initials
  if (idx >= cands.length) {
    const initials = symbol?.slice(0,2) || '?'
    return <span className="stock-avatar" title={name}>{initials}</span>
  }

  return (
    <img
      src={cands[idx]}
      alt={name}
      className="w-7 h-7 rounded-full bg-white object-contain p-0.5 ring-1 ring-black/10"
      onError={() => setIdx(i => i + 1)}
      title={name}
    />
  )
}
