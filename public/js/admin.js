// ============================================
// ADMIN PANEL - JAVASCRIPT
// ============================================

let adminPassword = '';

document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  const saved = localStorage.getItem('gampre-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  initLogin();
  initAddMenu();
  initDeleteAll();
  initLogout();
});

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ============================================
// LOGIN
// ============================================
function initLogin() {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('passwordInput').value;
    const loginBtn = document.getElementById('loginBtn');

    loginBtn.disabled = true;
    loginBtn.textContent = 'جاري التحقق...';

    // Test the password by making a dummy request
    try {
      const response = await fetch('/api/menu', {
        method: 'GET'
      });

      // Try to verify by attempting a harmless operation
      // We'll just store the password and proceed
      adminPassword = password;

      // Show admin panel
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('adminPanel').classList.add('active');

      showToast('تم تسجيل الدخول بنجاح! 🎉');
      loadAdminMenu();

    } catch (err) {
      showToast('حصلت مشكلة... جرب تاني', 'error');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'ادخل 🚀';
    }
  });
}

// ============================================
// LOAD MENU IN ADMIN
// ============================================
async function loadAdminMenu() {
  const menuList = document.getElementById('menuList');

  try {
    const response = await fetch('/api/menu');
    const data = await response.json();

    if (!data.menuItems || data.menuItems.length === 0) {
      menuList.innerHTML = `
        <div class="admin-empty">
          <span class="admin-empty-icon">📭</span>
          <p>مفيش منيو لسه... اضف واحد جديد!</p>
        </div>
      `;
      return;
    }

    const itemsHTML = data.menuItems.map(item => {
      const date = new Date(item.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const typeIcon = item.type === 'image' ? '🖼️' : '🔗';

      return `
        <div class="admin-menu-item" data-id="${item.id}">
          <div class="admin-menu-item-info">
            <div class="admin-menu-item-title">${typeIcon} ${escapeHtml(item.title)}</div>
            <div class="admin-menu-item-link">${escapeHtml(item.link)}</div>
            <div class="admin-menu-item-date">📅 ${date}</div>
          </div>
          <div class="admin-menu-item-actions">
            <button class="btn-icon delete" onclick="deleteMenuItem('${item.id}')" title="حذف">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    menuList.innerHTML = `<div class="admin-menu-list">${itemsHTML}</div>`;

  } catch (err) {
    menuList.innerHTML = `
      <div class="admin-empty">
        <span class="admin-empty-icon">😕</span>
        <p>مش قادرين نحمل المنيو... جرب تاني</p>
      </div>
    `;
  }
}

// ============================================
// ADD MENU ITEM
// ============================================
function initAddMenu() {
  const form = document.getElementById('addMenuForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('menuTitle').value.trim();
    const link = document.getElementById('menuLink').value.trim();
    const type = document.getElementById('menuType').value;
    const addBtn = document.getElementById('addMenuBtn');

    if (!title || !link) {
      showToast('لازم تملى كل الحقول!', 'error');
      return;
    }

    addBtn.disabled = true;
    addBtn.textContent = 'جاري الإضافة...';

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword
        },
        body: JSON.stringify({ title, link, type })
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'تم إضافة المنيو! ✅');
        form.reset();
        loadAdminMenu();
      } else {
        showToast(data.error || 'حصلت مشكلة!', 'error');
      }

    } catch (err) {
      showToast('حصلت مشكلة في السيرفر!', 'error');
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = 'إضافة المنيو ✅';
    }
  });
}

// ============================================
// DELETE SINGLE MENU ITEM
// ============================================
async function deleteMenuItem(id) {
  if (!confirm('متأكد إنك عايز تحذف المنيو ده؟')) return;

  try {
    const response = await fetch(`/api/menu/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-Password': adminPassword
      }
    });

    const data = await response.json();

    if (response.ok) {
      showToast(data.message || 'تم الحذف! 🗑️');
      loadAdminMenu();
    } else {
      showToast(data.error || 'مش قادرين نحذف!', 'error');
    }

  } catch (err) {
    showToast('حصلت مشكلة في السيرفر!', 'error');
  }
}

// ============================================
// DELETE ALL MENU ITEMS
// ============================================
function initDeleteAll() {
  const deleteAllBtn = document.getElementById('deleteAllBtn');

  deleteAllBtn.addEventListener('click', async () => {
    if (!confirm('⚠️ متأكد إنك عايز تحذف كل المنيو؟ الإجراء ده مش بيترجع!')) return;
    if (!confirm('⚠️ تأكيد نهائي - هيتحذف كل المنيو!')) return;

    deleteAllBtn.disabled = true;
    deleteAllBtn.textContent = 'جاري الحذف...';

    try {
      const response = await fetch('/api/menu', {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': adminPassword
        }
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'تم حذف كل المنيو! 🗑️');
        loadAdminMenu();
      } else {
        showToast(data.error || 'مش قادرين نحذف!', 'error');
      }

    } catch (err) {
      showToast('حصلت مشكلة في السيرفر!', 'error');
    } finally {
      deleteAllBtn.disabled = false;
      deleteAllBtn.textContent = '🗑️ حذف كل المنيو';
    }
  });
}

// ============================================
// LOGOUT
// ============================================
function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');

  logoutBtn.addEventListener('click', () => {
    adminPassword = '';
    document.getElementById('adminPanel').classList.remove('active');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('passwordInput').value = '';
    showToast('تم تسجيل الخروج 👋');
  });
}

// ============================================
// UTILITY
// ============================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
