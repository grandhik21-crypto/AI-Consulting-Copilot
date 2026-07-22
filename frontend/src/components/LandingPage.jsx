import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import Footer from "./Footer";

export default function LandingPage({ onStartChat }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar onStartChat={onStartChat} />
      <Hero onStartChat={onStartChat} />
      <Features />
      <Footer />
    </div>
  );
}
