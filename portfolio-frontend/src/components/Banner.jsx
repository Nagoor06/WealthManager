
import React from 'react'
export default function Banner({ kind='info', children }){
  const map = { info:'bg-blue-500/15 text-blue-200 border-blue-400/30', warn:'bg-amber-500/15 text-amber-200 border-amber-400/30', error:'bg-rose-500/15 text-rose-200 border-rose-400/30' }
  return <div className={`rounded-xl border px-3 py-2 text-sm ${map[kind]}`}>{children}</div>
}
