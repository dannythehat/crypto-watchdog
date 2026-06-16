import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import Markdown from "@/components/Markdown";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { useWarning } from "@/hooks/useWarnings";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

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

  const path = `/warnings/${warning.slug}`;

  return (
    <>
      <Seo
        title={warning.title}
        description={warning.summary ?? undefined}
        path={path}
        type="article"
        jsonLd={[
          articleJsonLd({
            title: warning.title,
            description: warning.summary ?? undefined,
            path,
            publishedAt: warning.published_at,
            modifiedAt: warning.updated_at,
            section: "Scam Warning",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Warnings", path: "/warnings" },
            { name: warning.title, path },
          ]),
        ]}
      />
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

            <div className="mt-8 max-w-none">
              <Markdown content={warning.content} />
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
