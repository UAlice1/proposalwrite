import Link from "next/link";
import { FileText, Sparkles, Clock, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  
  // If already logged in, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-zinc-900">
            <FileText className="h-6 w-6 text-violet-600" />
            <span className="text-lg">Proposal AI</span>
          </div>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Proposal Writing
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
              Professional Proposals
              <br />
              <span className="text-violet-600">In Minutes, Not Days</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
              Generate client-ready business proposals, bids, and RFP responses tailored for African SMEs. 
              Integrated with Pryro SOP ecosystem for seamless workflow.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://pryro-sop.vercel.app" target="_blank" rel="noopener">
                <Button variant="outline" size="lg">
                  View SOPs
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-zinc-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-zinc-900">
              Everything you need to win more business
            </h2>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<Sparkles className="h-6 w-6" />}
                title="AI-Generated Content"
                description="Automatically generate professional sections tailored to your client and industry using advanced AI."
              />
              <FeatureCard
                icon={<Clock className="h-6 w-6" />}
                title="Save Hours of Work"
                description="Cut proposal writing time from days to minutes. Focus on client relationships, not formatting."
              />
              <FeatureCard
                icon={<Download className="h-6 w-6" />}
                title="Export Ready"
                description="Download polished proposals in PDF or Word format, ready to send to clients immediately."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-600 sm:px-6 lg:px-8">
          <p>Part of the Pryro SOP ecosystem • Built for African SMEs</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
    </div>
  );
}
