const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API Toko ATK",
    version: "1.0.0",
    description: "Dokumentasi API Backend Toko ATK Express + PostgreSQL",
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
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    example: "admin@gmail.com",
                  },
                  password: {
                    type: "string",
                    example: "123456",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login berhasil",
          },
        },
      },
    },

    "/products": {
      get: {
        tags: ["Products"],
        summary: "Ambil semua produk",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Berhasil mengambil produk",
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Tambah produk",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    example: "Pulpen Pilot",
                  },
                  category_id: {
                    type: "number",
                    example: 1,
                  },
                  supplier_id: {
                    type: "number",
                    example: 1,
                  },
                  purchase_price: {
                    type: "number",
                    example: 2500,
                  },
                  selling_price: {
                    type: "number",
                    example: 3000,
                  },
                  stock: {
                    type: "number",
                    example: 100,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Produk berhasil ditambahkan",
          },
        },
      },
    },

    "/sales": {
      get: {
        tags: ["Sales"],
        summary: "Ambil semua penjualan",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Berhasil mengambil penjualan",
          },
        },
      },
      post: {
        tags: ["Sales"],
        summary: "Buat transaksi penjualan",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  customer_id: {
                    type: "number",
                    nullable: true,
                    example: null,
                  },
                  paid_amount: {
                    type: "number",
                    example: 50000,
                  },
                  payment_method: {
                    type: "string",
                    example: "cash",
                  },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_id: {
                          type: "number",
                          example: 1,
                        },
                        quantity: {
                          type: "number",
                          example: 2,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Penjualan berhasil dibuat",
          },
        },
      },
    },

    "/purchases": {
      get: {
        tags: ["Purchases"],
        summary: "Ambil semua pembelian",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Berhasil mengambil pembelian",
          },
        },
      },
      post: {
        tags: ["Purchases"],
        summary: "Buat pembelian barang masuk",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  supplier_id: {
                    type: "number",
                    nullable: true,
                    example: null,
                  },
                  user_id: {
                    type: "number",
                    example: 18,
                  },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_id: {
                          type: "number",
                          example: 1,
                        },
                        quantity: {
                          type: "number",
                          example: 20,
                        },
                        price: {
                          type: "number",
                          example: 2500,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Pembelian berhasil dibuat",
          },
        },
      },
    },

    "/reports/summary": {
      get: {
        tags: ["Reports"],
        summary: "Dashboard summary",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Berhasil mengambil summary dashboard",
          },
        },
      },
    },

    "/reports/stock": {
      get: {
        tags: ["Reports"],
        summary: "Laporan stok produk",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Berhasil mengambil laporan stok",
          },
        },
      },
    },

    "/reports/top-products": {
      get: {
        tags: ["Reports"],
        summary: "Laporan produk terlaris",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Berhasil mengambil produk terlaris",
          },
        },
      },
    },
  },
};

export default swaggerDocument;