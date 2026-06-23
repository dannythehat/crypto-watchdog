import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Markdown from "@/components/Markdown";
import Seo from "@/components/Seo";
import AuthorBlock from "@/components/AuthorBlock";
import { Button } from "@/components/ui/button";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { getRelatedPosts } from "@/content";
import { articleJsonLd, authorFromContent, breadcrumbJsonLd, extractFaq, faqJsonLd } from "@/lib/seo";

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
  const related = getRelatedPosts(post.slug, 6);

  return (
    <>
      <Seo
        title={post.title}
        description={post.summary ?? undefined}
        path={path}
        image={post.image_url}
        type="article"
        noindex={(post as any).noindex === true}
        jsonLd={[
          articleJsonLd({
            title: post.title,
            description: post.summary ?? undefined,
            path,
            image: post.image_url,
            publishedAt: post.published_at,
            modifiedAt: post.updated_at,
            section: post.category,
            author: authorFromContent(post),
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

            <AuthorBlock
              author={authorFromContent(post)}
              date={post.published_at}
              updated={post.updated_at}
              className="mt-4"
            />

            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="mt-6 w-full rounded-2xl border border-border shadow-2xl ring-1 ring-foreground/5"
                loading="eager"
              />
            )}

            <div className="mt-8 max-w-none">
              <Markdown content={post.content} dropcap />
            </div>

            <div className="mt-10 rounded-lg border border-border bg-muted/50 p-5 text-xs text-muted-foreground">
              <p className="font-semibold">Disclaimer</p>
              <p className="mt-1">
                This content is for informational purposes only and does not constitute financial advice. Always do your own research.
              </p>
            </div>

            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">Related guides</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      to={`/blog/${r.slug}`}
                      className="group rounded-xl border border-border bg-card/60 p-4 backdrop-blur transition hover:border-primary/40 hover:bg-card"
                    >
                      {r.category && <span className="text-xs font-medium text-primary">{r.category}</span>}
                      <p className="mt-1 font-heading font-semibold leading-snug text-foreground group-hover:text-primary">{r.title}</p>
                      {r.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
