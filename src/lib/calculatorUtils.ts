import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface CalculationInputs {
  productCost: number;
  sellingPrice: number;
  referralFee: number;
  fbaFee: number;
  shippingCost: number;
  ppcBudget: number;
  otherFees: number;
}

export interface CalculationResults {
  netProfit: number;
  profitMargin: number;
  breakEvenUnits: number;
  totalCosts: number;
}

export const calculateResults = (inputs: CalculationInputs): CalculationResults => {
  const totalCosts = inputs.productCost + inputs.referralFee + inputs.fbaFee + 
                    inputs.shippingCost + inputs.ppcBudget + inputs.otherFees;
  
  const netProfit = inputs.sellingPrice - totalCosts;
  const profitMargin = inputs.sellingPrice > 0 ? (netProfit / inputs.sellingPrice) * 100 : 0;
  const breakEvenUnits = netProfit !== 0 ? Math.ceil(Math.abs(totalCosts / (inputs.sellingPrice - inputs.productCost))) : 0;

  return {
    netProfit,
    profitMargin,
    breakEvenUnits,
    totalCosts
  };
};

export const getSmartDefaults = (): Partial<CalculationInputs> => ({
  referralFee: 0, // Will be calculated as 15% of selling price
  fbaFee: 0,
  shippingCost: 0,
  ppcBudget: 0,
  otherFees: 0
});

export const validateInputs = (inputs: CalculationInputs): string[] => {
  const errors: string[] = [];
  
  if (inputs.sellingPrice <= 0) {
    errors.push('Selling price must be greater than 0');
  }
  
  if (inputs.productCost < 0) {
    errors.push('Product cost cannot be negative');
  }
  
  return errors;
};

export const getContextualAdvice = (results: CalculationResults, inputs: CalculationInputs): string[] => {
  const advice: string[] = [];
  
  if (results.netProfit < 0) {
    advice.push('⚠️ Negative profit! Consider reducing costs or increasing selling price.');
  }
  
  if (results.profitMargin < 15) {
    advice.push('⚠️ Low profit margin. Aim for at least 15% for sustainable business.');
  } else if (results.profitMargin >= 30) {
    advice.push('✅ Excellent profit margin! This is considered healthy for FBA sellers.');
  } else if (results.profitMargin >= 20) {
    advice.push('✅ Good profit margin. You\'re on the right track.');
  }
  
  if (results.netProfit > 0) {
    const monthlyRevenue = (results.netProfit * 100).toFixed(0);
    advice.push(`💡 At this margin, you'd need to sell ${results.breakEvenUnits} units monthly to break even.`);
    advice.push(`📈 Selling 100 units monthly would net you $${monthlyRevenue}.`);
  }
  
  const referralFeePercentage = inputs.sellingPrice > 0 ? (inputs.referralFee / inputs.sellingPrice) * 100 : 0;
  if (referralFeePercentage > 20) {
    advice.push('⚠️ High referral fee percentage. Check if this is accurate for your category.');
  }
  
  return advice;
};

export const encodeStateToUrl = (inputs: CalculationInputs): string => {
  const params = new URLSearchParams();
  Object.entries(inputs).forEach(([key, value]) => {
    if (value !== 0) {
      params.set(key, value.toString());
    }
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

export const decodeStateFromUrl = (): Partial<CalculationInputs> => {
  const params = new URLSearchParams(window.location.search);
  const inputs: Partial<CalculationInputs> = {};
  
  const keys: (keyof CalculationInputs)[] = [
    'productCost', 'sellingPrice', 'referralFee', 'fbaFee', 
    'shippingCost', 'ppcBudget', 'otherFees'
  ];
  
  keys.forEach(key => {
    const value = params.get(key);
    if (value !== null) {
      inputs[key] = parseFloat(value) || 0;
    }
  });
  
  return inputs;
};

export const exportToPDF = async (inputs: CalculationInputs, results: CalculationResults): Promise<void> => {
  const pdf = new jsPDF();
  
  // Title
  pdf.setFontSize(20);
  pdf.text('Amazon FBA Profit Calculator Report', 20, 20);
  
  // Date
  pdf.setFontSize(12);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
  
  // Input section
  pdf.setFontSize(16);
  pdf.text('Input Values:', 20, 55);
  
  pdf.setFontSize(12);
  let yPos = 70;
  pdf.text(`Product Cost: $${inputs.productCost.toFixed(2)}`, 20, yPos);
  yPos += 10;
  pdf.text(`Selling Price: $${inputs.sellingPrice.toFixed(2)}`, 20, yPos);
  yPos += 10;
  pdf.text(`Amazon Referral Fee: $${inputs.referralFee.toFixed(2)}`, 20, yPos);
  yPos += 10;
  pdf.text(`FBA Fee: $${inputs.fbaFee.toFixed(2)}`, 20, yPos);
  yPos += 10;
  pdf.text(`Shipping Cost: $${inputs.shippingCost.toFixed(2)}`, 20, yPos);
  yPos += 10;
  pdf.text(`PPC Budget: $${inputs.ppcBudget.toFixed(2)}`, 20, yPos);
  yPos += 10;
  pdf.text(`Other Fees: $${inputs.otherFees.toFixed(2)}`, 20, yPos);
  
  // Results section
  yPos += 25;
  pdf.setFontSize(16);
  pdf.text('Results:', 20, yPos);
  
  yPos += 15;
  pdf.setFontSize(12);
  pdf.text(`Net Profit: $${results.netProfit.toFixed(2)}`, 20, yPos);
  yPos += 10;
  pdf.text(`Profit Margin: ${results.profitMargin.toFixed(1)}%`, 20, yPos);
  yPos += 10;
  pdf.text(`Break-even Units: ${results.breakEvenUnits}`, 20, yPos);
  
  // Formulas section
  yPos += 25;
  pdf.setFontSize(16);
  pdf.text('Calculation Methods:', 20, yPos);
  
  yPos += 15;
  pdf.setFontSize(12);
  pdf.text('Net Profit = Selling Price - (Product Cost + Fees + Shipping + PPC)', 20, yPos);
  yPos += 10;
  pdf.text('Profit Margin % = (Net Profit / Selling Price) × 100', 20, yPos);
  yPos += 10;
  pdf.text('Break-Even Units = ceil(Total Costs / (Selling Price - Product Cost))', 20, yPos);
  
  pdf.save('fba-profit-calculation.pdf');
};

export const exportToJSON = (inputs: CalculationInputs, results: CalculationResults): void => {
  const data = {
    timestamp: new Date().toISOString(),
    inputs,
    results,
    calculations: {
      netProfit: 'Selling Price - (Product Cost + Fees + Shipping + PPC)',
      profitMargin: '(Net Profit / Selling Price) × 100',
      breakEvenUnits: 'ceil(Total Costs / (Selling Price - Product Cost))'
    }
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fba-profit-calculation.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};
