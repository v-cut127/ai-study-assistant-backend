const express = require("express");
const auth = require("../middleware/auth");
const { generateText } = require("../lib/ollama");
const supabase = require("../supabase");

const router = express.Router();


const{
    cleanJson, 
    safeJsonParse,
    normalizeSummary,
} = require("../utils/aiFormatter");



/* -------------------- SUMMARIZE -------------------- */
router.post("/summarize", auth, async (req, res) => {
  const { content , documentId} = req.body;

  const prompt = `
You are an elite study assistant and master of concise explanation. Your job is to transform any content into a summary so clear and insightful that a student feels like they finally *get it* — not just that they've read it.

Follow these principles:

1. **Lead with the core idea.** Open with one sentence that captures the single most important takeaway. If someone reads nothing else, they should walk away with this.

2. **Structure for the brain.** Use short paragraphs or bullets to separate distinct ideas. Never let two unrelated concepts share a sentence. White space is clarity.

3. **Replace jargon with intuition.** When a technical term appears, immediately follow it with a plain-language explanation in parentheses or an analogy. Assume the reader is smart but new to this topic.

4. **Use analogies generously.** Anchor abstract ideas to things people already understand. A good analogy is worth a paragraph of definition.

5. **Highlight what's surprising or counterintuitive.** Students remember what surprises them. If there's a "wait, really?" moment in the content — surface it explicitly.

6. **End with so what.** Close with 1–2 sentences on why this matters or how it connects to a bigger picture. Give the student a reason to care.

Keep summaries concise but never shallow. Dense content deserves depth; simple content deserves brevity. Always match the length to what the content actually requires — no padding, no cutting corners.

TEXT:
${content}
`;

  try {
    const raw = await generateText(prompt);
    const result = normalizeSummary(raw);

    const { data, error } = await supabase
      .from("summaries")
      .insert([
        {
          document_id: documentId,
          content: result,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ error });
    }

    res.json({
      summary: result,
      saved: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

/* -------------------- FLASHCARDS -------------------- */
router.post("/flashcards", auth, async (req, res) => {
  const { content , documentId} = req.body;

  const prompt = `
You are a world-class educator and spaced-repetition expert who designs flashcards used by medical students, bar exam takers, and language learners to pass high-stakes tests.

Your flashcards are legendary because you follow these rules without exception:

**Card Design Rules:**
1. **One idea per card. Always.**
2. **Questions must be surgical.**
3. **Answers must be the minimum viable truth.**
4. **Write questions forward AND backward when it matters.**
5. **Surface the why, not just the what.**
6. **Flag tricky cards.**

Return ONLY a valid JSON array. No markdown, no explanation, no wrapper text.

Format:
[
  {
    "question": "...",
    "answer": "...",
    "hint": "optional one-word memory hook or mnemonic"
  }
]

TEXT:
${content}
`;

  try {
    const raw = await generateText(prompt);

    const flashcards =
        safeJsonParse(raw) || cleanJson(raw);

    const { data, error } = await supabase
      .from("flashcards")
      .insert([
        {
            document_id: documentId,
          cards: flashcards,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ error });
    }

    res.json({
      flashcards: flashcards,
      saved: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* -------------------- QUIZ -------------------- */
router.post("/quiz", auth, async (req, res) => {
  const { content , documentId} = req.body;

  const prompt = `
You are a psychometrician — a specialist in designing tests that accurately measure understanding, not just memorization.

**Question Design Rules:**
1. Test understanding, not recall.
2. Every wrong answer must be plausible.
3. Never repeat wording in correct answer.
4. Vary difficulty (30% easy, 50% medium, 20% hard).
5. Explain correct answer.
6. 4 options per question (A, B, C, D).

Return ONLY a valid JSON array. No markdown, no explanation, no wrapper text.

Format:
[
  {
    "question": "...",
    "options": {
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    },
    "correct": "A",
    "explanation": "..."
  }
]

TEXT:
${content}
`;

  try {
    const raw = await generateText(prompt);

    const quiz =
        safeJsonParse(raw) || cleanJson(raw);

    const { data, error } = await supabase
      .from("quizzes")
      .insert([
        {
          document_id: documentId,
          questions: quiz,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ error });
    }

    res.json({
      quiz: quiz,
      saved: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;