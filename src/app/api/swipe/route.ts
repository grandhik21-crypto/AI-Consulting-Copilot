import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { swipeSessions, swipes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// Record a swipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, movieId, movieTitle, liked, movieData } = body;

    if (!sessionId || !movieId || movieTitle === undefined || liked === undefined) {
      return NextResponse.json(
        { error: "sessionId, movieId, movieTitle, and liked are required" },
        { status: 400 }
      );
    }

    // Insert swipe
    await db.insert(swipes).values({
      sessionId,
      movieId,
      movieTitle,
      liked,
      movieData: movieData || null,
    });

    // Update total swipes count
    await db
      .update(swipeSessions)
      .set({ totalSwipes: sql`${swipeSessions.totalSwipes} + 1` })
      .where(eq(swipeSessions.id, sessionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording swipe:", error);
    return NextResponse.json(
      { error: "Failed to record swipe" },
      { status: 500 }
    );
  }
}
