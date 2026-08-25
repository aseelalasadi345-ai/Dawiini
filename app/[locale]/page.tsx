import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}
