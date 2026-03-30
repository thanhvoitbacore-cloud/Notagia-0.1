import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { noteId } = body;

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note || note.userId !== session.userId) {
      return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
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
Return ONLY a valid JSON object without any backticks, markdown wrapping, or extra text.

Example JSON output structure:
{
  "test_title": "Understanding Photosynthesis",
  "questions": [
    {
      "question_text": "What is the primary function of chlorophyll?",
      "options": ["To absorb water", "To absorb light", "To release oxygen", "To store glucose"],
      "correct_answer_id": "B",
      "explanation": "Chlorophyll is the green pigment in plants responsible for absorbing light energy to drive the process of photosynthesis."
    }
  ]
}

NOTE CONTENT:
${note.title}
${note.content}
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

    // Save the Test, Questions, and Options inside a transaction
    const test = await prisma.$transaction(async (tx: any) => {
      const newTest = await tx.test.create({
        data: {
          title: parsedJson.test_title,
          noteId: note.id,
          userId: session.userId,
          isPublic: false,
        },
      });

      for (const q of parsedJson.questions) {
        const newQuestion = await tx.question.create({
          data: {
            testId: newTest.id,
            questionText: q.question_text,
            correctAnswerId: "temp",
            explanation: q.explanation || "No explanation provided.",
          },
        });

        const letterMap = ["A", "B", "C", "D"];
        const optionPromises = (q.options as string[]).map((optText, index) => {
          return tx.option.create({
            data: {
              id: `${newQuestion.id}-${letterMap[index]}`,
              questionId: newQuestion.id,
              optionText: String(optText),
            },
          });
        });

        await Promise.all(optionPromises);

        // Update correct answer reference to match the generated ID
        await tx.question.update({
          where: { id: newQuestion.id },
          data: { correctAnswerId: `${newQuestion.id}-${q.correct_answer_id}` },
        });
      }
      return newTest;
    }, {
      maxWait: 5000,
      timeout: 20000,
    });

    return NextResponse.json({ success: true, testId: test.id });
  } catch (error: any) {
    console.error("Generate Test Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
