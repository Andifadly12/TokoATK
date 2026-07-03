import express from 'express';
import { pool } from '../config/db.js'
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware  from "../middleware/roleMiddleware.js";

const router = express.Router();


router.get('/',authMiddleware, roleMiddleware("admin"), async (req, res) => {
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


router.get('/:id',authMiddleware, roleMiddleware("admin"), async (req, res) => {
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



router.post('/', authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const {
            name,
            phone,
            address }
            = req.body;
        if (!name) {
      return res.status(400).json({
        message: "Nama supplier wajib diisi",
      });
    }
        const result = await pool.query(`INSERT INTO "TokoATK".suppliers (name, phone, address) VALUES ($1, $2 ,$3) RETURNING *`, [name, phone, address])
        res.status(201).json({
            massage: 'data berhasil ditambah',
            data: result.rows[0]
        })
    } catch (error) {
        console.log("Error data tidak di temuakan", error);
        return res.status(500).json({
            massage: 'error data tidak dapat ditemukan',
            error: error.massage
        })
    }
})



router.put('/:id',authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const {
            name,
            phone,
            address
        }
            = req.body;
        const result = await pool.query(`
            UPDATE "TokoATK".suppliers SET name=$1, phone=$2, address=$3 WHERE id =$4 RETURNING *
            `,
            [name, phone, address, req.params.id]
        );
        res.status(200).json(result.rows[0])
    } catch (error) {
        console.log('data tidak daoat diupdate', error);
        return res.status(500).json({
            massage: 'data tidak dapat di update',
            error:error.massage
        })
    }
})



router.delete('/:id',authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const result = await pool.query(`DELETE FROM "TokoATK".suppliers WHERE id=$1 RETURNING *`, [req.params.id]);
        res.json({
            message: "Customer berhasil dihapus",
            data: result.rows[0],
        })
    } catch (error) {
        console.log("data tidak dapat dihapus", error);
        return res.status(500).json({
            massage: 'data tidak dapat dihapus',
            error: error.massage
        })
    }
})

export default router