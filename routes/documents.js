const express = require("express");
const supabase = require("../supabase");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
    const {title, content} = req.body;

    const {data, error} = await supabase
        .from("documents")
        .insert([
            {
            title, 
            content, 
            user_id: req.user.id,
        },
        ]).select();

    if(error) return res.status(400).json(error);

    res.json(data);
});

router.get("/", auth, async (req, res) => {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", req.user.id);

  if (error) return res.status(400).json(error);

  res.json(data);
});

module.exports = router;