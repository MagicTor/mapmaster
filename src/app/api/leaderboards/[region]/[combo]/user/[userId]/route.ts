import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { region: string; combo: string; userId: string } }
) {
  try {
    const { region, combo, userId } = params;
    const month = req.nextUrl.searchParams.get("month") || new Date().getMonth() + 1;
    const year = req.nextUrl.searchParams.get("year") || new Date().getFullYear();

    // Validate inputs
    const validRegions = [
      "North America",
      "South America",
      "Asia",
      "Europe",
      "Oceania",
      "Africa",
      "World",
    ];

    if (!validRegions.includes(decodeURIComponent(region))) {
      return NextResponse.json(
        { error: "Invalid region" },
        { status: 400 }
      );
    }

    // Parse question types from combo
    const questionTypes = combo.split("-");
    const questionTypesJson = JSON.stringify(questionTypes);

    // Get all results for this region/combo/month/year
    const allResults = await prisma.challengeResult.findMany({
      where: {
        region: decodeURIComponent(region),
        questionTypes: questionTypesJson,
        successful: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: [
        { livesRemaining: "desc" },
        { incorrectGuesses: "asc" },
        { completedAt: "asc" },
      ],
    });

    // Filter by month/year
    const filteredResults = allResults.filter((r) => {
      const completedDate = new Date(r.completedAt);
      return (
        completedDate.getMonth() + 1 === parseInt(month as string) &&
        completedDate.getFullYear() === parseInt(year as string)
      );
    });

    // Find user's best result for this month
    const userBestResult = filteredResults.find((r) => r.userId === userId);

    if (!userBestResult) {
      return NextResponse.json(
        { error: "No completions found for this user in this period" },
        { status: 404 }
      );
    }

    // Calculate user's rank
    const userRank =
      filteredResults.findIndex((r) => r.userId === userId) + 1;

    return NextResponse.json({
      region: decodeURIComponent(region),
      questionTypes,
      month: parseInt(month as string),
      year: parseInt(year as string),
      user: {
        id: userId,
        username: userBestResult.user.username || "Anonymous",
        displayName: userBestResult.user.displayName,
      },
      rank: userRank,
      totalPlayers: filteredResults.length,
      stats: {
        livesRemaining: userBestResult.livesRemaining,
        incorrectGuesses: userBestResult.incorrectGuesses,
        completedAt: userBestResult.completedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user ranking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
