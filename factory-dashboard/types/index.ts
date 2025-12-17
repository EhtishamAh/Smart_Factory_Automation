export interface FactoryData {
  id: number;
  timestamp: string;
  system_name: string;
  
  // Fire Control
  fire_sensor_val?: number;
  fire_status?: string;
  siren_state?: string;
  sprinkler_state?: string;
  
  // Conveyor Belt
  order_count?: number;
  conveyor_speed?: number;
  conveyor_status?: string;
  
  // Weight System
  weight_grams?: number;
  weight_status?: string;
  servo_angle?: number;
  
  // Garage Door
  motion_detected?: boolean;
  garage_door?: string;
  
  // Battery
  battery_level?: number;
  led_brightness?: number;
  
  // HVAC
  temperature?: number;
  ac_state?: string;
  ac2_state?: string;
  furnace_state?: string;
  
  // Safe Room
  rfid_last_card?: string;
  access_log?: string;
  safe_door?: string;
  webcam_status?: string;
}

export interface Factory {
  id: number;
  factory_name: string;
  factory_table_name: string;
  location: string;
  created_at: string;
  is_active: boolean;
  last_data_received: string;
}

export interface SystemAlert {
  id: number;
  factory_id: number;
  alert_type: string;
  severity: string;
  message: string;
  system_name: string;
  created_at: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
}
