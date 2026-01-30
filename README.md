# Library System with Geolocation (Remidi UCP 1)

Backend sederhana untuk manajemen perpustakaan + peminjaman buku yang menyimpan lokasi (latitude/longitude).
Role dan User ID disimulasikan menggunakan header.

## 1) Tech Stack

- Node.js + Express
- MySQL + Sequelize ORM
- UI sederhana (static HTML) di browser

## 2) Cara Menjalankan

### A. Install dependency

```bash
npm install
```

### B. Siapkan database MySQL

Buat database (contoh):

```sql
CREATE DATABASE library_geo_db;
```

### C. Atur file .env

Contoh isi `.env` (sesuaikan):

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=library_geo_db
DB_DIALECT=mysql
DB_PORT=3307
```

### D. Jalankan server

Mode dev (nodemon):

```bash
npm run dev
```

Lalu buka:

- UI: `http://localhost:3000/`
- API health: `http://localhost:3000/api/health`

Catatan: Server menjalankan `sequelize.sync({ alter: true })` otomatis saat start, jadi tabel akan dibuat/update otomatis.

## 3) Spesifikasi Soal yang Terpenuhi

- Public:
  - `GET /api/books` (lihat semua buku)
  - `GET /api/books/:id` (detail buku)
- Admin (header `x-user-role: admin`):
  - `POST /api/books` (tambah buku)
  - `PUT /api/books/:id` (update buku)
  - `DELETE /api/books/:id` (hapus buku)
- User (header `x-user-role: user` dan `x-user-id: <angka>`):
  - `POST /api/borrow` (pinjam buku + simpan lokasi)

- Admin (opsional untuk monitoring, header `x-user-role: admin`):
  - `GET /api/borrow/logs` (lihat data peminjaman)

Validasi sederhana:
- `title` dan `author` tidak boleh kosong
- `stock` harus angka >= 0
- `bookId`, `latitude`, `longitude` divalidasi dan dicek range koordinat

Catatan penting sesuai soal:
- Tidak ada fitur login/JWT/session. Role dan userId disimulasikan manual via header pada setiap request.

Checklist fitur (sesuai soal):
- Middleware custom cek `x-user-role` (admin/user)
- Public: list & detail buku
- Admin: tambah/update/hapus buku
- User: borrow buku, stok berkurang, lokasi tersimpan (latitude/longitude)

## 4) Contoh Request (cURL)

### A. Public - List buku

```bash
curl http://localhost:3000/api/books
```

### B. Admin - Tambah buku

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -d "{\"title\":\"Clean Code\",\"author\":\"Robert C. Martin\",\"stock\":3}"
```

### C. Admin - Update buku

```bash
curl -X PUT http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -d "{\"stock\":10}"
```

### D. User - Borrow buku (simpan lokasi)

```bash
curl -X POST http://localhost:3000/api/borrow \
  -H "Content-Type: application/json" \
  -H "x-user-role: user" \
  -H "x-user-id: 1" \
  -d "{\"bookId\":1,\"latitude\":-6.2088,\"longitude\":106.8456}"
```

### E. Admin (opsional) - Lihat borrow logs

Semua logs:

```bash
curl http://localhost:3000/api/borrow/logs \
  -H "x-user-role: admin"
```

Dengan filter (opsional):

```bash
curl "http://localhost:3000/api/borrow/logs?userId=1&bookId=1&limit=50" \
  -H "x-user-role: admin"
```

## 5) Screenshot yang Diminta Dosen

Silakan buat folder `screenshots/` lalu tempelkan screenshot sesuai daftar ini.

### A. Screenshot API (Postman)

1) GET semua buku

[tempelkan ss di sini]

Contoh file: `screenshots/01-postman-get-books.png`

2) POST tambah buku (Admin)

[tempelkan ss di sini]

Contoh file: `screenshots/02-postman-admin-create-book.png`

3) PUT update buku (Admin)

[tempelkan ss di sini]

Contoh file: `screenshots/03-postman-admin-update-book.png`

4) DELETE hapus buku (Admin)

[tempelkan ss di sini]

Contoh file: `screenshots/04-postman-admin-delete-book.png`

5) POST borrow buku (User) + lokasi

[tempelkan ss di sini]

Contoh file: `screenshots/05-postman-user-borrow.png`

### B. Screenshot UI Web

1) Halaman utama (list buku)

[tempelkan ss di sini]

Contoh file: `screenshots/06-ui-home.png`

2) Mode admin (form create/update)

[tempelkan ss di sini]

Contoh file: `screenshots/07-ui-admin.png`

3) Mode user (form borrow + geolocation)

[tempelkan ss di sini]

Contoh file: `screenshots/08-ui-user-borrow.png`

### C. Screenshot Struktur Database

1) Struktur tabel `books`

[tempelkan ss di sini]

Contoh file: `screenshots/09-db-books.png`

2) Struktur tabel `borrow_logs`

[tempelkan ss di sini]

Contoh file: `screenshots/10-db-borrow-logs.png`

3) Contoh isi data setelah borrow (minimal 1 row di `borrow_logs`)

[tempelkan ss di sini]

Contoh file: `screenshots/11-db-borrow-logs-data.png`

## 6) Panduan Lengkap Test di Postman

Bagian ini dibuat supaya kamu bisa membuktikan semua fitur sesuai soal (tanpa login/JWT).

### A. Persiapan

1) Jalankan server dulu
- `npm run dev`
- Pastikan bisa akses `http://localhost:3000/api/health`

