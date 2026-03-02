// ============================================
// جمبري .com - MAIN JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initShrimpCursor();
  initTheme();
  initNavbar();
  initMobileMenu();
  loadMenu();
  initReveal();
});

// ── Custom Shrimp Cursor ──
function initShrimpCursor() {
  // Draw shrimp emoji onto a canvas and use as cursor
  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 40;
  const ctx = canvas.getContext('2d');
  ctx.font = '30px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🦐', 20, 22);

  const dataURL = canvas.toDataURL();

  // Apply cursor globally
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      cursor: url('${dataURL}') 4 4, auto !important;
    }
    a, button, [role="button"], input, select, textarea, label {
      cursor: url('${dataURL}') 4 4, pointer !important;
    }
  `;
  document.head.appendChild(style);
}

// ── Theme Toggle (Dark / Light Mode) ──
function initTheme() {
  const btn  = document.getElementById('themeToggle');
  const root = document.documentElement;

  // Apply saved theme on load
  const saved = localStorage.getItem('gampre-theme') || 'light';
  root.setAttribute('data-theme', saved);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('gampre-theme', next);
  });
}

// ── Navbar scroll effect ──
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Scrolled style
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active link
    const scrollY = window.scrollY + 200;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const h = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + h) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  });
}

// ── Mobile menu ──
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('active');
  });

  document.querySelectorAll('.nav-link').forEach(l =>
    l.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('active');
    })
  );

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });
}

// ── Load menu from API ──
async function loadMenu() {
  const container = document.getElementById('menuContent');
  if (!container) return;

  try {
    const res  = await fetch('/api/menu');
    const data = await res.json();

    if (!data.menuItems || data.menuItems.length === 0) {
      container.innerHTML = `
        <div class="menu-empty">
          <span class="menu-empty-icon">📋</span>
          <h3>المنيو قريباً</h3>
          <p>المنيو بيتجهز دلوقتي... تابعنا!</p>
        </div>`;
      return;
    }

    const cards = data.menuItems.map(item => {
      const date = new Date(item.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      if (item.type === 'image') {
        return `
          <div class="menu-card">
            <img src="${esc(item.link)}" alt="${esc(item.title)}" class="menu-card-image" loading="lazy">
            <div class="menu-card-body">
              <h3 class="menu-card-title">${esc(item.title)}</h3>
              <p class="menu-card-date">📅 ${date}</p>
              <a href="${esc(item.link)}" target="_blank" class="menu-card-link">🔗 افتح الصورة</a>
            </div>
          </div>`;
      }
      return `
        <div class="menu-card">
          <div class="menu-card-body" style="padding:32px;">
            <h3 class="menu-card-title" style="font-size:1.3rem;">${esc(item.title)}</h3>
            <p class="menu-card-date">📅 ${date}</p>
            <a href="${esc(item.link)}" target="_blank" class="menu-card-link" style="margin-top:18px;">🔗 افتح المنيو</a>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `<div class="menu-grid">${cards}</div>`;
  } catch {
    container.innerHTML = `
      <div class="menu-empty">
        <span class="menu-empty-icon">😕</span>
        <h3>حصل مشكلة</h3>
        <p>مش قادرين نحمل المنيو دلوقتي... جرب تاني</p>
      </div>`;
  }
}

// ── Scroll reveal animations ──
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Utility ──
function esc(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
