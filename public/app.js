/* global window, document */
const cfg = window.APP_CONFIG;

// Keep the user signed in across refreshes, and refresh tokens automatically.
const supabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true
  }
});

const $ = id => document.getElementById(id);
const ui = {
  status: $('status'),
  loggedOut: $('logged-out'),
  loggedIn: $('logged-in'),
  whoami: $('whoami'),
  email: $('email'),
  password: $('password'),
  btnSignIn: $('btn-signin'),
  btnSignOut: $('btn-signout'),
  app: $('app'),
  storeSelect: $('storeSelect'),
  monthInput: $('monthInput'),
  btnLoad: $('btn-load'),
  calendar: $('calendar'),
  summary: $('summary'),
  modal: $('dayModal'),
  modalTitle: $('modalTitle'),
  modalBadge: $('modalBadge'),
  modalKpis: $('modalKpis'),
  btnCloseModal: $('btnCloseModal'),
  btnSaveModal: $('btnSaveModal'),
};

const setStatus = (msg)=> ui.status.textContent = msg;
const setError  = (msg)=> (ui.status.textContent = '⚠️ ' + msg, console.error(msg));
const fmt = (n,d=0)=> (n===null||n===undefined||Number.isNaN(n)) ? '—' :
  Number(n).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d});
const pct = (a,b)=> (!b || b===0) ? 0 : (a/b)*100;
const hide = el => { el.classList.remove('open'); el.classList.add('hidden'); el.setAttribute('aria-hidden','true'); };
const show = el => { el.classList.remove('hidden'); el.classList.add('open'); el.setAttribute('aria-hidden','false'); };
const percentClass = p => (p>=100 ? 'ok' : 'bad');
const hitBgClass = (actual, goal) => ((actual||0) >= (goal||0) && (goal||0) > 0) ? 'bg-good' : 'bg-bad';

let active={ storeId:null, month:null, versionId:null, monthRows:[] };

// ---------- AUTH ----------
async function refreshAuthUI(){
  hide(ui.modal);
  const { data, error } = await supabase.auth.getSession();
  if (error){ setError('Auth session error: ' + error.message); return; }
  const session = data.session;
  if (session?.user){
    ui.loggedOut.classList.add('hidden');
    ui.loggedIn.classList.remove('hidden');
    ui.app.classList.remove('hidden');
    ui.whoami.textContent = session.user.email;
    setStatus('Signed in as ' + session.user.email);
    await loadStores();
  }else{
    ui.loggedOut.classList.remove('hidden');
    ui.loggedIn.classList.add('hidden');
    ui.app.classList.add('hidden');
    setStatus('Not signed in.');
  }
}
ui.btnSignIn.onclick = async ()=>{
  const email = ui.email.value.trim(), password = ui.password.value;
  if (!email || !password) return setError('Enter email and password.');
  ui.btnSignIn.disabled = true; setStatus('Signing in…');
  try{
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError('Sign-in failed: ' + error.message);
    await refreshAuthUI();
  }catch(e){ setError('Sign-in exception: ' + e.message); }
  finally{ ui.btnSignIn.disabled=false; }
};
ui.btnSignOut.onclick = async ()=>{ await supabase.auth.signOut(); await refreshAuthUI(); };

// ---------- STORES ----------
async function loadStores(){
  setStatus('Loading stores…');
  const { data, error } = await supabase.from('v_user_stores').select('*');
  if (error){ setError('Load stores failed: ' + error.message); return; }
  ui.storeSelect.innerHTML='';
  for (const r of data){
    const id = r.id || r.store_id || r.storeid || r.store;
    const name = r.name || r.store_name || '';
    const opt = document.createElement('option');
    opt.value = id; opt.textContent = `${id} — ${name}`;
    ui.storeSelect.appendChild(opt);
  }
  if (!ui.monthInput.value) ui.monthInput.value = new Date().toISOString().slice(0,7);
  setStatus('Stores loaded.');
}
ui.btnLoad.onclick = ()=>{
  active.storeId = ui.storeSelect.value;
  active.month   = ui.monthInput.value;
  if (!active.storeId || !active.month) return setError('Pick a store and month');
  loadMonth();
};

// ---------- CALENDAR RENDER ----------
function buildCellHTML(d){
  const atvActual = (d.txn_actual && d.sales_actual) ? (d.sales_actual / d.txn_actual) : null;

  return `
    <div class="date-row">
      <div class="date">${d.date.slice(8)}</div>
      <button class="drill" type="button">Details</button>
    </div>
    <div class="lines">
      <div class="line"><span class="mono">${fmt(d.sales_goal,2)}</span></div>
      <div class="line"><span class="mono">${fmt(d.txn_goal)}</span></div>
      <div class="line"><span class="mono">${fmt(d.atv_goal,2)}${atvActual!==null?` • ${fmt(atvActual,2)}`:''}</span></div>
      ${d.sales_actual ? `<div class="line"><span class="mono">${fmt(pct(d.sales_actual, d.sales_goal),2)}%</span></div>` : ``}
    </div>
  `;
}

