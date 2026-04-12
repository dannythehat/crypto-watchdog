import { useState } from "react";
import { Send, CheckCircle, AlertTriangle, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmission } from "@/hooks/useSubmission";

const Submit = () => {
  const [form, setForm] = useState({
    platform_name: "",
    platform_url: "",
    category: "",
    user_email: "",
    message: "",
  });
  const { mutate, isPending, isSuccess, isError } = useSubmission();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platform_name.trim()) return;
    mutate({
      platform_name: form.platform_name,
      platform_url: form.platform_url || undefined,
      category: form.category || undefined,
      user_email: form.user_email || undefined,
      message: form.message || undefined,
    });
  };

  return (
    <>
      <Navbar />
      <main>
        <SectionWrapper className="pt-28 md:pt-36">
          <div className="mx-auto max-w-2xl text-center">
            <Send className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl md:text-5xl">Submit a Platform</h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Want us to investigate a crypto platform, wallet, bot, or service? Submit it here and we'll add it to our review queue.
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper className="bg-card">
          <div className="mx-auto max-w-xl">
            {isSuccess ? (
              <div className="rounded-lg border border-rating-green/30 bg-rating-green/5 p-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-rating-green" />
                <h2 className="mt-4 font-heading text-2xl font-semibold">Submission Received</h2>
                <p className="mt-3 text-muted-foreground">
                  Thanks for submitting this platform. We'll review the request and may include it in our upcoming audit queue.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Platform Name *</label>
                  <Input
                    required
                    value={form.platform_name}
                    onChange={(e) => setForm({ ...form, platform_name: e.target.value })}
                    placeholder="e.g. Binance, MetaMask, Aurum Foundation"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Website URL</label>
                  <Input
                    value={form.platform_url}
                    onChange={(e) => setForm({ ...form, platform_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Category</label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Exchange, Wallet, Bot, DeFi, etc."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Your Email (optional)</label>
                  <Input
                    type="email"
                    value={form.user_email}
                    onChange={(e) => setForm({ ...form, user_email: e.target.value })}
                    placeholder="So we can notify you when the review is live"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Additional Details</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Why should we look into this platform? Any concerns or red flags you've noticed?"
                    rows={4}
                  />
                </div>

                {isError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rating-red/30 bg-rating-red/5 p-3 text-sm text-rating-red">
                    <AlertTriangle className="h-4 w-4" />
                    Something went wrong. Please try again.
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit for Review"}
                </Button>
              </form>
            )}
          </div>
        </SectionWrapper>

        <SectionWrapper>
          <div className="mx-auto max-w-xl text-center">
            <Mail className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-3 text-2xl">Other Enquiries</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              For partnership requests, interview enquiries, tips about suspicious platforms, or general questions:
            </p>
            <Button asChild variant="outline" className="mt-4">
              <a href="mailto:dannythehat2@gmail.com">Email Us Directly</a>
            </Button>
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
};

export default Submit;
