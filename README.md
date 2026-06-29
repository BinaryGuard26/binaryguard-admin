# BinaryGuard Admin CPanel

React + Vite admin application for:

- `admin.binaryguard.ca`

This repository is for the **Admin CPanel only**. The client portal is maintained in a separate GitHub repository and should not be mixed with this admin app.

## Local Development

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build

```bash
npm install && npm run build
```

The production build output is generated in:

```bash
dist
```

## Deploy on DigitalOcean App Platform

Recommended DigitalOcean settings:

- App type: Web Service or Static Site
- Source directory: `/` if `package.json` is in the repository root
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Domain: `admin.binaryguard.ca`

If DigitalOcean asks for a run command for a static Vite app, leave it empty. For a web service preview deployment, use:

```bash
npm run preview -- --host 0.0.0.0 --port $PORT
```

## Important Separation

Do not include portal files or portal imports in this admin repository.

Admin app should use:

```tsx
import "./styles/admin.css";
```

Do not use:

```tsx
import "./styles/portal.css";
```

The portal application belongs in the separate portal repository for:

- `portal.binaryguard.ca`

## Admin CPanel

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
- Admin account edit, modify, and delete
- Audit log view

## Key Files

```bash
package.json
tsconfig.json
src/App.tsx
src/pages/AdminCPanel.tsx
src/styles/admin.css
```

## Troubleshooting

If DigitalOcean build fails with a missing CSS error, confirm this file exists:

```bash
src/styles/admin.css
```

If the build fails because of `replaceAll()`, confirm `tsconfig.json` uses:

```json
"target": "ES2021",
"lib": ["DOM", "DOM.Iterable", "ES2021"]
```
