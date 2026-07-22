import { NextRequest, NextResponse } from "next/server";
import { getMoviesByGenre, getMovieReviews, posterUrl } from "@/lib/tmdb";

// Demo movies used when no TMDB key is configured
const DEMO_MOVIES = [
  {
    id: 1,
    title: "The Grand Adventure",
    year: "2023",
    overview: "A thrilling journey across uncharted lands filled with danger, discovery, and unexpected friendships.",
    poster: "",
    backdrop: "",
    rating: 8.2,
    voteCount: 4520,
    reviews: [
      { author: "MovieFan42", content: "An absolutely stunning visual experience with a heartfelt story!", rating: 9 },
      { author: "CinemaLover", content: "One of the best adventure films in recent years.", rating: 8 },
    ],
  },
  {
    id: 2,
    title: "Midnight Shadows",
    year: "2024",
    overview: "A detective must unravel a web of secrets in a city where nothing is as it seems.",
    poster: "",
    backdrop: "",
    rating: 7.8,
    voteCount: 3210,
    reviews: [
      { author: "ThrillerBuff", content: "Edge-of-your-seat suspense from start to finish.", rating: 8 },
      { author: "NightOwl", content: "Dark, atmospheric, and brilliantly acted.", rating: 7 },
    ],
  },
  {
    id: 3,
    title: "Love in Paris",
    year: "2023",
    overview: "Two strangers meet on a rainy evening in Paris and discover that fate has more in store for them.",
    poster: "",
    backdrop: "",
    rating: 7.5,
    voteCount: 2890,
    reviews: [
      { author: "RomComQueen", content: "Charming and witty with incredible chemistry between the leads.", rating: 8 },
      { author: "HeartStrings", content: "A beautiful love story that will make you believe in destiny.", rating: 7 },
    ],
  },
  {
    id: 4,
    title: "Galaxy Wardens",
    year: "2024",
    overview: "A ragtag crew of space explorers must save the galaxy from an ancient threat awakening in deep space.",
    poster: "",
    backdrop: "",
    rating: 8.5,
    voteCount: 6780,
    reviews: [
      { author: "SciFiNerd", content: "Epic space opera with incredible world-building and stunning visuals.", rating: 9 },
      { author: "StarGazer", content: "The best sci-fi film since Interstellar.", rating: 9 },
    ],
  },
  {
    id: 5,
    title: "The Last Laugh",
    year: "2023",
    overview: "A retired comedian gets one final shot at the spotlight in this heartwarming comedy-drama.",
    poster: "",
    backdrop: "",
    rating: 7.9,
    voteCount: 3450,
    reviews: [
      { author: "FunnyBone", content: "Hilarious and touching in equal measure. A real gem!", rating: 8 },
      { author: "ComedyCritic", content: "A masterclass in comedic timing with genuine emotional depth.", rating: 8 },
    ],
  },
  {
    id: 6,
    title: "Iron Will",
    year: "2024",
    overview: "Based on true events, a young athlete overcomes impossible odds to compete on the world stage.",
    poster: "",
    backdrop: "",
    rating: 8.1,
    voteCount: 4100,
    reviews: [
      { author: "SportsMovie", content: "Inspiring and beautifully shot. You'll be cheering by the end.", rating: 9 },
      { author: "TrueStoryFan", content: "A powerful reminder of what the human spirit can achieve.", rating: 8 },
    ],
  },
  {
    id: 7,
    title: "Whispers in the Dark",
    year: "2024",
    overview: "A family moves into a Victorian mansion only to discover they're not alone.",
    poster: "",
    backdrop: "",
    rating: 7.4,
    voteCount: 2670,
    reviews: [
      { author: "HorrorFan", content: "Genuinely creepy with some great jump scares. Not for the faint-hearted.", rating: 7 },
      { author: "ScreamQueen", content: "Atmospheric horror at its finest.", rating: 8 },
    ],
  },
  {
    id: 8,
    title: "Code Breaker",
    year: "2023",
    overview: "A brilliant mathematician is recruited by a secret agency to crack an unbreakable code.",
    poster: "",
    backdrop: "",
    rating: 8.0,
    voteCount: 3890,
    reviews: [
      { author: "TechThriller", content: "Smart, fast-paced, and incredibly satisfying.", rating: 8 },
      { author: "PuzzleMaster", content: "A thinking person's thriller that keeps you guessing.", rating: 8 },
    ],
  },
  {
    id: 9,
    title: "Wild Frontier",
    year: "2024",
    overview: "A lone sheriff must protect a frontier town from a ruthless gang in this modern western.",
    poster: "",
    backdrop: "",
    rating: 7.7,
    voteCount: 2340,
    reviews: [
      { author: "WesternLover", content: "A gritty, authentic western with stunning cinematography.", rating: 8 },
      { author: "SaddleUp", content: "They don't make 'em like this anymore. A real treat.", rating: 7 },
    ],
  },
  {
    id: 10,
    title: "The Dreamer",
    year: "2023",
    overview: "An animated tale about a young girl who discovers she can enter people's dreams.",
    poster: "",
    backdrop: "",
    rating: 8.7,
    voteCount: 5230,
    reviews: [
      { author: "AnimeFan", content: "Visually breathtaking with a story that will move you to tears.", rating: 10 },
      { author: "DreamWeaver", content: "A masterpiece of animation. Pixar-level quality.", rating: 9 },
    ],
  },
  {
    id: 11,
    title: "Street Kings",
    year: "2024",
    overview: "Two rival dance crews must join forces to save their community center from demolition.",
    poster: "",
    backdrop: "",
    rating: 7.3,
    voteCount: 1980,
    reviews: [
      { author: "DanceMovie", content: "Incredible choreography and a feel-good story. Love it!", rating: 8 },
      { author: "GrooveMaster", content: "The dance sequences alone are worth the ticket price.", rating: 7 },
    ],
  },
  {
    id: 12,
    title: "Echoes of Tomorrow",
    year: "2024",
    overview: "A scientist accidentally opens a portal to a parallel universe where history took a very different turn.",
    poster: "",
    backdrop: "",
    rating: 8.3,
    voteCount: 4670,
    reviews: [
      { author: "ParallelFan", content: "Mind-bending and thought-provoking. Christopher Nolan would be proud.", rating: 9 },
      { author: "TimeTravel", content: "A fresh take on the multiverse concept. Absolutely riveting.", rating: 8 },
    ],
  },
];

