<img width="1660" height="951" alt="Screenshot 2026-07-05 at 13 04 12" src="https://github.com/user-attachments/assets/95d368a1-c4ed-4229-bbb4-f3b1dbdf0511" />
# Backend API Toko ATK

Backend API untuk aplikasi **Toko ATK** menggunakan **Express.js** dan **PostgreSQL**.  
Project ini dibuat untuk mengelola data toko seperti user, produk, kategori, supplier, customer, penjualan, pembelian, stok barang, dan laporan.

## Teknologi yang Digunakan

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Bcrypt
- dotenv
- CORS
- Swagger UI
- DBeaver
- Postman

## Fitur Utama

- Auth register dan login
- Middleware JWT authentication
- Role access admin dan kasir
- CRUD Users
- CRUD Categories
- CRUD Customers
- CRUD Suppliers
- CRUD Products
- CRUD Sales / Penjualan
- CRUD Purchases / Pembelian
- Update stok otomatis saat penjualan
- Update stok otomatis saat pembelian
- Riwayat pergerakan stok
- Laporan penjualan
- Laporan pembelian
- Laporan stok produk
- Laporan produk terlaris
- Swagger API Documentation

## Struktur Folder

```bash
src
├── config
│   └── db.js
├── middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── categoryRoutes.js
│   ├── customerRoutes.js
│   ├── supplierRoutes.js
│   ├── productRoutes.js
│   ├── salesRoutes.js
│   ├── purchasesRoutes.js
│   └── reportRoutes.js
├── docs
│   └── swagger.js
└── index.js
