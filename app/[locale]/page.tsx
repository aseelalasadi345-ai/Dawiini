import Navbar2 from "@/components/Navbar2";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <main>
      <Navbar2 />
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}
