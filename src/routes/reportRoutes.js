import express from "express";
import { pool } from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";


const router = express.Router();

router.get("/summary", authMiddleware, roleMiddleware("admin"),  async (req, res) => {
    try {
        const totalSales = await pool.query(`
            SELECT COALESCE(SUM(total_amount), 0) AS total_sales FROM "TokoATK".sales
            `);
        const totalTrasactions = await pool.query(`
            SELECT COUNT(*) AS total_transactions FROM "TokoATK".sales`
        );
        const totalProducts = await pool.query(`
            SELECT COUNT(*) AS total_products FROM "TokoATK".products
            `);
        const lowStockProducts = await pool.query(`
            SELECT COUNT(*) AS low_stock_products FROM "TokoATK".products WHERE stock <= 10
            `  )
        res.json({
            massage: 'Berhasil mengambil summary berhasil',
            data: {
                totalSales: totalSales.rows[0].total_sales,
                totalTrasactions: totalTrasactions.rows[0].total_transactions,
                totalProducts: totalProducts.rows[0].total_products,
                lowStockProducts: lowStockProducts.rows[0].low_stock_products
            }
        })
    } catch (error) {
        res.status(500).json({
            massage: "Gagal mengambil data summary",
            error: error.message,
        })
    }
})


router.get("/sales", authMiddleware, roleMiddleware("admin"), async (req, res) => { 
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
            ORDER BY s.created_at DESC
            `);
        res.json({
            massage: "berhasil mengambil laporan penjualan ",
            data:result.rows
        })
    } catch (error) {
        res.status(500).json({
            massage: "Gagal mengambil data pnjualan",
            error: error.message,
        })
    }
})


// router.get('/stock', async (req, res) => {
//     try {
//         const result = await pool.query(`
//             SELECT 
//                 p.id,
//                 p.name,
//                 p.stock,
//                 p.purchase_price,
//                 p.selling_price,
//                 c.name AS category_name
//             FROM "TokoATK".products p
//             LEFT JOIN "TokoATK".categories c ON p.category_id = c.id
//             ORDER BY p.stock ASC    
//         `)
//     } catch (error) {
//         res.status(500).json({
//             massage: 'Gagal mengambil data stock',
//             error: error.message
//         })
//     }
//  })
router.get(
  "/stock",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.stock,
          p.purchase_price,
          p.selling_price,
          c.name AS category_name
        FROM "TokoATK".products p
        LEFT JOIN "TokoATK".categories c ON p.category_id = c.id
        ORDER BY p.stock ASC
      `);

      res.json({
        message: "Berhasil mengambil laporan stok produk",
        data: result.rows,
      });
    } catch (error) {
      res.status(500).json({
        message: "Gagal mengambil laporan stok produk",
        error: error.message,
      });
    }
  }
);
export default router;