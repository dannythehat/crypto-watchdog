import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import BlogCard from "@/components/BlogCard";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const Blog = () => {
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <>
      <Navbar />
      <main>
        <SectionWrapper className="pt-28 md:pt-36">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl">Blog</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Daily crypto safety insights, scam alerts, market updates, and educational content — updated automatically.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
                ))
              : (posts ?? []).map((p: any) => (
                  <BlogCard
                    key={p.id}
                    title={p.title}
                    slug={p.slug}
                    summary={p.summary}
                    category={p.category}
                    publishedAt={p.published_at}
                  />
                ))}
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default Blog;
