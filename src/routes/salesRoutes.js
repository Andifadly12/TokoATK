
// import express from "express";
// import { pool } from "../config/db.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";   

// const router = express.Router();

// router.get('/', authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
//     try {
//         const result = await pool.query(`SELECT * FROM "TokoATK".sales ORDER BY id ASC`)
//         return res.json(result.rows)
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ error: 'Internal Server Error' })
//     }
// })


// router.get('/:id', authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
//     try {
//         const result = await pool.query(`SELECT * FROM "TokoATK".sales WHERE id = $1`, [req.params.id])
//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'Sale not found' })
//         }
//         return res.json(result.rows[0])
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ error: 'Internal Server Error' })
//     }
// })


// router.post('/', authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
//     try {
//         const { invoice_number,
//             user_id, customer_id,
//             total_amount,
//             paid_amount,
//             change_amount,
//             payment_method } = req.body;
//         const result = await pool.query(`INSERT INTO "TokoATK".sales 
//             (invoice_number, user_id, customer_id, total_amount, paid_amount, change_amount, payment_method)
//             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
//             [invoice_number,
//                 user_id, customer_id,
//                 total_amount, paid_amount,
//                 change_amount,
//                 payment_method])
//         return res.status(201).json(result.rows[0])
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ error: 'Internal Server Error' })
//     }
// })
 

// router.put('/:id', authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
//     try {
//         const { invoice_number,
//             user_id, customer_id,
//             total_amount, paid_amount,
//             change_amount, payment_method } = req.body;
//         const result = await pool.query(`UPDATE "TokoATK".sales
//             SET invoice_number = $1,
//                 user_id = $2,
//                 customer_id = $3,
//                 total_amount = $4,
//                 paid_amount = $5,
//                 change_amount = $6,
//                 payment_method = $7
//             WHERE id = $8 RETURNING *`,
//             [invoice_number,
//                 user_id, customer_id,
//                 total_amount, paid_amount,
//                 change_amount,
//                 payment_method,
//                 req.params.id])
//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'Sale not found' })
//         }
//         return res.json(result.rows[0])
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ error: 'Internal Server Error' })
//     }
// })


// router.delete('/:id', authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
//     try {
//         const result = await pool.query(`DELETE FROM "TokoATK".sales WHERE id = $1 RETURNING *`, [req.params.id])
//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'Sale not found' })
//         }
//         return res.json({ message: 'Sale deleted successfully' })
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({ error: 'Internal Server Error' })
//     }
// })


// export default router
import express from "express";
import { pool } from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware  from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET semua penjualan
router.get("/", authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.invoice_number,
        s.total_amount,
        s.paid_amount,
        s.change_amount,
        s.payment_method,
        s.created_at,
        c.name AS customer_name,
        u.name AS cashier_name
      FROM "TokoATK".sales s
      LEFT JOIN "TokoATK".customers c ON s.customer_id = c.id
      LEFT JOIN "TokoATK".users u ON s.user_id = u.id
      ORDER BY s.id DESC
    `);

    res.json({
      message: "Berhasil mengambil data penjualan",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data penjualan",
      error: error.message,
    });
  }
});

// GET detail penjualan
router.get("/:id", authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
  try {
    const sale = await pool.query(
      `
      SELECT 
        s.*,
        c.name AS customer_name,
        u.name AS cashier_name
      FROM "TokoATK".sales s
      LEFT JOIN "TokoATK".customers c ON s.customer_id = c.id
      LEFT JOIN "TokoATK".users u ON s.user_id = u.id
      WHERE s.id = $1
      `,
      [req.params.id]
    );

    if (sale.rows.length === 0) {
      return res.status(404).json({
        message: "Data penjualan tidak ditemukan",
      });
    }

    const items = await pool.query(
      `
      SELECT 
        si.id,
        si.product_id,
        p.name AS product_name,
        si.quantity,
        si.price,
        si.subtotal
      FROM "TokoATK".sale_items si
      LEFT JOIN "TokoATK".products p ON si.product_id = p.id
      WHERE si.sale_id = $1
      ORDER BY si.id ASC
      `,
      [req.params.id]
    );

    res.json({
      message: "Berhasil mengambil detail penjualan",
      data: {
        sale: sale.rows[0],
        items: items.rows,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail penjualan",
      error: error.message,
    });
  }
});

// POST transaksi penjualan
router.post("/", authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customer_id,
      paid_amount,
      payment_method,
      items
    } = req.body;

    const user_id = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Items penjualan wajib diisi",
      });
    }

    await client.query("BEGIN");

    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const productResult = await client.query(
        `
        SELECT id, name, selling_price, stock
        FROM "TokoATK".products
        WHERE id = $1
        `,
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product dengan id ${item.product_id} tidak ditemukan`);
      }

      const product = productResult.rows[0];
      const quantity = Number(item.quantity);

      if (quantity <= 0) {
        throw new Error("Quantity harus lebih dari 0");
      }

      if (product.stock < quantity) {
        throw new Error(`Stok ${product.name} tidak cukup`);
      }

      const price = Number(product.selling_price);
      const subtotal = price * quantity;

      totalAmount += subtotal;

      saleItems.push({
        product_id: product.id,
        quantity,
        price,
        subtotal,
        product_name: product.name,
      });
    }

    const paidAmount = Number(paid_amount);

    if (paidAmount < totalAmount) {
      throw new Error("Uang pembayaran kurang dari total belanja");
    }

    const changeAmount = paidAmount - totalAmount;

    const invoiceNumber = `INV-${Date.now()}`;

    const saleResult = await client.query(
      `
      INSERT INTO "TokoATK".sales
      (invoice_number, user_id, customer_id, total_amount, paid_amount, change_amount, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        invoiceNumber,
        user_id,
        customer_id || null,
        total_amount,
        paidAmount,
        changeAmount,
        payment_method || "cash",
      ]
    );

    const sale = saleResult.rows[0];

    for (const item of saleItems) {
      await client.query(
        `
        INSERT INTO "TokoATK".sale_items
        (sale_id, product_id, quantity, price, subtotal)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [sale.id, item.product_id, item.quantity, item.price, item.subtotal]
      );

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
        (product_id, user_id, type, quantity, description)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          item.product_id,
          user_id,
          "out",
          item.quantity,
          `Penjualan ${invoiceNumber}`,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Penjualan berhasil dibuat",
      data: {
        sale,
        items: saleItems,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      message: "Gagal membuat penjualan",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

export default router;