# 🏭 SMART FACTORY AUTOMATION - COMPLETE PROJECT

A full-stack IoT automation system with real-time monitoring dashboard for Cisco Packet Tracer MCU simulations.

## 📁 Project Structure

```
SMART-FACTORY/
├── python-middleware/      # Python bridge server (Packet Tracer → Supabase)
│   ├── server.py          # Main HTTP server
│   ├── config.py          # Configuration (gitignored)
│   ├── config.example.py  # Configuration template
│   └── requirements.txt   # Python dependencies
├── factory-dashboard/      # Next.js real-time dashboard
│   ├── app/               # Next.js 15 app directory
│   ├── components/        # React components
│   ├── lib/               # Supabase client
│   └── types/             # TypeScript definitions
└── supabase_setup.sql     # Database schema
```

## 🚀 Complete Setup Guide

### Step 1: Setup Supabase Database

1. Create account at [https://app.supabase.com](https://app.supabase.com)
2. Create new project (wait ~2 minutes)
3. Go to **SQL Editor** → New Query
4. Copy & paste contents of `supabase_setup.sql`
5. Click **RUN**
6. Go to **Settings** → **API** and copy:
   - Project URL
   - anon/public key

### Step 2: Setup Python Middleware

```bash
cd python-middleware
pip install -r requirements.txt
cp config.example.py config.py
# Edit config.py with your Supabase credentials
python server.py
```

**Expected output:**
```
✓ Supabase connection established
============================================================
   🏭 SMART FACTORY SUPABASE BRIDGE SERVER
   📊 Database: https://xxxxx.supabase.co
   🌐 Listening on: http://localhost:8000
============================================================
```

### Step 3: Configure Packet Tracer

Update your MCU scripts to send data to the Python server:

**Fire Control System:**
```python
import urllib.request
import json

# Get sensor values
fire_status = "SAFE"  # or "CRITICAL FIRE"
temp = readPin(0)  # Temperature sensor

data = {
    "system": "fire_control",
    "status": fire_status,
    "temperature": temp,
    "timestamp": str(currentTime())
}

url = "http://192.168.1.100:8000"  # Your PC's IP
headers = {"Content-Type": "application/json"}
req = urllib.request.Request(url, json.dumps(data).encode(), headers)
urllib.request.urlopen(req)
```

**Repeat for all 7 systems:**
- Fire Control (fire_status, temperature)
- HVAC (temperature)
- Conveyor Belt (items_processed, items_failed)
- Weight Monitor (current_weight, status)
- Garage Door (status)
- Battery (battery_level, energy_consumption, led_status)
- Safe Room (is_locked, access_attempts)

### Step 4: Setup Dashboard

```bash
cd factory-dashboard
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

Dashboard will be available at **http://localhost:3000**

## 🔧 System Architecture

```
┌─────────────────┐
│ Packet Tracer   │  7 MCU Systems sending HTTP POST
│   IoT Devices   │  requests with JSON data
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Python Server   │  Receives data, validates factory
│   Port 8000     │  mapping, stores in Supabase
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Supabase      │  PostgreSQL database with
│   Database      │  real-time subscriptions
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Next.js        │  Real-time dashboard with
│  Dashboard      │  charts, alerts, monitoring
└─────────────────┘
```

## 📊 Features

### Real-Time Monitoring
- **Live Data Updates**: 3-second polling interval
- **Real-Time Subscriptions**: Instant alert notifications
- **7 System Cards**: Fire Control, HVAC, Conveyor, Weight, Garage, Battery, Safe Room
- **6 Analytics Charts**: Temperature trends, battery levels, production stats

### Alert System
- **Smart Deduplication**: Prevents duplicate alerts
- **Auto-Resolution**: Resolves alerts when conditions normalize
- **Real-Time Updates**: Alert messages update with current values
- **Acknowledged Tracking**: Mark alerts as acknowledged
- **Priority Classification**: Critical, Warning, Info levels

### Data Visualization
- **Temperature Chart**: Line chart for HVAC temperature trends
- **Battery Chart**: Area chart for battery level monitoring
- **Conveyor Chart**: Bar chart for production tracking
- **Weight Chart**: Line chart for weight measurements
- **Energy Chart**: Composed chart (battery + LED status)
- **System Activity**: Horizontal bar chart for last update times

### Dashboard Metrics
- **System Health**: Percentage of systems operating normally
- **Active Alerts**: Count of unresolved critical issues
- **Average Temperature**: Across all temperature sensors
- **Total Production**: Cumulative items processed

## 🛡️ Security Features

- **Credential Management**: Sensitive data in gitignored config files
- **Template Files**: `.example` files with placeholders for team sharing
- **Environment Variables**: Dashboard uses `.env.local` (gitignored)
- **Factory Validation**: Python server validates factory IDs before storage
- **Input Sanitization**: JSON validation and type checking

## 🐛 Bug Fixes Applied

### Temperature Display Issue
**Problem**: Temperature showing as 1.0°C, not updating  
**Solution**: Added `Number()` conversion in SystemCard, `float()` in Python server

### Fire Alert Detection Issue
**Problem**: Fire alerts not appearing when status is "CRITICAL FIRE"  
**Solution**: Changed exact match to substring matching: `"FIRE" in status`

### Alert Update Issue
**Problem**: Alert messages showing old temperature values  
**Solution**: Modified `_create_unique_alert()` to UPDATE existing alerts instead of skipping

## 📦 Dependencies

### Python Middleware
- `supabase>=2.0.0`: Database client
- Python 3.7+

### Dashboard
- `next@15.5.9`: React framework
- `react@18.3.1`: UI library
- `@supabase/supabase-js@2.39.0`: Database client
- `recharts@2.15.0`: Chart library
- `tailwindcss@3.4.17`: Styling
- `lucide-react@0.468.0`: Icons

## 🔍 Troubleshooting

### Python Server Won't Start
```bash
# Check if config.py exists
ls python-middleware/config.py

# Verify credentials are correct
# Test Supabase connection manually
```

### Dashboard Shows No Data
```bash
# Check Python server is running
# Verify Supabase credentials in .env.local
# Check browser console for errors
# Verify factory data exists in Supabase
```

### Packet Tracer Can't Send Data
```bash
# Verify Python server is running
# Check PC's local IP address (ipconfig / ifconfig)
# Update MCU scripts with correct IP
# Ensure firewall allows port 8000
```

### Temperature Still Shows 1.0°C
```bash
# Check if latest code is deployed
# Verify Number() conversion in SystemCard.tsx
# Check Python server logs for float conversion
# Clear browser cache and reload
```

## 📈 Future Enhancements

- [ ] Multi-factory support with factory switcher
- [ ] Historical data analysis and trends
- [ ] Predictive maintenance alerts
- [ ] Mobile app (React Native)
- [ ] Email/SMS alert notifications
- [ ] Machine learning for anomaly detection
- [ ] Export data to CSV/PDF reports
- [ ] User authentication and role-based access

## 📝 License

This project is for educational purposes as part of IoT coursework.

## 👥 Contributing

Before uploading to GitHub:
1. ✅ Remove sensitive credentials from code
2. ✅ Create `.gitignore` files
3. ✅ Create template files (`.example`)
4. ✅ Test with template configurations
5. ✅ Review `SECURITY.md` guidelines
6. ✅ Follow `GITHUB-UPLOAD-CHECKLIST.md`

## 🆘 Support

For issues or questions:
1. Check troubleshooting section above
2. Review Supabase logs in dashboard
3. Check Python server console output
4. Inspect browser console for errors

---

**Built with ❤️ for Smart Factory Automation**
