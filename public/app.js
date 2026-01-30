const els = {
  role: document.getElementById('role'),
  userId: document.getElementById('userId'),
  refresh: document.getElementById('refresh'),
  booksState: document.getElementById('booksState'),
  booksTable: document.getElementById('booksTable'),
  booksTbody: document.querySelector('#booksTable tbody'),
  openCreate: document.getElementById('openCreate'),
  adminCard: document.getElementById('adminCard'),
  adminForm: document.getElementById('adminForm'),
  cancelAdmin: document.getElementById('cancelAdmin'),
  bookId: document.getElementById('bookId'),
  title: document.getElementById('title'),
  author: document.getElementById('author'),
  stock: document.getElementById('stock'),
  borrowCard: document.getElementById('borrowCard'),
  borrowForm: document.getElementById('borrowForm'),
  borrowBookId: document.getElementById('borrowBookId'),
  latitude: document.getElementById('latitude'),
  longitude: document.getElementById('longitude'),
  useGeo: document.getElementById('useGeo'),
  log: document.getElementById('log'),
  clearLog: document.getElementById('clearLog'),
};

els.clearLog.addEventListener('click', () => {
  els.log.textContent = '';
  writeLog('Log telah dibersihkan.');
});

function writeLog(obj) {
  const line = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  els.log.textContent = `${new Date().toLocaleString()}\n${line}\n\n` + els.log.textContent;
}

function getHeaders() {
  const role = els.role.value;
  const headers = { 'Content-Type': 'application/json' };

  if (role === 'admin') headers['x-user-role'] = 'admin';
  if (role === 'user') {
    headers['x-user-role'] = 'user';
    const userId = String(els.userId.value || '').trim();
    if (userId) headers['x-user-id'] = userId;
  }

  return headers;
}

function updateModeUI() {
  const role = els.role.value;
  els.adminCard.hidden = role !== 'admin';
  els.borrowCard.hidden = role !== 'user';
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { ...(options.headers || {}), ...getHeaders() },
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = data?.message || `Request gagal (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function renderBooks(books) {
  els.booksTbody.innerHTML = '';

  for (const b of books) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.id}</td>
      <td>${escapeHtml(b.title)}</td>
      <td>${escapeHtml(b.author)}</td>
      <td>${b.stock}</td>
      <td class="actions"></td>
    `;

    const actionsTd = tr.querySelector('td:last-child');

    const btnDetail = document.createElement('button');
    btnDetail.className = 'secondary';
    btnDetail.textContent = 'Detail';
    btnDetail.onclick = async () => {
      try {
        const out = await api(`/api/books/${b.id}`);
        writeLog(out);
      } catch (e) {
        writeLog(String(e.message || e));
      }
    };

    actionsTd.appendChild(btnDetail);

    if (els.role.value === 'admin') {
      const btnEdit = document.createElement('button');
      btnEdit.className = 'secondary';
      btnEdit.textContent = 'Edit';
      btnEdit.onclick = () => {
        els.adminCard.hidden = false;
        els.bookId.value = b.id;
        els.title.value = b.title;
        els.author.value = b.author;
        els.stock.value = b.stock;

        writeLog(`Form edit buku #${b.id} dibuka. Ubah data lalu klik Simpan.`);
        els.adminCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => els.title.focus(), 150);
      };
      actionsTd.appendChild(btnEdit);

      const btnDelete = document.createElement('button');
      btnDelete.className = 'danger';
      btnDelete.textContent = 'Hapus';
      btnDelete.onclick = async () => {
        if (!confirm(`Hapus buku #${b.id}?`)) return;
        try {
          const out = await api(`/api/books/${b.id}`, { method: 'DELETE' });
          writeLog(out);
          await loadBooks();
        } catch (e) {
          writeLog(String(e.message || e));
        }
      };
      actionsTd.appendChild(btnDelete);
    }

    if (els.role.value === 'user') {
      const btnBorrow = document.createElement('button');
      btnBorrow.textContent = 'Borrow';
      btnBorrow.onclick = () => {
        els.borrowCard.hidden = false;
        els.borrowBookId.value = b.id;
      };
      actionsTd.appendChild(btnBorrow);
    }

    els.booksTbody.appendChild(tr);
  }
}

async function loadBooks() {
  updateModeUI();

  els.booksState.textContent = 'Memuat…';
  els.booksTable.hidden = true;

  try {
    const out = await api('/api/books');
    const books = out?.data || [];

    if (!Array.isArray(books) || books.length === 0) {
      els.booksState.textContent = 'Belum ada data buku. (Admin bisa tambah buku)';
      return;
    }

    els.booksState.textContent = '';
    els.booksTable.hidden = false;
    renderBooks(books);
  } catch (e) {
    els.booksState.textContent = 'Gagal memuat buku.';
    writeLog({ error: String(e.message || e) });
  }
}

els.refresh.addEventListener('click', loadBooks);
els.role.addEventListener('change', () => {
  updateModeUI();
  loadBooks();
});

els.openCreate.addEventListener('click', () => {
  if (els.role.value !== 'admin') {
    writeLog('Ganti role ke Admin dulu untuk tambah buku.');
    return;
  }
  els.adminCard.hidden = false;
  els.bookId.value = '';
  els.title.value = '';
  els.author.value = '';
  els.stock.value = 0;

  writeLog('Form tambah buku dibuka. Isi Title/Author/Stock, lalu klik Simpan.');
  els.adminCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => els.title.focus(), 150);
});

els.cancelAdmin.addEventListener('click', () => {
  els.adminCard.hidden = true;
});

els.adminForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const payload = {
      title: els.title.value,
      author: els.author.value,
      stock: Number(els.stock.value),
    };

    const id = String(els.bookId.value || '').trim();
    const out = id
      ? await api(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await api('/api/books', { method: 'POST', body: JSON.stringify(payload) });

    writeLog(out);
    await loadBooks();

    els.bookId.value = '';
    els.title.value = '';
    els.author.value = '';
    els.stock.value = 0;
  } catch (e2) {
    writeLog(String(e2.message || e2));
  }
});

els.useGeo.addEventListener('click', () => {
  if (!navigator.geolocation) {
    writeLog('Browser tidak mendukung geolocation.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      els.latitude.value = pos.coords.latitude;
      els.longitude.value = pos.coords.longitude;
      writeLog({ message: 'Lokasi berhasil diambil', latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    },
    (err) => {
      writeLog({ message: 'Gagal mengambil lokasi', error: err.message });
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

els.borrowForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    if (els.role.value !== 'user') throw new Error('Role harus User.');
    if (!String(els.userId.value || '').trim()) throw new Error('User ID wajib diisi.');

    const payload = {
      bookId: Number(els.borrowBookId.value),
      latitude: Number(els.latitude.value),
      longitude: Number(els.longitude.value),
    };

    const out = await api('/api/borrow', { method: 'POST', body: JSON.stringify(payload) });
    writeLog(out);
    await loadBooks();
  } catch (e2) {
    writeLog(String(e2.message || e2));
  }
});

function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

updateModeUI();
loadBooks();
