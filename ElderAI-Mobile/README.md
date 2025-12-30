# ElderAI Mobile - React Native App

A React Native (Expo) mobile application for the Memory Friend / Elder AI platform.

## Features

### Elder Portal
- **Home Dashboard** - Personalized greeting, quick actions, today's activities, upcoming video calls
- **Memories** - Add, view, and manage personal memories with photo support
- **Ask Questions** - AI-powered question answering based on stored memories with voice response
- **Video Calls** - Jitsi Meet integration for teleconsultations with clinicians
- **Settings** - Accessibility options, notifications, sign out

### Caregiver Portal
- **Dashboard** - Overview of linked elders, active alerts, today's tasks
- **My Elders** - Patient list with detailed profiles, memories, and health data
- **Alerts** - View and acknowledge alerts with severity filtering
- **Schedule** - Calendar view for consultations and reminders
- **Settings** - Notification preferences, account settings

### Clinician Portal
- **Dashboard** - Today's consultations, patient overview, quick actions
- **Patients** - Full patient list with health metrics and memory access
- **Telemedicine** - Video consultation management with instant call support
- **Schedule** - Calendar with availability management
- **Settings** - Practice settings, accepting patients toggle

## Tech Stack

- **Framework**: React Native with Expo (SDK 51)
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (Auth, Database, Storage)
- **Video Calls**: Jitsi Meet via WebView
- **State Management**: React Context API
- **Styling**: React Native StyleSheet with custom theme

## Prerequisites

- Node.js 18+
- npm, yarn, or bun
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

## Installation

```bash
# Navigate to the mobile app directory
cd ElderAI-Mobile

# Install dependencies
npm install

# Start the development server
npm start
```

## Running the App

### Using Expo Go (Recommended for Development)
1. Start the dev server: `npm start`
2. Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Running on Simulators
```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android
```

## Project Structure

```
ElderAI-Mobile/
├── app/                       # Expo Router pages
│   ├── _layout.tsx           # Root layout with auth provider
│   ├── index.tsx             # Entry point (redirects based on role)
│   ├── auth.tsx              # Authentication screen
│   ├── (elder)/              # Elder portal screens
│   │   ├── _layout.tsx       # Tab navigation
│   │   ├── home.tsx          # Dashboard
│   │   ├── memories.tsx      # Memory management
│   │   ├── ask.tsx           # AI Q&A
│   │   ├── video-call.tsx    # Teleconsultations
│   │   └── settings.tsx      # Settings
│   ├── (caregiver)/          # Caregiver portal screens
│   │   ├── _layout.tsx       # Tab navigation
│   │   ├── home.tsx          # Dashboard
│   │   ├── patients.tsx      # Elder management
│   │   ├── alerts.tsx        # Alert management
│   │   ├── schedule.tsx      # Calendar
│   │   └── settings.tsx      # Settings
│   └── (clinician)/          # Clinician portal screens
│       ├── _layout.tsx       # Tab navigation
│       ├── home.tsx          # Dashboard
│       ├── patients.tsx      # Patient management
│       ├── telemedicine.tsx  # Video consultations
│       ├── schedule.tsx      # Calendar
│       └── settings.tsx      # Settings
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/
│   │   └── supabase.ts       # Supabase client setup
│   ├── styles/
│   │   └── theme.ts          # Design system
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── .env                       # Environment variables
├── app.json                   # Expo configuration
└── package.json
```

## Environment Variables

Create a `.env` file with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key (optional)
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key (optional)
```

## Design System

The app uses a custom dark theme optimized for elder accessibility:
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #ec4899 (Pink)
- **Success**: #10b981 (Green)
- **Background**: #0f0f23 (Dark)
- **Large touch targets** for elder-friendly interaction
- **High contrast** text and elements

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build both
eas build --platform all
```

## Notes

- The app connects to the same Supabase backend as the web app
- Video calls use Jitsi Meet's public servers
- Secure storage is implemented for authentication tokens
- Auto-refresh of auth tokens is enabled
