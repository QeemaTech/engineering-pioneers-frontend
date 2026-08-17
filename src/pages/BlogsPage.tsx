import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, ArrowRight, ArrowLeft } from "lucide-react";
import { usePublicPosts } from "../features/public/hooks";
import { localizedPostFields } from "../utils/cmsLocale";
import { resolveMediaUrl } from "../utils/mediaUrl";

export default function BlogsPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const { data, isLoading, isError } = usePublicPosts({ page: 1, limit: 12 });

  const posts = data?.posts ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <nav className="text-sm text-slate-500">
          <Link to="/" className="transition hover:text-[#EE7C11]">
            {t("header.nav.home")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{t("publicBlogs.title")}</span>
        </nav>
        <header className="mt-4 max-w-2xl">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{t("publicBlogs.title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 md:text-base">{t("publicBlogs.subtitle")}</p>
        </header>

        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">
            {t("publicBlogs.loadError")}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const { title } = localizedPostFields(post, i18n.language);
            return (
              <Link
                key={post.id}
                to={`/blogs/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100/90 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#EE7C11]/25 hover:shadow-[0_16px_40px_rgba(238,124,17,0.12)]"
              >
                {post.thumbnail ? (
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={resolveMediaUrl(post.thumbnail)}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-[#EE7C11]/10 to-white">
                    <BookOpen className="h-12 w-12 text-[#EE7C11]/30 transition group-hover:text-[#EE7C11]" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="line-clamp-2 text-base font-extrabold text-slate-900 transition group-hover:text-[#EE7C11]">
                    {title}
                  </h2>
                  {post.author?.fullName ? (
                    <p className="mt-2 text-xs text-slate-500">
                      {post.author.fullName}
                      {post.createdAt ? ` · ${new Date(post.createdAt).toLocaleDateString(isRtl ? "ar-EG" : undefined)}` : ""}
                    </p>
                  ) : null}
                  {post.excerpt ? (
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#EE7C11]">
                    {t("publicBlogs.readMore")}
                    <Arrow className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {!isLoading && !isError && posts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
            {t("publicBlogs.empty")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
