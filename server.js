import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/match", async (req, res) => {
  const { textA, textB } = req.body;

  const prompt = `
Compare these two lost-and-found item descriptions.
Return ONLY a number between 0 and 1 indicating how similar they are.

A: ${textA}
B: ${textB}
`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  const score = parseFloat(
    data.candidates?.[0]?.content?.parts?.[0]?.text || "0"
  );

  res.json({ score });
});

app.listen(3000, () => {
  console.log("Gemini server running on http://localhost:3000");
});
