import { useQuery } from "@tanstack/react-query";
import CTA from "../components/CTA";
import Features from "../components/Features";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import RecommendedCourses from "../components/RecommendedCourses";
import Testimonials from "../components/Testimonials";
import FaqSection from "../components/FaqSection";
import HomeNewsBoard from "../components/HomeNewsBoard";
import client from "../api/client";

function Home() {
  const { data, isPending: landingLoading } = useQuery({
    queryKey: ["public", "landing-page"],
    queryFn: async () => {
      const res = await client.get("/public/landing-page");
      return res?.data?.data || {};
    },
    retry: false,
  });
  const sections = data?.sections || [];
  const heroSection = sections.find((s) => s?.key === "HERO");
  const faqSection = sections.find((s) => s?.key === "FAQ");
  const showHero =
    sections.length === 0 || !heroSection || heroSection.isVisible !== false;
  const isVisible = (key) =>
    sections.length === 0 || sections.some((s) => s?.key === key && s?.isVisible !== false);

  return (
    <div className="overflow-hidden">
      {showHero ? <Hero cmsContent={heroSection?.content} stats={data?.stats} /> : null}
      <Features />
      <RecommendedCourses />
      <HowItWorks />
      <HomeNewsBoard />
      {isVisible("TESTIMONIALS") ? <Testimonials /> : null}
      {isVisible("FAQ") ? <FaqSection rawContent={faqSection?.content} /> : null}
      <CTA />
    </div>
  );
}

export default Home;
