import { Navigation } from "@/components/Navigation";
import { InvestmentCalculator } from "@/components/InvestmentCalculator";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const CalculatorPage = () => {
  // No page-level logout button per latest request

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section id="calculator">
          <InvestmentCalculator />
        </section>
        {/* Logout button removed from Calculator page */}
      </main>
      <Footer />
    </div>
  );
};

export default CalculatorPage;






