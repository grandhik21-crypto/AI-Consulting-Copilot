import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwipeFlix — Discover Your Next Favorite Movie",
  description:
    "A Tinder-style movie discovery app. Swipe through popular movies and get personalized recommendations.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark-900 text-white antialiased font-display min-h-screen">
        {children}
      </body>
    </html>
  );
}
