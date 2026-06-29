# BinaryGuard Portal + Admin CPanel

React + Vite bundle for:

- `portal.binaryguard.ca`
- `admin.binaryguard.ca`

## Run
```bash
npm install
npm run dev
```

## Deploy on DigitalOcean App Platform
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Domains:
  - `portal.binaryguard.ca`
  - `admin.binaryguard.ca`

The same React app detects `admin.binaryguard.ca` or `/admin` and loads the Admin CPanel.

## Flow
1. User Authentication
2. OTP Verification
3. Service Authorization
4. Access Card Order Portal

Layer 2 is locked until OTP verification. Layer 3 is locked until Service Authorization. Logout resets to Layer 1.

## Admin CPanel

Open one of:

- `https://admin.binaryguard.ca`
- `/admin` during local development

Prototype admin login:

- Email: `admin@binaryguard.ca`
- Password: `Admin#2026!`
- MFA: `864209`

Admin CPanel includes:

- WordPress-style left admin menu
- Dashboard metrics and quick actions
- Access card order processing
- Company user approval
- Portal user management
- Tenant service controls
- Access Card Ordering form content management
- Admin registration with password + MFA setup
- Admin approval workflow
- Admin account edit / modify / delete
- Audit log view
