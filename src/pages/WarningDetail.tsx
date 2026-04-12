import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { useWarning } from "@/hooks/useWarnings";

const WarningDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: warning, isLoading } = useWarning(slug ?? "");

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

  if (!warning) {
    return (
      <>
        <Navbar />
        <SectionWrapper className="pt-28 text-center">
          <h1 className="text-3xl">Warning not found</h1>
          <Button asChild className="mt-4">
            <Link to="/warnings">Back to Warnings</Link>
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
            <Link to="/warnings" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Warnings
            </Link>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rating-red/30 bg-rating-red/10 px-3 py-1 text-sm font-semibold text-rating-red">
              <AlertTriangle className="h-4 w-4" />
              {warning.severity === "critical" ? "Critical Warning" : warning.severity === "high" ? "High Risk" : "Caution"}
            </div>

            <h1 className="text-3xl leading-tight md:text-4xl">{warning.title}</h1>

            {warning.platform_name && (
              <p className="mt-2 text-muted-foreground">Platform: <strong>{warning.platform_name}</strong></p>
            )}

            {warning.published_at && (
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(warning.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}

            <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
              {warning.content.split("\n").map((line: string, i: number) => {
                if (line.startsWith("## ")) return <h2 key={i} className="mt-8 mb-3 font-heading text-xl font-semibold">{line.slice(3)}</h2>;
                if (line.startsWith("- ")) return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="mb-3 text-muted-foreground">{line}</p>;
              })}
            </div>

            <div className="mt-10 rounded-lg border border-rating-red/20 bg-rating-red/5 p-5 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">⚠️ Important</p>
              <p className="mt-1">
                This warning is based on available evidence at the time of publication. If you have additional information about this platform, please contact us.
              </p>
            </div>
          </article>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default WarningDetail;
