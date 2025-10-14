import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY2,
});


export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    console.log("AI function input:", body);

    const { title, date } = JSON.parse(event.body);

    const prompt = `
You are a creative assistant. The user is adding an event to a personal life calendar.
Generate a short, warm, and inspiring description (1–2 sentences) for this event:
Event title: "${title}"
Date: ${date || "unspecified"}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0].message.content.trim();

    console.log("AI response:", text);

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    console.error("AI error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI generation failed" }),
    };
  }
}
