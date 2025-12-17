# ============================================================================
# SMART FACTORY AUTOMATION - CONFIGURATION FILE
# ============================================================================
# Copy this file to 'config.py' and update with your actual Supabase credentials
# DO NOT commit config.py to version control if it contains sensitive data
# ============================================================================

# ================= SUPABASE CONFIGURATION =================
# Get these values from your Supabase project settings:
# 1. Go to https://app.supabase.com
# 2. Select your project
# 3. Click on "Settings" -> "API"
# 4. Copy the URL and anon/public key

SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY_HERE"

# ================= SERVER CONFIGURATION =================
# HTTP Server settings for receiving data from Packet Tracer
LISTENER_IP = "0.0.0.0"      # Listen on all network interfaces
LISTENER_PORT = 8000         # Port number (Packet Tracer will send to this port)

# ================= FACTORY MAPPING =================
# Maps factory identifiers to their database table names
# Add more factories as needed
FACTORY_MAPPING = {
    "factory_1": "factory_1_data",
    "factory_2": "factory_2_data",
    # "factory_3": "factory_3_data",  # Uncomment when you add more factories
}

# Default factory to use if none is specified in the request
DEFAULT_FACTORY = "factory_1"

# ================= ALERT THRESHOLDS =================
# Configure thresholds for automatic alert generation
ALERT_THRESHOLDS = {
    "temperature_high": 30.0,      # Alert if temp > 30°C
    "temperature_low": 15.0,       # Alert if temp < 15°C
    "battery_low": 20.0,           # Alert if battery < 20%
    "fire_detected": True,         # Always alert on fire detection
}

# ================= DEBUGGING =================
# Set to True to enable verbose logging
DEBUG_MODE = False

# Set to True to print all received JSON data
LOG_RAW_DATA = False
