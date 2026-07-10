import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const completeGameSchema = z.object({
  region: z.string(),
  questionTypes: z.array(z.enum(["countries", "capitals", "flags"])),
  mode: z.enum(["practice", "challenge"]),
  livesRemaining: z.number().int().min(0).max(3),
  incorrectGuesses: z.number().int().min(0),
  successful: z.boolean(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gameId = params.id;
    const body = await req.json();
    const {
      region,
      questionTypes,
      mode,
      livesRemaining,
      incorrectGuesses,
      successful,
    } = completeGameSchema.parse(body);

    // Only save Challenge mode successful completions
    if (mode === "challenge" && successful) {
      // Get user record first
      const user = await prisma.user.findFirst({
        where: { clerkId: userId },
      });

      if (!user) {
        // Create user if doesn't exist
        await prisma.user.create({
          data: {
            clerkId: userId,
            email: "temp@example.com", // Will be updated by Clerk webhook
          },
        });
      }

      // Save challenge result to leaderboard
      const result = await prisma.challengeResult.create({
        data: {
          userId: user?.id || (await prisma.user.findFirst({ where: { clerkId: userId } }))?.id!,
          region,
          questionTypes: JSON.stringify(questionTypes),
          livesRemaining,
          incorrectGuesses,
          successful: true,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        gameId,
        mode,
        saved: true,
        result: {
          id: result.id,
          region: result.region,
          questionTypes: JSON.parse(result.questionTypes),
          livesRemaining: result.livesRemaining,
          incorrectGuesses: result.incorrectGuesses,
          completedAt: result.completedAt,
        },
      });
    }

    // Practice mode or failed challenge - don't save to database
    return NextResponse.json({
      success: successful,
      gameId,
      mode,
      saved: false,
      message:
        mode === "practice"
          ? "Practice game completed (not saved to leaderboard)"
          : "Challenge failed (not saved to leaderboard)",
    });
  } catch (error) {
    console.error("Error completing game:", error);
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
