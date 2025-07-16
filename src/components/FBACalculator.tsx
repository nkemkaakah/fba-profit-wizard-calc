import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, Mail, Menu, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CalculationInputs {
  productCost: number;
  sellingPrice: number;
  referralFee: number;
  fbaFee: number;
  shippingCost: number;
  ppcBudget: number;
  otherFees: number;
}

interface CalculationResults {
  netProfit: number;
  profitMargin: number;
  breakEvenUnits: number;
}

const FBACalculator = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    productCost: 0,
    sellingPrice: 0,
    referralFee: 0,
    fbaFee: 0,
    shippingCost: 0,
    ppcBudget: 0,
    otherFees: 0,
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [email, setEmail] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof CalculationInputs, value: string) => {
    const numericValue = parseFloat(value) || 0;
    if (numericValue < 0) return; // Prevent negative values
    
    setInputs(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const validateInputs = (): boolean => {
    if (inputs.sellingPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Selling price must be greater than 0",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const calculateProfit = async () => {
    if (!validateInputs()) return;

    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const totalCosts = inputs.productCost + inputs.referralFee + inputs.fbaFee + 
                      inputs.shippingCost + inputs.ppcBudget + inputs.otherFees;
    
    const netProfit = inputs.sellingPrice - totalCosts;
    const profitMargin = inputs.sellingPrice > 0 ? (netProfit / inputs.sellingPrice) * 100 : 0;
    const breakEvenUnits = netProfit !== 0 ? Math.ceil(Math.abs(totalCosts / (inputs.sellingPrice - inputs.productCost))) : 0;

    const calculationResults = {
      netProfit,
      profitMargin,
      breakEvenUnits
    };

    setResults(calculationResults);

    // Log calculation to Supabase
    try {
      await supabase.from('calculations').insert({
        product_cost: inputs.productCost,
        selling_price: inputs.sellingPrice,
        referral_fee: inputs.referralFee,
        fba_fee: inputs.fbaFee,
        shipping_cost: inputs.shippingCost,
        ppc_budget: inputs.ppcBudget,
        other_fees: inputs.otherFees,
        net_profit: calculationResults.netProfit,
        profit_margin: calculationResults.profitMargin,
        break_even_units: calculationResults.breakEvenUnits
      });
    } catch (error) {
      console.error('Error logging calculation:', error);
    }

    setIsCalculating(false);
  };

  const sendResultsToEmail = async () => {
    if (!email || !results) return;

    setIsSendingEmail(true);

    try {
      // Log email capture to Supabase
      await supabase.from('calculations').insert({
        product_cost: inputs.productCost,
        selling_price: inputs.sellingPrice,
        referral_fee: inputs.referralFee,
        fba_fee: inputs.fbaFee,
        shipping_cost: inputs.shippingCost,
        ppc_budget: inputs.ppcBudget,
        other_fees: inputs.otherFees,
        net_profit: results.netProfit,
        profit_margin: results.profitMargin,
        break_even_units: results.breakEvenUnits,
        email: email
      });

      toast({
        title: "Email Sent!",
        description: "Your calculation results have been sent to your inbox.",
      });
      
      setEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    }

    setIsSendingEmail(false);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">FBA Profit Calculator</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => scrollToSection('calculator')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Calculator
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                How it works
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => scrollToSection('calculator')}
                  className="text-left text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Calculator
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  How it works
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Banner Ad Placeholder */}
      <div className="w-full bg-muted border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-accent/50 border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
            <p className="text-muted-foreground text-lg">🎯 Ad goes here (728x90 banner)</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Calculator Section */}
        <section id="calculator" className="mb-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="productCost">Product Cost ($)</Label>
                    <Input
                      id="productCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.productCost || ''}
                      onChange={(e) => handleInputChange('productCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sellingPrice">Selling Price ($) *</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.sellingPrice || ''}
                      onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="referralFee">Amazon Referral Fee ($)</Label>
                    <Input
                      id="referralFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.referralFee || ''}
                      onChange={(e) => handleInputChange('referralFee', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fbaFee">FBA Fee ($)</Label>
                    <Input
                      id="fbaFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.fbaFee || ''}
                      onChange={(e) => handleInputChange('fbaFee', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shippingCost">Shipping to Amazon ($)</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.shippingCost || ''}
                      onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ppcBudget">PPC Budget per unit ($)</Label>
                    <Input
                      id="ppcBudget"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.ppcBudget || ''}
                      onChange={(e) => handleInputChange('ppcBudget', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="otherFees">Other Fees ($)</Label>
                    <Input
                      id="otherFees"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.otherFees || ''}
                      onChange={(e) => handleInputChange('otherFees', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button 
                  onClick={calculateProfit}
                  disabled={isCalculating}
                  className="w-full text-base py-6"
                  size="lg"
                >
                  {isCalculating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Calculating...</span>
                    </div>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Profit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Rectangle Ad Placeholder */}
            <div className="lg:hidden bg-muted rounded-lg">
              <div className="bg-accent/50 border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                <p className="text-muted-foreground">📱 Ad goes here (300x250)</p>
              </div>
            </div>

            {/* Results Card */}
            <div className="space-y-6">
              {/* Desktop Ad */}
              <div className="hidden lg:block bg-muted rounded-lg">
                <div className="bg-accent/50 border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">💻 Ad goes here (300x250)</p>
                </div>
              </div>

              {results && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="grid gap-4">
                      <div className={`p-4 rounded-lg ${results.netProfit >= 0 ? 'bg-profit/10 border border-profit/20' : 'bg-loss/10 border border-loss/20'}`}>
                        <Label className="text-sm text-muted-foreground">Net Profit</Label>
                        <p className={`text-2xl font-bold ${results.netProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                          ${results.netProfit.toFixed(2)}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-card border">
                        <Label className="text-sm text-muted-foreground">Profit Margin</Label>
                        <p className={`text-xl font-semibold ${results.profitMargin >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {results.profitMargin.toFixed(1)}%
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-card border">
                        <Label className="text-sm text-muted-foreground">Break-even Units</Label>
                        <p className="text-xl font-semibold text-foreground">
                          {results.breakEvenUnits} units
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mb-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <p className="text-base text-muted-foreground mb-4">
                  Our Amazon FBA Profit Calculator helps you determine the profitability of your products by calculating:
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Net Profit</h3>
                    <p className="text-sm text-muted-foreground">
                      Selling Price minus all costs (product cost, Amazon fees, shipping, PPC, etc.)
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Profit Margin</h3>
                    <p className="text-sm text-muted-foreground">
                      Percentage of profit relative to selling price (Net Profit / Selling Price × 100)
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Break-even Units</h3>
                    <p className="text-sm text-muted-foreground">
                      Number of units needed to cover all fixed costs and start making profit
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Email Capture Section */}
        {results && (
          <section className="mb-12">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-center">Get Your Results Delivered</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="email">Enter your email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={sendResultsToEmail}
                    disabled={!email || isSendingEmail}
                    className="w-full"
                    size="lg"
                  >
                    {isSendingEmail ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send my results to my inbox
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
};

export default FBACalculator;