// TMDB API helper
const TMDB_BASE = "https://api.themoviedb.org/3";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY environment variable is not set");
  }
  return key;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface TMDBReview {
  author: string;
  content: string;
  rating: number | null;
}

export interface Genre {
  id: number;
  name: string;
}

export async function getGenres(): Promise<Genre[]> {
  const res = await fetch(
    `${TMDB_BASE}/genre/movie/list?api_key=${getApiKey()}&language=en-US`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error("Failed to fetch genres");
  const data = await res.json();
  return data.genres;
}

export async function getMoviesByGenre(
  genreId: number,
  page: number = 1
): Promise<TMDBMovie[]> {
  const res = await fetch(
    `${TMDB_BASE}/discover/movie?api_key=${getApiKey()}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}&vote_count.gte=100`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch movies");
  const data = await res.json();
  return data.results;
}

export async function getMovieReviews(
  movieId: number
): Promise<TMDBReview[]> {
  const res = await fetch(
    `${TMDB_BASE}/movie/${movieId}/reviews?api_key=${getApiKey()}&language=en-US&page=1`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).slice(0, 2).map((r: any) => ({
    author: r.author,
    content: r.content.slice(0, 200),
    rating: r.author_details?.rating || null,
  }));
}

export function posterUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
