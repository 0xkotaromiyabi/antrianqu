# AntrianQu - Sistem Antrean Terpadu

AntrianQu adalah aplikasi manajemen antrean modern yang dirancang untuk efisiensi dan kemudahan penggunaan. Dilengkapi dengan Dashboard ERP untuk administrator dan fitur Super Admin untuk manajemen role.

## Fitur Utama

- **Pendaftaran Antrean**: User-friendly form untuk pelanggan mendaftar.
- **Tiket Digital**: Generasi nomor antrean otomatis secara real-time.
- **Admin Dashboard (ERP)**: Panel kontrol untuk memantau dan mengelola status antrean (Waiting, Arrived, Cancelled).
- **Keamanan JWT**: Autentikasi berbasis token untuk akses administrator.
- **Manajemen Super Admin**: Fitur untuk menambah/menghapus admin dan reset password melalui menu Settings.
- **Database Prisma & PostgreSQL**: Penyimpanan data yang tangguh dan terukur.

## Teknologi

- **Frontend**: React, Vite, Framer Motion, Lucide React.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL dengan Prisma ORM.
- **Deployment**: Docker & Docker Compose.

## Persiapan Lokal

1. **Clone Repository**:

   ```bash
   git clone git@github.com:0xkotaromiyabi/antrianqu.git
   cd antrianqu
   ```

2. **Setup Database**:
   Pastikan Docker sudah berjalan, lalu jalankan:

   ```bash
   docker-compose up -d
   ```

3. **Install Dependensi**:

   ```bash
   npm install
   ```

4. **Konfigurasi Environment**:
   Salin `.env.example` menjadi `.env` dan sesuaikan nilainya.

5. **Migrasi Database**:

   ```bash
   npx prisma db push
   ```

6. **Seed Data (Opsional)**:
   Jalankan server dan kirim request POST ke `/api/seed` untuk membuat data merchant dan super admin awal.

7. **Jalankan Aplikasi**:

   ```bash
   npm run dev
   ```

## Kredensial Default (Seeding)

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `SUPER_ADMIN`
