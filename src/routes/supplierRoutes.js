import express from 'express';
import { pool } from '../config/db.js'


const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM "TokoATK".suppliers ORDER BY id ASC`);
        res.json(result.rows)
    } catch (error) {
        console.log("ERROR BY SERVER", error);
        return res.status(500).json({
            massage: 'error bay server yau try look your  code',
            error: error.massage
        })
        
    }
})


export default router