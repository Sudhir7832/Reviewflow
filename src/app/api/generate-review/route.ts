import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { businessName, category, description, stars } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    
    // If user hasn't set their API key yet, use a smart fallback
    if (!apiKey || apiKey.includes("your_groq_api_key_here")) {
      const bizContext = category ? category : "business";
      const descContext = description ? ` Their ${description.toLowerCase()} really stood out.` : "";
      
      const fallbackReviews = [
        `I had a great experience at ${businessName}. The service at this ${bizContext} was really good.${descContext} Highly recommend to anyone in the area.`,
        `Really loved my visit to ${businessName}. The staff was incredible and the quality is outstanding.${descContext} Will definitely be coming back soon.`,
        `Great ${bizContext}. ${businessName} exceeded my expectations.${descContext} Definitely recommending it to my friends.`
      ];
      
      return NextResponse.json({ reviews: fallbackReviews });
    }

    const payload = {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a customer writing a realistic, casual Google review. Keep it concise, exactly 1 to 3 sentences maximum. Sound like a real human writing informally online. DO NOT use any exclamation marks or hyphens. Use proper sentence case capitalization (capitalize the first letter of sentences). Keep punctuation very simple."
        },
        {
          role: "user",
          content: `Write a ${stars}-star review for a business named "${businessName}". Category: ${category || 'Business'}. Description: ${description || 'N/A'}.`
        }
      ],
      temperature: 0.8,
      max_tokens: 100
    };

    // Groq doesn't support n>1, but since it's lightning fast, we can run 3 in parallel
    const promises = Array.from({ length: 3 }).map(() =>
      fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      }).then(res => res.json())
    );

    const results = await Promise.all(promises);
    
    if (results[0].error) {
      throw new Error(results[0].error.message);
    }
    
    // Extract the 3 choices and clean up surrounding quotes
    const reviews = results.map((data: any) => 
      data.choices[0].message.content.replace(/^["']|["']$/g, '').trim()
    );

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ error: "Failed to generate review" }, { status: 500 });
  }
}
