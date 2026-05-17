import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { noteTitle, noteContent } = body;

    if (!noteContent) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured in .env" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
System Instruction: 
Read the provided note content and return a JSON object with 'test_title' (string) and an array of 'questions' (3-10 items). 
Each question must have 'question_text' (string), an array of exactly 4 'options' (string arrays), a 'correct_answer_id' (string) which must be EXACTLY ONE OF: 'A', 'B', 'C', or 'D', and an 'explanation' (string) explaining why the answer is correct based on the text.

CRITICAL LANGUAGE REQUIREMENT: You MUST generate the test (title, questions, options, and explanation) strictly in Vietnamese (Tiếng Việt). However, you MUST keep specific technical terms, keywords, and formulas in their original English form (or whatever original language they are in the note) if they are best understood that way.

Return ONLY a valid JSON object without any backticks, markdown wrapping, or extra text.

Example JSON output structure:
{
  "test_title": "Tìm hiểu về Photosynthesis (Quang hợp)",
  "questions": [
    {
      "question_text": "Chức năng chính của chlorophyll là gì?",
      "options": ["Hấp thụ nước", "Hấp thụ ánh sáng", "Giải phóng oxy", "Lưu trữ glucose"],
      "correct_answer_id": "B",
      "explanation": "Chlorophyll là sắc tố màu xanh lá cây trong thực vật, có chức năng chính là hấp thụ năng lượng ánh sáng để thúc đẩy quá trình photosynthesis."
    }
  ]
}

NOTE CONTENT:
${noteTitle || ""}
${noteContent}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", responseText);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    if (!parsedJson.test_title || !Array.isArray(parsedJson.questions)) {
      return NextResponse.json({ error: "Invalid AI response structure" }, { status: 500 });
    }

    // Return the generated JSON directly to the client
    return NextResponse.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error("Generate Test Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
