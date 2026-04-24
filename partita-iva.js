// ========================================
//  PARTITA IVA GUIDE — JAVASCRIPT
// ========================================

// ----- Mobile nav -----
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ----- Active nav link on scroll -----
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) current = section.id;
  });
  navAnchors.forEach(a => {
    a.style.background = '';
    a.style.color = '';
    if (a.getAttribute('href') === `#${current}`) {
      a.style.background = 'var(--primary-light)';
      a.style.color = 'var(--primary)';
    }
  });
}, { passive: true });

// ----- Tax Calculator -----
function fmt(n) {
  return '€' + Math.round(n).toLocaleString('it-IT');
}

function pct(n) {
  return n.toFixed(1).replace('.', ',') + '%';
}

function calcola() {
  const ricavi = parseFloat(document.getElementById('ricavi').value) || 0;
  const coeff = parseFloat(document.getElementById('coefficiente').value);
  const aliquota = parseFloat(document.getElementById('aliquota').value);
  const riduzione = document.getElementById('riduzione').value === 'si';

  if (ricavi <= 0) {
    alert('Inserisci i ricavi annui previsti.');
    return;
  }
  if (ricavi > 85000) {
    alert('Attenzione: il regime forfettario ha un limite di €85.000 di ricavi. Oltre questa soglia si fuoriesce dal regime.');
  }

  // Calcoli
  const redditorLordo = ricavi * coeff;
  const aliquotaInps = riduzione ? 0.2623 * 0.65 : 0.2623;
  const contributiInps = redditorLordo * aliquotaInps;
  const imponibile = Math.max(0, redditorLordo - contributiInps);
  const imposta = imponibile * aliquota;
  const totaleOneri = imposta + contributiInps;
  const netto = ricavi - totaleOneri;
  const pressione = (totaleOneri / ricavi) * 100;

  // Mostra risultati
  document.getElementById('r-ricavi').textContent = fmt(ricavi);
  document.getElementById('r-lordo').textContent = fmt(redditorLordo);
  document.getElementById('r-inps').textContent = fmt(contributiInps);
  document.getElementById('r-imponibile').textContent = fmt(imponibile);
  document.getElementById('r-imposta').textContent = fmt(imposta);
  document.getElementById('r-netto').innerHTML = `<strong>${fmt(netto)}</strong>`;
  document.getElementById('r-pressione').innerHTML = `<strong>${pct(pressione)}</strong>`;

  // Scroll to results
  document.getElementById('risultati').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Allow Enter key in calculator inputs
document.querySelectorAll('.calc-form input, .calc-form select').forEach(el => {
  el.addEventListener('keydown', e => { if (e.key === 'Enter') calcola(); });
});

// ----- Smooth reveal on scroll -----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.info-card, .step, .regime-card, .flow-step, .calendar-month').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});
