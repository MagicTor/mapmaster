import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { countryId: string } }
) {
  try {
    const { countryId } = params;

    // Get country flag
    const country = await prisma.country.findUnique({
      where: { id: countryId.toUpperCase() },
      select: {
        id: true,
        name: true,
        flagUrl: true,
        iso2: true,
      },
    });

    if (!country) {
      return NextResponse.json(
        { error: `Country not found: ${countryId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      countryId: country.id,
      countryName: country.name,
      iso2: country.iso2,
      flagUrl: country.flagUrl || `https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`,
    });
  } catch (error) {
    console.error("Error fetching flag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
