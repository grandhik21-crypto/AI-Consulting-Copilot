import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

// A swipe session groups swipes for one genre exploration
export const swipeSessions = pgTable("swipe_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  genreId: integer("genre_id").notNull(),
  genreName: text("genre_name").notNull(),
  totalSwipes: integer("total_swipes").default(0),
  recommendedMovieId: integer("recommended_movie_id"),
  recommendedMovieTitle: text("recommended_movie_title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual swipe records
export const swipes = pgTable("swipes", {
  id: serial("id").primaryKey(),
  sessionId: uuid("session_id")
    .references(() => swipeSessions.id)
    .notNull(),
  movieId: integer("movie_id").notNull(),
  movieTitle: text("movie_title").notNull(),
  liked: boolean("liked").notNull(),
  movieData: jsonb("movie_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
