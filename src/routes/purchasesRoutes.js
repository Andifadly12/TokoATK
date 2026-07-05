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


// PUT update pembelian
router.put("/:id", async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const { supplier_id, user_id, items } = req.body;
    const purchaseId = req.params.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Items pembelian wajib diisi",
      });
    }

    await client.query("BEGIN");
    transactionStarted = true;

    // Cek pembelian lama
    const oldPurchaseResult = await client.query(
      `
      SELECT *
      FROM "TokoATK".purchases
      WHERE id = $1
      `,
      [purchaseId]
    );

    if (oldPurchaseResult.rows.length === 0) {
      throw new Error("Data pembelian tidak ditemukan");
    }

    const oldPurchase = oldPurchaseResult.rows[0];

    // Ambil item pembelian lama
    const oldItemsResult = await client.query(
      `
      SELECT *
      FROM "TokoATK".purchase_items
      WHERE purchase_id = $1
      `,
      [purchaseId]
    );

    // Kurangi stok dari item lama dulu
    for (const oldItem of oldItemsResult.rows) {
      const productResult = await client.query(
        `
        SELECT id, name, stock
        FROM "TokoATK".products
        WHERE id = $1
        FOR UPDATE
        `,
        [oldItem.product_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product lama dengan id ${oldItem.product_id} tidak ditemukan`);
      }

      const product = productResult.rows[0];

      if (Number(product.stock) < Number(oldItem.quantity)) {
        throw new Error(
          `Stok ${product.name} tidak cukup untuk mengubah pembelian. Kemungkinan barang sudah terjual.`
        );
      }

      await client.query(
        `
        UPDATE "TokoATK".products
        SET stock = stock - $1
        WHERE id = $2
        `,
        [oldItem.quantity, oldItem.product_id]
      );
    }

    // Hapus item pembelian lama
    await client.query(
      `
      DELETE FROM "TokoATK".purchase_items
      WHERE purchase_id = $1
      `,
      [purchaseId]
    );

    let totalAmount = 0;
    const newPurchaseItems = [];

    // Proses item baru
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
        FOR UPDATE
        `,
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product dengan id ${productId} tidak ditemukan`);
      }

      const product = productResult.rows[0];
      const subtotal = quantity * price;

      totalAmount += subtotal;

      newPurchaseItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        price,
        subtotal,
      });
    }

    const supplierId = supplier_id ? Number(supplier_id) : oldPurchase.supplier_id;
    const userId = user_id ? Number(user_id) : oldPurchase.user_id;

    // Update tabel purchases
    const updatedPurchaseResult = await client.query(
      `
      UPDATE "TokoATK".purchases
      SET supplier_id = $1,
          user_id = $2,
          total_amount = $3
      WHERE id = $4
      RETURNING *
      `,
      [supplierId, userId, totalAmount, purchaseId]
    );

    const updatedPurchase = updatedPurchaseResult.rows[0];

    // Masukkan item baru dan tambah stok
    for (const item of newPurchaseItems) {
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
        [purchaseId, item.product_id, item.quantity, item.price, item.subtotal]
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
          `Update pembelian ${updatedPurchase.invoice_number}`,
        ]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Pembelian berhasil diupdate dan stok disesuaikan",
      data: {
        purchase: updatedPurchase,
        items: newPurchaseItems,
      },
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    res.status(500).json({
      message: "Gagal update pembelian",
      error: error.message,
    });
  } finally {
    client.release();
  }
});



// DELETE pembelian
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const purchaseId = req.params.id;

    await client.query("BEGIN");
    transactionStarted = true;

    const purchaseResult = await client.query(
      `
      SELECT *
      FROM "TokoATK".purchases
      WHERE id = $1
      `,
      [purchaseId]
    );

    if (purchaseResult.rows.length === 0) {
      throw new Error("Data pembelian tidak ditemukan");
    }

    const purchase = purchaseResult.rows[0];

    const itemResult = await client.query(
      `
      SELECT *
      FROM "TokoATK".purchase_items
      WHERE purchase_id = $1
      `,
      [purchaseId]
    );

    for (const item of itemResult.rows) {
      const productResult = await client.query(
        `
        SELECT id, name, stock
        FROM "TokoATK".products
        WHERE id = $1
        FOR UPDATE
        `,
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product dengan id ${item.product_id} tidak ditemukan`);
      }

      const product = productResult.rows[0];

      if (Number(product.stock) < Number(item.quantity)) {
        throw new Error(
          `Stok ${product.name} tidak cukup untuk membatalkan pembelian. Kemungkinan barang sudah terjual.`
        );
      }

      await client.query(
        `
        UPDATE "TokoATK".products
        SET stock = stock - $1
        WHERE id = $2
        `,
        [item.quantity, item.product_id]
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
          purchase.user_id,
          "out",
          item.quantity,
          `Pembatalan pembelian ${purchase.invoice_number}`,
        ]
      );
    }

    await client.query(
      `
      DELETE FROM "TokoATK".purchases
      WHERE id = $1
      `,
      [purchaseId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Pembelian berhasil dihapus dan stok dikurangi",
      data: purchase,
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    res.status(500).json({
      message: "Gagal hapus pembelian",
      error: error.message,
    });
  } finally {
    client.release();
  }
});
export default router;