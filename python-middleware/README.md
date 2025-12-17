# 🐍 Python Middleware Server

HTTP bridge server that receives data from Cisco Packet Tracer MCUs and stores it in Supabase.

## 🚀 Quick Start

```bash
# Navigate to middleware directory
cd python-middleware

# Install dependencies
pip install -r requirements.txt

# Create configuration file
cp config.example.py config.py

# Edit config.py with your Supabase credentials
# Get them from: https://app.supabase.com → Your Project → Settings → API

# Start server
python server.py
```

Server will start on **http://localhost:8000**

## 📁 Files

```
python-middleware/
├── server.py           # Main HTTP server
├── config.py           # Configuration (gitignored)
├── config.example.py   # Configuration template
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## 🎯 Features

### HTTP Server
- **Port**: 8000 (configurable)
- **Method**: POST only
- **Content-Type**: application/json
- **CORS**: Enabled for all origins

### Data Processing
- **JSON Validation**: Ensures all required fields present
- **Type Conversion**: Converts strings to appropriate types (int, float, bool)
- **Factory Mapping**: Validates and maps MAC addresses to factory IDs
- **Timestamp Generation**: Adds server timestamp to all records

### Alert System
- **Smart Deduplication**: Prevents duplicate alerts for same issue
- **Auto-Resolution**: Resolves alerts when conditions return to normal
- **Real-Time Updates**: Updates existing alerts with new values
- **Priority Classification**: Determines alert severity automatically

### Logging
- **Colored Output**: Easy-to-read console logs
- **System Icons**: Visual indicators for each system type
- **Success/Error Tracking**: Clear status messages
- **Alert Notifications**: Highlights new/updated/resolved alerts

## 📊 Data Flow

```
┌─────────────────┐
│ Packet Tracer   │  MCU sends HTTP POST with JSON
│   IoT Device    │  {system, status, data...}
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  HTTP Handler   │  Receives POST request
│  (server.py)    │  Validates JSON structure
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Data Processor │  - Validates factory mapping
│                 │  - Converts data types
│                 │  - Generates timestamp
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Alert Manager  │  - Checks for alert conditions
│                 │  - Creates/updates/resolves alerts
│                 │  - Prevents duplicates
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Supabase DB   │  Stores data and alerts
└─────────────────┘
```

## 🔧 Configuration

### config.py (Your Credentials)

```python
# Supabase Configuration
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-anon-key-here"

# Factory Mapping (MAC Address → Factory ID)
FACTORY_MAPPING = {
    "00:11:22:33:44:55": 1,  # Factory A
    "AA:BB:CC:DD:EE:FF": 2,  # Factory B
}

# Alert Thresholds
ALERT_THRESHOLDS = {
    'temperature_high': 30.0,   # °C
    'temperature_low': 15.0,    # °C
    'battery_low': 20.0,        # %
    'weight_high': 1000.0,      # kg
}
```

### Packet Tracer MCU Configuration

Update your MCU Python scripts to send data to this server:

```python
import urllib.request
import json

# Your data
data = {
    "system": "fire_control",
    "status": "CRITICAL FIRE",
    "temperature": 45.5,
    "timestamp": str(currentTime())
}

# Send to Python server
url = "http://192.168.1.100:8000"  # Your PC's IP
headers = {"Content-Type": "application/json"}
req = urllib.request.Request(url, json.dumps(data).encode(), headers)

try:
    response = urllib.request.urlopen(req)
    print("✓ Data sent successfully")
except Exception as e:
    print("✗ Error:", str(e))
```

## 📡 API Specification

### Endpoint

```
POST http://localhost:8000
Content-Type: application/json
```

### Request Body

```json
{
  "system": "fire_control",
  "status": "CRITICAL FIRE",
  "temperature": 45.5,
  "items_processed": 150,
  "items_failed": 5,
  "battery_level": 85.0,
  "energy_consumption": 230.5,
  "led_status": "ON",
  "current_weight": 750.5,
  "is_locked": true,
  "access_attempts": 0,
  "timestamp": "2025-12-17 10:30:45"
}
```

### Response

**Success (200 OK):**
```json
{
  "status": "success",
  "message": "Data received and stored successfully",
  "factory_id": 1,
  "system": "fire_control"
}
```

**Error (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Invalid JSON format"
}
```

**Error (500 Internal Server Error):**
```json
{
  "status": "error",
  "message": "Database error: [details]"
}
```

## 🛡️ Alert Logic

### Fire Control
- **Alert When**: Fire status contains "FIRE" AND not "SAFE"
- **Resolve When**: Fire status is "SAFE"
- **Priority**: CRITICAL

### Temperature (HVAC)
- **Alert When**: 
  - Temperature > 30°C (HIGH)
  - Temperature < 15°C (LOW)
