import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { region: string } }
) {
  try {
    const { region } = params;
    const decodedRegion = decodeURIComponent(region);

    // Validate region
    const validRegions = [
      "North America",
      "South America",
      "Asia",
      "Europe",
      "Oceania",
      "Africa",
      "World",
    ];

    if (!validRegions.includes(decodedRegion)) {
      return NextResponse.json(
        { error: "Invalid region" },
        { status: 400 }
      );
    }

    // Get all countries in region
    const countries = await prisma.country.findMany({
      where: { region: decodedRegion },
      select: {
        id: true,
        name: true,
        capital: true,
        iso2: true,
        iso3: true,
        flagUrl: true,
        svgPath: true,
        region: true,
      },
      orderBy: { name: "asc" },
    });

    if (countries.length === 0) {
      return NextResponse.json(
        { error: `No countries found for region: ${decodedRegion}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      region: decodedRegion,
      count: countries.length,
      countries,
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
