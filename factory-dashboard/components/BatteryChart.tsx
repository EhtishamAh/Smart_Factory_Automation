'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Battery } from 'lucide-react';

interface BatteryData {
  timestamp: string;
  battery_level: number;
}

interface BatteryChartProps {
  factoryTable: string;
}

export default function BatteryChart({ factoryTable }: BatteryChartProps) {
  const [data, setData] = useState<BatteryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatteryData = async () => {
    try {
      const { data: batteryData, error } = await supabase
        .from(factoryTable)
        .select('timestamp, battery_level')
        .eq('system_name', 'Battery_System')
        .not('battery_level', 'is', null)
        .order('timestamp', { ascending: true })
        .limit(50);

      if (error) throw error;

      const formattedData = batteryData?.map((item: any) => ({
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        battery_level: parseFloat(item.battery_level)
      })) || [];

      setData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching battery data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatteryData();
    const interval = setInterval(fetchBatteryData, 3000);
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
        <Battery className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Battery Level Trend</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            domain={[0, 100]}
            label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
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
          <Area 
            type="monotone" 
            dataKey="battery_level" 
            stroke="#10B981" 
            strokeWidth={2}
            fill="url(#batteryGradient)"
            name="Battery Level (%)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
