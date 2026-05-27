const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("AI Study Assistant API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const authRoutes = require("./routes/auth");

app.use("/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running");
});

const documentRoutes = require("./routes/documents");

app.use("/documents", documentRoutes);

const aiRoutes = require("./routes/ai");

app.use("/ai", aiRoutes);