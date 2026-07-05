import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET semua pembelian
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.invoice_number,
        p.supplier_id,
        s.name AS supplier_name,
        p.user_id,
        u.name AS user_name,
        p.total_amount,
        p.created_at
      FROM "TokoATK".purchases p
      LEFT JOIN "TokoATK".suppliers s ON p.supplier_id = s.id
      LEFT JOIN "TokoATK".users u ON p.user_id = u.id
      ORDER BY p.id DESC
    `);

    res.json({
      message: "Berhasil mengambil data pembelian",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data pembelian",
      error: error.message,
    });
  }
});

// GET detail pembelian
router.get("/:id", async (req, res) => {
  try {
    const purchaseResult = await pool.query(
      `
      SELECT
        p.id,
        p.invoice_number,
        p.supplier_id,
        s.name AS supplier_name,
        p.user_id,
        u.name AS user_name,
        p.total_amount,
        p.created_at
      FROM "TokoATK".purchases p
      LEFT JOIN "TokoATK".suppliers s ON p.supplier_id = s.id
      LEFT JOIN "TokoATK".users u ON p.user_id = u.id
      WHERE p.id = $1
      `,
      [req.params.id]
    );

    if (purchaseResult.rows.length === 0) {
      return res.status(404).json({
        message: "Data pembelian tidak ditemukan",
      });
    }

    const itemResult = await pool.query(
      `
      SELECT
        pi.id,
        pi.purchase_id,
        pi.product_id,
        pr.name AS product_name,
        pi.quantity,
        pi.price,
        pi.subtotal
      FROM "TokoATK".purchase_items pi
      LEFT JOIN "TokoATK".products pr ON pi.product_id = pr.id
      WHERE pi.purchase_id = $1
      ORDER BY pi.id ASC
      `,
      [req.params.id]
    );

    res.json({
      message: "Detail pembelian berhasil diambil",
      data: {
        purchase: purchaseResult.rows[0],
        items: itemResult.rows,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail pembelian",
      error: error.message,
    });
  }
});

// POST pembelian barang masuk
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const { supplier_id, user_id, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Items pembelian wajib diisi",
      });
    }

    const supplierId = supplier_id ? Number(supplier_id) : null;
    const userId = user_id ? Number(user_id) : null;

    await client.query("BEGIN");

    let totalAmount = 0;
    const purchaseItems = [];

    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);
      const price = Number(item.price);

      if (!productId || quantity <= 0 || price <= 0) {
        throw new Error("product_id, quantity, dan price wajib benar");
      }

      const productResult = await client.query(
        `
        SELECT id, name
        FROM "TokoATK".products
        WHERE id = $1
        `,
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product dengan id ${productId} tidak ditemukan`);
      }

      const product = productResult.rows[0];
      const subtotal = quantity * price;

      totalAmount += subtotal;

      purchaseItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        price,
        subtotal,
      });
    }

    const invoiceNumber = `PUR-${Date.now()}`;

    const purchaseResult = await client.query(
      `
      INSERT INTO "TokoATK".purchases
      (
        invoice_number,
        supplier_id,
        user_id,
        total_amount
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [invoiceNumber, supplierId, userId, totalAmount]
    );

    const purchase = purchaseResult.rows[0];

    for (const item of purchaseItems) {
      await client.query(
        `
        INSERT INTO "TokoATK".purchase_items
        (
          purchase_id,
          product_id,
          quantity,
          price,
          subtotal
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [purchase.id, item.product_id, item.quantity, item.price, item.subtotal]
      );

      await client.query(
        `
        UPDATE "TokoATK".products
        SET stock = stock + $1,
            purchase_price = $2
        WHERE id = $3
        `,
        [item.quantity, item.price, item.product_id]
      );

      await client.query(
        `
        INSERT INTO "TokoATK".stock_movements
        (
          product_id,
          user_id,
          type,
          quantity,
          description
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          item.product_id,
          userId,
          "in",
          item.quantity,
          `Pembelian ${invoiceNumber}`,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Pembelian berhasil dibuat dan stok bertambah",
      data: {
        purchase,
        items: purchaseItems,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      message: "Gagal membuat pembelian",
      error: error.message,
    });
  } finally {
    client.release();
  }
});



export default router;