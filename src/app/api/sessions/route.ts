import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { swipeSessions, swipes } from "@/db/schema";
import { eq } from "drizzle-orm";

// Create a new swipe session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { genreId, genreName } = body;

    if (!genreId || !genreName) {
      return NextResponse.json(
        { error: "genreId and genreName are required" },
        { status: 400 }
      );
    }

    const [session] = await db
      .insert(swipeSessions)
      .values({ genreId, genreName })
      .returning();

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
