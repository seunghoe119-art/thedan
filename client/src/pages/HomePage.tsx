import Hero from "@/components/Hero";
import About from "@/components/About";
import Highlights from "@/components/Highlights";
import Tournaments from "@/components/Tournaments";
import Schedule from "@/components/Schedule";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Schedule />
      <Highlights />
      <About />
      <Tournaments />
    </>
  );
}