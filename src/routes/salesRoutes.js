
import express from "express";
import { pool } from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";   

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM "TokoATK".sales ORDER BY id ASC`)
        return res.json(result.rows)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})


router.get('/:id', authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM "TokoATK".sales WHERE id = $1`, [req.params.id])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sale not found' })
        }
        return res.json(result.rows[0])
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})


router.post('/', authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
    try {
        const { invoice_number,
            user_id, customer_id,
            total_amount,
            paid_amount,
            change_amount,
            payment_method } = req.body;
        const result = await pool.query(`INSERT INTO "TokoATK".sales 
            (invoice_number, user_id, customer_id, total_amount, paid_amount, change_amount, payment_method)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [invoice_number,
                user_id, customer_id,
                total_amount, paid_amount,
                change_amount,
                payment_method])
        return res.status(201).json(result.rows[0])
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})
 

router.put('/:id', authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
    try {
        const { invoice_number,
            user_id, customer_id,
            total_amount, paid_amount,
            change_amount, payment_method } = req.body;
        const result = await pool.query(`UPDATE "TokoATK".sales
            SET invoice_number = $1,
                user_id = $2,
                customer_id = $3,
                total_amount = $4,
                paid_amount = $5,
                change_amount = $6,
                payment_method = $7
            WHERE id = $8 RETURNING *`,
            [invoice_number,
                user_id, customer_id,
                total_amount, paid_amount,
                change_amount,
                payment_method,
                req.params.id])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sale not found' })
        }
        return res.json(result.rows[0])
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})


router.delete('/:id', authMiddleware, roleMiddleware("admin", "kasir"), async (req, res) => {
    try {
        const result = await pool.query(`DELETE FROM "TokoATK".sales WHERE id = $1 RETURNING *`, [req.params.id])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sale not found' })
        }
        return res.json({ message: 'Sale deleted successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})


export default router