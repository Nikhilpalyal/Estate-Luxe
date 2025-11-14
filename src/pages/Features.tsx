import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { BarChart3, FileDown, Heart, Home as HomeIcon } from "lucide-react";

const isAuthenticated = () => {
  try {
    const u = JSON.parse(localStorage.getItem("auth:user") || "null");
    return !!u && !!(u.email || u.name);
  } catch {
    return false;
  }
};

const FeaturesPage = () => {
  const navigate = useNavigate();

  const gate = (dest: string) => {
    if (isAuthenticated()) {
      navigate(dest);
    } else {
      navigate("/login", { replace: true, state: { from: { pathname: dest } } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold">Features</h1>
                <p className="text-muted-foreground mt-2">Explore Estate Luxe capabilities. You can view pages without login; some actions will ask you to sign in and return you here.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Get Property Valuation */}
              <Card className="glass p-6 border-border/50 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <HomeIcon className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-semibold">Get Property Valuation</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">Enter details and get instant AI valuation and insights.</p>
                <div className="flex gap-3">
                  <Button className="btn-premium" onClick={() => gate("/valuation")}>Open Valuation</Button>
                </div>
              </Card>

              {/* Save Property */}
              <Card className="glass p-6 border-border/50 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-semibold">Save Property</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">Save a property to your profile. Requires login.</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => gate("/valuation")}>Go to Valuation</Button>
                </div>
              </Card>

              {/* Download Report */}
              <Card className="glass p-6 border-border/50 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <FileDown className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-semibold">Download Report</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">Generate and download a valuation report as CSV. Requires login.</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => gate("/valuation")}>Start in Valuation</Button>
                </div>
              </Card>

              {/* Market Insights */}
              <Card className="glass p-6 border-border/50 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-semibold">Market Insights</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">Explore trends and insights. Viewing is public; some actions may require login.</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate("/insights")}>Open Insights</Button>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
