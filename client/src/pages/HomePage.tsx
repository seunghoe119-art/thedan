import Hero from "@/components/Hero";
import About from "@/components/About";
import Highlights from "@/components/Highlights";
import Tournaments from "@/components/Tournaments";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Highlights />
      <About />
      <Tournaments />
    </>
  );
}