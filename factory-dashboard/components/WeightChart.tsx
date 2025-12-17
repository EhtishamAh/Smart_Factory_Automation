'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Scale } from 'lucide-react';

interface WeightData {
  timestamp: string;
  weight_grams: number;
}

interface WeightChartProps {
  factoryTable: string;
}

export default function WeightChart({ factoryTable }: WeightChartProps) {
  const [data, setData] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeightData = async () => {
    try {
      const { data: weightData, error } = await supabase
        .from(factoryTable)
        .select('timestamp, weight_grams')
        .eq('system_name', 'Weight_System')
        .not('weight_grams', 'is', null)
        .order('timestamp', { ascending: true })
        .limit(40);

      if (error) throw error;

      const formattedData = weightData?.map((item: any) => ({
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        weight_grams: parseFloat(item.weight_grams)
      })) || [];

      setData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weight data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightData();
    const interval = setInterval(fetchWeightData, 3000);
    return () => clearInterval(interval);
  }, [factoryTable]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Weight Measurements</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            label={{ value: 'grams', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Line 
            type="monotone" 
            dataKey="weight_grams" 
            stroke="#FBBF24" 
            strokeWidth={2}
            dot={{ fill: '#FBBF24', r: 3 }}
            activeDot={{ r: 5 }}
            name="Weight (g)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
