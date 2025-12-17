'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Thermometer } from 'lucide-react';

interface TemperatureData {
  timestamp: string;
  temperature: number;
}

interface TemperatureChartProps {
  factoryTable: string;
}

export default function TemperatureChart({ factoryTable }: TemperatureChartProps) {
  const [data, setData] = useState<TemperatureData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemperatureData = async () => {
    try {
      const { data: tempData, error } = await supabase
        .from(factoryTable)
        .select('timestamp, temperature')
        .eq('system_name', 'HVAC_System')
        .not('temperature', 'is', null)
        .order('timestamp', { ascending: true })
        .limit(50);

      if (error) throw error;

      const formattedData = tempData?.map((item: any) => ({
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        temperature: parseFloat(item.temperature)
      })) || [];

      setData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperatureData();
    const interval = setInterval(fetchTemperatureData, 3000);
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
    <div className="glass-effect-strong rounded-2xl p-6 shadow-2xl card-hover fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
          <Thermometer className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Temperature Trend</h3>
          <p className="text-sm text-gray-400">HVAC System Monitoring</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#fff',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ fill: '#3B82F6', r: 4, strokeWidth: 2, stroke: '#1F2937' }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            name="Temperature (°C)"
            fill="url(#tempGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
