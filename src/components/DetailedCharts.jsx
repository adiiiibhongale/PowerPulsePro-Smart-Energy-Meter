import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.jpg';

/* ================================
   Constants & Config
================================== */

const METRICS = [
  { key: 'power', label: 'Power (W)', color: '#ea580c' },
  { key: 'voltage', label: 'Voltage (V)', color: '#0891b2' },
  { key: 'current', label: 'Current (A)', color: '#16a34a' },
  { key: 'energy', label: 'Energy (kWh)', color: '#7c3aed' }
];

const ALERT_TYPES = {
  TAMPER: { label: 'Tamper', color: '#dc2626' },
  SENSOR_FAULT: { label: 'Sensor Fault', color: '#eab308' },
  THRESHOLD: { label: 'Threshold Breach', color: '#f97316' }
};

const DEFAULT_RANGE_DAYS = 7;

/* ================================
   Utility Functions
================================== */

function generateMockData(startDate, endDate, granularity = 'hour') {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const stepMs =
    granularity === 'day'
      ? 24 * 60 * 60 * 1000
      : granularity === 'week'
      ? 7 * 24 * 60 * 60 * 1000
      : 60 * 60 * 1000; // hour default

  for (let t = start.getTime(); t <= end.getTime(); t += stepMs) {
    const base = 50 + Math.sin(t / 8.64e7) * 25; // daily sinusoidal
    data.push({
      timestamp: new Date(t),
      power: clampRandom(base, 30, 140),
      voltage: clampRandom(220 + Math.sin(t / 1e7) * 5, 210, 235),
      current: clampRandom(5 + Math.sin(t / 5e6) * 2, 2, 12),
      energy: clampRandom(base / 10, 1, 20)
    });
  }
  return data;
}

function clampRandom(seed, min, max) {
  const variation = (Math.random() - 0.5) * (max - min) * 0.15;
  const val = seed + variation;
  return Math.min(max, Math.max(min, parseFloat(val.toFixed(2))));
}

function aggregateByPeriod(data, granularity = 'day') {
  const buckets = new Map();
  data.forEach(d => {
    let key;
    const dt = d.timestamp;
    if (granularity === 'month') key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
    else if (granularity === 'week') {
      const week = getWeekNumber(dt);
      key = `${dt.getFullYear()}-W${week}`;
    } else {
      key = dt.toISOString().slice(0, 10);
    }
    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        power: 0,
        voltage: 0,
        current: 0,
        energy: 0,
        count: 0
      });
    }
    const b = buckets.get(key);
    METRICS.forEach(m => {
      b[m.key] += d[m.key];
    });
    b.count += 1;
  });
  return Array.from(buckets.values()).map(b => {
    return {
      key: b.key,
      power: b.power / b.count,
      voltage: b.voltage / b.count,
      current: b.current / b.count,
      energy: b.energy // total energy accumulation (not averaged)
    };
  });
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function computeStats(data, visibleMetrics) {
  const stats = {};
  visibleMetrics.forEach(m => {
    if (!data.length) {
      stats[m.key] = { min: 0, max: 0, avg: 0, minPoint: null, maxPoint: null };
      return;
    }
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let minPoint = null;
    let maxPoint = null;
    data.forEach(d => {
      const v = d[m.key];
      if (v < min) {
        min = v;
        minPoint = d;
      }
      if (v > max) {
        max = v;
        maxPoint = d;
      }
      sum += v;
    });
    stats[m.key] = {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat((sum / data.length).toFixed(2)),
      minPoint,
      maxPoint
    };
  });
  return stats;
}

