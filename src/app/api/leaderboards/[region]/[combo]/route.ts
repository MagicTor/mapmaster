import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { region: string; combo: string } }
) {
  try {
    const { region, combo } = params;
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

    // Parse question types from combo (e.g., "countries-capitals-flags")
    const questionTypes = combo.split("-");
    const questionTypesJson = JSON.stringify(questionTypes);

    // Query leaderboard for this month/year/region/combo
    const results = await prisma.challengeResult.findMany({
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
            avatar: true,
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
    const filteredResults = results.filter((r) => {
      const completedDate = new Date(r.completedAt);
      return (
        completedDate.getMonth() + 1 === parseInt(month as string) &&
        completedDate.getFullYear() === parseInt(year as string)
      );
    });

    // Add rankings
    const leaderboard = filteredResults.map((result, index) => ({
      rank: index + 1,
      player: {
        id: result.user.id,
        username: result.user.username || "Anonymous",
        displayName: result.user.displayName,
        avatar: result.user.avatar,
      },
      livesRemaining: result.livesRemaining,
      incorrectGuesses: result.incorrectGuesses,
      completedAt: result.completedAt,
    }));

    return NextResponse.json({
      region: decodeURIComponent(region),
      questionTypes,
      month: parseInt(month as string),
      year: parseInt(year as string),
      totalPlayers: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
