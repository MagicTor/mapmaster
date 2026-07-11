import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const submitAnswerSchema = z.object({
  countryId: z.string().min(2).max(3),
  questionType: z.enum(["countries", "capitals", "flags"]),
  isCorrect: z.boolean(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const body = await req.json();
    const { countryId, questionType, isCorrect } =
      submitAnswerSchema.parse(body);

    // Process the answer submission
    // This endpoint handles each answer during a game
    // It doesn't persist to database yet - that happens on game completion

    return NextResponse.json({
      success: true,
      gameId,
      countryId,
      questionType,
      isCorrect,
      feedback: isCorrect
        ? "Correct! Great job!"
        : "Incorrect. Try another country.",
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
