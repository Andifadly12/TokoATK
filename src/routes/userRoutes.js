import express from "express";
import {pool} from "../config/db.js";
import bcrypt from "bcrypt";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get('/',authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try{
        const result= await pool.query(
            `SELECT id, name, email, role, created_at from "TokoATK".users ORDER BY id ASC`
        );
        res.json(result.rows)

    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil data users",
            error: error.message,
        }); 
    }

})

router.get('/:id', async (req, res)=>{
    try{
        const result = await pool.query(
            `SELECT id, name, email, role, created_at FROM "TokoATK".users WHERE id = $1`,
            [req.params.id]
        );
      if (result.rows.length==0){
       return res.status(404).json({
            message: "User tidak ditemukan",
        });
      }
      res.json(result.rows[0]);
    }catch (error) {
        res.status(500).json({
            message: "Gagal mengambil data user",
            error: error.message,
        });
    }
})


// router.post("/", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     if (!name || !email || !password || !role) {
//       return res.status(400).json({
//         message: "name, email, password, dan role wajib diisi",
//       });
//     }

//     const result = await pool.query(
//       `INSERT INTO "TokoATK".users
//        VALUES ($1, $2, $3, $4)
//        RETURNING id, name, email, role, created_at`,
//       [name, email, password, role]
//     );

//     return res.status(201).json({
//       message: "User berhasil ditambahkan",
//       data: result.rows[0],
//     });
//   } catch (error) {
//     console.error("ERROR tambah user:", error);

//     return res.status(500).json({
//       message: "Gagal menambahkan user",
//       error: error.message,
//     });
//   }
// });

router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, dan password wajib diisi",
      });
    }

    const result = await pool.query(`
      
      INSERT INTO "TokoATK".users
      (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
      `,
      [name, email, hashedPassword, role || "kasir"]
    );

    res.status(201).json({
      message: "User berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    console.log("ERROR tambah user:", error);

    res.status(500).json({
      message: "Gagal tambah user",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const result = await pool.query(
      `
      UPDATE "TokoATK".users
      SET name = $1,
          email = $2,
          role = $3
      WHERE id = $4
      RETURNING id, name, email, role, created_at
      `,
      [name, email, role, req.params.id]
    );
      res.json({
          massage: "usar berhasil di udate",
          data:   result.rows[0]
    })
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Gagal update user",
error: error.message,
    });
  }
});


router.delete('/:id', async (req, res)=>{
    try{
        const result = await pool.query(
            `DELETE FROM "TokoATK".users WHERE id=$1 RETURNING id, name, email, role, created_at`,
            [req.params.id]
        );
        if (result.rows.length==0){
            return res.status(404).json({
                message: "User tidak ditemukan",
            });
        }
        res.json({
            message: "User berhasil dihapus",
            user: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal menghapus user",
            error: error.message,
        });
    }
})
export default router;