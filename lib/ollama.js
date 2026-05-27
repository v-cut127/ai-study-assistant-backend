const OLLAMA_URL = "http://localhost:11434/api/generate";

async function generateText(prompt) {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tinyllama",
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  return data.response;
}

module.exports = { generateText };