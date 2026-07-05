// import express from "express";
// import dotenv from "dotenv";
// import { pool } from "./config/db.js";
// import userRoutes from "./routes/userRoutes.js";
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 4000;

// app.use(express.json());

// app.use("/", (req, res)=>{
//     res.json({
//         massage: "Selamat datang di API TokoATK",
//         routes: {
//             users: "/users",
//         }
//     })
// })

// app.use("/users", userRoutes);

// app.listen(PORT, () => {
//   console.log(`Server berjalan di http://localhost:${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import customerRoutes from "./routes/cutomerRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import SupplierRoutes from "./routes/supplierRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import salesRoutes from "./routes/salesRoutes.js"
import reporRoutes from "./routes/reportRoutes.js"
import purchasesRoutes from "./routes/purchasesRoutes.js"
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./doc/swagger.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Selamat datang di API TokoATK",
    routes: {
      auth: "/auth",
      users: "/users",
      categories: "/categories",
      customers: "/customers",
      products: "/products",
      suppliers:"/suppliers",
      sales: "/sales",
      repor: "/report",
      purchases: "/purchases"
    },
  });
});
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/suppliers', SupplierRoutes);
app.use('/sales', salesRoutes);
app.use('/report', reporRoutes);
app.use('/purchases', purchasesRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});