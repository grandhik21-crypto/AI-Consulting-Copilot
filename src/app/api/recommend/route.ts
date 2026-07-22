import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { swipeSessions, swipes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface MovieData {
  id: number;
  title: string;
  year: string;
  overview: string;
  poster: string;
  backdrop: string;
  rating: number;
  voteCount: number;
  reviews: { author: string; content: string; rating: number | null }[];
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id is required" },
      { status: 400 }
    );
  }

  try {
    // Get all liked movies for this session
    const likedSwipes = await db
      .select()
      .from(swipes)
      .where(and(eq(swipes.sessionId, sessionId), eq(swipes.liked, true)));

    if (likedSwipes.length === 0) {
      return NextResponse.json({
        recommendation: null,
        message: "No liked movies found. Try swiping right on some movies!",
      });
    }

    // Score each liked movie based on rating and vote count
    // Pick the one with the highest combined score
    let bestMovie: MovieData | null = null;
    let bestScore = -1;

    for (const swipe of likedSwipes) {
      const movieData = swipe.movieData as MovieData | null;
      if (!movieData) continue;

      // Score = rating * log(voteCount) for balanced popularity + quality
      const score =
        (movieData.rating || 0) * Math.log10(Math.max(movieData.voteCount || 1, 1));

      if (score > bestScore) {
        bestScore = score;
        bestMovie = movieData;
      }
    }

    if (!bestMovie) {
      // Fallback: just pick the first liked movie
      const fallback = likedSwipes[0];
      bestMovie = (fallback.movieData as MovieData) || {
        id: fallback.movieId,
        title: fallback.movieTitle,
        year: "N/A",
        overview: "",
        poster: "",
        backdrop: "",
        rating: 0,
        voteCount: 0,
        reviews: [],
      };
    }

    // Update session with recommendation
    await db
      .update(swipeSessions)
      .set({
        recommendedMovieId: bestMovie.id,
        recommendedMovieTitle: bestMovie.title,
      })
      .where(eq(swipeSessions.id, sessionId));

    return NextResponse.json({
      recommendation: bestMovie,
      totalLiked: likedSwipes.length,
      totalSwiped: likedSwipes.length, // will be replaced with actual count
    });
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
