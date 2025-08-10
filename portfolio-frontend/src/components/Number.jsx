
export function fmtINR(n){ return n?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) }
export function Pct({v}){ const cls = v >= 0 ? 'text-emerald-400' : 'text-rose-400'; return <span className={cls}>{(v??0).toFixed(2)}%</span> }