function formatDateShort(d) {
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/* ================================
   Component
================================== */

const DetailedCharts = () => {
  const navigate = useNavigate();

  const [rangePreset, setRangePreset] = useState('7d');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - DEFAULT_RANGE_DAYS + 1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [granularity, setGranularity] = useState('hour');
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visible, setVisible] = useState(() => METRICS.map(m => m.key));
  const [thresholds, setThresholds] = useState({
    power: 120,
    voltage: 230,
    current: 10,
    energy: 15
  });
  const [highlightAnomalies, setHighlightAnomalies] = useState(true);
  const [alertEvents, setAlertEvents] = useState([]);
  const [focusMetric, setFocusMetric] = useState('power');
  const chartWrapperRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null); // Hovered data point index for line chart tooltip

  // Moved generateAlertEvents above effects to avoid temporal dead zone ReferenceError.
  function generateAlertEvents(data) {
    if (!data.length) return [];
    const sample = [];
    for (let i = 0; i < data.length; i += Math.floor(data.length / 8) || 1) {
      if (Math.random() < 0.3) {
        const typeKeys = Object.keys(ALERT_TYPES);
        const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        sample.push({
          id: `${type}-${i}-${Date.now()}`,
          timestamp: data[i].timestamp,
          type
        });
      }
    }
    return sample;
  }

  useEffect(() => {
    if (document.getElementById('detailed-charts-styles')) return;
    const styleTag = document.createElement('style');
    styleTag.id = 'detailed-charts-styles';
    styleTag.innerHTML = COMPONENT_CSS;
    document.head.appendChild(styleTag);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    // TODO: Fetch time-series data from DB here based on startDate/endDate/granularity.
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (s > e) {
      setIsLoading(false);
      setRawData([]);
      return;
    }
    const data = generateMockData(s, e, granularity);
    const handle = setTimeout(() => {
      setRawData(data);
      setAlertEvents(generateAlertEvents(data));
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(handle);
  }, [startDate, endDate, granularity]);

  useEffect(() => {
    const now = new Date();
    let newStart = new Date();
    if (rangePreset === '7d') {
      newStart.setDate(now.getDate() - 6);
      setGranularity('hour');
    } else if (rangePreset === '30d') {
      newStart.setDate(now.getDate() - 29);
      setGranularity('day');
    } else if (rangePreset === 'custom') {
      return;
    } else if (rangePreset === '90d') {
      newStart.setDate(now.getDate() - 89);
      setGranularity('day');
    }
    setStartDate(newStart.toISOString().slice(0, 10));
    setEndDate(now.toISOString().slice(0, 10));
  }, [rangePreset]);

  const visibleMetrics = useMemo(
    () => METRICS.filter(m => visible.includes(m.key)),
    [visible]
  );
  const stats = useMemo(
    () => computeStats(rawData, visibleMetrics),
    [rawData, visibleMetrics]
  );
  const peakPeriods = useMemo(() => {
    if (!rawData.length) return [];
    const sorted = [...rawData].sort((a, b) => b[focusMetric] - a[focusMetric]);
    return sorted.slice(0, 3);
  }, [rawData, focusMetric]);
  const aggregated = useMemo(() => {
    if (!rawData.length) return [];
    if (granularity === 'hour') return aggregateByPeriod(rawData, 'day');
    return aggregateByPeriod(rawData, granularity === 'week' ? 'week' : 'day');
  }, [rawData, granularity]);
  const yMaxGlobal = useMemo(() => {
    if (!rawData.length) return 0;
    return Math.max(
      ...rawData.flatMap(d => visibleMetrics.map(m => d[m.key] || 0)),
      ...visibleMetrics.map(m => thresholds[m.key] || 0)
    );
  }, [rawData, visibleMetrics, thresholds]);

  const toggleMetric = (key) => {
    setVisible(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  const updateThreshold = (metric, value) => {
    setThresholds(prev => ({ ...prev, [metric]: value }));
  };

  const onExportCSV = () => {
    if (!rawData.length) return;
    const headers = ['timestamp', ...visible];
    const rows = rawData.map(d => [
      d.timestamp.toISOString(),
      ...visible.map(k => d[k])
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `usage-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onExportPNG = async () => {
    if (!chartWrapperRef.current) return;
    try {
      const html2canvas = await import('html2canvas').catch(() => null);
      if (!html2canvas) {
        alert('PNG export requires html2canvas. Please install it.');
        return;
      }
      const canvas = await html2canvas.default(chartWrapperRef.current, {
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `charts-${startDate}-to-${endDate}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      alert('Failed to export image.');
    }
  };

  const handleCustomDateChange = (setter) => (e) => {
    setRangePreset('custom');
    setter(e.target.value);
  };

  // generateAlertEvents now defined above; removed useCallback version.

  const renderLineChart = () => {
    const width = 900;
    const isNarrow = typeof window !== 'undefined' && window.innerWidth < 600;
    const height = isNarrow ? 260 : 320; // shorter overall height on mobile
    const padding = { top: isNarrow ? 44 : 30, right: 56, bottom: isNarrow ? 22 : 40, left: 64 };
    if (!rawData.length) {
      return <div className="dc-chart-empty">No data for selected range.</div>;
    }
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const xCount = rawData.length - 1 || 1;
    const xScale = (i) => padding.left + (i / xCount) * innerW;
    const yScale = (v) => padding.top + innerH - (v / yMaxGlobal) * innerH;
    const xTicks = 6;
    const yTicks = 5;
    const visibleAlerts = alertEvents.filter(a =>
      a.timestamp >= new Date(startDate) && a.timestamp <= new Date(endDate)
    );
    return (
      <svg role="img" aria-label="Time-series usage chart" width="100%" viewBox={`0 0 ${width} ${height}`} className="dc-line-chart">
        <g className="dc-axes">
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#64748b" strokeWidth="1" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#64748b" strokeWidth="1" />
          {Array.from({ length: xTicks + 1 }).map((_, i) => {
            const idx = Math.round((i / xTicks) * xCount);
            const safeIdx = Math.min(idx, rawData.length - 1); // prevent out-of-range when few points (weekly)
            const d = rawData[safeIdx];
            if (!d) return null;
            return (
              <g key={i}>
                <line x1={xScale(safeIdx)} x2={xScale(safeIdx)} y1={height - padding.bottom} y2={height - padding.bottom + 6} stroke="#64748b" />
                <text x={xScale(safeIdx)} y={height - padding.bottom + 18} textAnchor="middle" className="dc-axis-text">
                  {d.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </text>
              </g>
            );
          })}
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const v = (i / yTicks) * yMaxGlobal;
            return (
              <g key={i}>
                <line x1={padding.left - 6} x2={padding.left} y1={yScale(v)} y2={yScale(v)} stroke="#64748b" />
                <text x={padding.left - 10} y={yScale(v) + 4} textAnchor="end" className="dc-axis-text">{Math.round(v)}</text>
                <line x1={padding.left} x2={width - padding.right} y1={yScale(v)} y2={yScale(v)} stroke="#e2e8f0" strokeWidth="0.5" />
              </g>
            );
          })}
        </g>
        {visibleMetrics.map(m => (
          <g key={`th-${m.key}`}>
            <line x1={padding.left} x2={width - padding.right} y1={yScale(thresholds[m.key])} y2={yScale(thresholds[m.key])} stroke={m.color} strokeDasharray="4 4" strokeWidth="1.5" />
            <text x={width - padding.right + 4} y={yScale(thresholds[m.key]) + 4} className="dc-threshold-label" fill={m.color}>{m.label.split(' ')[0]} Thr {thresholds[m.key]}</text>
          </g>
        ))}
        {visibleAlerts.map(alert => {
          const idx = rawData.findIndex(d => d.timestamp.getTime() === alert.timestamp.getTime());
          if (idx < 0) return null;
          const x = xScale(idx);
          return (
            <g key={alert.id}>
              <rect x={x - 2} y={padding.top} width={4} height={innerH} fill={ALERT_TYPES[alert.type].color} opacity="0.25" />
              <circle cx={x} cy={padding.top - 10} r={5} fill={ALERT_TYPES[alert.type].color}>
                <title>{`${ALERT_TYPES[alert.type].label} @ ${formatDateShort(alert.timestamp)}`}</title>
              </circle>
            </g>
          );
        })}
        {visibleMetrics.map(m => {
          const path = rawData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d[m.key])}`).join(' ');
          return (
            <g key={m.key} aria-label={`${m.label} line series`}>
              <path d={path} fill="none" stroke={m.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {rawData.map((d, i) => {
                const v = d[m.key];
                const isAnomaly = highlightAnomalies && v >= thresholds[m.key];
                return (
                  <circle key={i} cx={xScale(i)} cy={yScale(v)} r={isAnomaly ? 5 : 3} fill={isAnomaly ? '#dc2626' : m.color} stroke="#ffffff" strokeWidth="1" tabIndex={0}>
                    <title>{`${m.label}: ${v} @ ${formatDateShort(d.timestamp)}${isAnomaly ? ' (Threshold Breach)' : ''}`}</title>
                  </circle>
                );
              })}
              {stats[m.key].minPoint && (
                <g>
                  <circle cx={xScale(rawData.indexOf(stats[m.key].minPoint))} cy={yScale(stats[m.key].minPoint[m.key])} r="7" fill="#ffffff" stroke={m.color} strokeWidth="2" />
                </g>
              )}
              {stats[m.key].maxPoint && (
                <g>
                  <circle cx={xScale(rawData.indexOf(stats[m.key].maxPoint))} cy={yScale(stats[m.key].maxPoint[m.key])} r="7" fill="#ffffff" stroke={m.color} strokeWidth="2" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
  const width = 900;
  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 600;
  const barCount = aggregated.length || 1;
  const maxLabels = 12;
  const stridePreview = Math.max(1, Math.ceil(barCount / maxLabels));
    // allocate a bit more bottom space only if labels rotate (dense)
    const height = isNarrow ? 200 : 260;
    const bottomPad = isNarrow ? (stridePreview > 1 ? 30 : 24) : 50;
    const padding = { top: isNarrow ? 26 : 20, right: 40, bottom: bottomPad, left: 56 };
    if (!aggregated.length) {
      return <div className="dc-chart-empty">No aggregated data.</div>;
    }
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const metric = focusMetric;
  const color = METRICS.find(m => m.key === metric)?.color || '#334155';
  const maxVal = Math.max(...aggregated.map(d => d[metric]));
    // Improved bar layout with consistent gaps
  const count = barCount;
  const desiredGap = Math.min(16, Math.max(4, innerW / count * 0.12)); // dynamic gap based on density
  const totalGapSpace = desiredGap * (count - 1);
  let barWidth = (innerW - totalGapSpace) / count;
    if (barWidth < 2) { // fallback if too many bars
      barWidth = 2;
    }
    const gap = (innerW - barWidth * count) / (count - 1 || 1); // recompute exact gap to fill width precisely
    const xScale = (i) => padding.left + i * (barWidth + gap);
  const yScale = (v) => padding.top + innerH - (v / maxVal) * innerH;
  const yTicks = 4;
  // Adaptive label density (reuse stridePreview logic)
  const stride = stridePreview;
    return (
      <svg role="img" aria-label={`Aggregated ${metric} bar chart`} width="100%" viewBox={`0 0 ${width} ${height}`} className="dc-bar-chart">
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#64748b" strokeWidth="1" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#64748b" strokeWidth="1" />
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = (i / yTicks) * maxVal;
          return (
            <g key={i}>
              <line x1={padding.left} x2={width - padding.right} y1={yScale(v)} y2={yScale(v)} stroke="#e2e8f0" strokeWidth="0.5" />
              <text x={padding.left - 8} y={yScale(v) + 4} textAnchor="end" className="dc-axis-text">{Math.round(v)}</text>
            </g>
          );
        })}
        {aggregated.map((d, i) => {
          const h = innerH - (yScale(d[metric]) - padding.top);
          const isPeak = d[metric] === maxVal;
          let label = d.key;
          if (d.key.includes('-W')) {
            label = d.key; // Weekly representation
          } else {
            const dt = new Date(d.key);
            if (!isNaN(dt)) label = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }
          const showLabel = (i % stride === 0) || i === aggregated.length - 1;
          const xCenter = xScale(i) + barWidth / 2;
          return (
            <g key={d.key}>
              <rect x={xScale(i)} y={yScale(d[metric])} width={barWidth} height={h} fill={isPeak ? '#dc2626' : color} rx="4">
                <title>{`${label}: ${d[metric].toFixed(2)}`}</title>
              </rect>
              {showLabel && (
                <text x={xCenter} y={height - padding.bottom + (stride > 1 ? 24 : 16)} textAnchor="middle" className="dc-axis-text" style={{ fontSize: '10px' }} transform={stride > 1 ? `rotate(-45 ${xCenter} ${height - padding.bottom + 24})` : undefined}>
                  {label}
                </text>
              )}
            </g>
          );
        })}
        <text x={width / 2} y={height - 10} textAnchor="middle" className="dc-axis-text">Period</text>
        <text transform={`translate(15 ${height / 2}) rotate(-90)`} textAnchor="middle" className="dc-axis-text">{METRICS.find(m => m.key === metric)?.label}</text>
      </svg>
    );
  };

  return (
    <div className="dc-container">
      <header className="dc-header" role="banner">
        <div className="dc-header-content">
          <div className="dc-logo-section">
            <img src={Logo} alt="PowerPulsePro logo" className="dc-logo" />
          </div>
            <h1 className="dc-page-title">Detailed Usage Analytics</h1>
            <button className="dc-back-btn" onClick={() => navigate('/dashboard')} aria-label="Back to Dashboard">← Dashboard</button>
        </div>
      </header>
      <section className="dc-filters" role="toolbar" aria-label="Chart filters and date range selection">
        <div className="dc-filter-group">
          <label className="dc-filter-label">Range Preset</label>
          <div className="dc-preset-row" role="group" aria-label="Date range presets">
            {[{ key: '7d', label: 'Last 7 Days' }, { key: '30d', label: 'Last 30 Days' }, { key: '90d', label: 'Last 90 Days' }, { key: 'custom', label: 'Custom' }].map(p => (
              <button key={p.key} className={`dc-chip ${rangePreset === p.key ? 'active' : ''}`} onClick={() => setRangePreset(p.key)} aria-pressed={rangePreset === p.key}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="dc-filter-group">
          <label className="dc-filter-label" htmlFor="start-date">Start</label>
          <input id="start-date" type="date" value={startDate} onChange={handleCustomDateChange(setStartDate)} className="dc-date-input" aria-label="Start date" />
        </div>
        <div className="dc-filter-group">
          <label className="dc-filter-label" htmlFor="end-date">End</label>
          <input id="end-date" type="date" value={endDate} onChange={handleCustomDateChange(setEndDate)} className="dc-date-input" aria-label="End date" />
        </div>
        <div className="dc-filter-group">
          <label className="dc-filter-label" htmlFor="granularity">Granularity</label>
          <select id="granularity" className="dc-select" value={granularity} onChange={e => setGranularity(e.target.value)} aria-label="Granularity selection">
            <option value="hour">Hourly</option>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>
        </div>
        <div className="dc-filter-group">
          <label className="dc-filter-label">Anomalies</label>
          <div className="dc-toggle-row">
            <label className="dc-checkbox-label">
              <input type="checkbox" checked={highlightAnomalies} onChange={(e) => setHighlightAnomalies(e.target.checked)} aria-label="Highlight threshold anomalies" />
              Highlight
            </label>
          </div>
        </div>
      </section>
      <section className="dc-metric-legend" aria-label="Metric legend and visibility toggles">
        {METRICS.map(m => {
          const active = visible.includes(m.key);
          return (
            <button key={m.key} className={`dc-legend-item ${active ? 'visible' : 'dimmed'}`} onClick={() => toggleMetric(m.key)} style={{ '--metric-color': m.color }} aria-pressed={active} aria-label={`Toggle ${m.label}`}>
              <span className="dc-legend-dot" />
              <span className="dc-legend-label">{m.label}</span>
            </button>
          );
        })}
      </section>
      <div className="dc-threshold-panel" aria-label="Threshold controls">
        {METRICS.map(m => (
          <div key={m.key} className="dc-threshold-item">
            <label htmlFor={`thr-${m.key}`} className="dc-threshold-label">{m.label.split(' ')[0]} Thr</label>
            <input id={`thr-${m.key}`} type="number" className="dc-threshold-input" value={thresholds[m.key]} onChange={e => updateThreshold(m.key, Number(e.target.value))} aria-label={`${m.label} threshold`} />
          </div>
        ))}
      </div>
      <div className="dc-charts-wrapper" ref={chartWrapperRef}>
        <div className="dc-chart-card" aria-live="polite">
          <div className="dc-chart-card-header">
            <h2 className="dc-chart-title">Time-Series Usage</h2>
          </div>
          <div className="dc-chart-body dc-chart-body-responsive">{isLoading ? <Loader /> : renderLineChart()}</div>
        </div>
        <div className="dc-chart-card">
          <div className="dc-chart-card-header">
            <h2 className="dc-chart-title">Aggregated {focusMetric} Comparison</h2>
            <div className="dc-chart-subcontrols">
              <label className="dc-sub-label" htmlFor="focus-metric">Metric</label>
              <select id="focus-metric" className="dc-select" value={focusMetric} onChange={(e) => setFocusMetric(e.target.value)} aria-label="Select aggregation focus metric">
                {METRICS.map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="dc-chart-body dc-chart-body-responsive">{isLoading ? <Loader /> : renderBarChart()}</div>
        </div>
      </div>
      <section className="dc-summary-grid" aria-label="Metric summary statistics">
        {visibleMetrics.map(m => {
          const s = stats[m.key];
          return (
            <div key={m.key} className="dc-summary-card">
              <div className="dc-summary-header">
                <span className="dc-summary-color" style={{ background: m.color }} />
                <h3 className="dc-summary-title">{m.label}</h3>
              </div>
              <div className="dc-summary-stats">
                <div className="dc-stat-line"><span>Min</span><strong>{s.min}</strong></div>
                <div className="dc-stat-line"><span>Max</span><strong>{s.max}</strong></div>
                <div className="dc-stat-line"><span>Avg</span><strong>{s.avg}</strong></div>
              </div>
              <div className="dc-summary-foot">
                {s.minPoint && (<span className="dc-foot-tag" title={`At ${formatDateShort(s.minPoint.timestamp)}`}>Min @ {s.minPoint.timestamp.toLocaleDateString()}</span>)}
                {s.maxPoint && (<span className="dc-foot-tag" title={`At ${formatDateShort(s.maxPoint.timestamp)}`}>Max @ {s.maxPoint.timestamp.toLocaleDateString()}</span>)}
              </div>
            </div>
          );
        })}
      </section>
      <section className="dc-peak-panel" aria-label="Peak periods">
        <h2 className="dc-peak-title">Top {focusMetric} Periods</h2>
        <ul className="dc-peak-list">
          {peakPeriods.map(p => (
            <li key={p.timestamp.getTime()} className="dc-peak-item">
              <span className="dc-peak-time">{formatDateShort(p.timestamp)}</span>
              <span className="dc-peak-value">{p[focusMetric].toFixed(2)}</span>
            </li>
          ))}
          {!peakPeriods.length && <li className="dc-empty">No data</li>}
        </ul>
      </section>
      <section className="dc-export-panel" aria-label="Export options">
        <button className="dc-export-btn" onClick={onExportCSV} disabled={!rawData.length || isLoading} aria-disabled={!rawData.length || isLoading}>Export CSV</button>
        <button className="dc-export-btn" onClick={onExportPNG} disabled={!rawData.length || isLoading} aria-disabled={!rawData.length || isLoading}>Download PNG</button>
        <div className="dc-alert-legend" aria-label="Alert color legend">
          {Object.entries(ALERT_TYPES).map(([k, v]) => (
            <span key={k} className="dc-alert-legend-item">
              <span className="dc-alert-dot" style={{ background: v.color }} aria-hidden="true" />
              {v.label}
            </span>
          ))}
        </div>
      </section>
      <footer className="dc-footer" role="contentinfo">
        <div className="dc-footer-help">
          <span>Need help? Contact </span>
          <a href="mailto:support@powerpulsepro.com" className="dc-footer-link">PowerPulsePro Support</a>
        </div>
        <div className="dc-footer-copy">© {new Date().getFullYear()} PowerPulsePro Smart Energy Meter. All rights reserved.</div>
      </footer>
    </div>
  );
};

const Loader = () => (
  <div className="dc-loader" role="status" aria-live="polite">
    <div className="dc-spinner" />
    <span className="dc-loader-text">Loading analytics...</span>
  </div>
);

const COMPONENT_CSS = `
:root { --dc-bg: #fef7f0; --dc-bg-mid: #f0f9ff; --dc-bg-end: #ecfeff; --dc-surface: #ffffff; --dc-surface-alt: #f8fafc; --dc-border: #e2e8f0; --dc-border-strong: #cbd5e1; --dc-text: #111827; --dc-text-dim: #64748b; --dc-primary: #ea580c; --dc-primary-accent: #0891b2; --dc-radius-sm: 4px; --dc-radius: 10px; --dc-radius-lg: 18px; --dc-focus: 2px solid #0891b2; --dc-font-stack: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; --dc-max:1280px; }
.dc-container { font-family: var(--dc-font-stack); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background: linear-gradient(135deg,var(--dc-bg) 0%,var(--dc-bg-mid) 50%,var(--dc-bg-end) 100%); min-height: 100vh; padding: 0; color: var(--dc-text); box-sizing: border-box; display:flex; flex-direction:column; overflow-x:hidden; }
.dc-header { position: sticky; top: 0; z-index: 40; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-bottom: 2px solid var(--dc-primary); box-shadow: 0 4px 20px 0 rgba(234,88,12,0.2); }
.dc-header-content { width:100%; max-width: var(--dc-max); margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: .65rem 1rem; gap: 1rem; box-sizing:border-box; position:relative; }
.dc-logo-section { display: flex; align-items: center; gap: .4rem; }
.dc-logo { height: 42px; width: auto; object-fit: contain; }
.dc-brand-text { display:none; }
.dc-page-title { font-size: 1.4rem; font-weight: 700; margin: 0; color: var(--dc-primary); text-align: center; flex: 0; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); padding:0 .5rem; line-height:1.1; }
.dc-back-btn { background: var(--dc-primary); color: #fff; border: none; padding: .55rem .9rem; border-radius: .65rem; cursor: pointer; font-weight: 600; font-size: .8rem; letter-spacing: .5px; box-shadow: 0 2px 6px -1px rgba(234,88,12,0.5); transition: background .25s, transform .25s, box-shadow .25s; }
.dc-back-btn:hover { background: #c2410c; transform: translateY(-2px); box-shadow: 0 6px 14px -4px rgba(234,88,12,0.45); }
.dc-back-btn:active { transform: translateY(0); }
.dc-filters { display: grid; grid-template-columns: repeat(auto-fit,minmax(170px,1fr)); gap: 1rem; background: var(--dc-surface); padding: 1rem 1rem; border-radius: var(--dc-radius-lg); box-shadow: 0 4px 10px -4px rgba(0,0,0,0.1),0 0 0 1px rgba(0,0,0,0.05); margin: 1.1rem auto 1.25rem; width:100%; max-width: var(--dc-max); box-sizing:border-box; }
.dc-filter-group { display: flex; flex-direction: column; gap: .35rem; }
.dc-filter-label { font-size: .72rem; font-weight: 600; letter-spacing: .2px; color: var(--dc-text-dim); }
.dc-preset-row { display: flex; flex-wrap: wrap; gap: .4rem; }
.dc-chip { border: 1px solid var(--dc-border); background: var(--dc-surface-alt); padding: .38rem .6rem; font-size: .7rem; border-radius: 999px; cursor: pointer; color: var(--dc-text-dim); font-weight: 600; letter-spacing: .2px; transition: background .25s, color .25s, border-color .25s; }
.dc-chip.active, .dc-chip:hover { background: var(--dc-primary); color: #fff; border-color: var(--dc-primary); }
.dc-date-input, .dc-select, .dc-threshold-input { background: var(--dc-surface-alt); border: 1px solid var(--dc-border); padding: .55rem .6rem; border-radius: var(--dc-radius-sm); font-size: .8rem; color: var(--dc-text); outline: none; transition: border-color .25s, background .25s; }
.dc-date-input:focus, .dc-select:focus, .dc-threshold-input:focus { border-color: var(--dc-primary); box-shadow: 0 0 0 2px rgba(234,88,12,0.25); }
.dc-toggle-row { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.dc-checkbox-label { display: inline-flex; align-items: center; gap: .45rem; font-size: .75rem; font-weight: 500; color: var(--dc-text-dim); cursor: pointer; }
.dc-checkbox-label input { transform: scale(1.1); accent-color: var(--dc-primary); cursor: pointer; }
.dc-metric-legend { display: flex; flex-wrap: wrap; gap: .6rem; margin: 0 auto 1rem; width:100%; max-width: var(--dc-max); padding:0 1rem; box-sizing:border-box; }
.dc-legend-item { display: inline-flex; align-items: center; gap: .5rem; padding: .5rem .75rem; background: var(--dc-surface); border: 1px solid var(--dc-border); border-radius: var(--dc-radius); cursor: pointer; font-size: .75rem; font-weight: 600; color: var(--dc-text-dim); position: relative; transition: box-shadow .25s, border-color .25s, background .25s; }
.dc-legend-item.visible { color: var(--dc-text); border-color: var(--dc-primary); box-shadow: 0 0 0 1px var(--dc-primary), 0 2px 6px -1px rgba(0,0,0,0.15); }
.dc-legend-item.dimmed { opacity: .55; }
.dc-legend-item:focus-visible { outline: var(--dc-focus); outline-offset: 2px; }
.dc-legend-item:hover { background: #fff; }
.dc-legend-dot { width: 14px; height: 14px; border-radius: 4px; background: var(--metric-color); box-shadow: 0 0 0 1px rgba(0,0,0,0.2) inset; }
.dc-threshold-panel { display: flex; flex-wrap: wrap; gap: .9rem; background: var(--dc-surface); padding: .75rem .9rem; border-radius: var(--dc-radius-lg); box-shadow: 0 3px 8px -3px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05); margin: 0 auto 1.25rem; width:100%; max-width: var(--dc-max); box-sizing:border-box; }
.dc-threshold-item { display: flex; flex-direction: column; gap: .25rem; width: auto; flex:1 1 110px; min-width:95px; }
.dc-threshold-label { font-size: .65rem; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; color: var(--dc-text-dim); }
.dc-charts-wrapper { display: flex; flex-direction: column; gap: 1.25rem; margin: 0 auto 1.5rem; width:100%; max-width: var(--dc-max); padding: 0 1rem; box-sizing: border-box; }
.dc-chart-card { background: var(--dc-surface); border-radius: var(--dc-radius-lg); padding: .85rem 1rem .6rem; box-shadow: 0 2px 6px -1px rgba(0,0,0,0.12), 0 4px 16px -2px rgba(0,0,0,0.06); position: relative; overflow-x: auto; border: 1px solid #f1f5f9; }
.dc-chart-card-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: .75rem; padding-bottom: .5rem; border-bottom: 1px solid var(--dc-border); margin-bottom: .5rem; }
.dc-chart-title { font-size: .95rem; margin: 0; font-weight: 700; color: #0f172a; }
.dc-chart-subcontrols { display: flex; align-items: center; gap: .5rem; }
.dc-sub-label { font-size: .65rem; font-weight: 600; text-transform: uppercase; color: var(--dc-text-dim); letter-spacing: .5px; }
.dc-chart-body { width: 100%; min-height: 220px; }
.dc-chart-body-responsive{ width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
.dc-chart-body-responsive svg{ width:100%; min-width:0; height:auto; }
.dc-line-chart, .dc-bar-chart { font-family: inherit; }
.dc-axis-text { font-size: .6rem; fill: var(--dc-text-dim); font-weight: 500; letter-spacing: .3px; }
.dc-threshold-label { font-size: .55rem; font-weight: 600; background: #fff; padding: 2px 4px; border-radius: 4px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); }
.dc-chart-empty { font-size: .75rem; color: var(--dc-text-dim); padding: 1rem 0; }
.dc-summary-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 1rem; margin: 0 auto 1.25rem; width:100%; max-width: var(--dc-max); padding: 0 1rem; box-sizing:border-box; }
.dc-summary-card { background: linear-gradient(175deg,#ffffff 0%,#f8fafc 85%); border: 1px solid var(--dc-border); border-radius: var(--dc-radius-lg); padding: .85rem .9rem; display: flex; flex-direction: column; gap: .65rem; position: relative; box-shadow: 0 2px 5px -2px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05); min-height: 160px; }
.dc-summary-header { display: flex; align-items: center; gap: .5rem; }
.dc-summary-color { width: 16px; height: 16px; border-radius: 5px; box-shadow: 0 0 0 1px rgba(0,0,0,0.3) inset; }
.dc-summary-title { font-size: .78rem; margin: 0; font-weight: 600; color: var(--dc-text-dim); letter-spacing:.2px; }
.dc-summary-stats { display: flex; flex-direction: column; gap: .4rem; font-size: .7rem; }
.dc-stat-line { display: flex; align-items: center; justify-content: space-between; background: #fff; padding: .4rem .55rem; border-radius: var(--dc-radius-sm); border: 1px solid var(--dc-border); font-weight: 600; letter-spacing: .3px; }
.dc-summary-foot { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: auto; }
.dc-foot-tag { background: var(--dc-surface-alt); border: 1px solid var(--dc-border); font-size: .55rem; font-weight: 600; padding: .28rem .45rem; border-radius: 999px; letter-spacing: .15px; color: var(--dc-text-dim); }
.dc-peak-panel { background: var(--dc-surface); border-radius: var(--dc-radius-lg); padding: .9rem 1rem 1.15rem; box-shadow: 0 2px 6px -1px rgba(0,0,0,0.12), 0 4px 14px -4px rgba(0,0,0,0.06); margin: 0 auto 1.25rem; width:100%; max-width: var(--dc-max); border: 1px solid #f1f5f9; box-sizing:border-box; }
.dc-peak-title { font-size: .85rem; font-weight: 600; letter-spacing: .25px; color: var(--dc-text-dim); margin: 0 0 .6rem; }
.dc-peak-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .55rem; font-size: .7rem; }
.dc-peak-item { display: flex; justify-content: space-between; background: var(--dc-surface-alt); border: 1px solid var(--dc-border); padding: .5rem .6rem; border-radius: var(--dc-radius-sm); font-weight: 600; letter-spacing: .4px; }
.dc-empty { color: var(--dc-text-dim); font-style: italic; }
.dc-peak-time { color: var(--dc-text-dim); }
.dc-peak-value { color: var(--dc-text); font-weight: 700; }
.dc-export-panel { display: flex; flex-wrap: wrap; gap: .75rem 1rem; align-items: center; background: var(--dc-surface); padding: .8rem 1rem .75rem; border-radius: var(--dc-radius-lg); box-shadow: 0 2px 6px -1px rgba(0,0,0,0.12), 0 4px 14px -4px rgba(0,0,0,0.06); margin: 0 auto .5rem; width:100%; max-width: var(--dc-max); border: 1px solid #f1f5f9; box-sizing:border-box; }
.dc-export-btn { background: var(--dc-primary); color: #fff; border: none; padding: .58rem .95rem; border-radius: var(--dc-radius); font-size: .7rem; letter-spacing: .2px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.25); transition: background .25s, transform .2s; }
.dc-export-btn:hover:not(:disabled) { background: #c2410c; transform: translateY(-1px); }
.dc-export-btn:disabled { opacity: .5; cursor: not-allowed; }
.dc-alert-legend { display: flex; flex-wrap: wrap; gap: .6rem; margin-left: auto; font-size: .65rem; }
.dc-alert-legend-item { display: inline-flex; align-items: center; gap: .35rem; font-weight: 600; color: var(--dc-text-dim); background: var(--dc-surface-alt); padding: .35rem .55rem; border-radius: 999px; border: 1px solid var(--dc-border); letter-spacing: .4px; }
.dc-alert-dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 1px rgba(0,0,0,0.25) inset; }
.dc-loader { display: flex; flex-direction: column; align-items: center; gap: .75rem; padding: 2.5rem 0; }
.dc-spinner { width: 34px; height: 34px; border-radius: 50%; border: 4px solid var(--dc-border); border-top-color: var(--dc-primary); animation: dc-spin 1s linear infinite; }
.dc-loader-text { font-size: .7rem; font-weight: 600; letter-spacing: .4px; color: var(--dc-text-dim); text-transform: uppercase; }
@keyframes dc-spin { to { transform: rotate(360deg); } }
.dc-footer { text-align: center; font-size: .65rem; color: #cbd5e1; letter-spacing: .5px; padding: 1rem 1.25rem 1.05rem; max-width: 100%; margin: 0; font-weight:500; background:#0f172a; border-top:1px solid #1e293b; display:flex; flex-direction:column; gap:.5rem; margin-top:auto; }
.dc-footer-help { font-size:.8rem; color:#f1f5f9; }
.dc-footer-link { color:#ea580c; font-weight:600; text-decoration:none; }
.dc-footer-link:hover { text-decoration:underline; }
.dc-footer-copy { font-size:.7rem; color:#cbd5e1; }
@media (max-width: 860px){
  .dc-chart-body{padding-top:.5rem;}
  .dc-header-content{display:flex; flex-direction:row; align-items:center; gap:.55rem; padding:.5rem .6rem;}
  .dc-logo{height:28px;}
  .dc-page-title{position:static; transform:none; font-size:1rem; line-height:1.15; text-align:left; margin:0 .5rem 0 0; font-weight:700; color:var(--dc-primary);}
  .dc-back-btn{align-self:flex-end; order:2;}
}
@media (min-width: 1080px) { .dc-charts-wrapper { flex-direction: column; } }
@media (max-width: 840px) { .dc-filters { grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); } .dc-summary-grid { grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); } .dc-chart-card { padding: .65rem .65rem .85rem; } .dc-back-btn{font-size:.7rem; padding:.55rem .8rem;} }
/* Ultra-small / phone optimizations */
@media (max-width: 560px){
  /* Compact mobile header layout */
  .dc-header-content{display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:.55rem; padding:.5rem .6rem;}
  .dc-logo{height:28px;}
  .dc-page-title{grid-column:2; justify-self:center; position:static; transform:none; font-size:1rem; line-height:1.15; text-align:center; margin:0; font-weight:700; color:var(--dc-primary);}
  .dc-back-btn{background:transparent; color:var(--dc-primary); box-shadow:none; font-size:.7rem; padding:.35rem .5rem; margin:0; border:none; letter-spacing:.3px; font-weight:600;}
  .dc-back-btn:hover{background:transparent; text-decoration:underline; transform:none; box-shadow:none;}
  .dc-back-btn:active{transform:none;}
  .dc-filters{padding:.7rem .75rem; gap:.7rem;}
  .dc-threshold-panel{padding:.6rem .65rem; gap:.65rem;}
  .dc-threshold-item{flex:1 1 45%; min-width:120px;}
  .dc-threshold-input{padding:.45rem .5rem; font-size:.7rem;}
  .dc-metric-legend{gap:.45rem; padding:0 .6rem;}
  .dc-legend-item{padding:.45rem .6rem; font-size:.65rem;}
  .dc-export-panel{padding:.65rem .7rem .6rem; gap:.6rem .7rem;}
  .dc-summary-grid{padding:0 .6rem; gap:.65rem; grid-template-columns: repeat(auto-fit,minmax(150px,1fr));}
  .dc-charts-wrapper{padding:0 .6rem; gap:.85rem;}
  .dc-chart-card{padding:.55rem .55rem .4rem;}
  .dc-chart-title{font-size:.83rem;}
  .dc-axis-text{font-size:.5rem;}
  .dc-peak-panel{padding:.7rem .7rem .85rem; margin-bottom:1rem;}
  .dc-peak-title{font-size:.75rem;}
  .dc-foot-tag{font-size:.5rem;}
  .dc-export-btn{font-size:.6rem; padding:.5rem .7rem;}
  .dc-footer{padding:.85rem .75rem 1rem; font-size:.6rem;}
  .dc-footer-help{font-size:.7rem;}
  .dc-footer-copy{font-size:.6rem;}
  .dc-filters{grid-template-columns:repeat(2,minmax(0,1fr));}
  .dc-threshold-item{width:48%;}
}
@media (max-width: 420px){
  .dc-filters{grid-template-columns:1fr;}
  .dc-threshold-item{width:100%;}
  .dc-page-title{font-size:1rem;}
}
@media (prefers-reduced-motion: reduce) { .dc-back-btn, .dc-export-btn, .dc-chip { transition: none; } .dc-spinner { animation: none; } }
`;

export default DetailedCharts;
