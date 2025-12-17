'use client';

import { FactoryData } from '@/types';
import { 
  Flame, 
  Thermometer, 
  Package, 
  Scale, 
  DoorOpen,
  Battery,
  Shield,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SystemCardProps {
  title: string;
  systemName: string;
  data: FactoryData | undefined;
  icon: string;
}

const iconMap = {
  flame: Flame,
  thermometer: Thermometer,
  package: Package,
  scale: Scale,
  door: DoorOpen,
  battery: Battery,
  shield: Shield,
};

export default function SystemCard({ title, systemName, data, icon }: SystemCardProps) {
  const [isNew, setIsNew] = useState(false);
  const Icon = iconMap[icon as keyof typeof iconMap] || Activity;

  useEffect(() => {
    if (data) {
      setIsNew(true);
      const timer = setTimeout(() => setIsNew(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [data?.timestamp]);

  if (!data) {
    return (
      <div className="glass-effect rounded-2xl p-6 border border-gray-700/30 shimmer">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-xl">
            <Icon className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{title}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Waiting for data...
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-20 animate-pulse" />
          <p className="text-sm">System Initializing</p>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    // Fire Control - Handle different fire status values
    if (systemName === 'Fire_Control') {
      const fireStatus = String(data.fire_status || '').toUpperCase();
      return (fireStatus.includes('FIRE') && fireStatus !== 'SAFE') ? 'red' : 'green';
    }
    
    // HVAC - Ensure temperature is treated as a number
    if (systemName === 'HVAC_System') {
      const temp = Number(data.temperature);
      if (!isNaN(temp) && (temp > 30 || temp < 15)) {
        return 'yellow';
      }
      return 'green';
    }
    
    // Battery
    if (systemName === 'Battery_System') {
      if (data.battery_level && data.battery_level < 20) return 'red';
      if (data.battery_level && data.battery_level < 50) return 'yellow';
      return 'green';
    }
    
    // Safe Room
    if (systemName === 'Safe_Room') {
      return data.access_log === 'DENIED' ? 'red' : 'green';
    }
    
    // Weight System
    if (systemName === 'Weight_System') {
      return data.weight_status === 'INVALID' ? 'yellow' : 'green';
    }
    
    return 'green';
  };

  const statusColor = getStatusColor();
  const statusColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const borderColors = {
    green: 'border-green-500/30',
    yellow: 'border-yellow-500/30',
    red: 'border-red-500/30',
  };

  const timeSince = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border p-6 transition-all ${
        isNew ? 'border-blue-500 scale-[1.02]' : borderColors[statusColor as keyof typeof borderColors]
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${statusColors[statusColor as keyof typeof statusColors]}/10 rounded-lg`}>
            <Icon className={`w-5 h-5 ${statusColors[statusColor as keyof typeof statusColors].replace('bg-', 'text-')}`} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Clock className="w-3 h-3" />
              <span>{timeSince(data.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColors[statusColor as keyof typeof statusColors]} ${isNew ? 'animate-pulse' : ''}`} />
      </div>

      {/* Data Display */}
      <div className="space-y-3">
        {/* Fire Control */}
        {systemName === 'Fire_Control' && (
          <>
            <DataRow 
              label="Status" 
              value={data.fire_status || 'N/A'}
              alert={String(data.fire_status || '').toUpperCase().includes('FIRE') && data.fire_status !== 'SAFE'}
            />
            <DataRow 
              label="Sensor Value" 
              value={data.fire_sensor_val?.toString() || 'N/A'}
            />
            <DataRow 
              label="Siren" 
              value={data.siren_state || 'OFF'}
              badge={data.siren_state === 'ON'}
            />
            <DataRow 
              label="Sprinkler" 
              value={data.sprinkler_state || 'OFF'}
              badge={data.sprinkler_state === 'ON'}
            />
          </>
        )}

        {/* HVAC System */}
        {systemName === 'HVAC_System' && (
          <>
            <DataRow 
              label="Temperature" 
              value={(() => {
                const temp = Number(data.temperature);
                return !isNaN(temp) ? `${temp.toFixed(1)}°C` : 'N/A';
              })()}
              alert={(() => {
                const temp = Number(data.temperature);
                return !isNaN(temp) && (temp > 30 || temp < 15);
              })()}
            />
            <DataRow 
              label="AC Unit 1" 
              value={data.ac_state || 'OFF'}
              badge={data.ac_state === 'ON'}
            />
            <DataRow 
              label="AC Unit 2" 
              value={data.ac2_state || 'OFF'}
              badge={data.ac2_state === 'ON'}
            />
            <DataRow 
              label="Furnace" 
              value={data.furnace_state || 'OFF'}
              badge={data.furnace_state === 'ON'}
            />
          </>
        )}

        {/* Conveyor Belt */}
        {systemName === 'Conveyor_Belt' && (
          <>
            <DataRow 
              label="Order Count" 
              value={data.order_count?.toString() || '0'}
            />
            <DataRow 
              label="Speed" 
              value={data.conveyor_speed ? `${data.conveyor_speed} RPM` : 'N/A'}
            />
            <DataRow 
              label="Status" 
              value={data.conveyor_status || 'STOPPED'}
              badge={data.conveyor_status === 'RUNNING'}
            />
          </>
        )}

        {/* Weight System */}
        {systemName === 'Weight_System' && (
          <>
            <DataRow 
              label="Weight" 
              value={`${data.weight_grams?.toFixed(1) || 'N/A'}g`}
            />
            <DataRow 
              label="Status" 
              value={data.weight_status || 'N/A'}
              alert={data.weight_status === 'INVALID'}
            />
            <DataRow 
              label="Servo Position" 
              value={`${data.servo_angle || 0}°`}
            />
          </>
        )}

        {/* Garage Door */}
        {systemName === 'Garage_Door' && (
          <>
            <DataRow 
              label="Motion Detected" 
              value={data.motion_detected ? 'Yes' : 'No'}
              badge={data.motion_detected}
            />
            <DataRow 
              label="Door State" 
              value={data.garage_door || 'CLOSED'}
              badge={data.garage_door === 'OPEN'}
            />
          </>
        )}

        {/* Battery System */}
        {systemName === 'Battery_System' && (
          <>
            <DataRow 
              label="Battery Level" 
              value={`${data.battery_level?.toFixed(1) || 'N/A'}%`}
              alert={data.battery_level ? data.battery_level < 20 : false}
            />
            <DataRow 
              label="LED Brightness" 
              value={data.led_brightness?.toString() || 'N/A'}
            />
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    (data.battery_level || 0) > 50
                      ? 'bg-green-500'
                      : (data.battery_level || 0) > 20
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${data.battery_level || 0}%` }}
                />
              </div>
            </div>
          </>
        )}

        {/* Safe Room */}
        {systemName === 'Safe_Room' && (
          <>
            <DataRow 
              label="Last RFID Card" 
              value={data.rfid_last_card || 'N/A'}
            />
            <DataRow 
              label="Access" 
              value={data.access_log || 'N/A'}
              alert={data.access_log === 'DENIED'}
            />
            <DataRow 
              label="Door" 
              value={data.safe_door || 'LOCKED'}
              badge={data.safe_door === 'UNLOCKED'}
            />
            <DataRow 
              label="Webcam" 
              value={data.webcam_status || 'OFF'}
              badge={data.webcam_status === 'ON'}
            />
          </>
        )}
      </div>
    </div>
  );
}

function DataRow({ 
  label, 
  value, 
  alert = false, 
  badge = false 
}: { 
  label: string; 
  value: string; 
  alert?: boolean;
  badge?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        {alert && <AlertCircle className="w-4 h-4 text-red-400" />}
        {badge && !alert && <CheckCircle2 className="w-4 h-4 text-green-400" />}
        <span className={`text-sm font-medium ${alert ? 'text-red-400' : 'text-white'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
