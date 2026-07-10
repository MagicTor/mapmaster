import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.userId;
    const region = req.nextUrl.searchParams.get("region");
    const combo = req.nextUrl.searchParams.get("combo");

    // Get user
    const user = await prisma.user.findFirst({
      where: { clerkId: targetUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all challenge results for this user
    const allResults = await prisma.challengeResult.findMany({
      where: { userId: user.id, successful: true },
      orderBy: { completedAt: "desc" },
    });

    // If region and combo specified, get stats for that combo
    if (region && combo) {
      const questionTypes = combo.split("-");
      const questionTypesJson = JSON.stringify(questionTypes);

      const comboResults = allResults.filter(
        (r) => r.region === region && r.questionTypes === questionTypesJson
      );

      if (comboResults.length === 0) {
        return NextResponse.json({
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
          },
          region,
          questionTypes,
          stats: null,
          message: "No completions for this combination",
        });
      }

      // Get best result (highest lives, lowest incorrect guesses, earliest time)
      const bestResult = comboResults[0];

      // Get monthly stats for current month
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const monthlyResults = comboResults.filter((r) => {
        const date = new Date(r.completedAt);
        return (
          date.getMonth() + 1 === currentMonth &&
          date.getFullYear() === currentYear
        );
      });

      const lastCompletion = monthlyResults[0];

      return NextResponse.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
        },
        region,
        questionTypes,
        currentMonth,
        currentYear,
        stats: {
          totalCompletions: comboResults.length,
          monthlyCompletions: monthlyResults.length,
          bestResult: {
            livesRemaining: bestResult.livesRemaining,
            incorrectGuesses: bestResult.incorrectGuesses,
            completedAt: bestResult.completedAt,
          },
          lastCompletion: lastCompletion ? {
            livesRemaining: lastCompletion.livesRemaining,
            incorrectGuesses: lastCompletion.incorrectGuesses,
            completedAt: lastCompletion.completedAt,
          } : null,
        },
      });
    }

    // Return overall user stats (all regions/combos)
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
      stats: {
        totalChallengesCompleted: allResults.length,
        averageLivesRemaining:
          allResults.length > 0
            ? (allResults.reduce((sum, r) => sum + r.livesRemaining, 0) /
                allResults.length).toFixed(2)
            : 0,
        averageIncorrectGuesses:
          allResults.length > 0
            ? (allResults.reduce((sum, r) => sum + r.incorrectGuesses, 0) /
                allResults.length).toFixed(2)
            : 0,
        bestPerformance: {
          livesRemaining: allResults[0]?.livesRemaining,
          incorrectGuesses: allResults[0]?.incorrectGuesses,
          completedAt: allResults[0]?.completedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
