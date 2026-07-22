import { NextResponse } from "next/server";
import { getGenres } from "@/lib/tmdb";

// Hardcoded fallback genres in case TMDB_API_KEY is not set
const FALLBACK_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export async function GET() {
  try {
    const genres = await getGenres();
    return NextResponse.json({ genres });
  } catch {
    // Return fallback genres if TMDB is unavailable
    return NextResponse.json({ genres: FALLBACK_GENRES });
  }
}
