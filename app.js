const previewProviders = [
  {id:1,name:'Rico Mendoza',service:'Aircon cleaning & repair',category:'Home repair',municipality:'Olongapo',rating:4.9,completed_jobs:87,starting_price:650,initials:'RM',color:'#0c789d',verified:true},
  {id:2,name:'Liza Cruz',service:'Home deep cleaning',category:'Cleaning',municipality:'Subic',rating:4.8,completed_jobs:64,starting_price:800,initials:'LC',color:'#d07645',verified:true},
  {id:3,name:'Jun Alonzo',service:'Electrical repair',category:'Home repair',municipality:'Castillejos',rating:5,completed_jobs:41,starting_price:500,initials:'JA',color:'#567945',verified:true},
  {id:4,name:'Mara Bautista',service:'Event photography',category:'Events',municipality:'Iba',rating:4.9,completed_jobs:52,starting_price:2500,initials:'MB',color:'#7560a8',verified:true},
  {id:5,name:'Dario Villanueva',service:'Plumbing services',category:'Home repair',municipality:'Botolan',rating:4.7,completed_jobs:38,starting_price:550,initials:'DV',color:'#397d79',verified:true},
  {id:6,name:'Ana Santos',service:'Makeup & hair styling',category:'Events',municipality:'San Marcelino',rating:4.9,completed_jobs:73,starting_price:1200,initials:'AS',color:'#b34d72',verified:true}
];

const state = { providers: [], category: 'all', previewMode: false };
const els = {
  grid: document.querySelector('#providerGrid'), count: document.querySelector('#resultCount'), dataStatus: document.querySelector('#dataStatus'),
  empty: document.querySelector('#emptyState'), query: document.querySelector('#serviceQuery'), municipality: document.querySelector('#municipality'),
  clear: document.querySelector('#clearFilters'), dialog: document.querySelector('#bookingDialog'), form: document.querySelector('#bookingForm'),
  formError: document.querySelector('#formError'), success: document.querySelector('#successState')
};

async function loadProviders() {
  try {
    const response = await fetch('/api/providers');
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json();
    state.providers = data.providers;
  } catch {
    state.providers = previewProviders;
    state.previewMode = true;
    els.dataStatus.textContent = 'Preview data · connect Supabase to accept bookings';
  }
  renderProviders();
}

function filteredProviders() {
  const query = els.query.value.trim().toLowerCase();
  const municipality = els.municipality.value;
  return state.providers.filter(provider => {
    const matchesQuery = !query || `${provider.name} ${provider.service} ${provider.category}`.toLowerCase().includes(query);
    const matchesMunicipality = municipality === 'all' || provider.municipality === municipality;
    const matchesCategory = state.category === 'all' || provider.category === state.category || (state.category === 'Electrical' && provider.service.toLowerCase().includes('electrical'));
    return matchesQuery && matchesMunicipality && matchesCategory;
  });
}

function renderProviders() {
  const providers = filteredProviders();
  els.count.textContent = `${providers.length} provider${providers.length === 1 ? '' : 's'}`;
  els.clear.hidden = !els.query.value && els.municipality.value === 'all' && state.category === 'all';
  els.empty.hidden = providers.length > 0;
  els.grid.hidden = providers.length === 0;
  els.grid.innerHTML = providers.map(provider => `
    <article class="provider-card">
      <div class="provider-cover" style="--provider-color:${safeColor(provider.color)}"><div class="avatar">${escapeHtml(provider.initials)}</div></div>
      <div class="provider-body">
        ${provider.verified ? '<span class="verified">● Verified provider</span>' : ''}
        <h3>${escapeHtml(provider.name)}</h3><p class="service">${escapeHtml(provider.service)}</p>
        <div class="provider-meta"><span class="rating">${Number(provider.rating).toFixed(1)}</span><span>${Number(provider.completed_jobs)} jobs</span><span>⌖ ${escapeHtml(provider.municipality)}</span></div>
        <div class="provider-footer"><span class="price"><b>₱${Number(provider.starting_price).toLocaleString()}</b> <small>starts at</small></span><button class="book-btn" data-book="${Number(provider.id)}">View & book</button></div>
      </div>
    </article>`).join('');
}

function resetFilters() { state.category = 'all'; els.query.value = ''; els.municipality.value = 'all'; renderProviders(); }

document.querySelector('#searchForm').addEventListener('submit', event => { event.preventDefault(); renderProviders(); document.querySelector('#providers').scrollIntoView(); });
document.querySelectorAll('.popular button').forEach(button => button.addEventListener('click', () => { els.query.value = button.textContent; renderProviders(); document.querySelector('#providers').scrollIntoView(); }));
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => { state.category = button.dataset.category; renderProviders(); document.querySelector('#providers').scrollIntoView(); }));
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => document.querySelector(button.dataset.scroll).scrollIntoView()));
els.clear.addEventListener('click', resetFilters); document.querySelector('#resetSearch').addEventListener('click', resetFilters);
els.grid.addEventListener('click', event => { const button = event.target.closest('[data-book]'); if (button) openBooking(Number(button.dataset.book)); });

function openBooking(id) {
  const provider = state.providers.find(item => Number(item.id) === id); if (!provider) return;
  els.form.reset(); els.form.providerId.value = provider.id; els.form.hidden = false; els.success.hidden = true; els.formError.textContent = '';
  document.querySelector('#bookingTitle').textContent = `Book ${provider.name}`;
  document.querySelector('#bookingService').textContent = `${provider.service} · starts at ₱${Number(provider.starting_price).toLocaleString()}`;
  const date = els.form.preferredDate; date.min = new Date(Date.now() + 86400000).toISOString().slice(0,10);
  els.dialog.showModal();
}

els.form.addEventListener('submit', async event => {
  event.preventDefault(); els.formError.textContent = '';
  const button = els.form.querySelector('[type="submit"]'); button.disabled = true; button.textContent = 'Sending…';
  const payload = Object.fromEntries(new FormData(els.form)); payload.providerId = Number(payload.providerId);
  try {
    const response = await fetch('/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error === 'DATABASE_NOT_CONFIGURED' ? 'Bookings are not connected yet. Add the Supabase environment variables in Vercel.' : data.error || 'Unable to send booking.');
    els.form.hidden = true; els.success.hidden = false; document.querySelector('#bookingReference').textContent = data.booking.reference;
  } catch (error) { els.formError.textContent = error.message; }
  finally { button.disabled = false; button.textContent = 'Send booking request →'; }
});

document.querySelector('.dialog-close').addEventListener('click', () => els.dialog.close());
document.querySelector('#doneButton').addEventListener('click', () => els.dialog.close());
els.dialog.addEventListener('click', event => { if (event.target === els.dialog) els.dialog.close(); });

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function safeColor(value) { return /^#[0-9a-f]{6}$/i.test(String(value)) ? value : '#0c789d'; }
loadProviders();
