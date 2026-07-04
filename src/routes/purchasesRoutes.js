import express from "express";
import { pool } from "../config/db.js";


const router = express.Router();

router.get("/", async (req, res) => {
    try { 
        const result = await pool.query(
            `SELECT p.id, p.invoice_number, p.suppiler_id, s.name AS supplier_name, p.user_id, u.name AS user_name, p.total_amount,p.payment_status, p.note, p.created_at
            FROM purchases p
            JOIN suppliers s ON p.suppiler_id = s.id
            JOIN users u ON p.user_id = u.id                        
            ORDER BY p.created_at DESC`
        )                                       
        res.json({
            message: "Data pembelian berhasil diambil",
            data: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan server" });
     }
})
 

export default router;