function renderOrRebuildCell(d){
  // Find existing cell by date; if not found, create one.
  let cell = document.getElementById(`cell-${d.date}`);
  const cls = `cell ${hitBgClass(d.sales_actual, d.sales_goal)}`;

  if (!cell){
    cell = document.createElement('div');
    cell.id = `cell-${d.date}`;
    cell.dataset.date = d.date;
    cell.className = cls;
    cell.innerHTML = buildCellHTML(d);
    // attach click handler for Details button
    cell.querySelector('.drill').addEventListener('click', ()=>openDayModal(d));
    ui.calendar.appendChild(cell);
  }else{
    cell.className = cls;
    cell.innerHTML = buildCellHTML(d);
    cell.querySelector('.drill').addEventListener('click', ()=>openDayModal(d));
  }
}

async function loadMonth(){
  ui.calendar.innerHTML=''; ui.summary.textContent='Loading…'; setStatus(`Loading ${active.storeId} — ${active.month}`);

  const { data, error } = await supabase.from('v_calendar_month')
    .select('*')
    .eq('store_id', active.storeId)
    .eq('month', active.month)
    .order('date', { ascending:true });

  if (error){ setError('Load month failed: ' + error.message); ui.summary.textContent='Failed to load month.'; return; }
  if (!data || data.length===0){ ui.summary.textContent='No forecast found for this month.'; setStatus('No forecast for month'); return; }

  active.versionId = data[0].version_id;
  active.monthRows = data;

  // pad start of month
  const firstDow = new Date(data[0].date+'T00:00:00').getDay();
  for (let i=0;i<firstDow;i++){ const pad=document.createElement('div'); pad.className='cell'; ui.calendar.appendChild(pad); }

  let mtSalesGoal=0, mtSalesAct=0;

  for (const d of data){
    mtSalesGoal += d.sales_goal||0;
    mtSalesAct  += d.sales_actual||0;
    renderOrRebuildCell(d);
  }

  ui.summary.innerHTML = `
    <b>${active.storeId}</b> — ${active.month}
    &nbsp; | &nbsp; Sales: ${fmt(mtSalesAct,2)} / ${fmt(mtSalesGoal,2)}
    &nbsp; | &nbsp; ${fmt(pct(mtSalesAct, mtSalesGoal),0)}% to goal
  `;
  setStatus('Month loaded.');
}

// ---------- SAVE via Edge Function (service role) ----------
async function upsertActuals(storeId, rows){
  const resp = await fetch(`${cfg.SUPABASE_URL}/functions/v1/upsert-actuals`,{
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${cfg.SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ storeId, rows })
  });
  const text = await resp.text();
  let json; try{ json = text ? JSON.parse(text) : {}; }catch{ json = { raw:text }; }
  if (!resp.ok) throw new Error(json?.error || json?.message || `Edge function failed (${resp.status})`);
  return json;
}