2) Buat Postman Environment (disarankan)
- Klik Environments -> Create environment
- Buat variable:
  - `baseUrl` = `http://localhost:3000`
  - `adminRole` = `admin`
  - `userRole` = `user`
  - `userId` = `1`

### B. Aturan Header (ini inti simulasi role)

- Admin request harus pakai header:
  - `x-user-role: admin`

- User request harus pakai header:
  - `x-user-role: user`
  - `x-user-id: 1` (angka)

### C. Test Public Endpoint

1) GET semua buku
- Method: `GET`
- URL: `{{baseUrl}}/api/books`
- Header: (tidak wajib)
- Expected: `200 OK` dan body berisi `data: []` atau list buku

2) GET detail buku
- Method: `GET`
- URL: `{{baseUrl}}/api/books/1`
- Expected:
  - `200 OK` jika buku ada
  - `404 Not Found` jika id tidak ada

### D. Test Admin Endpoint (CRUD Buku)

Sebelum test admin, pastikan header berikut terisi di request:
- `x-user-role: {{adminRole}}`

1) POST tambah buku
- Method: `POST`
- URL: `{{baseUrl}}/api/books`
- Headers:
  - `Content-Type: application/json`
  - `x-user-role: {{adminRole}}`
- Body (raw JSON):

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "stock": 3
}
```

- Expected:
  - `201 Created`
  - Response ada `data` buku baru

2) PUT update buku
- Method: `PUT`
- URL: `{{baseUrl}}/api/books/1`
- Headers:
  - `Content-Type: application/json`
  - `x-user-role: {{adminRole}}`
- Body (raw JSON) contoh:

```json
{
  "stock": 10
}
```

- Expected:
  - `200 OK` jika buku ada
  - `404 Not Found` jika buku tidak ada

3) DELETE hapus buku
- Method: `DELETE`
- URL: `{{baseUrl}}/api/books/1`
- Headers:
  - `x-user-role: {{adminRole}}`
- Expected:
  - `200 OK` jika berhasil
  - `404 Not Found` jika buku tidak ada

### E. Test User Endpoint (Borrow + Geolocation)

Sebelum test user, pastikan header berikut terisi di request:
- `x-user-role: {{userRole}}`
- `x-user-id: {{userId}}`

1) POST borrow buku
- Method: `POST`
- URL: `{{baseUrl}}/api/borrow`
- Headers:
  - `Content-Type: application/json`
  - `x-user-role: {{userRole}}`
  - `x-user-id: {{userId}}`
- Body (raw JSON):

```json
{
  "bookId": 1,
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

- Expected:
  - `201 Created`
  - Response `Borrow success`
  - Stock buku berkurang 1
  - Tabel `borrow_logs` bertambah 1 row

### F. Negative Test (untuk bukti validasi & role middleware)

1) Coba POST /api/books tanpa header admin
- Expected: `403 Forbidden`

2) Coba POST /api/borrow tanpa `x-user-id`
- Expected: `400 Bad Request`

3) Coba tambah buku dengan title kosong
- Expected: `400 Bad Request` (title tidak boleh kosong)

4) Coba borrow ketika stock = 0
- Expected: `400 Bad Request` (Stock buku habis)

### G. Test Admin Endpoint (Opsional) - Borrow Logs

1) GET semua borrow logs
- Method: `GET`
- URL: `{{baseUrl}}/api/borrow/logs`
- Headers:
  - `x-user-role: {{adminRole}}`
- Expected: `200 OK` dan body `data: [...]`

2) GET borrow logs pakai filter (opsional)
- Method: `GET`
- URL: `{{baseUrl}}/api/borrow/logs?userId=1&bookId=1&limit=50`
- Headers:
  - `x-user-role: {{adminRole}}`
- Expected: `200 OK` dan data terfilter
