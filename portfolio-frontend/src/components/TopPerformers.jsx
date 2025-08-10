import React, { useMemo } from 'react';
import StockAvatar from './StockAvatar.jsx';
import { fmtINR } from './Number.jsx';

export default function TopPerformers({ summary, holdings }) {
  const best = summary?.topPerformer || null;
  const worst = summary?.worstPerformer || null;

  const { highestValue, lowestValue } = useMemo(() => {
    if (!Array.isArray(holdings) || holdings.length === 0) {
      return { highestValue: null, lowestValue: null };
    }
    let hi = holdings[0], lo = holdings[0];
    for (const h of holdings) {
      if (Number(h.value) > Number(hi.value)) hi = h;
      if (Number(h.value) < Number(lo.value)) lo = h;
    }
    return { highestValue: hi, lowestValue: lo };
  }, [holdings]);

  return (
    <div className="tp-section">
      <h2 className="tp-title">Top Performers</h2>

      <div className="tp-grid">
        {/* Best performer */}
        <div className="tp-card">
          <div className="tp-card-head">Best Performer</div>
          {best ? (
            <div className="tp-row">
              <div className="tp-left">
                <StockAvatar symbol={best.symbol} name={best.name} />
                <div>
                  <div className="tp-symbol">{best.symbol}</div>
                  <div className="tp-name">{best.name}</div>
                </div>
              </div>
              <div className="tp-value-pos">{Number(best.gainPercent).toFixed(2)}%</div>
            </div>
          ) : <div className="tp-name">—</div>}
        </div>

        {/* Worst performer */}
        <div className="tp-card">
          <div className="tp-card-head">Worst Performer</div>
          {worst ? (
            <div className="tp-row">
              <div className="tp-left">
                <StockAvatar symbol={worst.symbol} name={worst.name} />
                <div>
                  <div className="tp-symbol">{worst.symbol}</div>
                  <div className="tp-name">{worst.name}</div>
                </div>
              </div>
              <div className="tp-value-neg">{Number(worst.gainPercent).toFixed(2)}%</div>
            </div>
          ) : <div className="tp-name">—</div>}
        </div>

        {/* Highest / Lowest value (stacked) */}
        <div className="tp-card">
          <div className="tp-card-head">Highest Value Holding</div>
          {highestValue ? (
            <div className="tp-row" style={{ marginBottom: '0.75rem' }}>
              <div className="tp-left">
                <StockAvatar symbol={highestValue.symbol} name={highestValue.name} />
                <div>
                  <div className="tp-symbol">{highestValue.symbol}</div>
                  <div className="tp-name">{highestValue.name}</div>
                </div>
              </div>
              <div className="tp-value-high">₹ {fmtINR(highestValue.value)}</div>
            </div>
          ) : <div className="tp-name">—</div>}

          <div className="tp-card-head" style={{ marginTop: '0.5rem' }}>Lowest Value Holding</div>
          {lowestValue ? (
            <div className="tp-row">
              <div className="tp-left">
                <StockAvatar symbol={lowestValue.symbol} name={lowestValue.name} />
                <div>
                  <div className="tp-symbol">{lowestValue.symbol}</div>
                  <div className="tp-name">{lowestValue.name}</div>
                </div>
              </div>
              <div className="tp-value-low">₹ {fmtINR(lowestValue.value)}</div>
            </div>
          ) : <div className="tp-name">—</div>}
        </div>
      </div>
    </div>
  );
}
