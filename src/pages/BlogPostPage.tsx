import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { usePublicPost } from "../features/public/hooks";
import { localizedPostFields } from "../utils/cmsLocale";
import SocialShare from "../components/SocialShare";
import { resolveMediaUrl } from "../utils/mediaUrl";
import SEOHead from "../components/common/SEOHead";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function renderFormattedText(text: string) {
  if (!text) return null;

  // Split by line breaks
  const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-4 list-disc space-y-2 ps-6 text-slate-700 dark:text-slate-300">
          {currentList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Heading 1 (# ...)
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={index} className="mt-8 mb-4 text-2xl font-black text-slate-900 dark:text-white">
          {trimmed.slice(2)}
        </h2>
      );
      return;
    }

    // Heading 2 (## ...)
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={index} className="mt-6 mb-3 text-xl font-bold text-slate-900 dark:text-white">
          {trimmed.slice(3)}
        </h3>
      );
      return;
    }

    // Heading 3 (### ...)
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={index} className="mt-5 mb-2 text-lg font-bold text-[#EE7C11]">
          {trimmed.slice(4)}
        </h4>
      );
      return;
    }

    // Blockquote (> ...)
    if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={index}
          className="my-4 border-s-4 border-[#EE7C11] bg-orange-50/50 p-4 font-medium italic text-slate-700 dark:bg-orange-500/10 dark:text-slate-200 rounded-e-xl"
        >
          {trimmed.slice(2)}
        </blockquote>
      );
      return;
    }

    // Bullet points (- ... or * ...)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      currentList.push(trimmed.slice(2));
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={index} className="my-3 text-base leading-relaxed text-slate-700 dark:text-slate-300">
        {trimmed}
      </p>
    );
  });

  flushList();
  return <div className="space-y-1">{elements}</div>;
}

function PostBody({ content }: { content: unknown }) {
  const { t } = useTranslation();

  if (!content) {
    return <p className="text-slate-500">{t("publicBlogs.emptyBody", { defaultValue: "No content available." })}</p>;
  }

  if (typeof content === "string") {
    return renderFormattedText(content);
  }

  if (isRecord(content)) {
    // 1. Markdown or Body string
    if (typeof content.body === "string" && content.body.trim()) {
      return renderFormattedText(content.body);
    }
    if (typeof content.text === "string" && content.text.trim()) {
      return renderFormattedText(content.text);
    }

    // 2. Bullets array
    const bullets = content.bullets;
    if (Array.isArray(bullets) && bullets.length > 0) {
      return (
        <ul className="list-disc space-y-3 ps-5 text-slate-700 dark:text-slate-300">
          {bullets.map((item, i) => {
            if (!isRecord(item)) return <li key={i}>{String(item)}</li>;
            const title = typeof item.title === "string" ? item.title : null;
            const b = typeof item.body === "string" ? item.body : null;
            return (
              <li key={i} className="leading-relaxed">
                {title ? <strong className="font-bold text-slate-900 dark:text-white">{title}: </strong> : null}
                {b}
              </li>
            );
          })}
        </ul>
      );
    }

    // 3. Blocks array
    const blocks = content.blocks;
    if (Array.isArray(blocks) && blocks.length > 0) {
      return (
        <div className="space-y-4 text-slate-700 dark:text-slate-300">
          {blocks.map((block, i) => {
            if (!isRecord(block)) return null;
            if (block.type === "paragraph" && typeof block.text === "string") {
              return <p key={i} className="leading-relaxed">{block.text}</p>;
            }
            if (block.type === "heading" && typeof block.text === "string") {
              return <h3 key={i} className="text-xl font-bold text-slate-900 dark:text-white">{block.text}</h3>;
            }
            return null;
          })}
        </div>
      );
    }
  }

  return <p className="text-slate-500">{t("publicBlogs.emptyBody", { defaultValue: "No content available." })}</p>;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { data: post, isLoading, isError, error } = usePublicPost(slug);

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const { title, content } = localizedPostFields(post, i18n.language);

  const articleSchema = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "image": post.thumbnail ? resolveMediaUrl(post.thumbnail) : undefined,
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt || post.createdAt,
    "author": {
      "@type": "Person",
      "name": post.author?.fullName || "Engineering Pioneers"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Engineering Pioneers",
      "logo": {
        "@type": "ImageObject",
        "url": "https://engineeringpioneers.com/assets/logo.png"
      }
    }
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white py-12 md:py-16">
      {post && (
        <SEOHead
          title={`${title} | رواد الهندسة`}
          description={typeof content === "string" ? content.slice(0, 160) : title}
          image={post.thumbnail ? resolveMediaUrl(post.thumbnail) : undefined}
          schema={articleSchema}
          type="article"
          path={`/blogs/${slug}`}
        />
      )}
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
                <img src={resolveMediaUrl(post.thumbnail)} alt="" className="h-full w-full object-cover" />
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
              <div className="mt-8 border-t border-slate-100 pt-6">
                <SocialShare url={window.location.href} title={title} />
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
