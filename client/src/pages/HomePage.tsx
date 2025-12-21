import Hero from "@/components/Hero";
import About from "@/components/About";
import ImageSlider from "@/components/ImageSlider";
import Highlights from "@/components/Highlights";
import Tournaments from "@/components/Tournaments";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ImageSlider />
      <Highlights />
      <About />
      <Tournaments />
    </>
  );
}