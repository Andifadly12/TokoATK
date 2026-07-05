const security = [{ bearerAuth: [] }];

const idParam = [
  {
    name: "id",
    in: "path",
    required: true,
    schema: {
      type: "integer",
    },
  },
];

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API Toko ATK",
    version: "1.0.0",
    description: "Dokumentasi API Toko ATK Express + PostgreSQL",
  },
  servers: [
    {
      url: "http://localhost:4000",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    // ================= AUTH =================
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Admin Toko",
                email: "admin@gmail.com",
                password: "123456",
                role: "admin",
              },
            },
          },
        },
        responses: {
          201: { description: "Register berhasil" },
          400: { description: "Data tidak valid" },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "admin@gmail.com",
                password: "123456",
              },
            },
          },
        },
        responses: {
          200: { description: "Login berhasil" },
          401: { description: "Email atau password salah" },
        },
      },
    },

    "/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Ambil profile user login",
        security,
        responses: {
          200: { description: "Profile berhasil diambil" },
          401: { description: "Token tidak valid" },
        },
      },
    },

    // ================= USERS =================
    "/users": {
      get: {
        tags: ["Users"],
        summary: "Ambil semua user",
        security,
        responses: {
          200: { description: "Berhasil mengambil users" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Tambah user",
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Kasir 1",
                email: "kasir@gmail.com",
                password: "123456",
                role: "kasir",
              },
            },
          },
        },
        responses: {
          201: { description: "User berhasil ditambahkan" },
        },
      },
    },

    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Ambil detail user",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Detail user berhasil diambil" },
          404: { description: "User tidak ditemukan" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        security,
        parameters: idParam,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Kasir Update",
                email: "kasirupdate@gmail.com",
                role: "kasir",
              },
            },
          },
        },
        responses: {
          200: { description: "User berhasil diupdate" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Hapus user",
        security,
        parameters: idParam,
        responses: {
          200: { description: "User berhasil dihapus" },
        },
      },
    },

    // ================= CATEGORIES =================
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Ambil semua kategori",
        security,
        responses: {
          200: { description: "Berhasil mengambil kategori" },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Tambah kategori",
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Alat Tulis",
                description: "Kategori alat tulis kantor",
              },
            },
          },
        },
        responses: {
          201: { description: "Kategori berhasil ditambahkan" },
        },
      },
    },

    "/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Ambil detail kategori",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Detail kategori berhasil diambil" },
        },
      },
      put: {
        tags: ["Categories"],
        summary: "Update kategori",
        security,
        parameters: idParam,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Alat Tulis Update",
                description: "Kategori alat tulis terbaru",
              },
            },
          },
        },
        responses: {
          200: { description: "Kategori berhasil diupdate" },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Hapus kategori",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Kategori berhasil dihapus" },
        },
      },
    },

    // ================= CUSTOMERS =================
    "/customers": {
      get: {
        tags: ["Customers"],
        summary: "Ambil semua customer",
        security,
        responses: {
          200: { description: "Berhasil mengambil customer" },
        },
      },
      post: {
        tags: ["Customers"],
        summary: "Tambah customer",
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Pelanggan Umum",
                phone: "08123456789",
                address: "Bulukumba",
              },
            },
          },
        },
        responses: {
          201: { description: "Customer berhasil ditambahkan" },
        },
      },
    },

    "/customers/{id}": {
      get: {
        tags: ["Customers"],
        summary: "Ambil detail customer",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Detail customer berhasil diambil" },
        },
      },
      put: {
        tags: ["Customers"],
        summary: "Update customer",
        security,
        parameters: idParam,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Pelanggan Update",
                phone: "08111111111",
                address: "Makassar",
              },
            },
          },
        },
        responses: {
          200: { description: "Customer berhasil diupdate" },
        },
      },
      delete: {
        tags: ["Customers"],
        summary: "Hapus customer",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Customer berhasil dihapus" },
        },
      },
    },

    // ================= SUPPLIERS =================
    "/suppliers": {
      get: {
        tags: ["Suppliers"],
        summary: "Ambil semua supplier",
        security,
        responses: {
          200: { description: "Berhasil mengambil supplier" },
        },
      },
      post: {
        tags: ["Suppliers"],
        summary: "Tambah supplier",
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "PT Sumber ATK",
                phone: "08222222222",
                address: "Makassar",
              },
            },
          },
        },
        responses: {
          201: { description: "Supplier berhasil ditambahkan" },
        },
      },
    },

    "/suppliers/{id}": {
      get: {
        tags: ["Suppliers"],
        summary: "Ambil detail supplier",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Detail supplier berhasil diambil" },
        },
      },
      put: {
        tags: ["Suppliers"],
        summary: "Update supplier",
        security,
        parameters: idParam,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "PT Sumber ATK Update",
                phone: "08333333333",
                address: "Bulukumba",
              },
            },
          },
        },
        responses: {
          200: { description: "Supplier berhasil diupdate" },
        },
      },
      delete: {
        tags: ["Suppliers"],
        summary: "Hapus supplier",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Supplier berhasil dihapus" },
        },
      },
    },

    // ================= PRODUCTS =================
    "/products": {
      get: {
        tags: ["Products"],
        summary: "Ambil semua produk",
        security,
        responses: {
          200: { description: "Berhasil mengambil produk" },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Tambah produk",
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Pulpen Pilot",
                category_id: 1,
                supplier_id: 1,
                purchase_price: 2500,
                selling_price: 3000,
                stock: 100,
              },
            },
          },
        },
        responses: {
          201: { description: "Produk berhasil ditambahkan" },
        },
      },
    },

    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Ambil detail produk",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Detail produk berhasil diambil" },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update produk",
        security,
        parameters: idParam,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Pulpen Pilot Update",
                category_id: 1,
                supplier_id: 1,
                purchase_price: 2600,
                selling_price: 3500,
                stock: 120,
              },
            },
          },
        },
        responses: {
          200: { description: "Produk berhasil diupdate" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Hapus produk",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Produk berhasil dihapus" },
        },
      },
    },

    // ================= SALES =================
    "/sales": {
      get: {
        tags: ["Sales"],
        summary: "Ambil semua penjualan",
        security,
        responses: {
          200: { description: "Berhasil mengambil penjualan" },
        },
      },
      post: {
        tags: ["Sales"],
        summary: "Buat transaksi penjualan",
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                customer_id: null,
                paid_amount: 50000,
                payment_method: "cash",
                items: [
                  {
                    product_id: 1,
                    quantity: 2,
                  },
                ],
              },
            },
          },
        },
        responses: {
          201: { description: "Penjualan berhasil dibuat" },
        },
      },
    },

    "/sales/{id}": {
      get: {
        tags: ["Sales"],
        summary: "Ambil detail penjualan",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Detail penjualan berhasil diambil" },
        },
      },
      delete: {
        tags: ["Sales"],
        summary: "Hapus atau batalkan penjualan",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Penjualan berhasil dibatalkan" },
        },
      },
    },

    // ================= PURCHASES =================
    "/purchases": {
      get: {
        tags: ["Purchases"],
        summary: "Ambil semua pembelian",
        security,
        responses: {
          200: { description: "Berhasil mengambil pembelian" },
        },
      },
      post: {
        tags: ["Purchases"],
        summary: "Buat pembelian barang masuk",
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                supplier_id: null,
                user_id: 18,
                items: [
                  {
                    product_id: 1,
                    quantity: 20,
                    price: 2500,
                  },
                ],
              },
            },
          },
        },
        responses: {
          201: { description: "Pembelian berhasil dibuat" },
        },
      },
    },

    "/purchases/{id}": {
      get: {
        tags: ["Purchases"],
        summary: "Ambil detail pembelian",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Detail pembelian berhasil diambil" },
        },
      },
      put: {
        tags: ["Purchases"],
        summary: "Update pembelian",
        security,
        parameters: idParam,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                supplier_id: null,
                user_id: 18,
                items: [
                  {
                    product_id: 1,
                    quantity: 30,
                    price: 2500,
                  },
                ],
              },
            },
          },
        },
        responses: {
          200: { description: "Pembelian berhasil diupdate" },
        },
      },
      delete: {
        tags: ["Purchases"],
        summary: "Hapus pembelian",
        security,
        parameters: idParam,
        responses: {
          200: { description: "Pembelian berhasil dihapus" },
        },
      },
    },

    // ================= REPORTS =================
    "/reports/summary": {
      get: {
        tags: ["Reports"],
        summary: "Dashboard summary",
        security,
        responses: {
          200: { description: "Berhasil mengambil summary dashboard" },
        },
      },
    },

    "/reports/sales": {
      get: {
        tags: ["Reports"],
        summary: "Laporan penjualan",
        security,
        responses: {
          200: { description: "Berhasil mengambil laporan penjualan" },
        },
      },
    },

    "/reports/purchases": {
      get: {
        tags: ["Reports"],
        summary: "Laporan pembelian",
        security,
        responses: {
          200: { description: "Berhasil mengambil laporan pembelian" },
        },
      },
    },

    "/reports/stock": {
      get: {
        tags: ["Reports"],
        summary: "Laporan stok produk",
        security,
        responses: {
          200: { description: "Berhasil mengambil laporan stok" },
        },
      },
    },

    "/reports/low-stock": {
      get: {
        tags: ["Reports"],
        summary: "Laporan stok rendah",
        security,
        responses: {
          200: { description: "Berhasil mengambil stok rendah" },
        },
      },
    },

    "/reports/top-products": {
      get: {
        tags: ["Reports"],
        summary: "Laporan produk terlaris",
        security,
        responses: {
          200: { description: "Berhasil mengambil produk terlaris" },
        },
      },
    },

    "/reports/stock-movements": {
      get: {
        tags: ["Reports"],
        summary: "Riwayat pergerakan stok",
        security,
        responses: {
          200: { description: "Berhasil mengambil stock movements" },
        },
      },
    },
  },
};

export default swaggerDocument;