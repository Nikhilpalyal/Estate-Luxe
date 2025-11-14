import { useEffect, useState } from "react";
import { Calculator, TrendingUp, PieChart, DollarSign, Percent, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CountryCode, formatCurrency, getSavedCountry, saveCountry, convertBetweenCountries } from "@/lib/currency";

export const InvestmentCalculator = () => {
  const [country, setCountry] = useState<CountryCode>(getSavedCountry());
  const [calculation, setCalculation] = useState({
    propertyPrice: 450000,
    downPayment: 20,
    interestRate: 6.5,
    loanTerm: 30,
    monthlyRent: 2800,
    propertyTax: 1.2,
    insurance: 0.8,
    maintenance: 1.0,
    vacancy: 5,
    appreciation: 7.5,
  });

  // Calculate investment metrics
  const downPaymentAmount = (calculation.propertyPrice * calculation.downPayment) / 100;
  const loanAmount = calculation.propertyPrice - downPaymentAmount;
  const monthlyRate = calculation.interestRate / 100 / 12;
  const numPayments = calculation.loanTerm * 12;
  
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const monthlyPropertyTax = (calculation.propertyPrice * calculation.propertyTax / 100) / 12;
  const monthlyInsurance = (calculation.propertyPrice * calculation.insurance / 100) / 12;
  const monthlyMaintenance = (calculation.propertyPrice * calculation.maintenance / 100) / 12;
  const effectiveRent = calculation.monthlyRent * (1 - calculation.vacancy / 100);
  
  const totalMonthlyExpenses = monthlyPayment + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance;
  const monthlyCashFlow = effectiveRent - totalMonthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCashReturn = (annualCashFlow / downPaymentAmount) * 100;
  
  const capRate = ((calculation.monthlyRent * 12) - (monthlyPropertyTax + monthlyInsurance + monthlyMaintenance) * 12) / calculation.propertyPrice * 100;
  
  const futureValue1Year = calculation.propertyPrice * (1 + calculation.appreciation / 100);
  const futureValue5Year = calculation.propertyPrice * Math.pow(1 + calculation.appreciation / 100, 5);
  const futureValue10Year = calculation.propertyPrice * Math.pow(1 + calculation.appreciation / 100, 10);

  useEffect(() => {
    saveCountry(country);
  }, [country]);

  return (
    <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
            Investment Calculator
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Analyze rental property returns, cash flow projections, and long-term investment potential 
            with our comprehensive ROI calculator.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="glass p-8 border-border/50 shadow-elegant">
            <div className="flex items-center justify-between gap-2 mb-8">
              <Calculator className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-semibold text-foreground">Property Details</h3>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Country</span>
                <Select
                  value={country}
                  onValueChange={(v) => {
                    const next = v as CountryCode;
                    if (next !== country) {
                      // Convert key monetary inputs when switching country
                      const convertedPrice = convertBetweenCountries(calculation.propertyPrice, country, next);
                      const convertedRent = convertBetweenCountries(calculation.monthlyRent, country, next);
                      setCalculation({
                        ...calculation,
                        propertyPrice: Math.round(convertedPrice),
                        monthlyRent: Math.round(convertedRent),
                      });
                      setCountry(next);
                    }
                  }}
                >
                  <SelectTrigger className="h-9 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="US">USA</SelectItem>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="AE">Dubai (UAE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              {/* Property Price */}
              <div>
                <Label htmlFor="propertyPrice" className="text-sm font-medium text-foreground">
                  Property Purchase Price
                </Label>
                <Input
                  id="propertyPrice"
                  type="number"
                  value={calculation.propertyPrice}
                  onChange={(e) => setCalculation({ ...calculation, propertyPrice: Number(e.target.value) })}
                  className="mt-2 h-12"
                />
              </div>

              {/* Down Payment */}
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Down Payment: {calculation.downPayment}% ({formatCurrency(downPaymentAmount, country)})
                </Label>
                <Slider
                  value={[calculation.downPayment]}
                  onValueChange={(value) => setCalculation({ ...calculation, downPayment: value[0] })}
                  max={50}
                  min={5}
                  step={5}
                  className="mt-3"
                />
              </div>

              {/* Interest Rate */}
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Interest Rate: {calculation.interestRate}%
                </Label>
                <Slider
                  value={[calculation.interestRate]}
                  onValueChange={(value) => setCalculation({ ...calculation, interestRate: value[0] })}
                  max={10}
                  min={3}
                  step={0.1}
                  className="mt-3"
                />
              </div>

              {/* Loan Term */}
              <div>
                <Label htmlFor="loanTerm" className="text-sm font-medium text-foreground">
                  Loan Term (Years)
                </Label>
                <Select 
                  value={calculation.loanTerm.toString()} 
                  onValueChange={(value) => setCalculation({ ...calculation, loanTerm: Number(value) })}
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Years</SelectItem>
                    <SelectItem value="20">20 Years</SelectItem>
                    <SelectItem value="25">25 Years</SelectItem>
                    <SelectItem value="30">30 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Monthly Rent */}
              <div>
                <Label htmlFor="monthlyRent" className="text-sm font-medium text-foreground">
                  Monthly Rent Income
                </Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  value={calculation.monthlyRent}
                  onChange={(e) => setCalculation({ ...calculation, monthlyRent: Number(e.target.value) })}
                  className="mt-2 h-12"
                />
              </div>

              {/* Operating Expenses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Property Tax: {calculation.propertyTax}%
                  </Label>
                  <Slider
                    value={[calculation.propertyTax]}
                    onValueChange={(value) => setCalculation({ ...calculation, propertyTax: value[0] })}
                    max={3}
                    min={0.5}
                    step={0.1}
                    className="mt-3"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Insurance: {calculation.insurance}%
                  </Label>
                  <Slider
                    value={[calculation.insurance]}
                    onValueChange={(value) => setCalculation({ ...calculation, insurance: value[0] })}
                    max={2}
                    min={0.3}
                    step={0.1}
                    className="mt-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Maintenance: {calculation.maintenance}%
                  </Label>
                  <Slider
                    value={[calculation.maintenance]}
                    onValueChange={(value) => setCalculation({ ...calculation, maintenance: value[0] })}
                    max={3}
                    min={0.5}
                    step={0.1}
                    className="mt-3"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Vacancy: {calculation.vacancy}%
                  </Label>
                  <Slider
                    value={[calculation.vacancy]}
                    onValueChange={(value) => setCalculation({ ...calculation, vacancy: value[0] })}
                    max={15}
                    min={0}
                    step={1}
                    className="mt-3"
                  />
                </div>
              </div>

              {/* Appreciation Rate */}
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Annual Appreciation: {calculation.appreciation}%
                </Label>
                <Slider
                  value={[calculation.appreciation]}
                  onValueChange={(value) => setCalculation({ ...calculation, appreciation: value[0] })}
                  max={15}
                  min={1}
                  step={0.1}
                  className="mt-3"
                />
              </div>
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {/* Cash Flow Analysis */}
            <Card className="glass p-6 border-border/50 shadow-elegant">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="h-5 w-5 text-success" />
                <h3 className="text-xl font-semibold text-foreground">Cash Flow Analysis</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monthly Rent Income:</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(calculation.monthlyRent, country)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Effective Rent (after vacancy):</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(effectiveRent, country)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monthly Expenses:</span>
                  <span className="font-semibold text-destructive">
                    -{formatCurrency(totalMonthlyExpenses, country)}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Monthly Cash Flow:</span>
                    <span className={`text-2xl font-bold ${monthlyCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(monthlyCashFlow, country)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Investment Metrics */}
            <Card className="glass p-6 border-border/50 shadow-elegant">
              <div className="flex items-center gap-2 mb-6">
                <Percent className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Investment Returns</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {cashOnCashReturn.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Cash-on-Cash Return</div>
                </div>
                <div className="text-center p-4 bg-secondary/5 rounded-lg">
                  <div className="text-2xl font-bold text-secondary mb-1">
                    {capRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Cap Rate</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Annual Cash Flow:</span>
                  <span className={`font-semibold ${annualCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(annualCashFlow, country)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Cash Investment:</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(downPaymentAmount, country)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Future Value Projections */}
            <Card className="glass p-6 border-border/50 shadow-elegant">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-success" />
                <h3 className="text-xl font-semibold text-foreground">Property Value Projections</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Value:</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(calculation.propertyPrice, country)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">1 Year:</span>
                  <span className="font-semibold text-success">
                    {formatCurrency(futureValue1Year, country)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">5 Years:</span>
                  <span className="font-semibold text-success">
                    {formatCurrency(futureValue5Year, country)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">10 Years:</span>
                  <span className="font-semibold text-success">
                    {formatCurrency(futureValue10Year, country)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Total 10-Year Return Potential:</div>
                <div className="text-2xl font-bold text-gradient bg-gradient-primary bg-clip-text text-transparent">
                  {formatCurrency(((futureValue10Year - calculation.propertyPrice) + (annualCashFlow * 10)), country)}
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <Button
              className="btn-premium w-full h-12 text-lg font-semibold"
              onClick={() => toast({ title: "Generating report", description: "We will compile your investment details." })}
            >
              <PieChart className="mr-2 h-5 w-5" />
              Generate Detailed Report
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};