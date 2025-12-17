'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { PackageCheck } from 'lucide-react';

interface ConveyorData {
  timestamp: string;
  order_count: number;
  conveyor_speed: number;
}

interface ConveyorChartProps {
  factoryTable: string;
}

export default function ConveyorChart({ factoryTable }: ConveyorChartProps) {
  const [data, setData] = useState<ConveyorData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConveyorData = async () => {
    try {
      const { data: conveyorData, error } = await supabase
        .from(factoryTable)
        .select('timestamp, order_count, conveyor_speed')
        .eq('system_name', 'Conveyor_Belt')
        .not('order_count', 'is', null)
        .order('timestamp', { ascending: true })
        .limit(30);

      if (error) throw error;

      const formattedData = conveyorData?.map((item: any) => ({
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        order_count: parseInt(item.order_count) || 0,
        conveyor_speed: parseFloat(item.conveyor_speed) || 0
      })) || [];

      setData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conveyor data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConveyorData();
    const interval = setInterval(fetchConveyorData, 3000);
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
        <PackageCheck className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Production Tracking</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
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
          <Bar 
            dataKey="order_count" 
            fill="#A855F7" 
            name="Order Count"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
