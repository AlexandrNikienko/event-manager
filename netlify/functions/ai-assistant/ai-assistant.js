import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY2,
});

export async function handler(event) {
  try {
    const { title, date, type } = JSON.parse(event.body);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are a creative assistant helping the user add events to a personal life calendar.
            Your job is to write a short, warm, and inspiring description (1–2 sentences)
            for each event based on its title, date and type.
            Use a positive and natural tone.
          `,
        },
        {
          role: "user",
          content: `Event title: "${title}"\nDate: ${date || "unspecified"}\nType: ${type}`,
        },
      ],
    });

    const note = response.choices[0].message.content.trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ note }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI generation failed" }),
    };
  }
}

async function handlerrrr(event) {
  try {
    const { title, date } = JSON.parse(event.body);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative assistant. The user is adding an event to a personal life calendar. Generate a short, warm, and inspiring description (1–2 sentences)" },
          { role: "user", content: `Event title: "${title}" Date: ${date || "unspecified"}` },
        ],
      }),
    });

    const data = await response.json();

    return { 
      statusCode: 200, 
      body: JSON.stringify({ text: data.choices?.[0]?.message?.content }) 
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "AI generation failed" }) 
    };
  }
}
