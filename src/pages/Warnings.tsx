import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { useWarnings } from "@/hooks/useWarnings";

const severityStyles = {
  critical: "border-rating-red/40 bg-rating-red/5 text-rating-red",
  high: "border-rating-orange/40 bg-rating-orange/5 text-rating-orange",
  medium: "border-border bg-card text-muted-foreground",
};

const severityLabel = {
  critical: "🔴 Critical",
  high: "🟠 High Risk",
  medium: "🟡 Medium",
};

const Warnings = () => {
  const { data: warnings, isLoading } = useWarnings();

  return (
    <>
      <Navbar />
      <main>
        <SectionWrapper className="pt-28 md:pt-36">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-rating-red" />
            <h1 className="mt-4 text-4xl md:text-5xl">Scam Alerts & Warnings</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Urgent risk warnings and scam reports. If you see a platform listed here, proceed with extreme caution or avoid entirely.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))
            ) : (warnings ?? []).length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">No active warnings at this time. Check back regularly.</p>
              </div>
            ) : (
              (warnings ?? []).map((w: any) => (
                <Link
                  key={w.id}
                  to={`/warnings/${w.slug}`}
                  className={`block rounded-lg border p-6 transition-all hover:shadow-md ${severityStyles[w.severity as keyof typeof severityStyles] || severityStyles.medium}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {severityLabel[w.severity as keyof typeof severityLabel] || w.severity}
                      </span>
                      <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">{w.title}</h3>
                      {w.platform_name && (
                        <span className="mt-1 block text-sm text-muted-foreground">Platform: {w.platform_name}</span>
                      )}
                      {w.summary && <p className="mt-2 text-sm text-muted-foreground">{w.summary}</p>}
                    </div>
                    <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                  {w.published_at && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(w.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </Link>
              ))
            )}
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default Warnings;
