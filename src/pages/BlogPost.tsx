import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Markdown from "@/components/Markdown";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { articleJsonLd, breadcrumbJsonLd, extractFaq, faqJsonLd } from "@/lib/seo";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug ?? "");

  if (isLoading) {
    return (
      <>
        <Navbar />
        <SectionWrapper className="pt-28">
          <div className="mx-auto max-w-3xl animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-12 w-full rounded bg-muted" />
            <div className="h-96 w-full rounded bg-muted" />
          </div>
        </SectionWrapper>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <SectionWrapper className="pt-28 text-center">
          <h1 className="text-3xl">Post not found</h1>
          <Button asChild className="mt-4">
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </SectionWrapper>
        <Footer />
      </>
    );
  }

  const path = `/blog/${post.slug}`;
  const faqs = extractFaq(post.content);

  return (
    <>
      <Seo
        title={post.title}
        description={post.summary ?? undefined}
        path={path}
        image={post.image_url}
        type="article"
        jsonLd={[
          articleJsonLd({
            title: post.title,
            description: post.summary ?? undefined,
            path,
            image: post.image_url,
            publishedAt: post.published_at,
            modifiedAt: post.updated_at,
            section: post.category,
          }),
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path },
          ]),
        ]}
      />
      <Navbar />
      <main>
        <SectionWrapper className="pt-28 md:pt-36">
          <article className="mx-auto max-w-3xl">
            <Link to="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>

            {post.category && (
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {post.category}
              </span>
            )}

            <h1 className="text-3xl leading-tight md:text-4xl">{post.title}</h1>

            {post.published_at && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}

            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="mt-6 w-full rounded-2xl border border-border shadow-2xl ring-1 ring-foreground/5"
                loading="eager"
              />
            )}

            <div className="mt-8 max-w-none">
              <Markdown content={post.content} />
            </div>

            <div className="mt-10 rounded-lg border border-border bg-muted/50 p-5 text-xs text-muted-foreground">
              <p className="font-semibold">Disclaimer</p>
              <p className="mt-1">
                This content is for informational purposes only and does not constitute financial advice. Always do your own research.
              </p>
            </div>
          </article>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
