import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, LineChart as LineChartIcon, Table } from 'lucide-react';
import { CalculationInputs, CalculationResults, calculateResults } from '@/lib/calculatorUtils';

interface ProfitChartProps {
  inputs: CalculationInputs;
  results: CalculationResults;
}

export const ProfitChart: React.FC<ProfitChartProps> = ({ inputs, results }) => {
  const [priceRange, setPriceRange] = useState([Math.max(5, inputs.sellingPrice - 10), inputs.sellingPrice + 10]);
  const [volumeRange, setVolumeRange] = useState([10, 200]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const priceData = useMemo(() => {
    const data = [];
    const step = (priceRange[1] - priceRange[0]) / 20;
    
    for (let price = priceRange[0]; price <= priceRange[1]; price += step) {
      const testInputs = { ...inputs, sellingPrice: price };
      const testResults = calculateResults(testInputs);
      
      data.push({
        price: price.toFixed(2),
        profit: testResults.netProfit,
        margin: testResults.profitMargin,
        breakEven: testResults.breakEvenUnits
      });
    }
    
    return data;
  }, [inputs, priceRange]);

  const volumeData = useMemo(() => {
    const data = [];
    const step = (volumeRange[1] - volumeRange[0]) / 20;
    
    for (let volume = volumeRange[0]; volume <= volumeRange[1]; volume += step) {
      const totalProfit = results.netProfit * volume;
      const totalRevenue = inputs.sellingPrice * volume;
      const totalCosts = results.totalCosts * volume;
      
      data.push({
        volume: Math.round(volume),
        totalProfit,
        totalRevenue,
        totalCosts,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
      });
    }
    
    return data;
  }, [inputs, results, volumeRange]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-lg sm:text-xl">Profit Analysis</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'chart' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('chart')}
              className="flex-1 sm:flex-none"
            >
              <BarChart3 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Chart</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="flex-1 sm:flex-none"
            >
              <Table className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="price">Price Analysis</TabsTrigger>
            <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="price" className="space-y-4">
            <div className="space-y-2">
              <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={100}
                min={1}
                step={0.5}
                className="w-full"
              />
            </div>
            
            {viewMode === 'chart' ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={chartType === 'line' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('line')}
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('bar')}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="price" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'profit' ? `$${value.toFixed(2)}` : 
                            name === 'margin' ? `${value.toFixed(1)}%` : 
                            `${value} units`,
                            name === 'profit' ? 'Net Profit' : 
                            name === 'margin' ? 'Profit Margin' : 
                            'Break-even Units'
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke="#22c55e"
                          strokeWidth={2}
                          name="profit"
                        />
                      </LineChart>
                    ) : (
                      <BarChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="price" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'profit' ? `$${value.toFixed(2)}` : 
                            name === 'margin' ? `${value.toFixed(1)}%` : 
                            `${value} units`,
                            name === 'profit' ? 'Net Profit' : 
                            name === 'margin' ? 'Profit Margin' : 
                            'Break-even Units'
                          ]}
                        />
                        <Bar
                          dataKey="profit"
                          fill="#22c55e"
                          name="profit"
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Net Profit</th>
                      <th className="text-left p-2">Margin</th>
                      <th className="text-left p-2">Break-even</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">${row.price}</td>
                        <td className="p-2">${row.profit.toFixed(2)}</td>
                        <td className="p-2">{row.margin.toFixed(1)}%</td>
                        <td className="p-2">{row.breakEven} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="volume" className="space-y-4">
            <div className="space-y-2">
              <Label>Volume Range: {volumeRange[0]} - {volumeRange[1]} units</Label>
              <Slider
                value={volumeRange}
                onValueChange={setVolumeRange}
                max={500}
                min={10}
                step={10}
                className="w-full"
              />
            </div>
            
            {viewMode === 'chart' ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="volume" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `$${value.toFixed(2)}`,
                        name === 'totalProfit' ? 'Total Profit' : 
                        name === 'totalRevenue' ? 'Total Revenue' : 
                        'Total Costs'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalProfit" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="totalProfit"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalRevenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="totalRevenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalCosts" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="totalCosts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Volume</th>
                      <th className="text-left p-2">Total Profit</th>
                      <th className="text-left p-2">Total Revenue</th>
                      <th className="text-left p-2">Total Costs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volumeData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{row.volume} units</td>
                        <td className="p-2">${row.totalProfit.toFixed(2)}</td>
                        <td className="p-2">${row.totalRevenue.toFixed(2)}</td>
                        <td className="p-2">${row.totalCosts.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
