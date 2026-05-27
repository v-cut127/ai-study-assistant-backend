const HF_API_URL =
  "https://api-inference.huggingface.co/models/google/flan-t5-base";

async function generateText(prompt) {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
      },
    }),
  });

  const data = await response.json();

  console.log("HF RAW RESPONSE:", JSON.stringify(data, null, 2));

  if (data?.error) {
    throw new Error(data.error);
  }

  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }

  return JSON.stringify(data);
}

module.exports = { generateText };