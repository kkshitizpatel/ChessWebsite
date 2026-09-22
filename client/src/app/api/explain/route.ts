import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pgn, selectedMoves, language, model } = await req.json();
    const lang = language || "English";
    const aiModel = model || "Gemini Flash";

    // ── Build the AI prompt ──
    const prompt = `You are an expert chess coach. Analyze the following chess moves and explain them clearly in ${lang}.

Game PGN: ${pgn}
Moves to focus on: ${selectedMoves}

Please explain:
1. The tactical or strategic idea behind each selected move
2. Why it is good or bad
3. What the best alternative would have been (if applicable)
4. Any patterns or concepts a player should learn from this

Respond entirely in ${lang}. Be detailed but easy to understand.`;

    if (aiModel === "Llama 3") {
      // ── Call Groq API for Llama 3 ──
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1024
          })
        });
        const groqData = await groqRes.json();
        const explanation = groqData?.choices?.[0]?.message?.content;
        if (explanation) return NextResponse.json({ explanation });
      } else {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return NextResponse.json({
          explanation: `[${lang} — Mock Llama 3]\n\nAnalysis for: ${selectedMoves}\n\nTo get real Llama 3 explanations, please add your GROQ_API_KEY to the .env.local file:\n\nGROQ_API_KEY=your_key_here\n\nGet a free key at: https://console.groq.com`
        });
      }
    } else {
      // ── Call Gemini API ──
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            }),
          }
        );
        const geminiData = await geminiRes.json();
        const explanation = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (explanation) return NextResponse.json({ explanation });
      } else {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return NextResponse.json({
          explanation: `[${lang} — Mock Gemini]\n\nAnalysis for: ${selectedMoves}\n\nTo get real Gemini explanations, please add your GEMINI_API_KEY to the .env.local file:\n\nGEMINI_API_KEY=your_key_here\n\nGet a free key at: https://aistudio.google.com`
        });
      }
    }

  } catch (e) {
    return NextResponse.json({ error: "Failed to parse request" }, { status: 400 });
  }
}
