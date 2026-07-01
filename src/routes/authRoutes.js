import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { authMiddleware } from "../middelware/authMiddelware.js"

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, dan password wajib diisi",
      });
    }

    const checkEmail = await pool.query(
      `
      SELECT id, email
      FROM "TokoATK".users
      WHERE email = $1
      `,
      [email]
    );

    if (checkEmail.rows.length > 0) {
      return res.status(400).json({
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO "TokoATK".users
      (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
      `,
      [name, email, hashedPassword, role || "kasir"]
    );

    res.status(201).json({
      message: "Register berhasil",
      data: result.rows[0],
    });
  } catch (error) {
    console.log("ERROR REGISTER:", error.message);

    res.status(500).json({
      message: "Gagal register",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    const result = await pool.query(
      `
      SELECT id, name, email, password, role
      FROM "TokoATK".users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("ERROR LOGIN:", error.message);

    res.status(500).json({
      message: "Gagal login",
      error: error.message,
    });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  res.json({
    message: "Berhasil mengambil profile",
    user: req.user,
  });
});

export default router;