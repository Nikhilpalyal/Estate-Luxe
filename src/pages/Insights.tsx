import { Navigation } from "@/components/Navigation";
import { MarketInsights } from "@/components/MarketInsights";
import { Footer } from "@/components/Footer";

const InsightsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section id="insights">
          <MarketInsights />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default InsightsPage;






