import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.jpg';

// Inline CSS (mirrors theme + font from other pages)
const EVENTS_CSS = `
:root { --ea-font: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; --ea-primary:#ea580c; --ea-bg:#fef7f0; --ea-bg-mid:#f0f9ff; --ea-bg-end:#ecfeff; --ea-surface:#ffffff; --ea-border:#e2e8f0; --ea-border-strong:#cbd5e1; --ea-text:#111827; --ea-text-dim:#64748b; }
body, .ea-root { font-family: var(--ea-font); }
.ea-container { min-height:100vh; display:flex; flex-direction:column; background:linear-gradient(135deg,var(--ea-bg) 0%,var(--ea-bg-mid) 50%,var(--ea-bg-end) 100%); color:var(--ea-text); }
.ea-header { position:sticky; top:0; z-index:40; background:rgba(255,255,255,0.95); backdrop-filter:blur(20px); border-bottom:2px solid var(--ea-primary); box-shadow:0 4px 20px rgba(234,88,12,0.2); }
.ea-header-content { max-width:1280px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:.65rem 1rem; position:relative; }
.ea-logo { height:42px; width:auto; object-fit:contain; }
.ea-title { font-size:1.35rem; font-weight:700; margin:0; color:var(--ea-primary); letter-spacing:.5px; }
.ea-back-btn { background:var(--ea-primary); color:#fff; border:none; padding:.55rem .9rem; border-radius:.65rem; cursor:pointer; font-weight:600; font-size:.75rem; letter-spacing:.5px; box-shadow:0 2px 6px -1px rgba(234,88,12,0.5); transition:.25s; }
.ea-back-btn:hover { background:#c2410c; transform:translateY(-2px); }
.ea-main { width:100%; max-width:1280px; margin:0 auto; padding:.85rem .9rem 2.4rem; box-sizing:border-box; }
.ea-filters-toggle { display:inline-flex; align-items:center; gap:.4rem; background:var(--ea-primary); border:none; color:#fff; font-weight:600; font-size:.7rem; padding:.55rem .85rem; border-radius:12px; cursor:pointer; letter-spacing:.5px; box-shadow:0 2px 6px rgba(0,0,0,0.2); margin:0 0 .6rem; }
.ea-filters-toggle:active { transform:translateY(1px); }
.ea-filters-card { background:var(--ea-surface); border:1px solid var(--ea-border); border-radius:18px; padding:.85rem .95rem .9rem; box-shadow:0 10px 26px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04); display:flex; flex-wrap:wrap; gap:.85rem; align-items:center; position:relative; transition:max-height .4s ease, opacity .3s ease, padding .35s ease, margin .35s ease; overflow:hidden; }
.ea-filters-card.collapsed { max-height:0; opacity:0; padding:0 .95rem; margin:0; border-width:0; box-shadow:none; }
.ea-filters-card:before { content:""; position:absolute; inset:0; pointer-events:none; border-radius:inherit; background:linear-gradient(135deg,rgba(234,88,12,0.06),rgba(8,145,178,0.05)); mix-blend-mode:normal; }
.ea-total-inline { font-size:.78rem; font-weight:700; display:flex; align-items:center; gap:.35rem; letter-spacing:.3px; padding:0 .25rem; }
.ea-total-number { color:#dc2626; font-size:.8rem; }
.ea-field { display:flex; flex-direction:column; gap:.35rem; font-size:.65rem; font-weight:600; letter-spacing:.5px; color:var(--ea-text-dim); }
.ea-field-row { display:flex; flex-direction:row; flex-wrap:wrap; align-items:center; gap:.85rem; }
.ea-field label { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }
.ea-input, .ea-select { background:#f8fafc; border:1px solid var(--ea-border); border-radius:10px; padding:.52rem .6rem; font-size:.73rem; min-width:150px; outline:none; font-weight:500; color:var(--ea-text); transition:border-color .25s, background .25s; height:38px; }
.ea-input:focus, .ea-select:focus { border-color:var(--ea-primary); box-shadow:0 0 0 2px rgba(234,88,12,0.25); }
.ea-actions-bar { display:flex; flex-wrap:wrap; gap:.6rem; margin:.9rem 0 .8rem; }
.ea-btn { border:none; border-radius:10px; padding:.6rem .95rem; font-size:.65rem; font-weight:700; letter-spacing:.4px; cursor:pointer; display:inline-flex; align-items:center; gap:.4rem; box-shadow:0 2px 6px rgba(0,0,0,0.15); transition:.25s; background:#fff; }
.ea-btn:disabled { opacity:.45; cursor:not-allowed; }
.ea-btn-ack { background:#6366f1; color:#fff; }
.ea-btn-ack:hover:not(:disabled) { background:#4f46e5; }
.ea-btn-export { background:#2563eb; color:#fff; }
.ea-btn-export:hover:not(:disabled) { background:#1d4ed8; }
.ea-btn-clear { background:#dc2626; color:#fff; }
.ea-btn-clear:hover:not(:disabled) { background:#b91c1c; }
.ea-table-wrapper { background:var(--ea-surface); border:1px solid var(--ea-border); border-radius:14px; overflow:auto; box-shadow:0 10px 28px -12px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04); position:relative; -webkit-overflow-scrolling:touch; }
.ea-table-header-bar { height:6px; background:linear-gradient(90deg,var(--ea-primary),#f59e0b); width:100%; position:absolute; top:0; left:0; }
table.ea-table { width:100%; border-collapse:separate; border-spacing:0; font-size:.72rem; margin-top:6px; }
table.ea-table thead th { background:var(--ea-primary); color:#fff; text-align:left; padding:.65rem .7rem; font-size:.64rem; letter-spacing:.55px; position:sticky; top:0; z-index:5; border-bottom:2px solid #d9480f; }
table.ea-table thead th:first-child { width:30px; }
table.ea-table tbody td { padding:.6rem .7rem; border-top:1px solid #f1f5f9; vertical-align:middle; font-size:.7rem; }
table.ea-table tbody tr:first-child td { border-top:none; }
table.ea-table tbody tr:hover { background:#fff7ed; }
.ea-col-checkbox { width:26px; }
.ea-checkbox { accent-color:var(--ea-primary); cursor:pointer; }
.ea-badge { display:inline-flex; align-items:center; font-weight:700; font-size:.58rem; padding:.28rem .55rem; border-radius:999px; letter-spacing:.4px; border:1px solid; box-shadow:0 1px 2px rgba(0,0,0,0.15); }
.sev-critical { background:#fff1f2; color:#b91c1c; border-color:#fecaca; }
.sev-warning { background:#fffbeb; color:#92400e; border-color:#fde68a; }
.sev-info { background:#eff6ff; color:#1e3a8a; border-color:#bfdbfe; }
.ea-type { font-weight:600; letter-spacing:.3px; }
.ea-row-warning { background:#fffaf5; }
.ea-row-critical { background:#fff5f4; }
.ea-row-info { background:#f7fbff; }
.ea-json-btn, .ea-ack-btn { border:none; border-radius:8px; padding:.4rem .65rem; font-size:.58rem; font-weight:600; cursor:pointer; transition:.25s; }
.ea-ack-btn { background:#6366f1; color:#fff; }
.ea-ack-btn:hover { background:#4f46e5; }
.ea-json-btn { background:#e2e8f0; color:#1e293b; }
.ea-json-btn:hover { background:#cbd5e1; }
.ea-status-ack { color:#059669; font-weight:700; }
.ea-status-new { color:#dc2626; font-weight:700; }
.ea-footer { text-align:center; font-size:.65rem; color:#cbd5e1; letter-spacing:.5px; padding:1rem 1.25rem 1.05rem; background:#0f172a; border-top:1px solid #1e293b; margin-top:auto; display:flex; flex-direction:column; gap:.5rem; }
.ea-footer a { color:var(--ea-primary); font-weight:600; text-decoration:none; }
.ea-footer a:hover { text-decoration:underline; }
/* Modal */
.ea-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; padding:1rem; z-index:2000; backdrop-filter:blur(4px); }
.ea-modal { background:#fff; width:min(92vw,560px); max-height:82vh; display:flex; flex-direction:column; border-radius:18px; padding:1.15rem 1.25rem 1rem; box-shadow:0 30px 60px -18px rgba(0,0,0,0.35),0 0 0 1px rgba(0,0,0,0.05); position:relative; }
.ea-modal h2 { margin:0 0 .85rem; font-size:1rem; font-weight:700; letter-spacing:.5px; color:var(--ea-primary); }
.ea-modal pre { margin:0; font-size:.65rem; background:#f8fafc; padding:.9rem .95rem; border:1px solid #e2e8f0; border-radius:12px; flex:1; overflow:auto; line-height:1.35; }
.ea-modal-actions { display:flex; justify-content:flex-end; gap:.6rem; margin-top:.9rem; flex-wrap:wrap; }
.ea-no-scroll { overflow:hidden; }
@media (max-width:520px){ .ea-modal { width:94vw; padding:1rem .95rem .85rem; border-radius:16px; } .ea-modal pre { font-size:.6rem; } }
@media (max-width:880px){ .ea-filters-card { gap:.65rem; } .ea-input, .ea-select { min-width:130px; } .ea-main { padding:.75rem .7rem 2rem; } }
@media (max-width:640px){
 .ea-header-content { flex-wrap:wrap; }
 .ea-title { font-size:1.05rem; }
 .ea-back-btn { font-size:.65rem; padding:.45rem .7rem; }
 .ea-filters-toggle { display:inline-flex; }
 .ea-filters-card { flex-direction:column; align-items:stretch; padding:.85rem .85rem .75rem; }
 .ea-filters-card.collapsed { padding:0 .85rem; }
 .ea-total-inline { padding:0; }
 .ea-field-row { width:100%; display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:.55rem .65rem; }
 .ea-input, .ea-select { width:100%; min-width:0; }
 .ea-actions-bar { gap:.45rem; position:static; background:transparent; padding:.55rem 0; margin:.6rem 0 .8rem; box-shadow:none; overflow:visible; }
 .ea-btn { flex:1 1 auto; justify-content:center; }
 table.ea-table tbody td { font-size:.68rem; }
 /* Hide Source column on very small screens for brevity */
}
@media (max-width:480px){
 table.ea-table thead th:nth-child(6), table.ea-table tbody td:nth-child(6){ display:none; }
 table.ea-table thead th:nth-child(4){ min-width:160px; }
}
@media (min-width:641px){
 .ea-filters-toggle { display:none; }
 .ea-filters-card { max-height:none !important; opacity:1 !important; margin:0 0 .25rem; }
}
/* Responsive header adjustments matching prior pages */
@media (max-width:860px){
	.ea-header-content{padding:.55rem .65rem; gap:.6rem;}
	.ea-logo{height:30px;}
	.ea-title{font-size:1.05rem; margin:0; text-align:left;}
	.ea-back-btn{font-size:.7rem; padding:.5rem .75rem;}
}
@media (max-width:560px){
	.ea-header-content{display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:.5rem; padding:.5rem .6rem;}
	.ea-logo{height:26px;}
	.ea-title{grid-column:2; justify-self:center; font-size:1rem; font-weight:700; text-align:center; margin:0;}
	.ea-back-btn{background:transparent; color:var(--ea-primary); box-shadow:none; padding:.35rem .5rem; font-size:.7rem;}
	.ea-back-btn:hover{background:transparent; text-decoration:underline; transform:none;}
}
/* Mobile card layout for events table */
@media (max-width:560px){
 table.ea-table { border-spacing:0; }
 table.ea-table thead { display:none; }
 table.ea-table tbody tr { display:block; margin:.55rem 0; border:1px solid var(--ea-border); border-radius:12px; background:#fff; box-shadow:0 4px 10px -4px rgba(0,0,0,0.12); overflow:hidden; }
 table.ea-table tbody tr:hover { background:#fff; }
 table.ea-table tbody td { display:flex; width:100%; box-sizing:border-box; padding:.55rem .75rem; border-top:1px solid #f1f5f9; font-size:.7rem; }
 table.ea-table tbody td:first-child { border-top:none; }
 table.ea-table tbody td::before { content:attr(data-label); flex:0 0 88px; font-weight:600; color:var(--ea-text-dim); text-transform:uppercase; font-size:.56rem; letter-spacing:.5px; line-height:1.1; padding-right:.65rem; }
 table.ea-table tbody td[data-label="Detail"] { white-space:normal; }
 table.ea-table tbody td[data-label="Actions"] { justify-content:flex-start; }
 .ea-table-wrapper { overflow:visible; }
 .ea-detail-cell { min-width:0 !important; }
 .ea-col-checkbox { width:auto; }
 .ea-checkbox { margin-top:2px; }
}
`; 

