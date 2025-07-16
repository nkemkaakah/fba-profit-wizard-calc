import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Mail, Menu, X, Download, Share2, Copy, AlertTriangle, ChevronDown, Save, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import IntroScreen from './IntroScreen';
import { TooltipInfo } from '@/components/ui/tooltip-info';
import { InfoModal } from '@/components/ui/info-modal';
import { ProfitChart } from './ProfitChart';
import { 
  CalculationInputs, 
  CalculationResults, 
  calculateResults, 
  getSmartDefaults, 
  validateInputs, 
  getContextualAdvice, 
  encodeStateToUrl, 
  decodeStateFromUrl, 
  exportToPDF, 
  exportToJSON, 
  copyToClipboard 
} from '@/lib/calculatorUtils';

const FBACalculator = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [inputs, setInputs] = useState<CalculationInputs>(() => ({
    productCost: 0,
    sellingPrice: 0,
    referralFee: 0,
    fbaFee: 0,
    shippingCost: 0,
    ppcBudget: 0,
    otherFees: 0,
    ...getSmartDefaults(),
    ...decodeStateFromUrl(),
  }));

  const [scenario1, setScenario1] = useState<CalculationInputs | null>(null);
  const [scenario2, setScenario2] = useState<CalculationInputs | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [email, setEmail] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAlgorithmOpen, setIsAlgorithmOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleInputChange = (field: keyof CalculationInputs, value: string) => {
    const numericValue = parseFloat(value) || 0;
    if (numericValue < 0) return; // Prevent negative values
    
    const newInputs = {
      ...inputs,
      [field]: numericValue
    };
    
    // Auto-calculate referral fee as 15% of selling price if not manually set
    if (field === 'sellingPrice' && !inputs.referralFee) {
      newInputs.referralFee = numericValue * 0.15;
    }
    
    setInputs(newInputs);
  };

  // Live calculation as user types
  useEffect(() => {
    if (inputs.sellingPrice > 0) {
      const timeoutId = setTimeout(() => {
        const newResults = calculateResults(inputs);
        setResults(newResults);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [inputs]);

  const validateInputsFunc = (): boolean => {
    const errors = validateInputs(inputs);
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const calculateProfit = async () => {
    if (!validateInputsFunc()) return;

    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newResults = calculateResults(inputs);
    setResults(newResults);

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
        net_profit: newResults.netProfit,
        profit_margin: newResults.profitMargin,
        break_even_units: newResults.breakEvenUnits
      });
    } catch (error) {
      console.error('Error logging calculation:', error);
    }

    setIsCalculating(false);
  };

  const saveScenario = (scenarioNumber: 1 | 2) => {
    if (scenarioNumber === 1) {
      setScenario1(inputs);
    } else {
      setScenario2(inputs);
    }
    toast({
      title: "Scenario Saved",
      description: `Scenario ${scenarioNumber} has been saved successfully.`,
    });
  };

  const handleDownloadPDF = async () => {
    if (results) {
      await exportToPDF(inputs, results);
      toast({
        title: "PDF Downloaded",
        description: "Your calculation report has been downloaded.",
      });
    }
  };

  const handleDownloadJSON = () => {
    if (results) {
      exportToJSON(inputs, results);
      toast({
        title: "JSON Downloaded",
        description: "Your calculation data has been downloaded.",
      });
    }
  };

  const handleCopyShareLink = async () => {
    const shareUrl = encodeStateToUrl(inputs);
    await copyToClipboard(shareUrl);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to your clipboard.",
    });
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

  if (showIntro) {
    return <IntroScreen onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight">
              <span className="hidden sm:inline">Amazon FBA Profit Calculator | Calculate FBA Fees & Profit Margins</span>
              <span className="sm:hidden">FBA Profit Calculator</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-2 md:mb-4">Professional profit analysis for your Amazon FBA business</p>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl mx-auto px-2">
              Our comprehensive Amazon FBA calculator helps you determine accurate profit margins, 
              break-even points, and FBA fees for your Amazon business. Calculate your Amazon FBA 
              profit margin with our easy-to-use tool that includes all Amazon seller fees and costs.
            </p>
          </div>
          
          <div className="flex items-center justify-center">
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
              <InfoModal title="What is Break-Even?" triggerText="What is Break-Even?">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    The break-even point is the sales volume at which total revenues equal total costs, 
                    resulting in neither profit nor loss.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    It helps you determine the minimum sales needed to avoid a loss and is calculated by 
                    dividing total fixed costs by the difference between unit selling price and variable cost per unit.
                  </p>
                </div>
              </InfoModal>
              <InfoModal title="Why PPC matters?" triggerText="Why PPC matters?">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Pay-Per-Click (PPC) advertising is crucial for visibility on Amazon. It drives 
                    targeted traffic to your products, increasing sales and potentially improving product ranking.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Effective PPC management leads to higher sales, better organic rankings, and improved profitability 
                    for your Amazon FBA business.
                  </p>
                </div>
              </InfoModal>
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
      <div className="w-full bg-secondary border-b">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="bg-accent/20 border-2 border-dashed border-accent/40 rounded-lg p-4 md:p-8 text-center">
            <p className="text-secondary-foreground text-sm md:text-lg">
              <span className="hidden md:inline">🎯 Ad goes here (728x90 banner)</span>
              <span className="md:hidden">📱 Ad goes here (320x100 mobile)</span>
            </p>
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
                {/* Scenario Management */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="compare-mode"
                      checked={compareMode}
                      onCheckedChange={setCompareMode}
                    />
                    <Label htmlFor="compare-mode" className="text-sm sm:text-base">Compare Scenarios</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveScenario(1)}
                      className="text-xs flex-1 sm:flex-none"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Save as </span>#1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveScenario(2)}
                      className="text-xs flex-1 sm:flex-none"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Save as </span>#2
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="productCost">Product Cost ($)</Label>
                      <TooltipInfo content="The cost to manufacture or purchase your product, including materials and labor" />
                    </div>
                    <Input
                      id="productCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.productCost || ''}
                      onChange={(e) => handleInputChange('productCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-1 focus:ring-2 focus:ring-primary"
                      aria-label="Product cost in dollars"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="sellingPrice">Selling Price ($) *</Label>
                      <TooltipInfo content="The price you'll sell your product for on Amazon" />
                    </div>
                    <Input
                      id="sellingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.sellingPrice || ''}
                      onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                      placeholder="0.00"
                      className="mt-1 focus:ring-2 focus:ring-primary"
                      required
                      aria-label="Selling price in dollars"
                    />
                    {inputs.sellingPrice <= 0 && (
                      <Alert className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          ⚠️ Selling price must be greater than 0
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="referralFee">Amazon Referral Fee ($)</Label>
                      <TooltipInfo content="Amazon referral fee is typically 15% of the selling price. This is automatically calculated when you enter the selling price" />
                    </div>
                    <Input
                      id="referralFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.referralFee || ''}
                      onChange={(e) => handleInputChange('referralFee', e.target.value)}
                      placeholder="Auto-calculated at 15%"
                      className="mt-1 focus:ring-2 focus:ring-primary"
                      aria-label="Amazon referral fee in dollars"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="fbaFee">FBA Fee ($)</Label>
                      <TooltipInfo content="Fulfillment By Amazon fee for storage, picking, packing, and shipping your product" />
                    </div>
                    <Input
                      id="fbaFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.fbaFee || ''}
                      onChange={(e) => handleInputChange('fbaFee', e.target.value)}
                      placeholder="0.00"
                      className="mt-1 focus:ring-2 focus:ring-primary"
                      aria-label="FBA fee in dollars"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="shippingCost">Shipping to Amazon ($)</Label>
                      <TooltipInfo content="Cost to ship your product from supplier to Amazon warehouse" />
                    </div>
                    <Input
                      id="shippingCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.shippingCost || ''}
                      onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-1 focus:ring-2 focus:ring-primary"
                      aria-label="Shipping cost in dollars"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="ppcBudget">PPC Budget per unit ($)</Label>
                      <TooltipInfo content="Average advertising cost per unit sold through Amazon PPC campaigns" />
                    </div>
                    <Input
                      id="ppcBudget"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.ppcBudget || ''}
                      onChange={(e) => handleInputChange('ppcBudget', e.target.value)}
                      placeholder="0.00"
                      className="mt-1 focus:ring-2 focus:ring-primary"
                      aria-label="PPC budget per unit in dollars"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label htmlFor="otherFees">Other Fees ($)</Label>
                      <TooltipInfo content="Any additional fees like monthly storage, long-term storage, returns processing, etc." />
                    </div>
                    <Input
                      id="otherFees"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs.otherFees || ''}
                      onChange={(e) => handleInputChange('otherFees', e.target.value)}
                      placeholder="0.00"
                      className="mt-1 focus:ring-2 focus:ring-primary"
                      aria-label="Other fees in dollars"
                    />
                  </div>
                </div>

                <Button 
                  onClick={calculateProfit}
                  disabled={isCalculating}
                  className="w-full text-base py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
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
            <div className="lg:hidden bg-secondary rounded-lg">
              <div className="bg-accent/20 border-2 border-dashed border-accent/40 rounded-lg p-8 text-center">
                <p className="text-secondary-foreground">📱 Ad goes here (300x250)</p>
              </div>
            </div>

            {/* Results Card */}
            <div className="space-y-6">
              {/* Desktop Ad */}
              <div className="hidden lg:block bg-secondary rounded-lg">
                <div className="bg-accent/20 border-2 border-dashed border-accent/40 rounded-lg p-8 text-center">
                  <p className="text-secondary-foreground">💻 Ad goes here (300x250)</p>
                </div>
              </div>

              {results && (
                <div className="space-y-6">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <CardTitle className="text-lg sm:text-xl">Results</CardTitle>
                        <div className="flex flex-wrap gap-2 sm:space-x-2 sm:space-y-0">
                          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex-1 sm:flex-none">
                            <Download className="h-4 w-4 mr-1" />
                            <span className="hidden xs:inline">PDF</span>
                            <span className="xs:hidden">PDF</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleDownloadJSON} className="flex-1 sm:flex-none">
                            <Download className="h-4 w-4 mr-1" />
                            <span className="hidden xs:inline">JSON</span>
                            <span className="xs:hidden">JSON</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCopyShareLink} className="flex-1 sm:flex-none">
                            <Share2 className="h-4 w-4 mr-1" />
                            <span className="hidden xs:inline">Share</span>
                            <span className="xs:hidden">Share</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="grid gap-4">
                        <div className={`p-4 rounded-lg ${results.netProfit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <Label className="text-sm text-muted-foreground">Net Profit</Label>
                          <p className={`text-2xl font-bold ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${results.netProfit.toFixed(2)}
                          </p>
                          {results.netProfit < 0 && (
                            <Alert className="mt-2 border-red-200">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                ⚠️ Negative profit! Consider reducing costs or increasing selling price.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div className="p-4 rounded-lg bg-card border">
                          <Label className="text-sm text-muted-foreground">Profit Margin</Label>
                          <p className={`text-xl font-semibold ${results.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                      
                      {/* Contextual Advice */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">Analysis & Advice</h4>
                        {getContextualAdvice(results, inputs).map((advice, index) => (
                          <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">{advice}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Chart Visualization */}
                  <ProfitChart inputs={inputs} results={results} />
                  
                  {/* Scenario Comparison */}
                  {compareMode && (scenario1 || scenario2) && (
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-xl">Scenario Comparison</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {scenario1 && (
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-semibold mb-3">Scenario 1</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Selling Price:</span>
                                  <span>${scenario1.sellingPrice}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Product Cost:</span>
                                  <span>${scenario1.productCost}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Net Profit:</span>
                                  <span>${calculateResults(scenario1).netProfit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Profit Margin:</span>
                                  <span>{calculateResults(scenario1).profitMargin.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          )}
                          {scenario2 && (
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-semibold mb-3">Scenario 2</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Selling Price:</span>
                                  <span>${scenario2.sellingPrice}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Product Cost:</span>
                                  <span>${scenario2.productCost}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Net Profit:</span>
                                  <span>${calculateResults(scenario2).netProfit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Profit Margin:</span>
                                  <span>{calculateResults(scenario2).profitMargin.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
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

        {/* Algorithm Transparency Section */}
        <section className="mb-12">
          <Card className="shadow-lg">
            <CardHeader>
              <Collapsible open={isAlgorithmOpen} onOpenChange={setIsAlgorithmOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-xl">How We Calculate</CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isAlgorithmOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-6 space-y-6">
                    <div className="grid gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Net Profit Formula</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          <code className="bg-gray-200 px-2 py-1 rounded">
                            Net Profit = Selling Price – (Product Cost + Amazon Referral Fee + FBA Fee + Shipping + PPC + Other Fees)
                          </code>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This calculates your actual profit per unit after all costs are deducted from your selling price.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Profit Margin Formula</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          <code className="bg-gray-200 px-2 py-1 rounded">
                            Profit Margin % = (Net Profit / Selling Price) × 100
                          </code>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This shows what percentage of your selling price is actual profit. Higher margins indicate better profitability.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Break-Even Units Formula</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          <code className="bg-gray-200 px-2 py-1 rounded">
                            Break-Even Units = ceil(Total Costs / (Selling Price – Product Cost))
                          </code>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This calculates how many units you need to sell to cover all your costs and start making profit.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold mb-2 text-blue-800">Key Assumptions</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Amazon referral fee defaults to 15% of selling price (varies by category)</li>
                          <li>• All fees are calculated per unit sold</li>
                          <li>• PPC budget represents average advertising cost per unit</li>
                          <li>• Calculations assume consistent costs across all units</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>
        </section>

        {/* Email Capture Section */}
        {results && (
          <section className="mb-12">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-center">Get Your Results Delivered</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base">Enter your email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1 focus:ring-2 focus:ring-primary"
                      aria-label="Email address for results delivery"
                    />
                  </div>
                  <Button 
                    onClick={sendResultsToEmail}
                    disabled={!email || isSendingEmail}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base py-4 sm:py-6"
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
                        <span className="hidden sm:inline">Send my results to my inbox</span>
                        <span className="sm:hidden">Send results</span>
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