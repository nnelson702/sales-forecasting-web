/* global window, document */
const cfg = window.APP_CONFIG;
const supabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

// --- Auth UI ---
const ui = {
  loggedOut: document.getElementById('logged-out'),
  loggedIn: document.getElementById('logged-in'),
  whoami: document.getElementById('whoami'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  btnSignIn: document.getElementById('btn-signin'),
  btnSignOut: document.getElementById('btn-signout'),
  app: document.getElementById('app'),
  storeSelect: document.getElementById('storeSelect'),
  monthInput: document.getElementById('monthInput'),
  btnLoad: document.getElementById('btn-load'),
  btnSave: document.getElementById('btn-save'),
  calendar: document.getElementById('calendar'),
  summary: document.getElementById('summary'),
};

let session = null;
let edited = {}; // { 'YYYY-MM-DD': {transactions, net_sales, gross_margin} }
let active = { storeId: null, month: null, versionId: null };

function fmt(n, d=0){ if(n===null||n===undefined||Number.isNaN(n)) return '—'; return Number(n).toLocaleString(undefined,{minimumFractionDigits:d, maximumFractionDigits:d}); }
function pct(a,b){ if(!b) return 0; return (a/b)*100; }
function clsHit(actual, goal){ if(goal === 0) return ''; if(actual >= goal) return 'hit'; if(actual >= 0.95*goal) return 'miss'; return 'goal'; }

async function refreshAuthUI(){
  const { data } = await supabase.auth.getSession();
  session = data.session;
  if (session?.user) {
    ui.loggedOut.classList.add('hidden');
    ui.loggedIn.classList.remove('hidden');
    ui.app.classList.remove('hidden');
    ui.whoami.textContent = session.user.email;
    await loadStores();
  } else {
    ui.loggedOut.classList.remove('hidden');
    ui.loggedIn.classList.add('hidden');
    ui.app.classList.add('hidden');
  }
}

ui.btnSignIn.onclick = async () => {
  const email = ui.email.value.trim();
  const password = ui.password.value;
  if (!email || !password) return alert('Enter email and password.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);
  await refreshAuthUI();
};

ui.btnSignOut.onclick = async () => {
  await supabase.auth.signOut();
  await refreshAuthUI();
};

// --- Stores ---
async function loadStores(){
  // get stores user can access via v_user_stores (needs RLS open as we configured)
  const { data, error } = await supabase.from('v_user_stores').select('*');
  if (error) { console.error(error); alert('Could not load stores'); return; }
  ui.storeSelect.innerHTML = '';
  for (const r of data) {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.id} — ${r.name}`;
    ui.storeSelect.appendChild(opt);
  }
  if (!ui.monthInput.value) {
    const today = new Date();
    const ym = today.toISOString().slice(0,7);
    ui.monthInput.value = ym;
  }
}

ui.btnLoad.onclick = () => {
  active.storeId = ui.storeSelect.value;
  active.month = ui.monthInput.value; // YYYY-MM
  if (!active.storeId || !active.month) return alert('Pick a store and month');
  loadMonth();
};

async function loadMonth(){
  edited = {};
  ui.calendar.innerHTML = '';
  ui.summary.textContent = 'Loading...';

  const { data, error } = await supabase
    .from('v_calendar_month')
    .select('*')
    .eq('store_id', active.storeId)
    .eq('month', active.month)
    .order('date', { ascending: true });

  if (error) { console.error(error); ui.summary.textContent = 'Failed to load month.'; return; }
  if (!data || data.length === 0) { ui.summary.textContent = 'No forecast found for this month.'; return; }

  // Keep the version id for context
  active.versionId = data[0].version_id;

  // Build grid
  const firstDow = new Date(data[0].date + 'T00:00:00').getDay();
  // pad start
  for (let i=0;i<firstDow;i++){
    const pad = document.createElement('div');
    pad.className = 'cell';
    ui.calendar.appendChild(pad);
  }

  let mtTxnGoal = 0, mtSalesGoal = 0, mtTxnAct = 0, mtSalesAct = 0;

  for (const d of data) {
    mtTxnGoal += d.txn_goal || 0;
    mtSalesGoal += d.sales_goal || 0;
    mtTxnAct += d.txn_actual || 0;
    mtSalesAct += d.sales_actual || 0;

    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.date = d.date;

    const header = document.createElement('div');
    header.className = 'date';
    header.textContent = d.date.slice(8); // day num
    cell.appendChild(header);

    const kpis = document.createElement('div');
    kpis.className = 'kpis';
    kpis.innerHTML = `
      <div class="${clsHit(d.txn_actual ?? 0, d.txn_goal ?? 0)}">Txn<br><b>${fmt(d.txn_actual)}</b> <span class="goal">/ ${fmt(d.txn_goal)}</span></div>
      <div>ATV<br><b>${fmt(d.atv_goal,2)}</b></div>
      <div class="${clsHit(d.sales_actual ?? 0, d.sales_goal ?? 0)}">Sales<br><b>${fmt(d.sales_actual,2)}</b> <span class="goal">/ ${fmt(d.sales_goal,2)}</span></div>
    `;
    cell.appendChild(kpis);

    const inputs = document.createElement('div');
    inputs.className = 'inputs';
    const iTxn = document.createElement('input'); iTxn.type='number'; iTxn.placeholder='Txn'; iTxn.value = d.txn_actual ?? '';
    const iSales = document.createElement('input'); iSales.type='number'; iSales.step='0.01'; iSales.placeholder='Sales'; iSales.value = d.sales_actual ?? '';
    inputs.appendChild(iTxn); inputs.appendChild(iSales);
    cell.appendChild(inputs);

    function markEdited(){
      edited[d.date] = {
        transactions: iTxn.value === '' ? null : Number(iTxn.value),
        net_sales: iSales.value === '' ? null : Number(iSales.value),
        gross_margin: null
      };
    }
    iTxn.addEventListener('input', markEdited);
    iSales.addEventListener('input', markEdited);

    ui.calendar.appendChild(cell);
  }

  ui.summary.innerHTML = `
    <b>${active.storeId}</b> — ${active.month}
    &nbsp; | &nbsp; Txn: ${fmt(mtTxnAct)} / ${fmt(mtTxnGoal)} 
    &nbsp; | &nbsp; Sales: ${fmt(mtSalesAct,2)} / ${fmt(mtSalesGoal,2)}
    &nbsp; | &nbsp; ${fmt(pct(mtSalesAct, mtSalesGoal),0)}% to goal
  `;
}

// Save via Edge Function
ui.btnSave.onclick = async () => {
  const rows = Object.entries(edited).map(([date, vals]) => ({ date, ...vals }));
  if (rows.length === 0) return alert('No changes to save.');
  ui.btnSave.disabled = true;
  try {
    const resp = await fetch(`${cfg.SUPABASE_URL}/functions/v1/upsert-actuals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ storeId: active.storeId, rows })
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error || 'Save failed');
    edited = {};
    await loadMonth();
  } catch (e) {
    alert(e.message);
  } finally {
    ui.btnSave.disabled = false;
  }
};

// Initial
refreshAuthUI();
supabase.auth.onAuthStateChange(refreshAuthUI);
