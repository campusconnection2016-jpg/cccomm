// src/Components/PowerBILite.js
import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Treemap,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

/*
  PowerBI — Lite (final update)
  - Defensive idempotent setters
  - Refs for primary/card colors
  - Batched per-tile appearance updates to avoid nested setState storms
*/

export default function PowerBILite() {
  const fileInputRef = useRef(null);

  // data + UI state
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [types, setTypes] = useState({});
  const [error, setError] = useState("");

  // builder state
  const [chartType, setChartType] = useState("Clustered Bar");
  const [xField, setXField] = useState("");
  const [yFields, setYFields] = useState([]);
  const [agg, setAgg] = useState("sum");
  const [barOrientation, setBarOrientation] = useState("vertical"); // builder default

  // appearance (single primary color + bg color)
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [cardBg, setCardBg] = useState("#071127");
  // refs to avoid repeated setState storms
  const primaryRef = useRef(primaryColor);
  const cardBgRef = useRef(cardBg);

  // keep refs synced if state changes other places
  useEffect(() => { primaryRef.current = primaryColor; }, [primaryColor]);
  useEffect(() => { cardBgRef.current = cardBg; }, [cardBg]);

  // dashboard tiles
  const [tiles, setTiles] = useState([]);

  // ---------------- BATCHED TILE APPEARANCE UPDATES ----------------
  // batching helpers to avoid re-entrant setState storms from per-tile inputs
  const pendingTileUpdatesRef = useRef({}); // id -> { newPrimary, newBg }
  const pendingTileTimerRef = useRef(null);

  const flushPendingTileUpdates = useCallback(() => {
    const pending = pendingTileUpdatesRef.current;
    if (!pending || Object.keys(pending).length === 0) {
      pendingTileTimerRef.current = null;
      return;
    }
    setTiles(prev => {
      let changed = false;
      const updated = prev.map(tile => {
        const p = pending[tile.id];
        if (!p) return tile;
        const curPrimary = tile.primaryColor || primaryRef.current;
        const curBg = tile.cardBg || cardBgRef.current;
        if (curPrimary === p.newPrimary && curBg === p.newBg) return tile;
        changed = true;
        return { ...tile, primaryColor: p.newPrimary, cardBg: p.newBg };
      });
      // clear pending map
      pendingTileUpdatesRef.current = {};
      pendingTileTimerRef.current = null;
      return changed ? updated : prev;
    });
  }, [setTiles]);

  function scheduleTileAppearanceUpdate(id, newPrimary, newBg) {
    // merge/overwrite pending update for this tile
    pendingTileUpdatesRef.current = {
      ...pendingTileUpdatesRef.current,
      [id]: { newPrimary, newBg }
    };

    // if a timer is already scheduled, do nothing (it will flush merged updates)
    if (pendingTileTimerRef.current) return;

    // schedule a macrotask to flush updates (breaks sync re-entrancy)
    pendingTileTimerRef.current = setTimeout(() => {
      flushPendingTileUpdates();
    }, 0);
  }

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pendingTileTimerRef.current) {
        clearTimeout(pendingTileTimerRef.current);
        pendingTileTimerRef.current = null;
      }
      pendingTileUpdatesRef.current = {};
    };
  }, [flushPendingTileUpdates]);

  // slicer/drill/labels/search
  const [slicerField, setSlicerField] = useState("");
  const [slicerValues, setSlicerValues] = useState([]);
  const [drillStack, setDrillStack] = useState([]);
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [fieldSearch, setFieldSearch] = useState("");

  const paletteDefault = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // ---------- file handling ----------
  function detectType(values) {
    let num = 0, str = 0;
    for (const v of values.slice(0, 50)) {
      if (v === null || v === undefined || v === "") continue;
      if (typeof v === "number") num++;
      else if (!isNaN(Number(v))) num++;
      else str++;
    }
    return num > str ? "number" : "string";
  }
  function inferTypes(parsedRows) {
    if (!parsedRows.length) return {};
    const cols = Object.keys(parsedRows[0]);
    const t = {};
    for (const c of cols) t[c] = detectType(parsedRows.map((r) => r[c]));
    return t;
  }
  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target.result;
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(ws, { defval: null });
        setRows(parsed || []);
        const cols = parsed.length ? Object.keys(parsed[0]) : [];
        setColumns(cols);
        const inferred = inferTypes(parsed || []);
        setTypes(inferred);
        setXField(cols.find((c) => inferred[c] !== "number") || cols[0] || "");
        const firstNum = cols.find((c) => inferred[c] === "number") || cols[0] || "";
        setYFields(firstNum ? [firstNum] : []);
        setSlicerField("");
        setSlicerValues([]);
        setDrillStack([]);
      } catch (err) {
        console.error(err);
        setError("Failed to parse file.");
        setRows([]);
        setColumns([]);
        setTypes({});
        setXField("");
        setYFields([]);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ---------- aggregation ----------
  function analyzeNumericValues(values) {
    let sum = 0, numericCount = 0;
    for (const v of values) {
      if (v === null || v === undefined || v === "") continue;
      const num = typeof v === "number" ? v : Number(v);
      if (!isNaN(num)) { sum += num; numericCount++; }
    }
    return { sum, numericCount, totalCount: values.length };
  }
  function computeAggregateForValues(values, aggType) {
    if (aggType === "count") return values.length;
    const { sum, numericCount } = analyzeNumericValues(values);
    if (aggType === "sum") return numericCount ? sum : 0;
    if (aggType === "avg") return numericCount ? sum / numericCount : 0;
    return numericCount ? sum : 0;
  }

  // ---------- filtering ----------
  const filteredRows = useMemo(() => {
    if (!rows.length) return [];
    let base = rows;
    if (slicerField && slicerValues.length) {
      const set = new Set(slicerValues.map(String));
      base = base.filter((r) => set.has(String(r[slicerField])));
    }
    for (const step of drillStack) {
      base = base.filter((r) => String(r[step.field]) === String(step.value));
    }
    return base;
  }, [rows, slicerField, slicerValues, drillStack]);

  // grouped/aggregated
  const groupedData = useMemo(() => {
    if (!filteredRows.length || !xField || !yFields.length) return [];
    const groups = new Map();
    for (const r of filteredRows) {
      const key = r[xField] === null || r[xField] === undefined || r[xField] === "" ? "(blank)" : String(r[xField]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    }
    const out = [];
    for (const [k, items] of groups) {
      const row = { category: k };
      for (const y of yFields) {
        const vals = items.map((it) => it[y]);
        row[y] = computeAggregateForValues(vals, agg);
      }
      out.push(row);
    }
    const allNum = out.every((r) => !isNaN(Number(r.category)));
    out.sort((a,b) => allNum ? Number(a.category)-Number(b.category) : String(a.category).localeCompare(String(b.category)));
    return out;
  }, [filteredRows, xField, yFields, agg]);

  const pieData = useMemo(() => {
    if (!groupedData.length || !yFields.length) return [];
    const y = yFields[0];
    return groupedData.map((d) => ({ name: d.category, value: d[y] || 0 }));
  }, [groupedData, yFields]);

  const kpiValue = useMemo(() => {
    if (!filteredRows.length || !yFields.length) return null;
    const y = yFields[0];
    const all = filteredRows.map(r => r[y]);
    return computeAggregateForValues(all, agg);
  }, [filteredRows, yFields, agg]);

  const distinctValuesByField = useMemo(() => {
    const map = {};
    for (const c of columns) {
      map[c] = Array.from(new Set(rows.map((r) => r[c]).filter((v) => v !== null && v !== undefined && v !== ""))).slice(0,2000);
    }
    return map;
  }, [columns, rows]);

  // handlers
  const handleDrill = useCallback((field, value) => { setDrillStack((s) => [...s, { field, value }]); }, [setDrillStack]);
  const drillBack = useCallback(() => { setDrillStack((s) => s.slice(0,-1)); }, [setDrillStack]);
  const clearDrill = useCallback(() => { setDrillStack([]); }, [setDrillStack]);

  const addTileFromSpec = useCallback((spec, primary, bg) => {
    if (!spec.barOrientation) spec.barOrientation = spec.barOrientation || barOrientation || "vertical";
    const id = Math.random().toString(36).slice(2);
    const title = `${spec.type} • ${spec.agg?.toUpperCase?.() || "SUM"} (${(spec.yFields || []).slice(0,2).join(", ") || "—"}) by ${spec.xField || "All"}`;
    setTiles((t) => [{ id, spec, primaryColor: primary, cardBg: bg, title }, ...t]);
  }, [barOrientation, setTiles]);

  const removeTile = useCallback((id) => { setTiles((t) => t.filter((x) => x.id !== id)); }, [setTiles]);

  const duplicateTile = useCallback((id) => {
    setTiles((prev) => {
      const tile = prev.find(x => x.id === id);
      if (!tile) return prev;
      const specCopy = JSON.parse(JSON.stringify(tile.spec));
      const newId = Math.random().toString(36).slice(2);
      const title = `${specCopy.type} • ${specCopy.agg?.toUpperCase?.() || "SUM"} (${(specCopy.yFields || []).slice(0,2).join(", ") || "—"}) by ${specCopy.xField || "All"}`;
      return [{ id: newId, spec: specCopy, primaryColor: tile.primaryColor, cardBg: tile.cardBg, title }, ...prev];
    });
  }, [setTiles]);

  // update tile appearance (primary color / bg) - idempotent
  const updateTileAppearance = useCallback((id, newPrimary, newBg) => {
    setTiles(prev => {
      let changed = false;
      const updated = prev.map(tile => {
        if (tile.id !== id) return tile;
        const curPrimary = tile.primaryColor || primaryRef.current;
        const curBg = tile.cardBg || cardBgRef.current;
        if (curPrimary === newPrimary && curBg === newBg) return tile;
        changed = true;
        return { ...tile, primaryColor: newPrimary, cardBg: newBg };
      });
      return changed ? updated : prev;
    });
  }, [setTiles]);

  // update tile spec (idempotent)
  const updateTileSpec = useCallback((id, newSpecPatch) => {
    setTiles(prev => {
      let changed = false;
      const updated = prev.map(tile => {
        if (tile.id !== id) return tile;
        const newSpec = { ...tile.spec, ...newSpecPatch };
        const keys = Object.keys(newSpecPatch);
        let diff = false;
        for (const k of keys) {
          if (String(tile.spec?.[k]) !== String(newSpecPatch[k])) { diff = true; break; }
        }
        if (!diff) return tile;
        changed = true;
        return { ...tile, spec: newSpec };
      });
      return changed ? updated : prev;
    });
  }, [setTiles]);

  const clearDashboard = useCallback(() => { setTiles([]); }, [setTiles]);

  // drag/drop preview -> dashboard
  function onDragStartPreview(e) {
    const spec = { type: chartType, xField, yFields, agg, slicerField, slicerValues, barOrientation };
    const payload = { spec, primaryColor, cardBg };
    try { e.dataTransfer.setData("application/json", JSON.stringify(payload)); } catch (err) {}
  }
  function onDropDashboard(e) {
    e.preventDefault();
    try {
      const payload = JSON.parse(e.dataTransfer.getData("application/json"));
      if (payload && payload.spec) addTileFromSpec(payload.spec, payload.primaryColor || primaryColor, payload.cardBg || cardBg);
    } catch (err) {}
  }
  function onDragOverDashboard(e) { e.preventDefault(); }

  // export
  function downloadChartPNG(containerSelector, filename = "chart.png") {
    const container = document.querySelector(containerSelector);
    if (!container) { alert("Chart container not found for export."); return; }
    const svg = container.querySelector("svg");
    if (!svg) { alert("SVG chart not found inside container."); return; }
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img,0,0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.download = filename; a.href = URL.createObjectURL(blob); a.click();
      }, "image/png");
    };
    img.onerror = () => alert("Failed to render chart for export.");
    img.src = url;
  }

  function ensureColorArray(n, primary) {
    const arr = [primary || primaryRef.current];
    for (let i = arr.length; i < n; i++) arr.push(paletteDefault[i % paletteDefault.length]);
    return arr;
  }
  function fmtVal(v) {
    if (v === null || v === undefined) return "—";
    if (typeof v === "number") return v.toLocaleString();
    if (!isNaN(Number(v))) return Number(v).toLocaleString();
    return String(v);
  }
  function resetAll() {
    setRows([]); setColumns([]); setTypes({}); setXField(""); setYFields([]); setChartType("Clustered Bar"); setAgg("sum"); setError("");
    setPrimaryColor("#4f46e5"); primaryRef.current = "#4f46e5";
    setCardBg("#071127"); cardBgRef.current = "#071127";
    setTiles([]); setSlicerField(""); setSlicerValues([]); setDrillStack([]); setShowDataLabels(false); setFieldSearch("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  }
  function fieldListForSelect() {
    if (!fieldSearch) return columns;
    const s = fieldSearch.toLowerCase();
    return columns.filter(c => c.toLowerCase().includes(s));
  }

  // safe setters for primaryColor and cardBg using immediate ref update + setTimeout(0)
  function safeSetPrimaryColor(newColor) {
    if (!newColor) return;
    if (newColor === primaryRef.current) return;
    primaryRef.current = newColor;
    setTimeout(() => {
      setPrimaryColor((cur) => (cur === newColor ? cur : newColor));
    }, 0);
  }
  function safeSetCardBg(newBg) {
    if (!newBg) return;
    if (newBg === cardBgRef.current) return;
    cardBgRef.current = newBg;
    setTimeout(() => {
      setCardBg((cur) => (cur === newBg ? cur : newBg));
    }, 0);
  }

  // ---------- UI ----------
  return (
    <div className="enh-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
        :root{ --bg:#071126; --panel:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); --muted:#9aa6bb; --accent:#4f46e5; --card-border: rgba(255,255,255,0.04); --text:#e7f2ff; }
        *{box-sizing:border-box;font-family:Inter,system-ui,Arial;}
        html,body,#root{height:100%;margin:0}
        .enh-root{min-height:100vh;background:linear-gradient(180deg,#071126,#061226);color:var(--text);padding:18px;display:flex;justify-content:center}
        .wrap{width:100%;max-width:1200px}
        .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
        .brand{display:flex;gap:12px;align-items:center}
        .logo{width:44px;height:44px;border-radius:8px;background:linear-gradient(90deg,var(--accent),#06b6d4);display:flex;align-items:center;justify-content:center;font-weight:800}
        .title{font-weight:700}
        .top-actions{display:flex;gap:8px;align-items:center}
        .btn{background:var(--accent);border:none;color:white;padding:8px 12px;border-radius:8px;font-weight:700;cursor:pointer}
        .btn.ghost{background:transparent;border:1px solid var(--card-border);color:var(--text)}
        .layout{display:grid;grid-template-columns:360px 1fr;gap:16px}
        @media(max-width:980px){ .layout{grid-template-columns:1fr} }
        .card{background:var(--panel);border:1px solid var(--card-border);border-radius:10px;padding:12px;box-shadow:0 8px 30px rgba(2,6,23,0.6)}
        .section-title{font-weight:800;margin-bottom:8px}
        .muted{color:var(--muted);font-size:13px}
        select, option, input[type="color"], input[type="text"]{padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);outline:none}
        .builder .label{font-size:13px;color:var(--muted);font-weight:700;margin-bottom:6px}
        .builder .small{font-size:12px;color:var(--muted);margin-top:8px}
        .preview-card{min-height:460px;display:flex;flex-direction:column}
        .preview-body{flex:1;display:flex;align-items:center;justify-content:center;padding:8px}
        .center-wrap{width:100%;max-width:1000px;display:flex;align-items:center;justify-content:center;min-height:360px}
        .controls-row{display:flex;gap:8px;align-items:center;margin-top:8px}
        .color-row{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}
        .tile{border-radius:8px;padding:10px;border:1px solid rgba(255,255,255,0.03);background:linear-gradient(180deg, rgba(255,255,255,0.01), transparent)}
        .tiles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}
        @media(max-width:900px){ .tiles-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:560px){ .tiles-grid{grid-template-columns:repeat(1,1fr)} }
        .tile-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
        .tile-actions{display:flex;gap:6px;align-items:center}
        .small-muted{font-size:12px;color:var(--muted)}
        .breadcrumb{display:flex;gap:8px;align-items:center;margin-bottom:8px}
        .chip{background:rgba(255,255,255,0.02);padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.02)}
      `}</style>

      <div className="wrap">
        <div className="top">
          <div className="brand">
            <div className="logo">PB</div>
            <div>
              <div className="title">PowerBI — Lite</div>
              <div className="muted">Upload → Build → Preview → Drag & drop to dashboard</div>
            </div>
          </div>

          <div className="top-actions">
            <div className="muted">{rows.length ? `${rows.length.toLocaleString()} rows` : "No data loaded"}</div>
            <button className="btn ghost" onClick={resetAll}>Reset</button>
          </div>
        </div>

        <div className="layout">
          {/* LEFT: Upload + builder */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="section-title">Upload data</div>
                <div className="muted">First sheet used</div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{rows.length ? "File loaded" : "No file"}</div>
                  <div className="muted">{rows.length ? `${rows.length} rows • ${columns.length} fields` : "Supported: .xlsx, .xls, .csv"}</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <input ref={fileInputRef} id="file-input" type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ display: "none" }} />
                  <label htmlFor="file-input" className="btn" style={{ cursor: "pointer" }}>Choose file</label>
                  <button className="btn ghost" onClick={resetAll}>Clear</button>
                </div>
              </div>
              {error && <div style={{ color: "#ffb4b4", marginTop: 8 }}>{error}</div>}
            </div>

            <div className="card builder">
              <div className="section-title">Visual builder</div>

              <div style={{ marginBottom: 8 }}>
                <div className="builder label">Chart type</div>
                <select value={chartType} onChange={(e) => setChartType(e.target.value)} style={{ width: "100%" }}>
                  <option>Clustered Bar</option>
                  <option>Stacked Bar</option>
                  <option>Line</option>
                  <option>Area</option>
                  <option>Stacked Area</option>
                  <option>Pie</option>
                  <option>Donut</option>
                  <option>Treemap</option>
                  <option>Radar</option>
                  <option>Scatter</option>
                  <option>Combo (Bar + Line)</option>
                  <option>KPI</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div className="builder label">Field search</div>
                  <input type="text" placeholder="Search fields..." value={fieldSearch} onChange={(e) => setFieldSearch(e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div className="builder label">X field (category)</div>
                <select value={xField} onChange={(e) => setXField(e.target.value)} style={{ width: "100%" }}>
                  <option value="">(choose)</option>
                  {fieldListForSelect().map(c => <option key={c} value={c}>{c} ({types[c] || "—"})</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 6 }}>
                <div className="builder label">Y field(s) (numeric)</div>
                <select multiple value={yFields} onChange={(e) => setYFields(Array.from(e.target.selectedOptions, o => o.value))} style={{ width: "100%", height: 110 }}>
                  {fieldListForSelect().map(c => <option key={c} value={c}>{c} ({types[c] || "—"})</option>)}
                </select>
                <div className="builder small">Hold Ctrl/Cmd to multi-select. Use multiple Ys for stacked/clustered/combo charts.</div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div className="builder label">Aggregation</div>
                  <select value={agg} onChange={(e) => setAgg(e.target.value)} style={{ width: "100%" }}>
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="count">Count</option>
                  </select>
                </div>

                {(chartType === "Clustered Bar" || chartType === "Stacked Bar") && (
                  <div style={{ width: 160 }}>
                    <div className="builder label">Bar orientation</div>
                    <select value={barOrientation} onChange={(e) => setBarOrientation(e.target.value)} style={{ width: "100%" }}>
                      <option value="vertical">Vertical</option>
                      <option value="horizontal">Horizontal</option>
                    </select>
                  </div>
                )}

                <div style={{ width: 120 }}>
                  <div className="builder label">Actions</div>
                  <button className="btn" onClick={() => { alert("Preview updates automatically — drag it to the dashboard or click Add to dashboard."); }}>Preview</button>
                </div>
              </div>

              {/* SLICER */}
              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div className="builder label">Slicer (filter)</div>
                  <select value={slicerField} onChange={(e) => { setSlicerField(e.target.value); setSlicerValues([]); }} style={{ width: "100%" }}>
                    <option value="">(no slicer)</option>
                    {columns.map(c => <option key={c} value={c}>{c} ({types[c] || "—"})</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="builder label">Slicer values (multi)</div>
                  <select multiple value={slicerValues} onChange={(e) => setSlicerValues(Array.from(e.target.selectedOptions, o => o.value))} style={{ width: "100%", height: 90 }}>
                    {(slicerField ? (distinctValuesByField[slicerField] || []) : []).map(v => <option key={String(v)} value={String(v)}>{String(v)}</option>)}
                  </select>
                </div>
              </div>

              <div className="color-row">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="small-muted">Color (primary)</div>
                  {/* Guarded primary color setter => use safeSetPrimaryColor */}
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => safeSetPrimaryColor(e.target.value)}
                    title="Primary series color"
                  />
                </div>

                <div style={{ marginLeft: 8, display: "flex", flexDirection: "column" }}>
                  <div className="small-muted">Card background</div>
                  {/* Guarded card bg setter => use safeSetCardBg */}
                  <input
                    type="color"
                    value={cardBg}
                    onChange={(e) => safeSetCardBg(e.target.value)}
                  />
                </div>

                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="btn" onClick={() => {
                    const spec = { type: chartType, xField, yFields: [...yFields], agg, slicerField, slicerValues, barOrientation };
                    addTileFromSpec(spec, primaryColor, cardBg);
                  }}>Add to dashboard</button>
                </div>
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={showDataLabels} onChange={(e) => setShowDataLabels(e.target.checked)} /> Show data labels</label>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button className="btn ghost" onClick={() => { if (window.confirm("Clear dashboard?")) clearDashboard(); }}>Clear dashboard</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title">Fields</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {columns.length ? columns.map(c => (
                  <div key={c} className="tile" style={{ minWidth: 120 }}>
                    <div style={{ fontWeight: 700 }}>{c}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{types[c] || "—"}</div>
                  </div>
                )) : <div className="muted">No fields. Upload a file to inspect schema.</div>}
              </div>
            </div>
          </div>

          {/* RIGHT: Live preview + dashboard */}
          <div>
            <div className="card preview-card" draggable={false} onDragOver={(e) => e.preventDefault()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div className="section-title">Live preview</div>
                <div className="muted">{chartType}</div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div className="breadcrumb">
                  <div className="chip">Base</div>
                  {drillStack.map((d,i) => <div key={i} className="chip">{d.field}: {String(d.value)} {i < drillStack.length-1 ? "→" : ""}</div>)}
                  {drillStack.length > 0 && <button className="btn ghost" onClick={drillBack}>Back</button>}
                  {drillStack.length > 0 && <button className="btn ghost" onClick={clearDrill}>Clear Drill</button>}
                </div>
              </div>

              <div className="preview-body" draggable onDragStart={onDragStartPreview} title="Drag this preview into the dashboard area" style={{ cursor: "grab" }}>
                <div id="live-preview-container" className="center-wrap" style={{ background: cardBg, borderRadius: 8, padding: 12 }}>
                  {!rows.length && <div className="muted">Upload an Excel/CSV to begin</div>}
                  {rows.length && (!xField || !yFields.length) && <div className="muted">Choose X and Y field(s) to render the chart</div>}
                  {rows.length && xField && yFields.length > 0 && groupedData.length === 0 && <div className="muted">No data after grouping — check your fields</div>}

                  {rows.length && xField && yFields.length > 0 && groupedData.length > 0 && (
                    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
                      {/* KPI */}
                      {chartType === "KPI" && (
                        <div style={{ display: "flex", gap: 12 }}>
                          <div className="tile" style={{ padding: 18, minWidth: 180, background: "rgba(255,255,255,0.02)" }}>
                            <div className="muted">Metric</div>
                            <div style={{ fontSize: 26, fontWeight: 800 }}>{kpiValue === null ? "—" : Number(kpiValue).toLocaleString()}</div>
                            <div className="muted" style={{ fontSize: 13 }}>{yFields[0]}</div>
                          </div>
                        </div>
                      )}

                      {/* Pie */}
                      {(chartType === "Pie" || chartType === "Donut") && (
                        <div style={{ width: "100%", maxWidth: 700, margin: "0 auto" }}>
                          <ResponsiveContainer width="100%" height={360}>
                            <PieChart>
                              <Tooltip formatter={(v) => fmtVal(v)} />
                              <Legend />
                              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} innerRadius={chartType === "Donut" ? 60 : 0} label={showDataLabels ? (entry => fmtVal(entry.value)) : false} onClick={(data) => handleDrill(xField, data.name)}>
                                {pieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={(ensureColorArray(yFields.length || 1, primaryColor)[idx] || paletteDefault[idx % paletteDefault.length])} />)}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Bars (builder-level orientation applied in preview) */}
                      {(chartType === "Clustered Bar" || chartType === "Stacked Bar") && (
                        <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
                          {barOrientation === "vertical" ? (
                            <ResponsiveContainer width="100%" height={360}>
                              <BarChart data={groupedData} margin={{ top: 20, right: 20, left: 20, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" angle={-30} textAnchor="end" interval={0} height={60} />
                                <YAxis />
                                <Tooltip formatter={(v) => fmtVal(v)} />
                                <Legend />
                                {yFields.map((y,i) => (
                                  <Bar key={y} dataKey={y} fill={ensureColorArray(yFields.length || 1, primaryColor)[i % yFields.length]} stackId={chartType === "Stacked Bar" ? "a" : undefined} onClick={(d) => d && handleDrill(xField, d.payload.category)}>
                                    {showDataLabels && <LabelList dataKey={y} position="top" formatter={(v) => fmtVal(v)} />}
                                  </Bar>
                                ))}
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <ResponsiveContainer width="100%" height={360}>
                              <BarChart data={groupedData} layout="vertical" margin={{ top: 20, right: 20, left: 80, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="category" width={120} />
                                <Tooltip formatter={(v) => fmtVal(v)} />
                                <Legend />
                                {yFields.map((y,i) => (
                                  <Bar key={y} dataKey={y} fill={ensureColorArray(yFields.length || 1, primaryColor)[i % yFields.length]} stackId={chartType === "Stacked Bar" ? "a" : undefined} onClick={(d) => d && handleDrill(xField, d.payload.category)}>
                                    {showDataLabels && <LabelList dataKey={y} position="right" formatter={(v) => fmtVal(v)} />}
                                  </Bar>
                                ))}
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      )}

                      {/* Other chart types (Line, Area, Combo, Scatter, Treemap, Radar) */}
                      {chartType === "Line" && (
                        <ResponsiveContainer width="100%" height={360}>
                          <LineChart data={groupedData} margin={{ top: 20, right: 20, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" angle={-30} textAnchor="end" interval={0} height={60} />
                            <YAxis />
                            <Tooltip formatter={(v) => fmtVal(v)} />
                            <Legend />
                            <Line type="monotone" dataKey={yFields[0]} stroke={primaryColor} strokeWidth={2} dot={{ r: 3 }} onClick={(d) => d && handleDrill(xField, d.category)}>
                              {showDataLabels && <LabelList dataKey={yFields[0]} position="top" formatter={(v) => fmtVal(v)} />}
                            </Line>
                          </LineChart>
                        </ResponsiveContainer>
                      )}

                      {(chartType === "Area" || chartType === "Stacked Area") && (
                        <ResponsiveContainer width="100%" height={360}>
                          <AreaChart data={groupedData} margin={{ top: 20, right: 20, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" angle={-30} textAnchor="end" interval={0} height={60} />
                            <YAxis />
                            <Tooltip formatter={(v) => fmtVal(v)} />
                            <Legend />
                            {yFields.map((y,i) => (
                              <Area key={y} type="monotone" dataKey={y} stackId={chartType === "Stacked Area" ? "a" : undefined} stroke={ensureColorArray(yFields.length || 1, primaryColor)[i % yFields.length]} fill={ensureColorArray(yFields.length || 1, primaryColor)[i % yFields.length]} fillOpacity={0.18} onClick={(d) => d && handleDrill(xField, d.category)}>
                                {showDataLabels && <LabelList dataKey={y} position="top" formatter={(v) => fmtVal(v)} />}
                              </Area>
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                      )}

                      {chartType === "Combo (Bar + Line)" && (
                        <ResponsiveContainer width="100%" height={360}>
                          <ComposedChart data={groupedData} margin={{ top:20,right:20,left:20,bottom:80 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" angle={-30} textAnchor="end" interval={0} height={60} />
                            <YAxis />
                            <Tooltip formatter={(v) => fmtVal(v)} />
                            <Legend />
                            {yFields.slice(0, Math.max(1,yFields.length-1)).map((y,i) => (
                              <Bar key={y} dataKey={y} fill={ensureColorArray(yFields.length || 1, primaryColor)[i % yFields.length]} onClick={(d)=>d && handleDrill(xField, d.payload.category)}>
                                {showDataLabels && <LabelList dataKey={y} position="top" formatter={(v)=>fmtVal(v)} />}
                              </Bar>
                            ))}
                            {yFields[yFields.length-1] && <Line type="monotone" dataKey={yFields[yFields.length-1]} stroke={ensureColorArray(yFields.length || 1, primaryColor)[(yFields.length-1) % yFields.length]} strokeWidth={2} />}
                          </ComposedChart>
                        </ResponsiveContainer>
                      )}

                      {chartType === "Scatter" && (() => {
                        const yKey = yFields[0];
                        const maybeNumericX = groupedData.every(d => !isNaN(Number(d.category)));
                        const useNumericX = maybeNumericX;
                        let scatterData, indexToCategory = null;
                        if (useNumericX) scatterData = groupedData.map(d => ({ x: Number(d.category), y: d[yKey] || 0, label: d.category }));
                        else { indexToCategory = groupedData.map(d => d.category); scatterData = groupedData.map((d,i) => ({ x: i, y: d[yKey] || 0, label: d.category })); }
                        return (
                          <ResponsiveContainer width="100%" height={360}>
                            <ScatterChart margin={{ top:20,right:20,left:20,bottom:80 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              {useNumericX ? <XAxis type="number" dataKey="x" name={xField} tickFormatter={(v)=>Number(v).toLocaleString()} /> : <XAxis type="number" dataKey="x" name={xField} domain={[0, scatterData.length-1]} tickFormatter={(v)=>indexToCategory[v] ?? v} ticks={scatterData.map((_,i)=>i)} />}
                              <YAxis />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const p = payload[0].payload;
                                  return (<div style={{ background:"#fff", color:"#000", padding:8, borderRadius:6 }}><div><strong>{p.label}</strong></div><div>{yKey}: {fmtVal(p.y)}</div><div>{xField}: {useNumericX ? fmtVal(p.x) : p.label}</div></div>);
                                }
                                return null;
                              }} />
                              <Legend />
                              <Scatter data={scatterData} fill={primaryColor} onClick={(d)=>d && handleDrill(xField, d.label)} shape={(props) => {
                                const { cx, cy } = props;
                                return <circle cx={cx} cy={cy} r={4} stroke="#fff" strokeWidth={0.6} fill={primaryColor} />;
                              }} />
                            </ScatterChart>
                          </ResponsiveContainer>
                        );
                      })()}

                      {chartType === "Treemap" && (
                        <ResponsiveContainer width="100%" height={360}>
                          <Treemap data={groupedData.map(d => ({ name: d.category, size: d[yFields[0]] || 0 }))} dataKey="size" aspectRatio={4/3} stroke="#fff" fill={primaryColor} />
                        </ResponsiveContainer>
                      )}

                      {chartType === "Radar" && (
                        <ResponsiveContainer width="100%" height={360}>
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={groupedData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis />
                            {yFields.map((y,i) => <Radar key={y} dataKey={y} stroke={ensureColorArray(yFields.length || 1, primaryColor)[i % yFields.length]} fill={ensureColorArray(yFields.length || 1, primaryColor)[i % yFields.length]} fillOpacity={0.2} />)}
                            <Tooltip formatter={(v) => fmtVal(v)} />
                          </RadarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div className="small-muted">Drag the preview into the dashboard below or click Add to dashboard.</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" onClick={() => { const spec = { type: chartType, xField, yFields:[...yFields], agg, slicerField, slicerValues, barOrientation }; addTileFromSpec(spec, primaryColor, cardBg); }}>Add to dashboard</button>
                  <button className="btn ghost" onClick={() => downloadChartPNG("#live-preview-container", "preview.png")}>Export PNG</button>
                </div>
              </div>
            </div>

            {/* Dashboard area */}
            <div className="card" style={{ marginTop:12 }} onDrop={onDropDashboard} onDragOver={onDragOverDashboard}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div className="section-title">Dashboard</div>
                <div className="muted">Drop preview here</div>
              </div>

              {tiles.length === 0 ? (
                <div className="muted" style={{ padding:12 }}>No visuals yet. Drag the live preview here or use Add to dashboard.</div>
              ) : (
                <div className="tiles-grid">
                  {tiles.map((tile) => (
                    <div key={tile.id} className="card tile" style={{ background: tile.cardBg || "#071127" }} data-tile-id={tile.id}>
                      <div className="tile-header">
                        <div style={{ fontWeight:800 }}>{tile.title}</div>
                        <div className="tile-actions">
                          <button className="btn ghost" onClick={() => duplicateTile(tile.id)}>Duplicate</button>
                          <button className="btn ghost" onClick={() => removeTile(tile.id)}>Delete</button>
                        </div>
                      </div>

                      <div style={{ minHeight:180 }}>
                        <TileChart spec={tile.spec} dataRows={rows} primaryColor={tile.primaryColor} showDataLabels={showDataLabels} onDrill={handleDrill} />
                      </div>

                      {/* Appearance + per-tile controls */}
                      <div style={{ marginTop:8, display:"flex", gap:8, alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                          <div className="small-muted">Bg</div>
                          {/* Batched update: scheduleTileAppearanceUpdate */}
                          <input
                            type="color"
                            value={tile.cardBg || "#071127"}
                            onChange={(e)=> {
                              const v = e.target.value;
                              const curBg = tile.cardBg || cardBgRef.current;
                              if (v === curBg) return;
                              // schedule a batched update for this tile
                              scheduleTileAppearanceUpdate(tile.id, tile.primaryColor, v);
                              // keep ref in sync asynchronously
                              setTimeout(() => { cardBgRef.current = v; }, 0);
                            }}
                          />
                          <div className="small-muted">Color</div>
                          <input
                            type="color"
                            value={tile.primaryColor || primaryColor}
                            onChange={(e) => {
                              const v = e.target.value;
                              const curPrimary = tile.primaryColor || primaryRef.current;
                              if (v === curPrimary) return;
                              scheduleTileAppearanceUpdate(tile.id, v, tile.cardBg);
                              setTimeout(() => { primaryRef.current = v; }, 0);
                            }}
                          />
                          {(tile.spec && (tile.spec.type === "Clustered Bar" || tile.spec.type === "Stacked Bar")) && (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <div className="small-muted">Orientation</div>
                              <select value={tile.spec.barOrientation || "vertical"} onChange={(e) => updateTileSpec(tile.id, { barOrientation: e.target.value })}>
                                <option value="vertical">Vertical</option>
                                <option value="horizontal">Horizontal</option>
                              </select>
                            </div>
                          )}
                        </div>

                        <div style={{ display:"flex", gap:6 }}>
                          <button className="btn ghost" onClick={() => downloadChartPNG(`[data-tile-id="${tile.id}"]`, `${tile.title.replace(/\s+/g,"_")}.png`)}>Export PNG</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* TileChart component - uses primaryColor + per-tile settings */
function TileChart({ spec, dataRows, primaryColor = "#4f46e5", showDataLabels = false, onDrill = () => {} }) {
  const filtered = useMemo(() => {
    if (!dataRows.length) return [];
    let base = dataRows;
    if (spec.slicerField && spec.slicerValues && spec.slicerValues.length) {
      const set = new Set(spec.slicerValues.map(String));
      base = base.filter((r) => set.has(String(r[spec.slicerField])));
    }
    return base;
  }, [dataRows, spec]);

  const grouped = useMemo(() => {
    if (!filtered.length || !spec.xField || !spec.yFields?.length) return [];
    const groups = new Map();
    for (const r of filtered) {
      const key = r[spec.xField] === null || r[spec.xField] === undefined || r[spec.xField] === "" ? "(blank)" : String(r[spec.xField]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    }
    const out = [];
    for (const [k, items] of groups) {
      const row = { category: k };
      for (const y of spec.yFields) {
        const vals = items.map(it => it[y]);
        let value;
        if (spec.agg === "count") value = vals.length;
        else {
          const { sum, numericCount } = (function analyze(values){ let s=0,nc=0; for(const v of values){ if(v===null||v===undefined||v==='') continue; const num=typeof v==='number'? v : Number(v); if(!isNaN(num)){ s+=num; nc++; } } return {sum:s, numericCount:nc}; })(vals);
          value = spec.agg === "avg" ? (numericCount ? sum / numericCount : 0) : (numericCount ? sum : 0);
        }
        row[y] = value;
      }
      out.push(row);
    }
    const allNum = out.every(r => !isNaN(Number(r.category)));
    out.sort((a,b) => allNum ? Number(a.category)-Number(b.category) : String(a.category).localeCompare(String(b.category)));
    return out;
  }, [filtered, spec]);

  if (!grouped.length) return <div style={{ color: "#9aa6bb" }}>No data</div>;

  const colors = [primaryColor, ...["#06b6d4","#10b981","#f59e0b","#ef4444"].filter(Boolean)];
  const fmt = (v) => (v === null || v === undefined ? "—" : (typeof v === "number" ? v.toLocaleString() : (isNaN(Number(v)) ? String(v) : Number(v).toLocaleString())));

  // KPI
  if (spec.type === "KPI") {
    const total = grouped.reduce((s,r) => s + (r[spec.yFields[0]] || 0), 0);
    return (<div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:120 }}><div style={{ textAlign:"center" }}><div style={{ fontSize:20, color:"#cfe6ff", fontWeight:800 }}>{Number(total).toLocaleString()}</div><div style={{ color:"#9aa6bb", marginTop:6 }}>{spec.yFields[0]}</div></div></div>);
  }

  // Pie
  if (spec.type === "Pie" || spec.type === "Donut") {
    const pieData = grouped.map(d => ({ name: d.category, value: d[spec.yFields[0]] || 0 }));
    return (
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={spec.type==="Donut"?30:0} onClick={(d)=>d && onDrill(spec.xField, d.name)}>
            {pieData.map((entry, idx) => <Cell key={idx} fill={colors[idx % colors.length]} />)}
          </Pie>
          <Tooltip formatter={(v)=>fmt(v)} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Bars (respect spec.barOrientation)
  if (spec.type === "Clustered Bar" || spec.type === "Stacked Bar") {
    const orientation = spec.barOrientation || "vertical";
    if (orientation === "vertical") {
      return (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={grouped}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(v)=>fmt(v)} />
            <Legend />
            {spec.yFields.map((y,i) => (
              <Bar key={y} dataKey={y} fill={colors[i % colors.length]} stackId={spec.type === "Stacked Bar" ? "a" : undefined} onClick={(d) => d && onDrill(spec.xField, d.payload.category)}>
                {showDataLabels && <LabelList dataKey={y} position="top" formatter={(v)=>fmt(v)} />}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={grouped} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="category" width={120} />
            <Tooltip formatter={(v)=>fmt(v)} />
            <Legend />
            {spec.yFields.map((y,i) => (
              <Bar key={y} dataKey={y} fill={colors[i % colors.length]} stackId={spec.type === "Stacked Bar" ? "a" : undefined} onClick={(d) => d && onDrill(spec.xField, d.payload.category)}>
                {showDataLabels && <LabelList dataKey={y} position="right" formatter={(v)=>fmt(v)} />}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
  }

  // Line
  if (spec.type === "Line") {
    return (
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={grouped}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(v)=>fmt(v)} />
          <Legend />
          <Line type="monotone" dataKey={spec.yFields[0]} stroke={colors[0]} dot={{ r:3 }} onClick={(d)=>d && onDrill(spec.xField, d.category)}>{showDataLabels && <LabelList dataKey={spec.yFields[0]} position="top" formatter={(v)=>fmt(v)} />}</Line>
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Area
  if (spec.type === "Area" || spec.type === "Stacked Area") {
    return (
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={grouped}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(v)=>fmt(v)} />
          <Legend />
          {spec.yFields.map((y,i) => <Area key={y} type="monotone" dataKey={y} stackId={spec.type==="Stacked Area" ? "a" : undefined} stroke={colors[i%colors.length]} fill={colors[i%colors.length]} fillOpacity={0.16} onClick={(d)=>d && onDrill(spec.xField, d.category)}>{showDataLabels && <LabelList dataKey={y} position="top" formatter={(v)=>fmt(v)} />}</Area>)}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Combo
  if (spec.type === "Combo (Bar + Line)") {
    return (
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={grouped}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(v)=>fmt(v)} />
          <Legend />
          {spec.yFields.slice(0, Math.max(1, spec.yFields.length-1)).map((y,i) => <Bar key={y} dataKey={y} fill={colors[i%colors.length]} onClick={(d)=>d && onDrill(spec.xField, d.payload.category)}>{showDataLabels && <LabelList dataKey={y} position="top" formatter={(v)=>fmt(v)} />}</Bar>)}
          {spec.yFields[spec.yFields.length-1] && <Line type="monotone" dataKey={spec.yFields[spec.yFields.length-1]} stroke={colors[(spec.yFields.length-1) % colors.length]} />}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // Scatter
  if (spec.type === "Scatter") {
    const yKey = spec.yFields[0];
    const maybeNumericX = grouped.every(d => !isNaN(Number(d.category)));
    const useNumericX = maybeNumericX;
    let scatterData, indexToCategory = null;
    if (useNumericX) scatterData = grouped.map(d => ({ x: Number(d.category), y: d[yKey] || 0, label: d.category }));
    else { indexToCategory = grouped.map(d => d.category); scatterData = grouped.map((d,i) => ({ x: i, y: d[yKey] || 0, label: d.category })); }

    return (
      <ResponsiveContainer width="100%" height={160}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          {useNumericX ? <XAxis type="number" dataKey="x" name={spec.xField} tickFormatter={(v)=>Number(v).toLocaleString()} /> : <XAxis type="number" dataKey="x" name={spec.xField} domain={[0, scatterData.length-1]} tickFormatter={(v)=>indexToCategory[v] ?? v} ticks={scatterData.map((_,i)=>i)} />}
          <YAxis />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const p = payload[0].payload;
              return (<div style={{ background:"#fff", color:"#000", padding:8, borderRadius:6 }}><div><strong>{p.label}</strong></div><div>{yKey}: {fmt(p.y)}</div><div>{spec.xField}: {useNumericX ? fmt(p.x) : p.label}</div></div>);
            }
            return null;
          }} />
          <Legend />
          <Scatter data={scatterData} fill={colors[0]} onClick={(d)=>d && onDrill(spec.xField, d.label)} shape={(props) => {
            const { cx, cy } = props;
            return <circle cx={cx} cy={cy} r={4} stroke="#fff" strokeWidth={0.6} fill={colors[0]} />;
          }} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // Treemap
  if (spec.type === "Treemap") {
    return (
      <ResponsiveContainer width="100%" height={160}>
        <Treemap data={grouped.map(d => ({ name: d.category, size: d[spec.yFields[0]] || 0 }))} dataKey="size" stroke="#fff" fill={colors[0]} />
      </ResponsiveContainer>
    );
  }

  // Radar
  if (spec.type === "Radar") {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={grouped}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis />
          {spec.yFields.map((y,i) => <Radar key={y} dataKey={y} stroke={colors[i%colors.length]} fill={colors[i%colors.length]} fillOpacity={0.2} />)}
          <Tooltip formatter={(v)=>fmt(v)} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  return <div style={{ color: "#9aa6bb" }}>Unsupported chart type</div>;
}
