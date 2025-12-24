'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Factory, FactoryData, SystemAlert } from '@/types';
import FactorySelector from '@/components/FactorySelector';
import SystemCard from '@/components/SystemCard';
import AlertsPanel from '@/components/AlertsPanel';
import StatsOverview from '@/components/StatsOverview';
import TemperatureChart from '@/components/TemperatureChart';
import BatteryChart from '@/components/BatteryChart';
import ConveyorChart from '@/components/ConveyorChart';
import WeightChart from '@/components/WeightChart';
import EnergyChart from '@/components/EnergyChart';
import SystemActivityChart from '@/components/SystemActivityChart';
import { Activity } from 'lucide-react';

export default function Home() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [latestData, setLatestData] = useState<Record<string, FactoryData>>({});
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch factories on mount
  useEffect(() => {
    fetchFactories();
  }, []);

  // Fetch latest data when factory changes
  useEffect(() => {
    if (selectedFactory) {
      fetchLatestData();
      fetchAlerts();
      
      // Setup real-time subscription
      const channel = supabase
        .channel(`factory_${selectedFactory.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: selectedFactory.factory_table_name,
          },
          (payload) => {
            const newData = payload.new as FactoryData;
            setLatestData((prev) => ({
              ...prev,
              [newData.system_name]: newData,
            }));
          }
        )
        .subscribe();

      // Poll for updates every 3 seconds for near real-time monitoring
      const interval = setInterval(fetchLatestData, 3000);
      
      // Poll for critical alerts every 2 seconds
      const alertInterval = setInterval(fetchAlerts, 2000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
        clearInterval(alertInterval);
      };
    }
  }, [selectedFactory]);

  const fetchFactories = async () => {
    try {
      const { data, error } = await supabase
        .from('factories')
        .select('*')
        .eq('is_active', true)
        .order('id');

      if (error) throw error;

      setFactories(data || []);
      if (data && data.length > 0) {
        setSelectedFactory(data[0]);
      }
    } catch (error) {
      console.error('Error fetching factories:', error);
    }
  };

  const fetchLatestData = async () => {
    if (!selectedFactory) return;

    try {
      setLoading(true);
      
      // Get latest data for each system
      const { data, error } = await supabase
        .from(selectedFactory.factory_table_name)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by system_name, keep only latest
      const grouped: Record<string, FactoryData> = {};
      data?.forEach((item) => {
        if (!grouped[item.system_name] || 
            new Date(item.timestamp) > new Date(grouped[item.system_name].timestamp)) {
          grouped[item.system_name] = item;
        }
      });

      setLatestData(grouped);
    } catch (error) {
      console.error('Error fetching latest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    if (!selectedFactory) return;

    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('factory_id', selectedFactory.id)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const acknowledgeAlert = async (alertId: number) => {
    try {
      await supabase
        .from('system_alerts')
        .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq('id', alertId);

      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900"></div>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl top-1/2 left-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="glass-effect-strong border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur-xl relative">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-2xl transform group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Dummy Work
                </h1>
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Real-time IoT Monitoring & Analytics
                </p>
              </div>
            </div>
            
            <FactorySelector
              factories={factories}
              selectedFactory={selectedFactory}
              onSelectFactory={setSelectedFactory}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {loading && !Object.keys(latestData).length ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 border-4 border-blue-500 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-400 animate-pulse">Loading factory data...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <StatsOverview 
              latestData={latestData} 
              alerts={alerts}
              factoryName={selectedFactory?.factory_name || ''}
            />

            {/* Alerts Panel */}
            {alerts.length > 0 && (
              <AlertsPanel 
                alerts={alerts} 
                onAcknowledge={acknowledgeAlert}
              />
            )}

            {/* System Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
              <SystemCard
                title="Fire Control System"
                systemName="Fire_Control"
                data={latestData['Fire_Control']}
                icon="flame"
              />
              
              <SystemCard
                title="HVAC System"
                systemName="HVAC_System"
                data={latestData['HVAC_System']}
                icon="thermometer"
              />
              
              <SystemCard
                title="Conveyor Belt"
                systemName="Conveyor_Belt"
                data={latestData['Conveyor_Belt']}
                icon="package"
              />
              
              <SystemCard
                title="Weight & Sorting"
                systemName="Weight_System"
                data={latestData['Weight_System']}
                icon="scale"
              />
              
              <SystemCard
                title="Garage Door"
                systemName="Garage_Door"
                data={latestData['Garage_Door']}
                icon="door"
              />
              
              <SystemCard
                title="Battery System"
                systemName="Battery_System"
                data={latestData['Battery_System']}
                icon="battery"
              />
              
              <SystemCard
                title="Safe Room Security"
                systemName="Safe_Room"
                data={latestData['Safe_Room']}
                icon="shield"
              />
            </div>

            {/* Analytics Charts Section */}
            {selectedFactory && (
              <div className="mt-12 fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Data Analytics & Trends
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Real-time system performance metrics</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Row 1: Temperature & Battery */}
                  <TemperatureChart factoryTable={selectedFactory.factory_table_name} />
                  <BatteryChart factoryTable={selectedFactory.factory_table_name} />
                  
                  {/* Row 2: Conveyor & Weight */}
                  <ConveyorChart factoryTable={selectedFactory.factory_table_name} />
                  <WeightChart factoryTable={selectedFactory.factory_table_name} />
                  
                  {/* Row 3: Energy Management */}
                  <div className="lg:col-span-2">
                    <EnergyChart factoryTable={selectedFactory.factory_table_name} />
                  </div>
                  
                  {/* Row 4: System Activity (Full Width) */}
                  <div className="lg:col-span-2">
                    <SystemActivityChart factoryTable={selectedFactory.factory_table_name} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-effect border-t border-gray-700/50 mt-16 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Smart Factory Automation © 2025
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">System Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
