import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { useBlogPost } from "@/hooks/useBlogPosts";

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

  return (
    <>
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

            {/* Render content - supports markdown-like line breaks and ## headers */}
            <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
              {post.content.split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                  return <h2 key={i} className="mt-8 mb-3 font-heading text-xl font-semibold">{line.slice(3)}</h2>;
                }
                if (line.startsWith("- ")) {
                  return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="mb-3 text-muted-foreground">{line}</p>;
              })}
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
