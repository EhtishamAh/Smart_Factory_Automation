# 🎨 Factory Dashboard

Real-time monitoring dashboard built with Next.js 15, React 18, and TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# Get them from: https://app.supabase.com → Your Project → Settings → API

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📁 Project Structure

```
factory-dashboard/
├── app/
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles and animations
├── components/
│   ├── SystemCard.tsx     # Individual system status cards
│   ├── AlertsPanel.tsx    # Active alerts display
│   ├── StatsOverview.tsx  # Dashboard metrics
│   ├── FactorySelector.tsx # Factory dropdown selector
│   ├── TemperatureChart.tsx
│   ├── BatteryChart.tsx
│   ├── ConveyorChart.tsx
│   ├── WeightChart.tsx
│   ├── EnergyChart.tsx
│   └── SystemActivityChart.tsx
├── lib/
│   └── supabase.ts        # Supabase client configuration
├── types/
│   └── index.ts           # TypeScript type definitions
└── public/                # Static assets
```

## 🎯 Features

### Real-Time Updates
- **3-Second Polling**: Fetches latest system data every 3 seconds
- **2-Second Alert Polling**: Checks for new alerts every 2 seconds
- **Real-Time Subscriptions**: Listens to Supabase changes for instant updates
- **Auto-Refresh Charts**: All charts update automatically with new data

### System Monitoring
- **7 System Cards**: 
  - 🔥 Fire Control (temperature, fire status)
  - 🌡️ HVAC (temperature control)
  - 🏭 Conveyor Belt (production stats)
  - ⚖️ Weight Monitor (current weight)
  - 🚪 Garage Door (open/closed status)
  - 🔋 Battery (charge level, energy consumption)
  - 🔒 Safe Room (lock status, access attempts)

### Analytics Charts
- **Temperature Chart**: Line chart showing HVAC temperature trends over time
- **Battery Chart**: Area chart displaying battery levels with gradient fill
- **Conveyor Chart**: Bar chart comparing processed vs failed items
- **Weight Chart**: Line chart for weight measurements
- **Energy Chart**: Composed chart showing battery level and LED status
- **System Activity Chart**: Horizontal bar chart showing last update times

### Alert System
- **Active Alerts Panel**: Displays all unresolved alerts
- **Acknowledge Feature**: Mark alerts as seen
- **Auto-Dismiss**: Alerts disappear when conditions normalize
- **Color-Coded**: Red (critical), yellow (warning), blue (info)
- **Real-Time Updates**: Alert messages update with current values

### Dashboard Metrics
- **System Health**: Percentage of systems with "NORMAL" status
- **Active Alerts**: Count of unresolved critical issues
- **Average Temperature**: Calculated from all temperature sensors
- **Total Production**: Sum of all items processed

## 🎨 Styling

### Design System
- **Dark Mode**: Modern dark theme with glass-morphism effects
- **Color Palette**:
  - Background: `#0f1117` (deep dark blue)
  - Cards: `#1a1d29` (dark gray-blue)
  - Accent: `#3b82f6` (blue) for primary actions
  - Success: `#10b981` (green)
  - Warning: `#f59e0b` (amber)
  - Danger: `#ef4444` (red)

### Animations
- **Fade In**: Cards fade in on load
- **Slide In**: Charts slide in from bottom
- **Pulse**: Active status indicators pulse
- **Spin**: Loading indicators rotate
- **Ping**: Alert notifications ping

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**:
  - `sm`: 640px (tablets)
  - `md`: 768px (small laptops)
  - `lg`: 1024px (desktops)
  - `xl`: 1280px (large screens)

## 🛠️ Tech Stack

### Core
- **Next.js 15.5.9**: React framework with App Router
- **React 18.3.1**: UI library
- **TypeScript 5**: Type safety

### Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Autoprefixer**: Browser compatibility

### Data & State
- **Supabase JS 2.39.0**: Database client and real-time subscriptions
- **React Hooks**: State management (useState, useEffect)

### Visualization
- **Recharts 2.15.0**: Chart library
  - LineChart (temperature, weight)
  - AreaChart (battery)
  - BarChart (conveyor, system activity)
  - ComposedChart (energy)

### Icons
- **Lucide React 0.468.0**: Modern icon library
  - Flame, Thermometer, Package, Weight, DoorClosed, Battery, Lock
  - AlertTriangle, CheckCircle, Activity, TrendingUp

## 📊 Data Flow

```
┌──────────────┐
│   Supabase   │  PostgreSQL database
│   Database   │  with real-time features
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  supabase.ts │  Client configuration
│  (lib/)      │  with credentials
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   page.tsx   │  Main dashboard page
│              │  - Fetches data via polling
│              │  - Listens to real-time changes
│              │  - Manages state
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  Components  │  Receive data as props
│  (reusable)  │  - SystemCard
│              │  - AlertsPanel
│              │  - Charts
└──────────────┘
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Client

Located in `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 🐛 Common Issues

### "Module not found" errors
```bash
# Clear Next.js cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
```

### Data not showing
```bash
# Check browser console for errors
# Verify .env.local exists and has correct values
# Check network tab for failed requests
# Verify Python server is running and inserting data
```

### Charts not rendering
```bash
# Clear browser cache
# Check if recharts is installed: npm list recharts
# Verify data format matches chart requirements
```

### Real-time updates not working
```bash
# Check Supabase dashboard → Database → Replication
# Ensure real-time is enabled for tables
# Check browser console for subscription errors
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# Settings → Environment Variables
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📝 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 🎯 Best Practices

### Component Structure
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props
- Document complex components with comments

### Performance
- Use `React.memo()` for expensive components
- Implement proper loading states
- Debounce rapid state updates
- Lazy load heavy components

### Code Quality
- Follow ESLint rules
- Use TypeScript strict mode
- Write descriptive variable names
- Add comments for complex logic

## 🔮 Future Enhancements

- [ ] Add user authentication
- [ ] Implement factory switcher functionality
- [ ] Add date range picker for historical data
- [ ] Export charts as images/PDFs
- [ ] Add system comparison view
- [ ] Implement dark/light mode toggle
- [ ] Add keyboard shortcuts
- [ ] Create mobile app version

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Recharts Documentation](https://recharts.org)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Happy Monitoring! 🏭**
