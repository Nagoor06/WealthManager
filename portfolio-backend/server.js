import express from "express";
import cors from "cors";
import 'dotenv/config';
import XLSX from "xlsx";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(express.json());

const EXCEL_PATH = process.env.EXCEL_PATH || "./data/portfolio.xlsx";

const num = v => (typeof v === "string" ? Number(String(v).replace(/[,₹\s]/g, "")) : Number(v));

function loadWorkbook() { return XLSX.readFile(EXCEL_PATH); }

function sheetToJSON(wb, name) {
  const ws = wb.Sheets[name];
  if (!ws) throw new Error(`Missing sheet "${name}"`);
  return XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });
}

function getHoldings(wb) {
  const rows = sheetToJSON(wb, "Holdings");
  return rows.map(r => ({
    symbol: r["Symbol"],
    name: r["Company Name"],
    quantity: Number(r["Quantity"]),
    avgPrice: num(r["Avg Price ₹"]),
    currentPrice: num(r["Current Price (₹)"]),
    sector: r["Sector"],
    marketCap: r["Market Cap"],
    value: num(r["Value ₹"]),
    gainLoss: num(r["Gain/Loss (₹)"]),
    gainLossPercent: Number(String(r["Gain/Loss %"]).replace("%",""))
  }));
}

function getAllocation(wb) {
  const sRows = sheetToJSON(wb, "Sector_Allocation");
  const bySector = {};
  sRows.forEach(r => { bySector[r["Sector"]] = {
    value: num(r["Value (₹)"]), percentage: Number(String(r["Percentage"]).replace("%",""))
  }});
  const mRows = sheetToJSON(wb, "Market_Cap");
  const byMarketCap = {};
  mRows.forEach(r => {
    const key = String(r["Market Cap"]).replace(" Cap","").replace(" ", "");
    byMarketCap[key] = { value: num(r["Value (₹)"]), percentage: Number(String(r["Percentage"]).replace("%","")) };
  });
  return { bySector, byMarketCap };
}

function getPerformance(wb) {
  const rows = sheetToJSON(wb, "Historical Performance");
  const timeline = rows.map(r => ({
    date: XLSX.SSF.format("yyyy-mm-dd", new Date(r["Date"])),
    portfolio: num(r["Portfolio Value"]),
    nifty50: num(r["Nifty 50"]),
    gold: num(r["Gold (₹/10g)"])
  }));
  const ret = (arr, key, months) => {
    if (arr.length < 2) return 0;
    const last = arr[arr.length - 1][key];
    const idx = Math.max(0, arr.length - months - 1);
    const prev = arr[idx][key];
    return Number((((last - prev) / prev) * 100).toFixed(2));
  };
  const returns = {
    portfolio: { "1month": ret(timeline, "portfolio", 1), "3months": ret(timeline, "portfolio", 3), "1year": ret(timeline, "portfolio", 12) },
    nifty50:   { "1month": ret(timeline, "nifty50", 1), "3months": ret(timeline, "nifty50", 3), "1year": ret(timeline, "nifty50", 12) },
    gold:      { "1month": ret(timeline, "gold", 1), "3months": ret(timeline, "gold", 3), "1year": ret(timeline, "gold", 12) }
  };
  return { timeline, returns };
}

function getSummary(wb) {
  const sRows = sheetToJSON(wb, "Summary");
  const dict = {}; sRows.forEach(r => { dict[r["Metric"]] = r["Value"]; });
  const topRows = sheetToJSON(wb, "Top_Performers");
  const top = {}; topRows.forEach(r => { top[r["Metric"]] = r; });

  const cleanPct = v => Number(String(v).replace("%",""));
  const totalValue = num(dict["Total Portfolio"]);
  const totalInvested = num(dict["Total Invested"]);
  const totalGainLoss = num(dict["Total Gain/Loss"]);
  const totalGainLossPercent = cleanPct(dict["Total Gain/Loss %"]);
  const diversificationScore = Number(String(dict["Diversification"]).split("/")[0]);
  const riskLevel = dict["Risk Level"];

  return {
    totalValue, totalInvested, totalGainLoss, totalGainLossPercent,
    topPerformer: { symbol: top["Best Performer"]?.["Symbol"], name: top["Best Performer"]?.["Company Name"], gainPercent: cleanPct(top["Best Performer"]?.["Performance"] || 0) },
    worstPerformer: { symbol: top["Worst Performer"]?.["Symbol"], name: top["Worst Performer"]?.["Company Name"], gainPercent: cleanPct(top["Worst Performer"]?.["Performance"] || 0) },
    diversificationScore, riskLevel
  };
}

app.get("/api/portfolio/holdings", (req, res) => {
  try {
    const wb = loadWorkbook(); const data = getHoldings(wb);
    const Holding = z.object({ symbol:z.string(), name:z.string(), quantity:z.number(), avgPrice:z.number(), currentPrice:z.number(), sector:z.string(), marketCap:z.string(), value:z.number(), gainLoss:z.number(), gainLossPercent:z.number() });
    z.array(Holding).parse(data);
    res.json(data);
  } catch (e) { res.status(500).json({ error:"Failed to load holdings", details:e.message }); }
});

app.get("/api/portfolio/allocation", (req, res) => {
  try { const wb = loadWorkbook(); res.json(getAllocation(wb)); }
  catch(e){ res.status(500).json({ error:"Failed to load allocation", details:e.message }); }
});

app.get("/api/portfolio/performance", (req, res) => {
  try { const wb = loadWorkbook(); res.json(getPerformance(wb)); }
  catch(e){ res.status(500).json({ error:"Failed to load performance", details:e.message }); }
});

app.get("/api/portfolio/summary", (req, res) => {
  try { const wb = loadWorkbook(); res.json(getSummary(wb)); }
  catch(e){ res.status(500).json({ error:"Failed to load summary", details:e.message }); }
});

app.get("/health", (_req, res) => res.send("ok"));
const PORT = Number(process.env.PORT || 5174);
app.listen(PORT, () => console.log(`Portfolio API on http://localhost:${PORT}`));