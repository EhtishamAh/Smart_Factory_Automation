'use client';

import { SystemAlert } from '@/types';
import { AlertTriangle, Flame, ThermometerSnowflake, ThermometerSun, Battery, Shield, X, Clock } from 'lucide-react';

interface AlertsPanelProps {
  alerts: SystemAlert[];
  onAcknowledge: (alertId: number) => void;
}

export default function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'FIRE_DETECTED':
        return Flame;
      case 'HIGH_TEMPERATURE':
        return ThermometerSun;
      case 'LOW_TEMPERATURE':
        return ThermometerSnowflake;
      case 'LOW_BATTERY':
        return Battery;
      case 'UNAUTHORIZED_ACCESS':
        return Shield;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'red';
      case 'WARNING':
        return 'yellow';
      case 'INFO':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const timeSince = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (alerts.length === 0) return null;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-500/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Active Alerts</h2>
          <p className="text-sm text-gray-400">{alerts.length} alert{alerts.length !== 1 ? 's' : ''} requiring attention</p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.alert_type);
          const color = getSeverityColor(alert.severity);
          
          const colorClasses = {
            red: {
              bg: 'bg-red-500/10',
              border: 'border-red-500/30',
              text: 'text-red-400',
              icon: 'text-red-400',
            },
            yellow: {
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/30',
              text: 'text-yellow-400',
              icon: 'text-yellow-400',
            },
            blue: {
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/30',
              text: 'text-blue-400',
              icon: 'text-blue-400',
            },
            gray: {
              bg: 'bg-gray-500/10',
              border: 'border-gray-500/30',
              text: 'text-gray-400',
              icon: 'text-gray-400',
            },
          };

          const classes = colorClasses[color as keyof typeof colorClasses];

          return (
            <div
              key={alert.id}
              className={`${classes.bg} border ${classes.border} rounded-lg p-4 flex items-start gap-4 hover:border-opacity-60 transition-all`}
            >
              <div className={`p-2 ${classes.bg} rounded-lg`}>
                <Icon className={`w-5 h-5 ${classes.icon}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${classes.text}`}>
                        {alert.alert_type.replace(/_/g, ' ')}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${classes.bg} ${classes.text} border ${classes.border}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{alert.system_name}</p>
                  </div>
                  
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="p-1 hover:bg-gray-700 rounded-md transition-colors group"
                    title="Acknowledge alert"
                  >
                    <X className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </button>
                </div>
                
                <p className="text-white mb-2">{alert.message}</p>
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{timeSince(alert.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
