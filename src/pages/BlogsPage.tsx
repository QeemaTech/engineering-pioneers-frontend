import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { usePublicPosts } from "../features/public/hooks";

export default function BlogsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePublicPosts({ page: 1, limit: 12 });

  const posts = data?.posts ?? [];

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <nav className="text-sm text-slate-500">
          <Link to="/" className="hover:text-pioneer-orange-normal">
            {t("header.nav.home")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{t("publicBlogs.title")}</span>
        </nav>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">{t("publicBlogs.title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-600">{t("publicBlogs.subtitle")}</p>

        {isLoading ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">{t("dashboard.common.loading")}</div>
        ) : null}
        {isError ? (
          <div className="mt-10 rounded-2xl border border-red-100 bg-[#EE7C11]/10 p-6 text-sm text-red-800">{t("publicBlogs.loadError")}</div>
        ) : null}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blogs/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {post.thumbnail ? (
                <div className="h-36 overflow-hidden bg-slate-100">
                  <img src={post.thumbnail} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                </div>
              ) : (
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-pioneer-orange-light to-white">
                  <BookOpen className="h-12 w-12 text-pioneer-orange-normal/40 transition group-hover:text-pioneer-orange-normal" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-base font-bold text-slate-900 group-hover:text-pioneer-orange-normal">{post.title}</h2>
                {post.author?.fullName ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {post.author.fullName}
                    {post.createdAt ? ` · ${new Date(post.createdAt).toLocaleDateString()}` : ""}
                  </p>
                ) : null}
                {post.excerpt ? <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">{post.excerpt}</p> : null}
                <span className="mt-auto pt-4 text-sm font-semibold text-pioneer-orange-normal">{t("publicBlogs.readMore")} →</span>
              </div>
            </Link>
          ))}
        </div>

        {!isLoading && posts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            {t("publicBlogs.empty")}
            <div className="mt-4">
              <Link to="/explore" className="font-semibold text-pioneer-orange-normal hover:underline">
                {t("header.nav.explore")}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