// ---------- MODAL ----------
function openDayModal(dInitial){
  // get the latest reference for this date from active.monthRows
  const idx = active.monthRows.findIndex(r=>r.date===dInitial.date);
  let d = idx>=0 ? {...active.monthRows[idx]} : {...dInitial};

  const paintBadge = ()=>{
    const pSales = pct(d.sales_actual, d.sales_goal);
    ui.modalBadge.textContent = (pSales >= 100) ? 'On / Above Goal' : (pSales >= 95 ? 'Near Goal' : 'Below Goal');
  };

  ui.modalTitle.textContent = `${d.date} — Day details`;
  paintBadge();

  const atvActual = (d.txn_actual && d.sales_actual) ? (d.sales_actual / d.txn_actual) : null;
  const marginPct = (d.sales_actual && d.margin_actual!=null) ? (d.margin_actual / d.sales_actual * 100) : null;

  ui.modalKpis.innerHTML = `
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button id="btnClear" class="ghost" type="button">Clear all</button>
    </div>

    <div class="columns">
      <div class="card" id="card-txn">
        <div class="card-title">Transactions</div>
        <div class="pair">
          <div><div class="label">Goal</div><input id="txg" class="pill" type="number" value="${d.txn_goal ?? ''}" readonly></div>
          <div><div class="label">Actual</div><input id="txa" class="pill" type="number" value="${d.txn_actual ?? ''}"></div>
        </div>
        <div id="txp" class="pct ${percentClass(pct(d.txn_actual,d.txn_goal))}">${fmt(pct(d.txn_actual,d.txn_goal),2)}%</div>
      </div>

      <div class="card" id="card-sales">
        <div class="card-title">Sales</div>
        <div class="pair">
          <div><div class="label">Goal ($)</div><input id="slg" class="pill" type="number" step="0.01" value="${d.sales_goal ?? ''}" readonly></div>
          <div><div class="label">Actual ($)</div><input id="sla" class="pill" type="number" step="0.01" value="${d.sales_actual ?? ''}"></div>
        </div>
        <div id="slp" class="pct ${percentClass(pct(d.sales_actual,d.sales_goal))}">${fmt(pct(d.sales_actual,d.sales_goal),2)}%</div>
      </div>

      <div class="card" id="card-atv">
        <div class="card-title">ATV</div>
        <div class="pair">
          <div><div class="label">Goal ($)</div><input id="avg" class="pill" type="number" step="0.01" value="${d.atv_goal ?? ''}" readonly></div>
          <div><div class="label">Actual ($)</div><input id="ava" class="pill" type="number" step="0.01" value="${atvActual ?? ''}" readonly></div>
        </div>
        <div id="avp" class="pct ${percentClass(pct(atvActual,d.atv_goal))}">${fmt(pct(atvActual,d.atv_goal),2)}%</div>
      </div>

      <div class="card" id="card-margin">
        <div class="card-title">Margin</div>
        <div class="pair">
          <div><div class="label">Margin %</div><input id="mpc" class="pill" type="number" step="0.01" value="${marginPct ?? ''}" readonly></div>
          <div><div class="label">Margin $</div><input id="m$" class="pill" type="number" step="0.01" value="${d.margin_actual ?? ''}"></div>
        </div>
      </div>
    </div>

    <div class="notes">Notes (coming soon—will save to Day Notes)</div>
  `;

  const txa = document.getElementById('txa');
  const sla = document.getElementById('sla');
  const m$  = document.getElementById('m$');
  const txg = Number((document.getElementById('txg').value)||0);
  const slg = Number((document.getElementById('slg').value)||0);
  const avg = Number((document.getElementById('avg').value)||0);
  const avA = document.getElementById('ava');
  const mpc = document.getElementById('mpc');
  const txp = document.getElementById('txp');
  const slp = document.getElementById('slp');
  const avp = document.getElementById('avp');

  const setPct = (el, val)=>{ el.textContent = `${fmt(val,2)}%`; el.className = `pct ${percentClass(val)}`; };
  const recompute = ()=>{
    d.txn_actual    = txa.value===''?null:Number(txa.value);
    d.sales_actual  = sla.value===''?null:Number(sla.value);
    d.margin_actual = m$.value===''?null:Number(m$.value);

    const t = d.txn_actual ?? 0;
    const s = d.sales_actual ?? 0;
    const mg= d.margin_actual ?? 0;

    const atvA = (t>0) ? (s/t) : 0;
    avA.value = t>0 ? atvA.toFixed(4) : '';
    setPct(avp, pct(atvA, avg));
    mpc.value = (s>0 && mg!=null) ? (mg/s*100).toFixed(4) : '';
    setPct(txp, pct(t, txg));
    setPct(slp, pct(s, slg));
    paintBadge();
  };
  txa.addEventListener('input', recompute);
  sla.addEventListener('input', recompute);
  m$.addEventListener('input', recompute);

  $('btnClear').onclick = ()=>{ txa.value=''; sla.value=''; m$.value=''; recompute(); };

  ui.btnSaveModal.onclick = async ()=>{
    ui.btnSaveModal.disabled = true;
    try{
      // Persist
      const rows = [{
        date: d.date,
        transactions: d.txn_actual,
        net_sales:   d.sales_actual,
        gross_margin:d.margin_actual
      }];
      await upsertActuals(active.storeId, rows);

      // Verify
      const { data:verify, error:vErr } = await supabase
        .from('actual_daily')
        .select('transactions,net_sales,gross_margin')
        .eq('store_id', active.storeId).eq('date', d.date).maybeSingle();
      if (vErr) throw new Error('Verify read failed: ' + vErr.message);
      if (!verify) throw new Error('Save appears to have failed (no row)');

      // ---- Optimistic UI update (no page reload) ----
      // Update in-memory monthRows
      const i = active.monthRows.findIndex(x=>x.date===d.date);
      if (i>=0){
        active.monthRows[i] = {
          ...active.monthRows[i],
          txn_actual: d.txn_actual,
          sales_actual: d.sales_actual,
          margin_actual: d.margin_actual
        };
        // Re-render that day's tile immediately
        renderOrRebuildCell(active.monthRows[i]);
      }

      hide(ui.modal);
      setStatus(`Saved actuals for ${d.date}`);
    }catch(e){ setError(e.message); }
    finally{ ui.btnSaveModal.disabled=false; }
  };

  show(ui.modal);
}

ui.btnCloseModal.addEventListener('click', ()=> hide(ui.modal));
ui.modal.addEventListener('click', (e)=>{ if(e.target===ui.modal) hide(ui.modal); });
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !ui.modal.classList.contains('hidden')) hide(ui.modal); });

// boot
(async ()=>{ hide(ui.modal); setStatus('Initializing…'); await refreshAuthUI(); })();
