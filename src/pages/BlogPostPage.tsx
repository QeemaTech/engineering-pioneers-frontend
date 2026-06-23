import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { usePublicPost } from "../features/public/hooks";
import { localizedPostFields } from "../utils/cmsLocale";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function PostBody({ content }: { content: unknown }) {
  const { t } = useTranslation();

  if (!isRecord(content)) {
    return <p className="text-slate-500">{String(content ?? "")}</p>;
  }

  const format = content.format;
  const body = content.body;
  if (format === "markdown" && typeof body === "string") {
    return (
      <div className="max-w-none text-base leading-relaxed text-slate-700">
        <div className="whitespace-pre-wrap">{body}</div>
      </div>
    );
  }

  const bullets = content.bullets;
  if (Array.isArray(bullets) && bullets.length > 0) {
    return (
      <ul className="list-disc space-y-3 ps-5 text-slate-700">
        {bullets.map((item, i) => {
          if (!isRecord(item)) return null;
          const title = typeof item.title === "string" ? item.title : null;
          const b = typeof item.body === "string" ? item.body : null;
          return (
            <li key={i}>
              {title ? <span className="font-semibold text-slate-900">{title}: </span> : null}
              {b}
            </li>
          );
        })}
      </ul>
    );
  }

  const blocks = content.blocks;
  if (Array.isArray(blocks) && blocks.length > 0) {
    return (
      <div className="space-y-4 text-slate-700">
        {blocks.map((block, i) => {
          if (!isRecord(block)) return null;
          if (block.type === "paragraph" && typeof block.text === "string") {
            return <p key={i} className="leading-relaxed">{block.text}</p>;
          }
          return null;
        })}
      </div>
    );
  }

  if (Array.isArray(blocks) && blocks.length === 0) {
    return <p className="text-slate-500">{t("publicBlogs.emptyBody")}</p>;
  }

  return (
    <pre className="overflow-x-auto rounded-xl bg-slate-100 p-4 text-xs text-slate-700">{JSON.stringify(content, null, 2)}</pre>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { data: post, isLoading, isError, error } = usePublicPost(slug);

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const { title, content } = localizedPostFields(post, i18n.language);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
        <nav className="text-sm text-slate-500">
          <Link to="/" className="transition hover:text-[#EE7C11]">
            {t("header.nav.home")}
          </Link>
          <span className="mx-2">/</span>
          <Link to="/blogs" className="transition hover:text-[#EE7C11]">
            {t("publicBlogs.title")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{title || "…"}</span>
        </nav>

        {isLoading ? (
          <div className="mt-10 h-64 animate-pulse rounded-2xl bg-slate-100" />
        ) : null}

        {isError ? (
          <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">
            {status === 404 ? t("publicBlogs.notFound") : t("publicBlogs.loadError")}
          </div>
        ) : null}

        {post ? (
          <article className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {post.thumbnail ? (
              <div className="max-h-[420px] overflow-hidden">
                <img src={post.thumbnail} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null}
            <div className="p-6 md:p-10">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{title}</h1>
              <p className="mt-3 text-sm text-slate-500">
                {post.author?.fullName ? <span>{post.author.fullName}</span> : null}
                {post.author?.fullName && post.createdAt ? <span> · </span> : null}
                {post.createdAt ? (
                  <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time>
                ) : null}
              </p>
              <div className="mt-10 border-t border-slate-100 pt-8">
                <PostBody content={content} />
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
