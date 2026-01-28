# Regform Documentation

This directory contains comprehensive documentation for the Agneepath Registration System.

## 📚 Documentation Index

### Core System Documentation

- **[DMZ.md](./DMZ.md)** - Complete DMZ integration guide including:
  - Architecture overview
  - All sync triggers (registration, form submission, swaps)
  - API client implementation
  - Optimization details
  - Error handling patterns
  - Recent improvements

- **[DMZ_INTEGRATION.md](./DMZ_INTEGRATION.md)** - Original DMZ integration documentation (legacy)

### Development & Setup

- **[LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)** - Local development setup guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference for common tasks

### Admin Features

- **[ADMIN_SYNC_WORKFLOW.md](./ADMIN_SYNC_WORKFLOW.md)** - Admin dashboard and sync workflows

### Google Sheets Integration

- **[GOOGLE_APPS_SCRIPT_WEBHOOK.md](./GOOGLE_APPS_SCRIPT_WEBHOOK.md)** - Google Apps Script webhook setup
- **[SHEETS_API_TESTING.md](./SHEETS_API_TESTING.md)** - Testing guide for Sheets API
- **[SYNC_SYSTEM_IMPROVEMENTS.md](./SYNC_SYSTEM_IMPROVEMENTS.md)** - Sync system architecture and improvements
- **[REGISTRATION_STATUS_SYNC.md](./REGISTRATION_STATUS_SYNC.md)** - Registration status sync documentation

### Payments & Verification

- **[PAYMENT_VERIFICATION_SETUP.md](./PAYMENT_VERIFICATION_SETUP.md)** - Payment verification system setup

### Code Quality

- **[COHESIVENESS_AUDIT.md](./COHESIVENESS_AUDIT.md)** - Codebase cohesiveness audit and improvements

## 🔍 Quick Links

### For New Developers
1. Start with [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)
2. Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. Understand [DMZ.md](./DMZ.md) for external integrations

### For Operations/Admin
1. [ADMIN_SYNC_WORKFLOW.md](./ADMIN_SYNC_WORKFLOW.md)
2. [PAYMENT_VERIFICATION_SETUP.md](./PAYMENT_VERIFICATION_SETUP.md)
3. [DMZ.md](./DMZ.md) - especially the "Recent Optimizations" section

### For Integration Work
1. [DMZ.md](./DMZ.md) - Complete DMZ integration
2. [SYNC_SYSTEM_IMPROVEMENTS.md](./SYNC_SYSTEM_IMPROVEMENTS.md)
3. [GOOGLE_APPS_SCRIPT_WEBHOOK.md](./GOOGLE_APPS_SCRIPT_WEBHOOK.md)

## 🏗️ System Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Registration Frontend                      │
│  (Next.js App - User Registration & Admin Portal)           │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Backend API Routes                         │
│  /api/form/*  |  /api/admin/*  |  /api/auth/*              │
└───┬────────────┬────────────────┬─────────────────────────┬──┘
    │            │                │                         │
    ▼            ▼                ▼                         ▼
┌────────┐  ┌─────────────┐  ┌────────────────┐  ┌──────────────┐
│MongoDB │  │Google Sheets│  │  DMZ API       │  │  Razorpay    │
│(Primary│  │(Backup/     │  │  (External     │  │  (Payments)  │
│  DB)   │  │ Reporting)  │  │   Participant  │  │              │
│        │  │             │  │   Registry)    │  │              │
└────────┘  └─────────────┘  └────────────────┘  └──────────────┘
```

### Data Flow

1. **User Registration:** MongoDB → Google Sheets → DMZ API
2. **Form Submission:** MongoDB → Google Sheets → DMZ API (all players)
3. **Admin Updates:** MongoDB → Google Sheets → DMZ API (delta updates)
4. **Payment Verification:** Razorpay → MongoDB → Google Sheets
5. **Status Sync:** Bidirectional between Sheets ↔ MongoDB

## 🔄 Key Integration Points

### 1. DMZ API (External Participant Registry)
- **URL:** `https://dmz.agneepath.co.in/api/users`
- **Purpose:** Central participant database across all universities
- **Sync:** One-way (Regform → DMZ)
- **Documentation:** [DMZ.md](./DMZ.md)

### 2. Google Sheets (Backup & Reporting)
- **Purpose:** Real-time backup and data export for organizers
- **Sync:** Bidirectional (MongoDB ↔ Sheets)
- **Documentation:** 
  - [GOOGLE_APPS_SCRIPT_WEBHOOK.md](./GOOGLE_APPS_SCRIPT_WEBHOOK.md)
  - [SYNC_SYSTEM_IMPROVEMENTS.md](./SYNC_SYSTEM_IMPROVEMENTS.md)

### 3. MongoDB (Primary Database)
- **Purpose:** Source of truth for all data
- **Collections:** `users`, `form`, `payments`, `auditLogs`
- **Hosted:** MongoDB Atlas

### 4. Razorpay (Payment Gateway)
- **Purpose:** Payment processing and verification
- **Documentation:** [PAYMENT_VERIFICATION_SETUP.md](./PAYMENT_VERIFICATION_SETUP.md)

## 🛠️ Common Tasks

### Testing DMZ Sync
```bash
# Check DMZ logs in application
grep "\[DMZ\]" logs/application.log

# Test DMZ endpoint
curl -X POST https://dmz.agneepath.co.in/api/users \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"email":"test@example.com","name":"Test","university":"Test Uni","phone":"+911234567890"}'
```

### Checking Sync Status
```bash
# MongoDB → Sheets sync status
# Check in admin panel: /admin/sync-status

# DMZ sync status
# Check console logs with [DMZ] prefix
```

### Debugging Failed Syncs
1. Check MongoDB for source data
2. Check application logs for error messages
3. Verify API keys in `.env` files
4. Test individual endpoints manually
5. Check Google Sheets API quota (if sheets sync fails)

## 📝 Contributing Documentation

When adding new documentation:

1. **Create a new .md file** in this directory
2. **Add it to this README** in the appropriate section
3. **Use clear headers** and formatting
4. **Include code examples** where applicable
5. **Link to relevant files** in the codebase
6. **Update the Quick Links** section if needed

### Documentation Template

```markdown
# Feature Name

## Overview
Brief description of what this feature does.

## How It Works
Step-by-step explanation of the workflow.

## Code Locations
- `/app/api/path/to/file.ts` - Main implementation
- `/lib/utility.ts` - Helper functions

## Configuration
Environment variables and setup required.

## Testing
How to test this feature.

## Troubleshooting
Common issues and solutions.
```

## 🐛 Known Issues & Solutions

See individual documentation files for specific issues. Common ones:

- **DMZ Sync Failures:** Check API key and network connectivity
- **Sheets Rate Limits:** Implement exponential backoff (already done)
- **Payment Webhook Issues:** Verify Razorpay signature validation
- **Concurrent Updates:** Optimistic locking in place for forms

## 📞 Support

For questions or issues:
1. Check relevant documentation in this directory
2. Review application logs
3. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for common solutions
4. Contact the development team

## 🔄 Recent Updates

### January 2026
- ✅ Optimized DMZ sync for player swaps (only sync changed players)
- ✅ Added comprehensive [DMZ.md](./DMZ.md) documentation
- ✅ Improved error handling for all external API calls
- ✅ Added this README for better navigation

---

**Last Updated:** January 28, 2026  
**Documentation Version:** 2.0
