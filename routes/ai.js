const express = require("express");
const auth = require("../middleware/auth");
const { generateText } = require("../lib/ollama");
const supabase = require("../supabase");

const router = express.Router();

const {
  cleanJson,
  safeJsonParse,
  normalizeSummary,
} = require("../utils/aiFormatter");

/* -------------------- SUMMARIZE -------------------- */
router.post("/summarize", auth, async (req, res) => {
  const { content, documentId } = req.body;

  const prompt = `
You are an elite study assistant and master of concise explanation. Your job is to transform any content into a summary so clear and insightful that a student feels like they finally *get it* — not just that they've read it.

Follow these principles:

1. Lead with the core idea.
2. Structure for the brain.
3. Replace jargon with intuition.
4. Use analogies generously.
5. Highlight surprising ideas.
6. End with why it matters.

TEXT:
${content}
`;

  try {
    const rawSummary = await generateText(prompt);

    const result = normalizeSummary(rawSummary);

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
    res.status(500).json({
      error: err.message,
    });
  }
});

/* -------------------- FLASHCARDS -------------------- */
router.post("/flashcards", auth, async (req, res) => {
  const { content, documentId } = req.body;

  const prompt = `
You are a world-class educator and spaced-repetition expert.

Return ONLY a valid JSON array.

Format:
[
  {
    "question": "...",
    "answer": "...",
    "hint": "..."
  }
]

TEXT:
${content}
`;

  try {
    const rawFlashcards = await generateText(prompt);

    const flashcards =
      safeJsonParse(rawFlashcards) ||
      cleanJson(rawFlashcards);

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
      flashcards,
      saved: data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* -------------------- QUIZ -------------------- */
router.post("/quiz", auth, async (req, res) => {
  const { content, documentId } = req.body;

  const prompt = `
You are a psychometrician.

Create a multiple choice quiz.

Return ONLY a valid JSON array.

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
    const rawQuiz = await generateText(prompt);

    const quiz =
      safeJsonParse(rawQuiz) ||
      cleanJson(rawQuiz);

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
      quiz,
      saved: data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* -------------------- STUDY WORKFLOW -------------------- */
router.post("/study/:documentId", auth, async (req, res) => {
  const { documentId } = req.params;

  try {
    /* ---------------- GET DOCUMENT ---------------- */

    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return res.status(404).json({
        error: "Document not found",
      });
    }

    const content = document.content;

    /* ---------------- SUMMARY ---------------- */

    const summaryPrompt = `
Summarize this text clearly for a student.

TEXT:
${content}
`;

    const rawSummary = await generateText(summaryPrompt);

    const summary = normalizeSummary(rawSummary);

    const { data: savedSummary, error: summaryError } =
      await supabase
        .from("summaries")
        .insert([
          {
            document_id: documentId,
            content: summary,
          },
        ])
        .select()
        .single();

    if (summaryError) {
      return res.status(500).json({
        error: summaryError.message,
      });
    }

    /* ---------------- FLASHCARDS ---------------- */

    const flashPrompt = `
Create flashcards from this text.

Return ONLY a valid JSON array.

Format:
[
  {
    "question": "...",
    "answer": "...",
    "hint": "..."
  }
]

TEXT:
${content}
`;

    const rawFlashcards = await generateText(flashPrompt);

    const flashcards =
      safeJsonParse(rawFlashcards) ||
      cleanJson(rawFlashcards);

    const { data: savedFlashcards, error: flashError } =
      await supabase
        .from("flashcards")
        .insert([
          {
            document_id: documentId,
            cards: flashcards,
          },
        ])
        .select()
        .single();

    if (flashError) {
      return res.status(500).json({
        error: flashError.message,
      });
    }

    /* ---------------- QUIZ ---------------- */

    const quizPrompt = `
Create a multiple choice quiz from this text.

Return ONLY a valid JSON array.

TEXT:
${content}
`;

    const rawQuiz = await generateText(quizPrompt);

    const quiz =
      safeJsonParse(rawQuiz) ||
      cleanJson(rawQuiz);

    const { data: savedQuiz, error: quizError } =
      await supabase
        .from("quizzes")
        .insert([
          {
            document_id: documentId,
            questions: quiz,
          },
        ])
        .select()
        .single();

    if (quizError) {
      return res.status(500).json({
        error: quizError.message,
      });
    }

    /* ---------------- RESPONSE ---------------- */

    res.json({
      success: true,
      studyPack: {
        document,
        summary: savedSummary,
        flashcards: savedFlashcards,
        quiz: savedQuiz,
      },
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;