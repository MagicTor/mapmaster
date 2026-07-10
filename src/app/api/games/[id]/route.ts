import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gameId = params.id;

    // In a real implementation, retrieve game state from cache/database
    // For now, return a basic response
    return NextResponse.json({
      gameId,
      status: "active",
      message:
        "Game state is managed client-side during active gameplay. Use /submit to process answers.",
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
