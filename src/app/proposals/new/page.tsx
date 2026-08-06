import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SECTION_ORDER, SECTION_META } from "@/types";

export default async function NewProposalPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect("/login");

  async function createProposal(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) throw new Error("User not found");

    const proposal = await db.proposal.create({
      data: {
        title: formData.get("title") as string,
        clientName: formData.get("clientName") as string,
        clientIndustry: formData.get("clientIndustry") as string,
        projectScope: formData.get("projectScope") as string,
        budgetRange: formData.get("budgetRange") as string,
        linkedSopId: formData.get("linkedSopId") as string || null,
        userId: user.id,
        status: "DRAFT",
      },
    });

    // Create empty sections
    await db.proposalSection.createMany({
      data: SECTION_ORDER.map((type) => ({
        proposalId: proposal.id,
        type,
        title: SECTION_META[type].title,
        content: "",
        order: SECTION_META[type].order,
      })),
    });

    redirect(`/proposals/${proposal.id}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={{ name: user.name, email: user.email, plan: user.plan }} />

      <main className="flex-1 bg-zinc-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-zinc-900">New Proposal</h1>
            <p className="text-zinc-600 mt-1">
              Fill in the basics and we'll help you generate the content
            </p>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-900">
                Proposal Details
              </h2>
            </CardHeader>
            <CardContent>
              <form action={createProposal} className="space-y-5">
                <Input
                  name="title"
                  label="Proposal Title"
                  placeholder="e.g., Marketing Strategy for ABC Corp"
                  required
                />

                <Input
                  name="clientName"
                  label="Client Name"
                  placeholder="e.g., ABC Corporation"
                  required
                />

                <Select
                  name="clientIndustry"
                  label="Client Industry"
                  placeholder="Select industry"
                  options={[
                    { value: "Technology", label: "Technology" },
                    { value: "Finance", label: "Finance" },
                    { value: "Healthcare", label: "Healthcare" },
                    { value: "Retail", label: "Retail" },
                    { value: "Manufacturing", label: "Manufacturing" },
                    { value: "Agriculture", label: "Agriculture" },
                    { value: "Education", label: "Education" },
                    { value: "Construction", label: "Construction" },
                    { value: "Other", label: "Other" },
                  ]}
                />

                <Textarea
                  name="projectScope"
                  label="Project Scope"
                  placeholder="Describe what this project aims to achieve..."
                  rows={4}
                  hint="Be specific about deliverables, timeline, and objectives"
                />

                <Select
                  name="budgetRange"
                  label="Budget Range"
                  placeholder="Select budget range"
                  options={[
                    { value: "Under $5,000", label: "Under $5,000" },
                    { value: "$5,000 - $10,000", label: "$5,000 - $10,000" },
                    { value: "$10,000 - $25,000", label: "$10,000 - $25,000" },
                    { value: "$25,000 - $50,000", label: "$25,000 - $50,000" },
                    { value: "$50,000+", label: "$50,000+" },
                  ]}
                />

                <Input
                  name="linkedSopId"
                  label="Linked SOP ID (Optional)"
                  placeholder="e.g., sop-123"
                  hint="Link to a Pryro SOP to pull methodology details"
                />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1">
                    Create Proposal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => (window.location.href = "/dashboard")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
