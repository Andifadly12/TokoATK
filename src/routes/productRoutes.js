import express from 'express'

import { pool } from '../config/db.js'


const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM "TokoATK".products ORDER BY id ASC`);
        res.json(result.rows)
    } catch (error) {
        console.log("ERROR DATA SERVER", error);
        return res.status(500).json({
            massage: 'error pada server',
            error: error.massage
        })
    }
})

// router.post('/', async (req, res) => {
//     try {
//         const { category_id, name, sku, unit, purchase_price, selling_price, stock } = req.body;
//         const result = await pool.query(`INSERT INTO "TokoATK".products VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [category_id, name, sku, unit, purchase_price, selling_price, stock]);
//         res.status(201).json({
//             massage: 'data berhasil ditambah',
//             data: result.rows
//         })
//     } catch (error) {
//         console.log('Error whit server ', error);
//         return res.status(500).json({
//             massage: 'server error',
//             error: error.massage
//         })
//     }
// })
router.post("/", async (req, res) => {
  try {
    const {
      category_id,
      name,
      sku,
      unit,
      purchase_price,
      selling_price,
      stock,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO "TokoATK".products
      (category_id, name, sku, unit, purchase_price, selling_price, stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        category_id,
        name,
        sku,
        unit,
        purchase_price,
        selling_price,
        stock,
      ]
    );

    res.status(201).json({
      message: "Data berhasil ditambah",
      data: result.rows[0],
    });
  } catch (error) {
    console.log("Error with server:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});



router.put('/', async (req, res) => {
    try {
        const {
            category_id,
            name,
            sku,
            unit,
            purchase_price,
            selling_price,
            stock
        } = req.body;

        const result = await pool.query(
            `
            UPDATE "TokoATK".products SET
            category_id=$1,
            name=$2,
            sku=$3,
            unit=$4,
            purchase_price=$5,
            selling_price=$6,
            stock=$7 WHERE
            id=$8 RETURNING *
            `, [category_id, name, sku, unit, purchase_price, selling_price, stock, req.params.id])
    } catch (error) {
        console.log('error server bermasalah', error);
        return res.status(500).json({
            massage: 'saat ini ada error pada server',
            error: error.massage
            
        })
    }
})


router.delete('/', async(req, res) => {
    try {
        
    } catch (error) {
          console.log("ERROR this server", error);
        return res.status(500).json({
            massage: 'ERROR a servers',
            error:error.massage
        })
    }
})
export default router