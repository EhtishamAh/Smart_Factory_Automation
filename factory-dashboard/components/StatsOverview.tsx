'use client';

import { FactoryData } from '@/types';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Database
} from 'lucide-react';

interface StatsOverviewProps {
  latestData: Record<string, FactoryData>;
  alerts: any[];
  factoryName: string;
}

export default function StatsOverview({ latestData, alerts, factoryName }: StatsOverviewProps) {
  const activeSystems = Object.keys(latestData).length;
  const totalSystems = 7;
  const activeAlerts = alerts.length;
  
  // Calculate system health
  const healthyCount = Object.values(latestData).filter(data => {
    // Check fire status - handle variations like 'CRITICAL FIRE'
    const fireStatus = String(data.fire_status || '').toUpperCase();
    if (fireStatus.includes('FIRE') && fireStatus !== 'SAFE') return false;
    
    // Check temperature - convert to number
    const temp = Number(data.temperature);
    if (!isNaN(temp) && (temp > 30 || temp < 15)) return false;
    
    // Check battery
    if (data.battery_level && data.battery_level < 20) return false;
    
    // Check access
    if (data.access_log === 'DENIED') return false;
    
    return true;
  }).length;

  const healthPercentage = activeSystems > 0 ? Math.round((healthyCount / activeSystems) * 100) : 0;

  const stats = [
    {
      title: 'Active Systems',
      value: `${activeSystems}/${totalSystems}`,
      icon: Activity,
      color: 'blue',
      trend: activeSystems === totalSystems ? 'All systems operational' : `${totalSystems - activeSystems} offline`,
    },
    {
      title: 'System Health',
      value: `${healthPercentage}%`,
      icon: healthPercentage >= 80 ? CheckCircle : AlertTriangle,
      color: healthPercentage >= 80 ? 'green' : healthPercentage >= 60 ? 'yellow' : 'red',
      trend: healthPercentage >= 80 ? 'Excellent' : 'Needs attention',
    },
    {
      title: 'Active Alerts',
      value: activeAlerts,
      icon: AlertTriangle,
      color: activeAlerts > 0 ? 'red' : 'green',
      trend: activeAlerts > 0 ? 'Requires action' : 'All clear',
    },
    {
      title: 'Data Points',
      value: Object.values(latestData).length,
      icon: Database,
      color: 'purple',
      trend: 'Real-time',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClass = colorClasses[stat.color as keyof typeof colorClasses];
        
        return (
          <div
            key={index}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-gray-500" />
                  <p className="text-xs text-gray-500">{stat.trend}</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
