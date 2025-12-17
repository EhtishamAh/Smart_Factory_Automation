# 🛡️ Security Guidelines

This document outlines security best practices for the Smart Factory IoT project.

## 🔐 Credential Management

### ✅ DO

- **Use environment files** (`.env.local`, `config.py`) for sensitive data
- **Add to `.gitignore`**: Never commit credentials to Git
- **Create template files** (`.env.example`, `config.example.py`) with placeholders
- **Use environment variables** in production deployments
- **Rotate credentials** regularly (monthly recommended)
- **Use different credentials** for dev/staging/production

### ❌ DON'T

- **Never hardcode** credentials in source code
- **Never commit** `.env.local`, `config.py` to version control
- **Never share** credentials in chat/email (use secure vaults)
- **Never use production credentials** in development
- **Never log** credentials in console output
- **Never expose** credentials in error messages

## 📁 Files to Protect

### Critical Files (Must be gitignored)

```
# Python Middleware
python-middleware/config.py              # Contains Supabase credentials
python-middleware/__pycache__/           # Python cache files

# Dashboard
factory-dashboard/.env.local             # Contains Supabase credentials
factory-dashboard/.next/                 # Build artifacts
factory-dashboard/node_modules/          # Dependencies

# Git
.git/                                    # Git history
```

### Template Files (Safe to commit)

```
python-middleware/config.example.py      # Placeholder credentials
factory-dashboard/.env.example           # Placeholder credentials
.gitignore                               # Git ignore rules
README.md                                # Project documentation
```

## 🔒 Supabase Security

### Row Level Security (RLS)

Currently **disabled** for development. Enable in production:

```sql
-- Enable RLS
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies
CREATE POLICY "Users can only view their factory" ON factory_data
    FOR SELECT USING (factory_id = current_user_factory_id());

CREATE POLICY "Users can only insert to their factory" ON factory_data
    FOR INSERT WITH CHECK (factory_id = current_user_factory_id());
```

### API Keys

- **anon/public key**: Safe for frontend (has limited permissions)
- **service_role key**: NEVER expose to frontend (has full access)
- Use anon key for dashboard, service role only in secure backend

### Database Access

```bash
# In Supabase Dashboard → Settings → Database:
- Set strong PostgreSQL password
- Enable SSL connections
- Restrict connection pooler access
- Enable network restrictions (allow only your IPs)
```

## 🌐 Network Security

### Python Server (Port 8000)

```python
# In production, use HTTPS with SSL certificates
# Add authentication tokens
# Implement rate limiting
# Validate input data strictly
```

### Firewall Rules

```bash
# Allow only necessary ports
# Windows Firewall
- Allow Python on port 8000 (local network only)
- Block external access to development servers

# Linux iptables
sudo iptables -A INPUT -p tcp --dport 8000 -s 192.168.0.0/16 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8000 -j DROP
```

## 🔍 Input Validation

### Python Middleware

```python
# Validate all input data
def validate_data(data):
    required_fields = ['system', 'status']
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
    
    # Validate data types
    if 'temperature' in data:
        data['temperature'] = float(data['temperature'])
    
    # Sanitize strings
    if 'status' in data:
        data['status'] = str(data['status'])[:50]
    
    return data
```

### Dashboard

```typescript
// Validate data before display
const sanitizeData = (data: any) => {
  return {
    temperature: Number(data.temperature) || 0,
    status: String(data.status).slice(0, 50),
    // ... validate all fields
  };
};
```

## 🚨 Alert Security

### Prevent Alert Spam

```python
# Implement rate limiting
ALERT_COOLDOWN = 60  # seconds between similar alerts

# Check last alert time before creating new one
last_alert = get_last_alert(factory_id, system, alert_type)
if last_alert and (time.now() - last_alert.created_at) < ALERT_COOLDOWN:
    return  # Skip creating duplicate alert
```

### Alert Validation

```python
# Validate alert data
def create_alert(factory_id, system, message):
    # Sanitize message
    message = str(message)[:500]  # Limit length
    
    # Validate factory exists
    if not factory_exists(factory_id):
        raise ValueError("Invalid factory_id")
    
    # Validate system
    valid_systems = ['fire_control', 'hvac', 'conveyor', ...]
    if system not in valid_systems:
        raise ValueError("Invalid system")
```

## 🔐 Authentication (Future Enhancement)

### Supabase Auth

```typescript
// Add user authentication
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Sign up
const { user, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign in
const { user, error } = await supabase.auth.signIn({
  email: 'user@example.com',
  password: 'secure-password',
});

// Protect routes
if (!user) {
  router.push('/login');
}
```

### Role-Based Access Control (RBAC)

```sql
-- Create user roles
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'viewer');

-- Add role to users table
ALTER TABLE users ADD COLUMN role user_role DEFAULT 'viewer';

-- Create policy for role-based access
CREATE POLICY "Admins can do anything" ON factory_data
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Operators can insert and view" ON factory_data
    FOR SELECT, INSERT USING (auth.jwt() ->> 'role' IN ('admin', 'operator'));

CREATE POLICY "Viewers can only view" ON factory_data
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'operator', 'viewer'));
```

## 📝 Logging Security

### What to Log

```python
# Log successful operations
logger.info(f"Data stored for factory {factory_id}, system {system}")

# Log security events
logger.warning(f"Invalid factory_id attempted: {factory_id}")
logger.error(f"Database error: {error_type}")
```

### What NOT to Log

```python
# NEVER log credentials
# ❌ logger.debug(f"Connecting with key: {SUPABASE_KEY}")

# NEVER log sensitive data
# ❌ logger.info(f"User password: {password}")

# NEVER log full stack traces in production
# ❌ logger.error(f"Full error: {traceback.format_exc()}")
```

## 🔄 Dependency Security

### Regular Updates

```bash
# Update Python dependencies
pip install --upgrade -r requirements.txt

# Update Node.js dependencies
npm update

# Check for vulnerabilities
npm audit
npm audit fix
```

### Dependency Scanning

```bash
# Use Snyk or similar tools
npm install -g snyk
snyk test

# GitHub Dependabot
# Enable in GitHub repo settings → Security → Dependabot
```

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Use HTTPS for all connections
- [ ] Implement user authentication
- [ ] Add rate limiting
- [ ] Enable firewall rules
- [ ] Use environment variables for all secrets
- [ ] Enable database backups
- [ ] Set up monitoring and alerting
- [ ] Implement proper error handling
- [ ] Remove debug logs
- [ ] Use strong passwords (16+ characters)
- [ ] Enable 2FA for Supabase account
- [ ] Review and test security policies
- [ ] Set up audit logging
- [ ] Implement session management
- [ ] Add CSRF protection

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Python Security Guidelines](https://python.readthedocs.io/en/stable/library/security_warnings.html)

## 🆘 Security Incident Response

If credentials are exposed:

1. **Immediately rotate** all exposed credentials
2. **Revoke** old credentials in Supabase dashboard
3. **Review** access logs for unauthorized usage
4. **Update** all applications with new credentials
5. **Notify** team members if necessary
6. **Document** incident and preventive measures

## 📧 Contact

For security concerns or to report vulnerabilities:
- Create a GitHub issue (for non-sensitive issues)
- Contact project maintainer directly (for sensitive issues)

---

**Stay Secure! 🔒**