- **Resolve When**: 15°C ≤ Temperature ≤ 30°C
- **Priority**: WARNING

### Battery
- **Alert When**: Battery level < 20%
- **Resolve When**: Battery level ≥ 20%
- **Priority**: WARNING

### Weight Monitor
- **Alert When**: Weight > 1000 kg
- **Resolve When**: Weight ≤ 1000 kg
- **Priority**: WARNING

### Conveyor Belt
- **Alert When**: Items failed > 0
- **Resolve When**: Items failed = 0
- **Priority**: INFO

### Safe Room
- **Alert When**: Access attempts > 0
- **Resolve When**: Access attempts = 0
- **Priority**: WARNING

## 🐛 Troubleshooting

### Server won't start

```bash
# Check if port 8000 is already in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Kill process using port 8000 if needed
# Then restart server
```

### Connection refused from Packet Tracer

```bash
# Get your PC's local IP address
ipconfig              # Windows
ifconfig              # Linux/Mac

# Update Packet Tracer MCU script with this IP
url = "http://192.168.1.100:8000"  # Replace with your IP

# Check Windows Firewall settings
# Allow Python through firewall on port 8000
```

### Database errors

```bash
# Verify config.py has correct credentials
cat config.py  # Linux/Mac
type config.py # Windows

# Test Supabase connection
python -c "from supabase import create_client, Client; import config; client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY); print('✓ Connected')"
```

### Data not appearing in dashboard

```bash
# Check server console for errors
# Verify factory mapping in config.py
# Check Supabase dashboard for data
# Verify table names match: factory_data, alerts
```

### Temperature showing as 1.0

```bash
# Fixed in latest version
# Ensure float() conversion in _convert_value_types()
# Update from GitHub if using old version
```

### Fire alerts not appearing

```bash
# Fixed in latest version
# Now uses substring match: "FIRE" in status
# Handles "CRITICAL FIRE", "FIRE DETECTED", etc.
# Update from GitHub if using old version
```

## 📊 Console Output

### Successful Data Receipt

```
🔥 [10:30:45] Fire Control | CRITICAL FIRE | Factory: 1
   ├─ Temperature: 45.5°C
   ├─ Database: ✓ Stored
   └─ 🚨 Alert Created: Critical fire detected!
```

### Alert Updates

```
🌡️ [10:31:15] HVAC | NORMAL | Factory: 1
   ├─ Temperature: 22.0°C
   ├─ Database: ✓ Stored
   └─ 🔄 Alert Updated: Temperature at 22.0°C
```

### Alert Resolution

```
🔥 [10:32:00] Fire Control | SAFE | Factory: 1
   ├─ Temperature: 25.0°C
   ├─ Database: ✓ Stored
   └─ ✅ Alert Resolved: Fire control normal
```

## 🔍 Code Structure

### server.py

```python
# HTTP Server Class
class RequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. Parse JSON
        # 2. Validate factory
        # 3. Process data
        # 4. Store in Supabase
        # 5. Check alerts
        # 6. Send response

# Alert Manager Functions
def _create_unique_alert():
    # Smart deduplication logic
    # Updates existing alerts
    # Creates new if needed

def _check_alerts():
    # Evaluates all alert conditions
    # Calls _create_unique_alert()
    # Resolves normalized conditions

def _resolve_alert():
    # Marks alerts as resolved
    # Updates resolved_at timestamp
```

## 📦 Dependencies

- **supabase>=2.0.0**: Python client for Supabase
  - Handles database operations
  - Provides real-time subscriptions
  - Manages authentication

## 🚀 Production Deployment

### Systemd Service (Linux)

Create `/etc/systemd/system/factory-middleware.service`:

```ini
[Unit]
Description=Smart Factory Middleware Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/python-middleware
ExecStart=/usr/bin/python3 server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable factory-middleware
sudo systemctl start factory-middleware
sudo systemctl status factory-middleware
```

### Docker (Optional)

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY server.py config.py ./

EXPOSE 8000
CMD ["python", "server.py"]
```

```bash
docker build -t factory-middleware .
docker run -p 8000:8000 factory-middleware
```

## 🔮 Future Enhancements

- [ ] Add HTTPS support with SSL certificates
- [ ] Implement authentication tokens
- [ ] Add request rate limiting
- [ ] Create health check endpoint
- [ ] Add metrics and monitoring
- [ ] Support WebSocket connections
- [ ] Batch insert for performance
- [ ] Add data validation schemas

## 📚 Resources

- [Python http.server Documentation](https://docs.python.org/3/library/http.server.html)
- [Supabase Python Client](https://supabase.com/docs/reference/python/introduction)
- [JSON in Python](https://docs.python.org/3/library/json.html)

---

**Happy Bridging! 🌉**
