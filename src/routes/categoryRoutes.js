import express from "express";
import { pool } from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        description,
        status,
        total_products,
        created_at
      FROM "TokoATK".categories
      ORDER BY id ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ERROR fetching categories:", error.message);

    res.status(500).json({
      message: "Gagal mengambil data kategori",
      error: error.message,
    });
  }
});

router.post("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const { name, description, status, total_products } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Nama kategori wajib diisi",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO "TokoATK".categories
      (
        name,
        description,
        status,
        total_products
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        description,
        status,
        total_products,
        created_at
      `,
      [
        name.trim(),
        description || "",
        status || "active",
        Number(total_products || 0),
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("ERROR adding category:", error.message);

    res.status(500).json({
      message: "Gagal menambah kategori",
      error: error.message,
    });
  }
});

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { name, description, status, total_products } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          message: "Nama kategori wajib diisi",
        });
      }

      const result = await pool.query(
        `
      UPDATE "TokoATK".categories
      SET
        name = $1,
        description = $2,
        status = $3,
        total_products = $4
      WHERE id = $5
      RETURNING
        id,
        name,
        description,
        status,
        total_products,
        created_at
      `,
        [
          name.trim(),
          description || "",
          status || "active",
          Number(total_products || 0),
          req.params.id,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Kategori tidak ditemukan",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("ERROR updating category:", error.message);

      res.status(500).json({
        message: "Gagal update kategori",
        error: error.message,
      });
    }
  },
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        DELETE FROM "TokoATK".categories
        WHERE id = $1
        RETURNING
          id,
          name,
          description,
          status,
          total_products,
          created_at
        `,
        [req.params.id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Kategori tidak ditemukan",
        });
      }

      res.json({
        message: "Kategori berhasil dihapus",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("ERROR deleting category:", error.message);

      res.status(500).json({
        message: "Gagal hapus kategori",
        error: error.message,
      });
    }
  },
);

export default router;
