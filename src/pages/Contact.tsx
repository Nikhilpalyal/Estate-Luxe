import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

const ContactPage = () => {
  const [bugTitle, setBugTitle] = useState("");
  const [bugEmail, setBugEmail] = useState("");
  const [bugSeverity, setBugSeverity] = useState("medium");
  const [bugSteps, setBugSteps] = useState("");

  const submitBug = (e: React.FormEvent) => {
    e.preventDefault();
    const report = {
      title: bugTitle.trim(),
      email: bugEmail.trim(),
      severity: bugSeverity,
      steps: bugSteps.trim(),
      at: new Date().toISOString(),
    };
    try {
      const list = JSON.parse(localStorage.getItem("support:bugs") || "[]");
      const next = Array.isArray(list) ? list : [];
      next.push(report);
      localStorage.setItem("support:bugs", JSON.stringify(next));
      toast({ title: "Bug reported", description: "Thanks for the report. We will review it shortly." });
    } catch {}
    // Optional mailto fallback
    try {
      const subject = encodeURIComponent(`[Bug] ${report.title || "Untitled"}`);
      const body = encodeURIComponent(`Severity: ${report.severity}\nEmail: ${report.email}\n\nSteps to reproduce:\n${report.steps}`);
      window.open(`mailto:support@estateluxe.com?subject=${subject}&body=${body}`, "_blank");
    } catch {}
    setBugTitle(""); setBugEmail(""); setBugSeverity("medium"); setBugSteps("");
  };
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section id="contact" className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="glass p-8 border-border/50">
              <h2 className="text-3xl font-display font-bold mb-6">Contact Us</h2>
              <div className="grid gap-4">
                <Input placeholder="Your Name" className="h-12" />
                <Input type="email" placeholder="Email" className="h-12" />
                <Textarea placeholder="Message" className="min-h-[140px]" />
                <Button className="btn-premium self-start">Send Message</Button>
              </div>
            </Card>
            {/* Report a Bug */}
            <Card className="glass p-8 border-border/50 mt-8">
              <h2 className="text-2xl font-display font-semibold mb-4">Report a Bug</h2>
              <p className="text-sm text-muted-foreground mb-4">Spotted an issue? Share details so we can fix it fast.</p>
              <form className="grid gap-4" onSubmit={submitBug}>
                <Input placeholder="Bug summary (e.g., Login button unresponsive)" className="h-12" value={bugTitle} onChange={(e) => setBugTitle(e.target.value)} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input type="email" placeholder="Your email (optional)" className="h-12" value={bugEmail} onChange={(e) => setBugEmail(e.target.value)} />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Severity</div>
                    <select className="w-full h-12 rounded-md bg-background/80 border border-border/50 px-3" value={bugSeverity} onChange={(e) => setBugSeverity(e.target.value)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <Textarea placeholder="Steps to reproduce (bullet points help)" className="min-h-[140px]" value={bugSteps} onChange={(e) => setBugSteps(e.target.value)} required />
                <div className="flex gap-3">
                  <Button type="submit" className="btn-premium">Submit Bug</Button>
                  <Button type="button" variant="outline" onClick={() => { setBugTitle(""); setBugEmail(""); setBugSeverity("medium"); setBugSteps(""); }}>Clear</Button>
                </div>
              </form>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;






