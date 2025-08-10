
import React from "react";
function Box({ title, r }) {
  const Val = (v) => { const n = Number(v ?? 0); return <span className={n >= 0 ? "rs-pos" : "rs-neg"}>{n.toFixed(0)}%</span> };
  return (
    <div className="rs-box">
      <div className="rs-box-title">{title}</div>
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-300/80">1M:</span>{Val(r["1month"])}</div>
        <div className="flex justify-between"><span className="text-gray-300/80">3M:</span>{Val(r["3months"])}</div>
        <div className="flex justify-between"><span className="text-gray-300/80">1Y:</span>{Val(r["1year"])}</div>
      </div>
    </div>
  );
}
export default function ReturnsSnapshot({ returns }) {
  if (!returns) return null;
  return (
    <div className="rs-card">
      <h2 className="rs-title">Returns Snapshot</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Box title="PORTFOLIO" r={returns.portfolio} />
        <Box title="NIFTY50" r={returns.nifty50} />
        <Box title="GOLD" r={returns.gold} />
      </div>
    </div>
  );
}
