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


router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM "TokoATK".suppliers WHERE id=$1`, [req.params.id])
        res.status(200).json(result.rows[0])
    } catch (error) {
        console.log('ERROR gagarl mengambil suplaier', error);
        return res.status(500).json({
            massage:'gagal temukan suplaer'
        })
    }
})


export default router