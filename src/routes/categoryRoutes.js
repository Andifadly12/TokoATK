import express from "express";
import { pool } from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js"
import roleMiddleware  from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get('/',authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM "TokoATK".categories ORDER BY id ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/',authMiddleware, roleMiddleware("admin"), async (req, res)=>{
    
    try {
        const {name}= req.body;
        const result = await pool.query(
            `INSERT INTO "TokoATK".categories (name) VALUES ($1) RETURNING id, name, created_at`,
            [name]
        );
         res.status(201).json(result.rows[0]);
    }catch(error){
        console.error('ERROR adding category:', error);
        res.status(500).json({error:'internalserver error'});
    }
})


router.put('/:id',authMiddleware, roleMiddleware("admin"), async (req, res)=>{
    try{
        const {name}= req.body;
        const result= await pool.query(`UPDATE "TokoATK".categories SET name = $1 WHERE id = $2 RETURNING *`, [name, req.params.id])
        res.json(result.rows[0])
    }catch(error){
        console.error('ERROR updating category:', error);
      return  res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:id',authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM "TokoATK".categories WHERE id = $1 RETURNING id, name`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted', category: result.rows[0] });
    } catch (error) {
        console.error('ERROR deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;