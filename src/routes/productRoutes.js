import express from 'express'

import { pool } from '../config/db.js'
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


router.get('/',authMiddleware, roleMiddleware("admin","kasir"), async (req, res) => {
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
router.post("/",authMiddleware, roleMiddleware("admin"), async (req, res) => {
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

    res.status(200).json({
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



router.put("/:id",authMiddleware, roleMiddleware("admin"), async (req, res) => {
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
      UPDATE "TokoATK".products
      SET category_id = COALESCE($1, category_id),
          name = COALESCE($2, name),
          sku = COALESCE($3, sku),
          unit = COALESCE($4, unit),
          purchase_price = COALESCE($5, purchase_price),
          selling_price = COALESCE($6, selling_price),
          stock = COALESCE($7, stock)
      WHERE id = $8
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
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Data berhasil diupdate",
      data: result.rows[0],
    });
  } catch (error) {
    console.log("Error server:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        message: "SKU sudah digunakan oleh produk lain",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.delete('/:id',authMiddleware, roleMiddleware("admin"), async(req, res) => {
    try {
        const result = await pool.query(`DELETE FROM "TokoATK".products WHERE id=$1 RETURNING *`, [req.params.id])
         if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Product tidak ditemukan",
        });
      }

      res.json({
        message: "Product berhasil dihapus",
        data: result.rows[0],
      });
    } catch (error) {
          console.log("ERROR this server", error);
        return res.status(500).json({
            massage: 'ERROR a servers',
            error:error.massage
        })
    }
})
export default router