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
 

export default router;