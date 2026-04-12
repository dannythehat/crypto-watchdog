import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { useCategories } from "@/hooks/useCategories";

const Reviews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: reviews, isLoading } = useReviews(activeCategory || undefined);
  const { data: categories } = useCategories();

  let filteredReviews = ratingFilter
    ? (reviews ?? []).filter((r: any) => r.rating === ratingFilter)
    : reviews ?? [];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredReviews = filteredReviews.filter(
      (r: any) => r.name.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q)
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <SectionWrapper className="pt-28 md:pt-36">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl">Platform Reviews</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Browse our independent audits. Search, filter by category or alert level.
            </p>
          </div>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant={activeCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchParams({})}
            >
              All
            </Button>
            {(categories ?? []).map((c: any) => (
              <Button
                key={c.slug}
                variant={activeCategory === c.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchParams({ category: c.slug })}
              >
                {c.name}
              </Button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["green", "orange", "red"].map((r) => (
              <Button
                key={r}
                variant={ratingFilter === r ? "default" : "outline"}
                size="sm"
                onClick={() => setRatingFilter(ratingFilter === r ? "" : r)}
                className="capitalize"
              >
                {r === "green" ? "🟢 Green Alert" : r === "orange" ? "🟠 Orange Alert" : "🔴 Red Alert"}
              </Button>
            ))}
          </div>

          {/* Grid */}
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
              ))
            ) : filteredReviews.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">
                No reviews found for this filter.
              </p>
            ) : (
              filteredReviews.map((r: any) => (
                <ReviewCard
                  key={r.id}
                  name={r.name}
                  slug={r.slug}
                  rating={r.rating}
                  summary={r.summary}
                  categoryName={r.categories?.name}
                  websiteUrl={r.website_url}
                  trustScore={r.trust_score}
                />
              ))
            )}
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default Reviews;
