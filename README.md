# ElderAI - Intelligent Memory Companion 🧠✨

ElderAI is a production-grade, compassionate AI-powered ecosystem designed to bridge the gap between elderly users, their families, caregivers, and clinicians. By leveraging state-of-the-art AI and real-time communication, ElderAI helps preserve precious memories, provide instant support, and ensure a higher quality of care.

[![Status](https://img.shields.io/badge/Status-Production--Ready-success.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-Next.js%2015%20|%20React%2019%20|%20Supabase-blue.svg)](#)
[![AI](https://img.shields.io/badge/AI-Gemini%20|%20Groq%20|%20HuggingFace-orange.svg)](#)
[![Mobile](https://img.shields.io/badge/Mobile-Expo%20|%20React%20Native-brightgreen.svg)](#)

---

## 🚀 Key Platforms

### 🌐 Web Ecosystem (Next.js 15)
A multi-portal web application with specialized interfaces for:
*   **Elder Portal:** Simplified UI with voice-first interactions.
*   **Caregiver Dashboard:** Real-time monitoring and memory management.
*   **Clinician Suite:** Advanced analytics and health status monitoring.
*   **Family Space:** Stay connected and view daily summaries.

### 📱 Mobile App (ElderAI-Mobile)
A companion mobile application built for on-the-go access, featuring:
*   Push notifications for reminders.
*   Simplified memory recording via mobile camera and microphone.
*   Direct family-to-elder messaging.

---

## ✨ Core Features

### 📖 Intelligent Memory Management
*   **Multimodal Entry:** Record memories via text, voice, or photos.
*   **Automated Extraction:** AI automatically extracts people, locations, and events to build a structured "Life Story" graph.
*   **Contextual Retrieval:** Ask "Where did I go last summer?" and get instant, warm, and friendly answers based on recorded memories.

### 🩺 Health & Support
*   **Teleconsultation:** Integrated high-quality video calling via **Jitsi SDK** for remote clinician visits.
*   **Status Monitoring:** Real-time tracking of wellbeing and activity.
*   **AI Summaries:** Daily and weekly AI-generated summaries for caregivers and families to stay informed without manual check-ins.

### 🎙️ Accessibility First
*   **Voice Interface:** Native Speech-to-Text and Text-to-Speech integration.
*   **High-Contrast UI:** Optimized for users with visual impairments.
*   **Cognitive Load Reduction:** Simplified navigation and large interactive elements.

---

## 🛠️ Technical Architecture

### Tech Stack
*   **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
*   **Backend:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Edge Functions, Real-time)
*   **AI Engine:** [Google Gemini Pro](https://ai.google.dev/), [Groq LPU](https://groq.com/), [Hugging Face](https://huggingface.co/)
*   **Communication:** [Jitsi Meet SDK](https://jitsi.org/), [Resend](https://resend.com/) (Email Notifications)
*   **State & Data:** [TanStack Query v5](https://tanstack.com/query), [Zod](https://zod.dev/)

### Project Structure
```bash
├── app/                  # Next.js 15 App Router (Primary Routes)
│   ├── api/              # Secure Backend API Routes
│   ├── (portals)/        # Role-based portals (Elder, Caregiver, etc.)
│   └── auth/             # Supabase Authentication Flow
├── ElderAI-Mobile/       # Companion React Native/Expo Application
├── src/
│   ├── components/       # Reusable UI & Feature components
│   ├── views/            # Legacy view migrations (Hybrid Router Support)
│   ├── integrations/     # Supabase & External Service Clients
│   └── lib/              # Core Logic (AI, Utils, Types)
├── supabase/
│   ├── functions/        # Deno-based AI Edge Functions
│   └── migrations/       # Version-controlled Database Schema
└── public/               # Static assets and 3D Models
```

---

## 🚦 Getting Started

### 1. Prerequisites
*   Node.js 18.x or 20.x
*   pnpm (recommended) or npm
*   A Supabase Project

### 2. Environment Setup
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
RESEND_API_KEY=your_resend_key
```

### 3. Installation & Development
```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

The application will be live at `http://localhost:3000`.

---

## 🛡️ Security & Reliability
*   **RLS (Row Level Security):** Strict data isolation between different elders and families.
*   **AI Fallbacks:** Naive keyword-matching fallbacks ensure basic functionality if AI APIs hit rate limits.
*   **Hybrid Routing:** Seamlessly handles both App Router performance and Pages Router flexibility.

---

## 📈 Development Status
- [x] Next.js 15 Migration
- [x] React 19 Upgrade
- [x] Supabase Auth & DB Integration
- [x] Multi-Portal Dashboard (Elder, Caregiver, Clinician)
- [x] Real-time Teleconsultation (Jitsi)
- [x] AI Memory Extraction & QA
- [ ] Advanced Health Predictive Analytics
- [ ] Wearable Device Integration

---

**Developed with ❤️ for the Elderly Community by [GARV ANAND](https://github.com/Garvanand)**
