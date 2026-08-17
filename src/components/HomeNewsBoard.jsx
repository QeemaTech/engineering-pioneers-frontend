import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Calendar, User, Newspaper, Clock, BookOpen, Loader2 } from "lucide-react";
import client from "../api/client";
import { resolveMediaUrl } from "../utils/mediaUrl";

function HomeNewsBoard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL"); // 'ALL' | 'NEWS' | 'INVESTIGATION' | 'BLOG'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      try {
        const res = await client.get("/public/posts");
        const items = res?.data?.data || [];
        setPosts(items);
      } catch (err) {
        console.error("Failed to load homepage posts", err);
      } finally {
        setIsLoading(false);
      }
    }
    void loadPosts();
  }, []);

  // High quality fallback stories matching the categories
  const fallbackPosts = useMemo(() => [
    {
      id: "demo-1",
      title: "انطلاق الفصل الصيفي لمنصة رواد الهندسة الأكاديمية",
      titleEn: "Launch of the Summer Term on Engineering Pioneers Platform",
      content: { format: "markdown", body: "نعلن لطلابنا الأعزاء عن بدء التسجيل للفصل الصيفي للعام الأكاديمي الحالي، مع توفير باقات حصرية ومساقات مجانية لطلاب الجامعات." },
      contentEn: { format: "markdown", body: "We announce to our dear students the launch of registrations for the summer term, featuring exclusive bundles and free university courses." },
      excerpt: "نعلن لطلابنا الأعزاء عن بدء التسجيل للفصل الصيفي للعام الأكاديمي الحالي، مع توفير باقات حصرية ومساقات مجانية لطلاب الجامعات.",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600",
      category: "NEWS",
      createdAt: new Date().toISOString(),
      slug: "summer-term-launch",
      author: { fullName: "رواد الهندسة" }
    },
    {
      id: "demo-2",
      title: "تحقيق استقصائي: كيف تؤثر أدوات الذكاء الاصطناعي على مشاريع تخرج طلاب الهندسة؟",
      titleEn: "Investigation: How is Generative AI Affecting Graduation Projects of Engineering Students?",
      content: { format: "markdown", body: "نبحث بالتفصيل في هذا التقرير الاستقصائي التأثير الفعلي لأدوات الذكاء الاصطناعي مثل Copilot و ChatGPT على مهارات الطلاب البرمجية وكفاءة تسليم مشاريع التخرج بالجامعات المصرية." },
      contentEn: { format: "markdown", body: "We investigate in detail the actual impact of generative AI tools like Copilot and ChatGPT on students' coding skills and the efficiency of graduation project delivery in Egyptian universities." },
      excerpt: "نبحث بالتفصيل في هذا التقرير الاستقصائي التأثير الفعلي لأدوات الذكاء الاصطناعي على مهارات الطلاب البرمجية وكفاءة تسليم مشاريع التخرج بالجامعات المصرية.",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600",
      category: "INVESTIGATION",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      slug: "ai-impact-graduation-projects",
      author: { fullName: "فريق البحث والتحقيق" }
    },
    {
      id: "demo-3",
      title: "تفعيل الشهادات المهنية المعتمدة لتدريب الصيف",
      titleEn: "Activation of Accredited Professional Certificates for Summer Training",
      content: { format: "markdown", body: "تحديث جديد لنظام الشهادات بالمنصة لإضافة الاختام الأكاديمية وتوفير مستندات معتمدة لطلاب الهندسة لتقديمها في التدريب الصيفي." },
      contentEn: { format: "markdown", body: "A new update to the certificate system adding academic credentials and providing certified documents for engineering students to submit for summer training." },
      excerpt: "تحديث جديد لنظام الشهادات بالمنصة لإضافة الاختام الأكاديمية وتوفير مستندات معتمدة لطلاب الهندسة لتقديمها في التدريب الصيفي.",
      thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600",
      category: "NEWS",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      slug: "certified-summer-training",
      author: { fullName: "الإدارة التعليمية" }
    },
    {
      id: "demo-4",
      title: "دليل المبتدئين إلى فهم الخوارزميات وهياكل البيانات البرمجية",
      titleEn: "Beginner's Guide to Understanding Algorithms & Data Structures",
      content: { format: "markdown", body: "تعد الخوارزميات وهياكل البيانات عصب البرمجة الأساسي. في هذه المقالة، نستعرض أهم المفاهيم التي يجب على كل طالب هندسة حاسبات استيعابها في سنواته الأولى." },
      contentEn: { format: "markdown", body: "Algorithms and data structures are the core of programming. In this article, we outline the essential concepts every computer engineering student must master in their early years." },
      excerpt: "تعد الخوارزميات وهياكل البيانات عصب البرمجة الأساسي. في هذه المقالة، نستعرض أهم المفاهيم التي يجب على كل طالب هندسة حاسبات استيعابها.",
      thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=600",
      category: "BLOG",
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      slug: "algorithms-data-structures-guide",
      author: { fullName: "م. أحمد مصطفى" }
    }
  ], []);

  const activePosts = posts.length > 0 ? posts : fallbackPosts;

  // Filter posts based on active tab
  const filteredPosts = useMemo(() => {
    if (activeTab === "ALL") return activePosts;
    return activePosts.filter((p) => p.category === activeTab);
  }, [activePosts, activeTab]);

  // Extract featured post (most recent) and grid posts
  const featuredPost = filteredPosts[0] || null;
  const gridPosts = filteredPosts.slice(1, 4); // Show up to 3 secondary posts

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "NEWS":
        return isRtl ? "📰 خبر" : "📰 News";
      case "INVESTIGATION":
        return isRtl ? "🔍 تحقيق استقصائي" : "🔍 Investigation";
      case "BLOG":
        return isRtl ? "✍️ مقال" : "✍️ Blog";
      default:
        return isRtl ? "📄 عام" : "📄 General";
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "NEWS":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "INVESTIGATION":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "BLOG":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      default:
        return "bg-slate-500/10 text-slate-600";
    }
  };

  return (
    <section className="py-20 bg-slate-50/50 dark:bg-[#0B0F19] transition-colors duration-300 antialiased font-sans border-y border-slate-200/50 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#EE7C11]/10 text-[#EE7C11]">
              <Newspaper className="h-3.5 w-3.5" />
              {isRtl ? "صحافة المنصة" : "Platform Press"}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {isRtl ? "التحقيقات الاستقصائية والأخبار" : "News, Investigations & Blogs"}
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
              {isRtl 
                ? "منبر رواد الهندسة لمتابعة الأحداث والتقارير الفنية والتحقيقات الدقيقة حول التكنولوجيا وهندسة البرمجيات." 
                : "The Engineering Pioneers press room for event updates, technical logs, and deep investigations."}
            </p>
          </div>

          {/* Interactive Filters Tabs */}
          <div className="flex flex-wrap bg-white dark:bg-[#151B2C] p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/5 shadow-xs shrink-0 self-start">
            {[
              { id: "ALL", label: isRtl ? "الكل" : "All" },
              { id: "NEWS", label: isRtl ? "أخبار" : "News" },
              { id: "INVESTIGATION", label: isRtl ? "تحقيقات" : "Investigations" },
              { id: "BLOG", label: isRtl ? "مقالات" : "Blogs" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab.id
                    ? "bg-[#EE7C11] text-white shadow-md shadow-orange-500/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" />
          </div>
        ) : !featuredPost ? (
          <div className="py-16 text-center text-slate-550 dark:text-slate-450 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#101625] max-w-lg mx-auto">
            <BookOpen className="h-10 w-10 mx-auto text-slate-350 dark:text-slate-650 mb-3" />
            <p className="text-sm font-bold">{isRtl ? "لا توجد موضوعات منشورة في هذا التصنيف حالياً." : "No articles found in this category yet."}</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* 1. FEATURED HERO POST BOARD */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white dark:border-white/5 dark:bg-[#101625] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="grid lg:grid-cols-12 gap-0">
                {/* Image panel with hover zoom */}
                <div className="lg:col-span-6 relative h-72 sm:h-96 lg:h-auto overflow-hidden min-h-[340px]">
                  <img
                    src={resolveMediaUrl(featuredPost.thumbnail) || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600"}
                    alt="Featured story"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  
                  {/* Floating Category Badge */}
                  <span className={`absolute top-4 start-4 px-3 py-1 rounded-lg text-xs font-black shadow-xs ${getCategoryColor(featuredPost.category)} backdrop-blur-md bg-white/90 dark:bg-slate-900/90`}>
                    {getCategoryLabel(featuredPost.category)}
                  </span>
                </div>

                {/* Content description panel */}
                <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.8 w-3.8" />
                        {new Date(featuredPost.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.8 w-3.8" />
                        {isRtl ? "قراءة في ٥ دقائق" : "5 min read"}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight transition-colors duration-250 group-hover:text-[#EE7C11]">
                      {isRtl ? featuredPost.title : (featuredPost.titleEn || featuredPost.title)}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-4">
                      {featuredPost.excerpt || (isRtl ? "اضغط على المقال لمتابعة القراءة والاطلاع على التفاصيل والتقارير المرفقة." : "Click on the story to read further and explore attachments.")}
                    </p>
                  </div>

                  {/* Author detail & CTA */}
                  <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#EE7C11]/10 text-[#EE7C11] flex items-center justify-center font-bold text-xs">
                        {featuredPost.author?.fullName ? featuredPost.author.fullName.charAt(0) : "A"}
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {featuredPost.author?.fullName || (isRtl ? "مسؤول المنصة" : "Platform Editor")}
                      </span>
                    </div>

                    <a
                      href={`/blogs/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/10 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <span>{isRtl ? "اقرأ التحقيق بالكامل" : "Read Full Inquiry"}</span>
                      {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. SECONDARY POSTS GRID */}
            {gridPosts.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/50 bg-white dark:border-white/5 dark:bg-[#101625] hover:shadow-lg transition-all duration-300"
                  >
                    <div>
                      {/* Thumbnail frame */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-white/5">
                        <img
                          src={resolveMediaUrl(post.thumbnail) || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600"}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 animate-fade-in"
                        />
                        {/* Inline tag */}
                        <span className={`absolute top-3 start-3 px-2 py-0.5 rounded text-[10px] font-black ${getCategoryColor(post.category)}`}>
                          {getCategoryLabel(post.category)}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {post.author?.fullName || "Admin"}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 dark:text-white line-clamp-2 transition-colors duration-250 group-hover:text-[#EE7C11] leading-snug">
                          {isRtl ? post.title : (post.titleEn || post.title)}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Footer read link */}
                    <div className="p-5 pt-0">
                      <a
                        href={`/blogs/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-black text-[#EE7C11] hover:underline"
                      >
                        <span>{isRtl ? "اقرأ القصة" : "Read Story"}</span>
                        {isRtl ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Read All Button */}
            <div className="flex justify-center pt-4">
              <a
                href="/blogs"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 hover:border-[#EE7C11]/50 bg-white dark:border-white/5 dark:bg-[#101625] px-6 py-3.5 text-xs font-black text-slate-700 dark:text-slate-350 hover:text-[#EE7C11] dark:hover:text-[#EE7C11] transition-all"
              >
                {isRtl ? "تصفح مكتبة المقالات والتقارير كاملة" : "Browse Full Press Archives"}
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </a>
            </div>
            
          </div>
        )}

      </div>
    </section>
  );
}

export default HomeNewsBoard;