export async function GET(request: NextRequest) {
  const genreId = request.nextUrl.searchParams.get("genre_id");
  const page = request.nextUrl.searchParams.get("page") || "1";

  if (!genreId) {
    return NextResponse.json({ error: "genre_id is required" }, { status: 400 });
  }

  // Check if TMDB key is available
  if (!process.env.TMDB_API_KEY) {
    // Shuffle demo movies and return
    const shuffled = [...DEMO_MOVIES].sort(() => Math.random() - 0.5);
    return NextResponse.json({ movies: shuffled, demo: true });
  }

  try {
    const movies = await getMoviesByGenre(Number(genreId), Number(page));

    // Fetch reviews for each movie in parallel (limit to first 15)
    const enriched = await Promise.all(
      movies.slice(0, 15).map(async (movie) => {
        let reviews: { author: string; content: string; rating: number | null }[] = [];
        try {
          reviews = await getMovieReviews(movie.id);
        } catch {
          // Reviews are optional
        }

        return {
          id: movie.id,
          title: movie.title,
          year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
          overview: movie.overview,
          poster: posterUrl(movie.poster_path),
          backdrop: posterUrl(movie.backdrop_path, "w780"),
          rating: Math.round(movie.vote_average * 10) / 10,
          voteCount: movie.vote_count,
          reviews,
        };
      })
    );

    return NextResponse.json({ movies: enriched, demo: false });
  } catch (error) {
    // On TMDB failure, return demo movies
    const shuffled = [...DEMO_MOVIES].sort(() => Math.random() - 0.5);
    return NextResponse.json({ movies: shuffled, demo: true });
  }
}