const mockEvents = [
	{ id: 'e1', time: '2025-09-29T16:00:00Z', type: 'Tamper', detail: 'Cover opened detection triggered.', severity: 'Critical', source: 'PPPRO-001', status: 'New', raw: { sensor: 'lid', code: 'COVER_OPEN', value: true } },
	{ id: 'e2', time: '2025-09-29T15:15:00Z', type: 'Threshold', detail: 'Voltage under limit (UV) for 5 min.', severity: 'Warning', source: 'PPPRO-001', status: 'New', raw: { metric: 'voltage', avg: 176.2, threshold: 180 } },
	{ id: 'e3', time: '2025-09-28T21:45:00Z', type: 'System', detail: 'Firmware updated successfully to v1.2.3', severity: 'Info', source: 'PPPRO-001', status: 'Ack', raw: { version: '1.2.3', previous: '1.2.2', result: 'OK' } },
	{ id: 'e4', time: '2025-09-27T16:30:00Z', type: 'Threshold', detail: 'Power Factor low: 0.82 (lagging).', severity: 'Warning', source: 'PPPRO-001', status: 'New', raw: { pf: 0.82, mode: 'lagging' } },
	{ id: 'e5', time: '2025-09-27T13:30:00Z', type: 'Tamper', detail: 'Magnetic field proximity detected.', severity: 'Critical', source: 'PPPRO-001', status: 'New', raw: { fieldGauss: 155 } }
];

