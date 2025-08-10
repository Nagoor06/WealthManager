import React, { useEffect, useMemo, useState } from 'react';
import Modal from './components/Modal.jsx';
import SearchInput from './components/SearchInput.jsx';
import ReturnsSnapshot from './components/ReturnsSnapshot.jsx';
import StockAvatar from './components/StockAvatar.jsx';
import Banner from './components/Banner.jsx';
import { fmtINR, Pct } from './components/Number.jsx';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const BASE = import.meta.env.VITE_API_URL || '';
const LINE_COLORS = { portfolio:'#F5D97E', nifty50:'#22d3ee', gold:'#D4AF37' };
const PIE_COLORS  = ['#F5D97E','#22d3ee','#8b5cf6','#34d399','#f59e0b','#fb7185','#a78bfa','#84cc16','#eab308','#60a5fa'];

export default function App(){
  const [summary, setSummary]   = useState(null);
  const [alloc, setAlloc]       = useState(null);
  const [perf, setPerf]         = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [q, setQ]               = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [sel, setSel]           = useState(null);


  useEffect(()=>{
    (async ()=>{
      try{
        const [s,a,p,h] = await Promise.all([
          fetch(`${BASE}/api/portfolio/summary`).then(r=>r.json()),
          fetch(`${BASE}/api/portfolio/allocation`).then(r=>r.json()),
          fetch(`${BASE}/api/portfolio/performance`).then(r=>r.json()),
          fetch(`${BASE}/api/portfolio/holdings`).then(r=>r.json()),
        ]);
        setSummary(s); setAlloc(a); setPerf(p); setHoldings(h); setLoading(false);
      }catch(e){
        console.error(e);
        setError('Could not reach API. Start backend on http://localhost:5174, or set VITE_API_URL.');
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(()=>{
    const qq = (q || '').toLowerCase();
    if(!qq) return holdings;
    return holdings.filter(h =>
      (h.symbol && h.symbol.toLowerCase().includes(qq)) ||
      (h.name && h.name.toLowerCase().includes(qq))
    );
  }, [holdings, q]);

  const indexedTimeline = useMemo(()=>{
    const t = perf?.timeline || [];
    if(!t.length) return [];
    const bP = t[0].portfolio || 1;
    const bN = t[0].nifty50   || 1;
    const bG = t[0].gold      || 1;
    return t.map(d => ({
      date: d.date,
      portfolioIdx: (d.portfolio / bP) * 100,
      niftyIdx:     (d.nifty50   / bN) * 100,
      goldIdx:      (d.gold      / bG) * 100,
    }));
  }, [perf]);

  const yDomain = useMemo(() => {
    const t = indexedTimeline || [];
    if (!t.length) return ['auto', 'auto'];
    let min = Infinity, max = -Infinity;
    t.forEach(d => ['portfolioIdx','niftyIdx','goldIdx'].forEach(k => {
      const v = Number(d[k]);
      if (!Number.isFinite(v)) return;
      if (v < min) min = v;
      if (v > max) max = v;
    }));
    return [Math.floor(min - 5), Math.ceil(max + 5)];
  }, [indexedTimeline]);

  if(loading){
    return (
      <div className="g-page">
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          <div className="animate-pulse h-8 w-64 rounded bg-white/10"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(k=> <div key={k} className="h-28 rounded-2xl bg-white/5 border border-white/10" /> )}
          </div>
        </div>
      </div>
    );
  }

  if(error){
    return (
      <div className="g-page">
        <div className="max-w-3xl mx-auto p-6 space-y-3">
          <Banner kind="error">{error}</Banner>
          <div className="text-xs text-gray-300/80">
            Troubleshoot: start backend (<code>npm run dev</code> in <code>portfolio-backend</code>), then start frontend (<code>npm run dev</code>).
            Dev proxy forwards <code>/api</code> → <code>http://localhost:5174</code>.
          </div>
        </div>
      </div>
    );
  }

  const sectorData = alloc
    ? Object.entries(alloc.bySector)
        .map(([k,v])=>({ name:k, value:v.value, pct:v.percentage }))
        .sort((a,b)=>b.value-a.value)
    : [];

  const mcapData = alloc
    ? Object.entries(alloc.byMarketCap).map(([k,v])=>({ name:k, value:v.value, pct:v.percentage }))
    : [];

  return (
    <div className="g-page">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Heading with logo from /public */}
        <div className="flex items-center gap-3">
          <img src="../image.png" alt="Wealth Manager" className="w-7 h-7" />
          <h1 className="text-2xl font-semibold">
            <span className="text-gray-300/80">Wealth Manager</span>
          </h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="kpi"><div className="label">Total Portfolio Value</div><div className="value">₹ {fmtINR(summary.totalValue)}</div></div>
          <div className="kpi"><div className="label">Total Gain/Loss</div><div className="value">₹ {fmtINR(summary.totalGainLoss)} ({summary.totalGainLossPercent.toFixed(2)}%)</div></div>
          <div className="kpi"><div className="label">Diversification</div><div className="value">{summary.diversificationScore}/10</div></div>
          <div className="kpi"><div className="label">Risk Level</div><div className="value">{summary.riskLevel}</div></div>
        </div>

        {/* Returns Snapshot */}
        <ReturnsSnapshot returns={perf?.returns} />

        {/* Allocation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="mb-2 font-semibold">Sector Allocation</div>
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie data={sectorData} dataKey="value" nameKey="name" innerRadius={90} outerRadius={160} labelLine={false}
                  label={(e)=>`${e.name} (${(e.pct ?? 0).toFixed(2)}%)`}>
                  {sectorData.map((_,i)=>(<Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{background:'#0f141c', border:'1px solid rgba(197,155,47,.35)', color:'#fff'}}
                         formatter={(v,p,entry)=>[`₹ ${fmtINR(v)}`, entry.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="mb-2 font-semibold">Market Cap</div>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={mcapData}>
                <XAxis dataKey="name" stroke="#A8B0BE" />
                <YAxis stroke="#A8B0BE" />
                <Tooltip contentStyle={{background:'#0f141c', border:'1px solid rgba(197,155,47,.35)', color:'#fff'}}
                         formatter={(v)=>`₹ ${fmtINR(v)}`} />
                <Bar dataKey="value" fill={LINE_COLORS.gold} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance vs Benchmarks (Indexed → all lines visible) */}
        <div className="card">
          <div className="mb-2 font-semibold">Performance vs Benchmarks (Indexed)</div>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={indexedTimeline} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <XAxis dataKey="date" stroke="#A8B0BE" />
              <YAxis stroke="#A8B0BE" domain={yDomain} />
              <Tooltip
                contentStyle={{ background:'#0f141c', border:'1px solid rgba(197,155,47,.35)', color:'#fff' }}
                formatter={(v) => `${Number(v).toFixed(1)}`}
              />
              <Line type="monotone" dataKey="portfolioIdx" stroke={LINE_COLORS.portfolio} strokeWidth={2.2} dot={false} connectNulls />
              <Line type="monotone" dataKey="niftyIdx"     stroke={LINE_COLORS.nifty50}   strokeWidth={1.8} dot={false} connectNulls />
              <Line type="monotone" dataKey="goldIdx"      stroke={LINE_COLORS.gold}      strokeWidth={1.8} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-5 text-sm mt-2 text-gray-300">
            <span className="flex items-center gap-2"><i className="legend-dot" style={{background: LINE_COLORS.portfolio}}/> Portfolio</span>
            <span className="flex items-center gap-2"><i className="legend-dot" style={{background: LINE_COLORS.nifty50}}/> Nifty50</span>
            <span className="flex items-center gap-2"><i className="legend-dot" style={{background: LINE_COLORS.gold}}/> Gold</span>
          </div>
        </div>

        {/* Holdings */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Holdings</div>
            <SearchInput value={q} onChange={setQ} placeholder="Search by symbol or name..." />
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr className="thead">
                  <th>Symbol</th><th>Name</th><th>Qty</th><th>Avg</th>
                  <th>Price</th><th>Value</th><th>P/L</th><th>P/L %</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h=>(
                  <tr key={h.symbol} className="trow cursor-pointer" onClick={()=>setSel(h)}>
                    <td className="tcell">
                      <div className="flex items-center gap-2">
                        <StockAvatar symbol={h.symbol} name={h.name}/>
                        <span>{h.symbol}</span>
                      </div>
                    </td>
                    <td className="tcell">{h.name}</td>
                    <td className="tcell">{h.quantity}</td>
                    <td className="tcell">₹ {fmtINR(h.avgPrice)}</td>
                    <td className="tcell">₹ {fmtINR(h.currentPrice)}</td>
                    <td className="tcell">₹ {fmtINR(h.value)}</td>
                    <td className={`tcell ${h.gainLoss>=0?'badge-pos':'badge-neg'}`}>₹ {fmtINR(h.gainLoss)}</td>
                    <td className="tcell"><Pct v={h.gainLossPercent} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
<TopPerformers summary={summary} holdings={holdings} />

        {/* Modal (gold header + company logo handled in Modal component) */}
        <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.name} symbol={sel?.symbol} name={sel?.name}>
          {sel && (
            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-xs text-gray-300">Symbol</div><div className="font-semibold">{sel.symbol}</div></div>
              <div><div className="text-xs text-gray-300">Sector</div><div className="font-semibold">{sel.sector}</div></div>
              <div><div className="text-xs text-gray-300">Quantity</div><div className="font-semibold">{sel.quantity}</div></div>
              <div><div className="text-xs text-gray-300">Market Cap</div><div className="font-semibold">{sel.marketCap}</div></div>
              <div><div className="text-xs text-gray-300">Avg Price</div><div className="font-semibold">₹ {fmtINR(sel.avgPrice)}</div></div>
              <div><div className="text-xs text-gray-300">Current Price</div><div className="font-semibold">₹ {fmtINR(sel.currentPrice)}</div></div>
              <div className="col-span-2"><div className="text-xs text-gray-300">Value</div><div className="font-semibold">₹ {fmtINR(sel.value)}</div></div>
              <div className="col-span-2"><div className="text-xs text-gray-300">P/L</div>
                <div className={sel.gainLoss>=0?'badge-pos':'badge-neg'}>₹ {fmtINR(sel.gainLoss)} (<Pct v={sel.gainLossPercent}/>)</div>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
}
