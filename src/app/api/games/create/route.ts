import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createGameSchema = z.object({
  region: z.enum([
    "North America",
    "South America",
    "Asia",
    "Europe",
    "Oceania",
    "Africa",
    "World",
  ]),
  questionTypes: z.array(z.enum(["countries", "capitals", "flags"])).min(1),
  mode: z.enum(["practice", "challenge"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { region, questionTypes, mode } = createGameSchema.parse(body);

    // Get all countries in the region
    const countries = await prisma.country.findMany({
      where: { region },
      select: { id: true, name: true, capital: true, region: true },
    });

    if (countries.length === 0) {
      return NextResponse.json(
        { error: `No countries found for region: ${region}` },
        { status: 404 }
      );
    }

    // Shuffle countries
    const shuffledCountries = [...countries].sort(() => Math.random() - 0.5);

    // Generate a unique game session ID
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return game setup with country list
    return NextResponse.json(
      {
        gameId,
        region,
        mode,
        questionTypes,
        totalCountries: countries.length,
        countries: shuffledCountries,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating game:", error);
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
