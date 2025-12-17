"""
============================================================================
SMART FACTORY AUTOMATION - SUPABASE BRIDGE SERVER
============================================================================
This middleware receives telemetry data from Cisco Packet Tracer MCUs
and stores it in Supabase PostgreSQL database instead of ThingsBoard.

Features:
- Multi-factory support (auto-routing to correct table)
- Smart mode: Only sends data when values change
- Automatic alert generation for critical events
- Connection pooling for better performance
- Comprehensive error handling

Author: Smart Factory Automation Team
Version: 2.0
============================================================================
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from supabase import create_client, Client
from datetime import datetime, timezone
import os
from typing import Optional, Dict, Any

# Import configuration from config.py (gitignored for security)
try:
    from config import SUPABASE_URL, SUPABASE_KEY, LISTENER_IP, LISTENER_PORT
except ImportError:
    print("=" * 70)
    print("ERROR: config.py not found!")
    print("=" * 70)
    print("Please create config.py from config.example.py:")
    print("  1. Copy config.example.py to config.py")
    print("  2. Update SUPABASE_URL and SUPABASE_KEY with your credentials")
    print("=" * 70)
    exit(1)

# Factory Configuration (Maps MCU system names to factory tables)
# You can add more factories here as needed
FACTORY_MAPPING = {
    "factory_1": "factory_1_data",  # Default factory
    "factory_2": "factory_2_data",
}

# Default factory if none specified in the request
DEFAULT_FACTORY = "factory_1"

# Alert Thresholds (for automatic alert generation)
ALERT_THRESHOLDS = {
    "temperature_high": 30.0,
    "temperature_low": 15.0,
    "battery_low": 15.0,  # Alert when battery drops below 15%
    "fire_detected": True,
}
# =================================================

# Initialize Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✓ Supabase connection established")
except Exception as e:
    print(f"✗ Failed to connect to Supabase: {e}")
    exit(1)

print("\n" + "="*60)
print("   🏭 SMART FACTORY SUPABASE BRIDGE SERVER")
print(f"   📊 Database: {SUPABASE_URL}")
print(f"   🌐 Listening on: http://localhost:{LISTENER_PORT}")
print(f"   🏭 Default Factory: {DEFAULT_FACTORY}")
print("="*60 + "\n")


class FactoryBridgeHandler(BaseHTTPRequestHandler):
    """
    Handles incoming HTTP POST requests from Packet Tracer MCUs
    and stores the data in Supabase database.
    """
    
    def do_POST(self):
        """Handle POST requests from Packet Tracer MCUs"""
        try:
            # 1. Receive Raw Data from Packet Tracer
            length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(length)
            
            # 2. Parse JSON
            pt_data = json.loads(post_data.decode('utf-8'))
            
            # 3. Extract System Info
            system_name = pt_data.get('system', 'Unknown')
            factory_id = pt_data.get('factory', DEFAULT_FACTORY)  # Allow factory selection
            
            # 4. Get the correct table name
            table_name = FACTORY_MAPPING.get(factory_id, FACTORY_MAPPING[DEFAULT_FACTORY])
            
            # 5. Map Data to Database Schema
            telemetry = self._map_telemetry_data(pt_data, system_name)
            
            if telemetry:
                # 6. Add metadata
                telemetry['system_name'] = system_name
                telemetry['timestamp'] = datetime.now(timezone.utc).isoformat()
                
                # 7. Insert into Supabase
                success = self._insert_to_supabase(table_name, telemetry, factory_id)
                
                if success:
                    print(f"[✓] {system_name:<20} -> {table_name:<20} | Data Saved")
                    
                    # 8. Check for alerts (critical conditions)
                    self._check_and_create_alerts(telemetry, factory_id, system_name)
                else:
                    print(f"[✗] {system_name:<20} -> {table_name:<20} | Save Failed")
                    
            else:
                print(f"[⚠] {system_name:<20} -> No valid data to save")
            
            # 9. Send Success Response to Packet Tracer
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success"}).encode())
            
        except json.JSONDecodeError as e:
            print(f"[✗] JSON Parse Error: {e}")
            self._send_error_response(400, "Invalid JSON")
            
        except Exception as e:
            print(f"[✗] CRITICAL ERROR: {e}")
            self._send_error_response(500, "Internal Server Error")
    
    def _map_telemetry_data(self, pt_data: Dict[str, Any], system_name: str) -> Dict[str, Any]:
        """
        Maps incoming Packet Tracer data to Supabase table schema
        
        Args:
            pt_data: Raw data from Packet Tracer
            system_name: Name of the subsystem sending data
            
        Returns:
            Dictionary with mapped telemetry data
        """
        telemetry = {}
        
        # --- SYSTEM 1: FIRE CONTROL ---
        if system_name == "Fire_Control":
            telemetry["fire_sensor_val"] = pt_data.get("sensor_value")
            telemetry["fire_status"] = pt_data.get("status")
            telemetry["siren_state"] = "ON" if pt_data.get("siren") == 1 else "OFF"
            telemetry["sprinkler_state"] = "ON" if pt_data.get("sprinkler") == 1 else "OFF"
        
        # --- SYSTEM 2: CONVEYOR BELT ---
        elif system_name == "Conveyor_Belt":
            telemetry["order_count"] = pt_data.get("order_count")
            telemetry["conveyor_speed"] = pt_data.get("sensor_value")
            telemetry["conveyor_status"] = pt_data.get("status")
        
        # --- SYSTEM 3: WEIGHT & SORTING ---
        elif system_name == "Weight_System":
            telemetry["weight_grams"] = pt_data.get("weight_val")
            telemetry["weight_status"] = pt_data.get("status")
            telemetry["servo_angle"] = pt_data.get("servo_pos")
        
        # --- SYSTEM 4: GARAGE DOOR ---
        elif system_name == "Garage_Door":
            # Convert "DETECTED"/"CLEAR" string to boolean
            motion_status = pt_data.get("motion_status")
            if isinstance(motion_status, str):
                telemetry["motion_detected"] = motion_status == "DETECTED"
            else:
                telemetry["motion_detected"] = bool(motion_status)
            telemetry["garage_door"] = pt_data.get("door_state")
        
        # --- SYSTEM 5: BATTERY MANAGEMENT ---
        elif system_name == "Battery_System":
            telemetry["battery_level"] = pt_data.get("battery_level")
            telemetry["led_brightness"] = pt_data.get("led_intensity")
        
        # --- SYSTEM 6: HVAC (THERMOSTAT) ---
        elif system_name == "HVAC_System":
            # Ensure temperature is properly converted to float
            temp_value = pt_data.get("temperature")
            if temp_value is not None:
                try:
                    telemetry["temperature"] = float(temp_value)
                except (ValueError, TypeError):
                    telemetry["temperature"] = None
            telemetry["ac_state"] = pt_data.get("ac_status")
            telemetry["ac2_state"] = pt_data.get("ac2_status")
            telemetry["furnace_state"] = pt_data.get("furnace_status")
        
        # --- SYSTEM 7: SAFE ROOM (RFID) ---
        elif system_name == "Safe_Room":
            telemetry["rfid_last_card"] = pt_data.get("last_card")
            telemetry["access_log"] = pt_data.get("access")
            telemetry["safe_door"] = pt_data.get("door")
            telemetry["webcam_status"] = pt_data.get("webcam")
        
        return telemetry
    
    def _insert_to_supabase(self, table_name: str, data: Dict[str, Any], factory_id: str) -> bool:
        """
        Inserts telemetry data into Supabase database
        
        Args:
            table_name: Target table name (e.g., 'factory_1_data')
            data: Telemetry data to insert
            factory_id: Factory identifier
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Insert data
            result = supabase.table(table_name).insert(data).execute()
            
            # Update factory's last_data_received timestamp
            factory_lookup = {"factory_1": 1, "factory_2": 2}
            factory_pk = factory_lookup.get(factory_id)
            
            if factory_pk:
                supabase.table("factories").update({
                    "last_data_received": datetime.now(timezone.utc).isoformat()
                }).eq("id", factory_pk).execute()
            
            return True
            
        except Exception as e:
            print(f"   └─ Database Error: {e}")
            return False
    
    def _check_and_create_alerts(self, telemetry: Dict[str, Any], factory_id: str, system_name: str):
        """
        Checks telemetry data for critical conditions and creates alerts
        Only creates new alerts if one doesn't already exist for the same condition
        Auto-acknowledges alerts when conditions return to normal
        
        Args:
            telemetry: The telemetry data to check
            factory_id: Factory identifier
            system_name: Name of the subsystem
        """
        try:
            factory_lookup = {"factory_1": 1, "factory_2": 2}
            factory_pk = factory_lookup.get(factory_id)
            
            if not factory_pk:
                return
            
            # Fire Detection - Handle different fire status values
            fire_status = str(telemetry.get("fire_status", "")).upper()
            if "FIRE" in fire_status and fire_status != "SAFE":
                sensor_val = telemetry.get("fire_sensor_val", "N/A")
                self._create_unique_alert(
                    factory_pk, "FIRE_DETECTED", "CRITICAL",
                    f"🔥 FIRE DETECTED! Sensor: {sensor_val} | Sprinklers & Siren ACTIVATED",
                    system_name
                )
            else:
                # Clear fire alerts when status is SAFE
                self._auto_acknowledge_alert(factory_pk, system_name, "FIRE_DETECTED")
            
            # Temperature Monitoring
            temp = telemetry.get("temperature")
            if temp is not None:
                # Ensure temperature is a float for accurate comparison
                try:
                    temp = float(temp)
                except (ValueError, TypeError):
                    temp = None
                
            if temp is not None:
                if temp > ALERT_THRESHOLDS["temperature_high"]:
                    ac_status = telemetry.get("ac_state", "N/A")
                    self._create_unique_alert(
                        factory_pk, "HIGH_TEMPERATURE", "WARNING",
                        f"🌡️ High Temperature: {temp:.1f}°C (Threshold: {ALERT_THRESHOLDS['temperature_high']}°C) | AC: {ac_status}",
                        system_name
                    )
                elif temp < ALERT_THRESHOLDS["temperature_low"]:
                    furnace_status = telemetry.get("furnace_state", "N/A")
                    self._create_unique_alert(
                        factory_pk, "LOW_TEMPERATURE", "WARNING",
                        f"❄️ Low Temperature: {temp:.1f}°C (Threshold: {ALERT_THRESHOLDS['temperature_low']}°C) | Furnace: {furnace_status}",
                        system_name
                    )
                else:
                    # Temperature is normal, clear temperature alerts
                    self._auto_acknowledge_alert(factory_pk, system_name, "HIGH_TEMPERATURE")
                    self._auto_acknowledge_alert(factory_pk, system_name, "LOW_TEMPERATURE")
            
            # Battery Monitoring
            battery = telemetry.get("battery_level")
            if battery:
                if battery < ALERT_THRESHOLDS["battery_low"]:
                    led = telemetry.get("led_brightness", "N/A")
                    self._create_unique_alert(
                        factory_pk, "LOW_BATTERY", "WARNING",
                        f"🔋 Critical Battery: {battery:.1f}% (LED: {led}) | Charge Immediately!",
                        system_name
                    )
                else:
                    # Battery is charged, clear battery alerts
                    self._auto_acknowledge_alert(factory_pk, system_name, "LOW_BATTERY")
            
            # Unauthorized Access (Always create new alert for security events)
            if telemetry.get("access_log") == "DENIED":
                card_id = telemetry.get("rfid_last_card", "Unknown")
                supabase.table("system_alerts").insert({
                    "factory_id": factory_pk,
                    "alert_type": "UNAUTHORIZED_ACCESS",
                    "severity": "WARNING",
                    "message": f"🚫 Unauthorized Access Attempt | Card ID: {card_id} | Door: LOCKED",
                    "system_name": system_name
                }).execute()
                print(f"   └─ 🚨 Security Alert: UNAUTHORIZED_ACCESS (Card: {card_id})")
                    
        except Exception as e:
            print(f"   └─ Alert Error: {e}")
    
    def _create_unique_alert(self, factory_pk: int, alert_type: str, severity: str, message: str, system_name: str):
        """
        Creates an alert only if one doesn't already exist for the same condition.
        If an alert already exists, updates its message with current data.
        """
        try:
            # Check if an unacknowledged alert already exists
            existing = supabase.table("system_alerts")\
                .select("id, message")\
                .eq("factory_id", factory_pk)\
                .eq("system_name", system_name)\
                .eq("alert_type", alert_type)\
                .eq("acknowledged", False)\
                .execute()
            
            if existing.data:
                # Alert exists - update the message with current data
                alert_id = existing.data[0]["id"]
                old_message = existing.data[0].get("message", "")
                
                # Only update if message has changed (to avoid unnecessary updates)
                if old_message != message:
                    supabase.table("system_alerts").update({
                        "message": message,
                        "created_at": datetime.now(timezone.utc).isoformat()  # Update timestamp
                    }).eq("id", alert_id).execute()
                    print(f"   └─ 🔄 Alert Updated: {alert_type}")
            else:
                # No existing alert - create new one
                supabase.table("system_alerts").insert({
                    "factory_id": factory_pk,
                    "alert_type": alert_type,
                    "severity": severity,
                    "message": message,
                    "system_name": system_name
                }).execute()
                print(f"   └─ 🚨 Alert Created: {alert_type}")
        except Exception as e:
            print(f"   └─ Alert Creation Error: {e}")
    
    def _auto_acknowledge_alert(self, factory_pk: int, system_name: str, alert_type: str):
        """
        Automatically acknowledges alerts when the condition returns to normal
        """
        try:
            supabase.table("system_alerts")\
                .update({
                    "acknowledged": True,
                    "acknowledged_at": datetime.now(timezone.utc).isoformat(),
                    "acknowledged_by": "AUTO_RESOLVED"
                })\
                .eq("factory_id", factory_pk)\
                .eq("system_name", system_name)\
                .eq("alert_type", alert_type)\
                .eq("acknowledged", False)\
                .execute()
        except Exception as e:
            pass  # Silently fail to avoid cluttering logs
    
    def _send_error_response(self, code: int, message: str):
        """Send error response to client"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "error", "message": message}).encode())
    
    def log_message(self, format, *args):
        """Disable default HTTP logging to keep console clean"""
        return


def main():
    """Start the HTTP server"""
    try:
        server = HTTPServer((LISTENER_IP, LISTENER_PORT), FactoryBridgeHandler)
        print("🚀 Server is running... Press Ctrl+C to stop\n")
        server.serve_forever()
        
    except KeyboardInterrupt:
        print("\n\n⏹  Shutting down server...")
        server.server_close()
        print("✓ Server stopped successfully")
        
    except Exception as e:
        print(f"\n✗ Server Error: {e}")
        exit(1)


if __name__ == '__main__':
    main()
