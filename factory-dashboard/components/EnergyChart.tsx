'use client';

import { useEffect, useState } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Zap } from 'lucide-react';

interface EnergyData {
  timestamp: string;
  battery_level: number;
  led_brightness: number;
}

interface EnergyChartProps {
  factoryTable: string;
}

export default function EnergyChart({ factoryTable }: EnergyChartProps) {
  const [data, setData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnergyData = async () => {
    try {
      const { data: energyData, error } = await supabase
        .from(factoryTable)
        .select('timestamp, battery_level, led_brightness')
        .eq('system_name', 'Battery_System')
        .not('battery_level', 'is', null)
        .order('timestamp', { ascending: true })
        .limit(50);

      if (error) throw error;

      const formattedData = energyData?.map((item: any) => ({
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        battery_level: parseFloat(item.battery_level) || 0,
        led_brightness: parseInt(item.led_brightness) || 0
      })) || [];

      setData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching energy data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnergyData();
    const interval = setInterval(fetchEnergyData, 3000);
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
        <Zap className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Energy Management</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="ledGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            label={{ value: 'Battery %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            label={{ value: 'LED', angle: 90, position: 'insideRight', fill: '#9CA3AF' }}
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
            yAxisId="right"
            type="monotone" 
            dataKey="led_brightness" 
            fill="url(#ledGradient)"
            stroke="#F59E0B"
            strokeWidth={2}
            name="LED Brightness"
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="battery_level" 
            stroke="#10B981" 
            strokeWidth={3}
            dot={{ fill: '#10B981', r: 3 }}
            name="Battery Level (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
