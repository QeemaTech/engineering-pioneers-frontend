import { useQuery } from "@tanstack/react-query";
import CTA from "../components/CTA";
import Features from "../components/Features";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import RecommendedCourses from "../components/RecommendedCourses";
import HomePackagesSection from "../components/HomePackagesSection";
import Testimonials from "../components/Testimonials";
import Feedback from "../components/Feedback";
import FaqSection from "../components/FaqSection";
import HomeNewsBoard from "../components/HomeNewsBoard";
import SEOHead from "../components/common/SEOHead";
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

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Engineering Pioneers | رواد الهندسة",
    "url": "https://engineeringpioneers.com",
    "logo": "https://engineeringpioneers.com/assets/logo.png",
    "description": "المنصة التعليمية الرائدة للطلاب والمهندسين في العالم العربي، تقدم كورسات هندسية متخصصة وحصص مباشرة مع نخبة من أفضل الأساتذة.",
    "sameAs": [
      "https://facebook.com",
      "https://twitter.com",
      "https://linkedin.com"
    ]
  };

  return (
    <div className="overflow-hidden">
      <SEOHead path="/" schema={organizationSchema} />
      {showHero ? <Hero cmsContent={heroSection?.content} stats={data?.stats} /> : null}
      <Features />
      <RecommendedCourses />
      <HomePackagesSection />
      <HowItWorks />
      <HomeNewsBoard />
      {isVisible("TESTIMONIALS") ? (
        Array.isArray(data?.featuredReviews) && data.featuredReviews.length > 0 ? (
          <Feedback featuredReviews={data.featuredReviews} reviewsLoading={landingLoading} />
        ) : (
          <Testimonials />
        )
      ) : null}
      {isVisible("FAQ") ? <FaqSection rawContent={faqSection?.content} /> : null}
      <CTA />
    </div>
  );
}

export default Home;