export default function EventsAlerts(){
	const navigate = useNavigate();
	const [events, setEvents] = useState(mockEvents);
	const [selected, setSelected] = useState(new Set());
	const [device, setDevice] = useState('PPPRO-001');
	const [typeFilter, setTypeFilter] = useState('ALL');
	const [severityFilter, setSeverityFilter] = useState('ALL');
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');
	const [jsonEvent, setJsonEvent] = useState(null);
	const [filtersOpen, setFiltersOpen] = useState(true);

	// lock scroll when modal open
	useEffect(()=>{
		if(jsonEvent){ document.body.classList.add('ea-no-scroll'); }
		else { document.body.classList.remove('ea-no-scroll'); }
		return ()=> document.body.classList.remove('ea-no-scroll');
	},[jsonEvent]);

	// inject CSS once
	useEffect(()=>{
		if(!document.getElementById('events-alerts-css')){
			const tag=document.createElement('style');
			tag.id='events-alerts-css';
			tag.innerHTML=EVENTS_CSS; document.head.appendChild(tag);
		}
		return ()=>{};
	},[]);

	const filtered = useMemo(()=>{
		return events.filter(ev=>{
			if(device && ev.source!==device) return false;
			if(typeFilter!=='ALL' && ev.type!==typeFilter) return false;
			if(severityFilter!=='ALL' && ev.severity.toUpperCase()!==severityFilter) return false;
			if(statusFilter!=='ALL' && ev.status.toUpperCase()!==statusFilter) return false;
			if(fromDate){ if(new Date(ev.time) < new Date(fromDate)) return false; }
			if(toDate){ const end = new Date(toDate); end.setHours(23,59,59,999); if(new Date(ev.time) > end) return false; }
			return true;
		}).sort((a,b)=> new Date(b.time)-new Date(a.time));
	},[events, device, typeFilter, severityFilter, statusFilter, fromDate, toDate]);

	const totalNew = events.filter(e=>e.status==='New').length;

	function toggleSelect(id){
		setSelected(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
	}
	function toggleSelectAll(){
		if(selected.size === filtered.length){ setSelected(new Set()); } else { setSelected(new Set(filtered.map(e=>e.id))); }
	}
	function acknowledge(ids){
		if(!ids.length) return;
		setEvents(evts=> evts.map(e=> ids.includes(e.id)? { ...e, status:'Ack'}: e));
		setSelected(new Set());
	}
	function handleAckSelected(){ acknowledge(Array.from(selected)); }
	function handleClearAll(){
		setTypeFilter('ALL'); setSeverityFilter('ALL'); setStatusFilter('ALL'); setFromDate(''); setToDate(''); setSelected(new Set());
	}
	function exportCSV(){
		if(!filtered.length) return;
		const header = ['id','time','type','detail','severity','source','status'];
		const lines = [header.join(',')].concat(filtered.map(e=> header.map(h=> JSON.stringify(e[h]??'')).join(',')));
		const blob = new Blob([lines.join('\n')],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='events.csv'; a.click(); URL.revokeObjectURL(url);
	}

	function formatTime(iso){
		const d=new Date(iso);
		return d.toLocaleDateString('en-GB',{ day:'2-digit', month:'2-digit', year:'numeric'}) + ', ' + d.toLocaleTimeString('en-GB',{ hour:'2-digit', minute:'2-digit', second:'2-digit'});
	}

	const uniqueTypes = useMemo(()=> Array.from(new Set(events.map(e=>e.type))), [events]);

	return (
		<div className="ea-container ea-root">
			<header className="ea-header" role="banner">
				<div className="ea-header-content">
					<div style={{display:'flex', alignItems:'center', gap:'.55rem'}}>
						<img src={Logo} alt="Logo" className="ea-logo" />
					</div>
						<h1 className="ea-title">Events &amp; Alerts</h1>
						<button className="ea-back-btn" onClick={()=>navigate('/dashboard')} aria-label="Back to Dashboard">← Dashboard</button>
				</div>
			</header>
			<main className="ea-main">
				<button type="button" onClick={()=>setFiltersOpen(o=>!o)} className="ea-filters-toggle" aria-expanded={filtersOpen} aria-controls="ea-filters-panel">{filtersOpen? 'Hide Filters':'Show Filters'}</button>
				<div id="ea-filters-panel" className={"ea-filters-card" + (filtersOpen? "":" collapsed")} aria-label="Events filter panel">
					<div className="ea-total-inline" aria-label={`Total new events ${totalNew}`}>
						<span>Total New:</span>
						<span className="ea-total-number">{totalNew}</span>
					</div>
					<div className="ea-field-row" style={{flex:1}}>
						<div className="ea-field">
							<label htmlFor="device" style={{display:'none'}}>Device</label>
							<select id="device" className="ea-select" value={device} onChange={e=>setDevice(e.target.value)}>
								<option value="PPPRO-001">PPPRO-001 (Current)</option>
							</select>
						</div>
						<div className="ea-field">
							<label htmlFor="from">From</label>
							<input id="from" type="date" className="ea-input" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
						</div>
						<div className="ea-field">
							<label htmlFor="to">To</label>
							<input id="to" type="date" className="ea-input" value={toDate} onChange={e=>setToDate(e.target.value)} />
						</div>
						<div className="ea-field">
							<label htmlFor="type">Type</label>
							<select id="type" className="ea-select" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
								<option value="ALL">All Type</option>
								{uniqueTypes.map(t=> <option key={t} value={t}>{t}</option>)}
							</select>
						</div>
						<div className="ea-field">
							<label htmlFor="sev">Severity</label>
							<select id="sev" className="ea-select" value={severityFilter} onChange={e=>setSeverityFilter(e.target.value)}>
								<option value="ALL">All Severity</option>
								<option value="CRITICAL">Critical</option>
								<option value="WARNING">Warning</option>
								<option value="INFO">Info</option>
							</select>
						</div>
						<div className="ea-field">
							<label htmlFor="status">Status</label>
							<select id="status" className="ea-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
								<option value="ALL">All Status</option>
								<option value="NEW">New</option>
								<option value="ACK">Acknowledged</option>
							</select>
						</div>
					</div>
				</div>
				<div className="ea-actions-bar">
					<button className="ea-btn ea-btn-ack" disabled={!selected.size} onClick={handleAckSelected}>
						Acknowledge Selected ({selected.size})
					</button>
					<button className="ea-btn ea-btn-export" disabled={!filtered.length} onClick={exportCSV}>
						Export CSV ({filtered.length})
					</button>
						<button className="ea-btn ea-btn-clear" onClick={handleClearAll}>Clear All</button>
				</div>
				<div className="ea-table-wrapper" role="region" aria-label="Events table">
					<table className="ea-table">
						<thead>
							<tr>
								<th className="ea-col-checkbox"><input type="checkbox" className="ea-checkbox" aria-label="Select All" onChange={toggleSelectAll} checked={selected.size && selected.size===filtered.length} /></th>
								<th>Time (ISO)</th>
								<th>Type</th>
								<th>Detail</th>
								<th>Severity</th>
								<th>Source</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{!filtered.length && (
								<tr><td colSpan={7} style={{textAlign:'center', padding:'1.2rem', color:'var(--ea-text-dim)', fontWeight:600}}>No events match current filters.</td></tr>
							)}
							{filtered.map(ev=>{
								const sevClass = ev.severity==='Critical'?'ea-row-critical': ev.severity==='Warning'?'ea-row-warning':'ea-row-info';
								return (
									<tr key={ev.id} className={sevClass}>
										<td data-label="Select" className="ea-col-checkbox"><input aria-label={`Select event ${ev.id}`} type="checkbox" className="ea-checkbox" checked={selected.has(ev.id)} onChange={()=>toggleSelect(ev.id)} /></td>
										<td data-label="Time" style={{whiteSpace:'nowrap'}}>{formatTime(ev.time)}</td>
										<td data-label="Type" className="ea-type">{ev.type}</td>
										<td data-label="Detail" className="ea-detail-cell" style={{minWidth:'200px'}}>{ev.detail}</td>
										<td data-label="Severity"><span className={`ea-badge ${ev.severity==='Critical'?'sev-critical':ev.severity==='Warning'?'sev-warning':'sev-info'}`}>{ev.severity}</span></td>
										<td data-label="Source">{ev.source}</td>
										<td data-label="Actions" style={{display:'flex', gap:'.4rem'}}>
											{ev.status==='New' && <button className="ea-ack-btn" onClick={()=>acknowledge([ev.id])}>Ack</button>}
											<button className="ea-json-btn" onClick={()=>setJsonEvent(ev)}>View JSON</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				{jsonEvent && (
					<div role="dialog" aria-modal="true" className="ea-modal-overlay" onClick={()=>setJsonEvent(null)}>
						<div className="ea-modal" role="document" onClick={e=>e.stopPropagation()}>
							<h2>Event JSON</h2>
							<pre>{JSON.stringify(jsonEvent, null, 2)}</pre>
							<div className="ea-modal-actions">
								<button className="ea-json-btn" onClick={()=>{navigator.clipboard?.writeText(JSON.stringify(jsonEvent,null,2));}}>Copy</button>
								<button className="ea-ack-btn" onClick={()=>setJsonEvent(null)}>Close</button>
							</div>
						</div>
					</div>
				)}
			</main>
			<footer className="ea-footer" role="contentinfo">
				<div>Need help? Contact <a href="mailto:support@powerpulsepro.com">PowerPulsePro Support</a></div>
				<div>© {new Date().getFullYear()} PowerPulsePro Smart Energy Meter. All rights reserved.</div>
			</footer>
		</div>
	);
}

