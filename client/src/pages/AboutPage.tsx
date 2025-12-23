import Schedule from "@/components/Schedule";
import ImageSlider from "@/components/ImageSlider";
import News from "@/components/News";
import PageTransition from "@/components/PageTransition";
import Navigation from "@/components/Navigation";
import About from "@/components/About";

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="h-20"></div>
        <div id="facilities-section">
          <About />
        </div>
        <Schedule />
        <ImageSlider />
        <News />
      </div>
    </PageTransition>
  );
}