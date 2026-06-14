import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { businessName, category, description, stars } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    
    // If user hasn't set their API key yet, use a smart fallback
    if (!apiKey || apiKey.includes("your-api-key")) {
      const bizContext = category ? category : "business";
      const descContext = description ? ` Their ${description.toLowerCase()} really stood out.` : "";
      return NextResponse.json({ 
        review: `I had an amazing experience at ${businessName}! The service at this ${bizContext} was top-notch.${descContext} Highly recommend to anyone in the area. ${stars}/5!` 
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a customer writing a realistic, authentic Google review. Keep it under 3 sentences. Sound like a real human. Do not use robotic language."
          },
          {
            role: "user",
            content: `Write a ${stars}-star review for a business named "${businessName}". Category: ${category || 'Business'}. Description: ${description || 'N/A'}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const review = data.choices[0].message.content.replace(/^["']|["']$/g, '');

    return NextResponse.json({ review });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ error: "Failed to generate review" }, { status: 500 });
  }
}
