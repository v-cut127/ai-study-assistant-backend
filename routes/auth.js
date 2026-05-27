const express = require("express");
const supabase = require("../supabase");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("BODY:", req.body);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.log("SUPABASE ERROR:", error);
      return res.status(400).json(error);
    }

    res.json(data);
  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json(err.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("BODY:", req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("SUPABASE ERROR:", error);
      return res.status(400).json(error);
    }

    res.json(data);
  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json(err.message);
  }
});

module.exports = router;