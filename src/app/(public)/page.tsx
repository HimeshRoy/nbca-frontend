import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import BoardsSection from "@/components/home/BoardsSection";
import WhyParentsTrust from "@/components/home/WhyChooseNBCA";
import LearningJourney from "@/components/home/LearningJourney";
import CoreSubjects from "@/components/home/CoreSubjects";
import CTA from "@/components/home/CTA";
import { Analytics } from "@vercel/analytics/next";

export default function Home() {
  return (
    <>
      <Hero />
      <BoardsSection />
      <WhyParentsTrust />
      <LearningJourney />
      <CoreSubjects />
      <CTA />
      <Analytics />
    </>
  );
}
