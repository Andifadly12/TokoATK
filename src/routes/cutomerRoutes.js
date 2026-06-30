import express from "express";
import { pool } from "../config/db.js";

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM "TokoATK".customers ORDER BY id ASC`)
    return res.json(result.rows)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

router.post('/', async(req, res)=>{
    try {
        const { name, phone, address } = req.body;

        const result = await pool.query(`INSERT INTO "TokoATK".customers (name, phone, address) VALUES ($1, $2, $3) RETURNING id, name, phone, address, created_at `, [name, phone, address])
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log('ERROR post data', error);
        return res.status(500).json({error: 'iternal server ERROR'})
    }
})

router.put('/:id', async(req, res)=>{
    try {
        const {name, phone, address} = req.body;
        const result= await pool.query(
            `UPDATE "TokoATK".customers SET name=$1, phone=$2, address=$3 WHERE id =$4 RETURNING *`, [name, phone, address, req.params.id]
        )

    res.json(result.rows[0])
    } catch (error) {
console.log('EEROR terjadi kesalahan update ', error);
        return res.status(500).json({ error: 'internal put server' }) 
    }
})



router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(`DELETE FROM "TokoATK".customers WHERE id=$1 RETURNING *`, [req.params.id])
        res.json({
            message: "Customer berhasil dihapus",
            data: result.rows[0],
        })
    } catch (error) {
        console.log('ERROR ini server erro tolong periksa ', error)
        return res.status(500).json({error:'terjadi kesalahan pda server'})
    }
})


router.delete('/:id', async(req, res)=>{

})
export default router