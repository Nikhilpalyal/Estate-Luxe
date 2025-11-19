import { Navigation } from "@/components/Navigation";
import { PropertyForm, type PropertyDetails } from "@/components/PropertyForm";
import { ValuationResults } from "@/components/ValuationResults";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ValuationPage = () => {
  const [valuationInput, setValuationInput] = useState<PropertyDetails | undefined>(undefined);
  const handleFormSubmit = (data: PropertyDetails) => {
    setValuationInput(data);
  };

  // Accept prefill via navigation state: { prefill: PropertyDetails }
  const location = useLocation();
  useEffect(() => {
    try {
      const stateAny = (location.state || {}) as any;
      if (stateAny?.prefill) {
        setValuationInput(stateAny.prefill as PropertyDetails);
      }
    } catch {}
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section id="valuation">
          <PropertyForm onSubmit={handleFormSubmit} />
          {valuationInput && <ValuationResults input={valuationInput} stickyHeader={false} />}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ValuationPage;


