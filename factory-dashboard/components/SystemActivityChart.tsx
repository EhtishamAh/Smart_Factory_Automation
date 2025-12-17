'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { TrendingUp } from 'lucide-react';

interface ActivityData {
  system: string;
  updates: number;
}

interface SystemActivityChartProps {
  factoryTable: string;
}

export default function SystemActivityChart({ factoryTable }: SystemActivityChartProps) {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivityData = async () => {
    try {
      const { data: activityData, error } = await supabase
        .from(factoryTable)
        .select('system_name')
        .gte('timestamp', new Date(Date.now() - 3600000).toISOString()); // Last hour

      if (error) throw error;

      // Count updates per system
      const systemCounts: Record<string, number> = {};
      activityData?.forEach((item: any) => {
        systemCounts[item.system_name] = (systemCounts[item.system_name] || 0) + 1;
      });

      const chartData = Object.entries(systemCounts).map(([system, count]) => ({
        system: system.replace('_', ' '),
        updates: count
      }));

      setData(chartData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
    const interval = setInterval(fetchActivityData, 3000);
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
        <TrendingUp className="w-5 h-5 text-pink-400" />
        <h3 className="text-lg font-semibold text-white">System Activity (Last Hour)</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            type="category"
            dataKey="system"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            width={150}
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
            dataKey="updates" 
            fill="#EC4899" 
            name="Data Updates"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
