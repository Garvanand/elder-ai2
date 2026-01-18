<p align="center">
  <img src="https://img.shields.io/badge/Elder%20AI-Memory%20Companion-blue?style=for-the-badge&logo=brain&logoColor=white" alt="Elder AI Badge"/>
</p>

<h1 align="center">Elder AI</h1>

<p align="center">
  <strong>AI-Powered Memory Companion & Care Platform for Seniors</strong>
</p>

<p align="center">
  A compassionate, intelligent platform designed to preserve memories, enhance cognitive health, and connect elderly users with their caregivers and healthcare providers.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.1-61DAFB?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=flat-square&logo=google" alt="Gemini AI"/>
  <img src="https://img.shields.io/badge/TensorFlow.js-Face%20Recognition-FF6F00?style=flat-square&logo=tensorflow" alt="TensorFlow"/>
</p>

---

## Overview

Elder AI is a comprehensive eldercare platform that combines artificial intelligence with human-centered design to support seniors in preserving their memories, maintaining cognitive health, and staying connected with loved ones. The platform serves three distinct user roles: **Elders**, **Caregivers**, and **Clinicians**, each with tailored interfaces and features.

---

## Key Features

### For Elders

#### Memory Recording & Preservation
- **Voice-Enabled Memory Entry** - Record memories hands-free using speech recognition
- **Photo Memory Uploads** - Attach images to memories for visual preservation
- **Smart Categorization** - AI automatically tags and categorizes memories (stories, people, events, medication, routines, preferences)
- **Memory Wall** - Beautiful visual gallery of all recorded memories
- **Memory Timeline** - Chronological life journey visualization

#### AI Memory Companion
- **Conversational AI** - Chat with an empathetic AI companion that remembers your stories
- **Memory-Aware Responses** - AI references your past memories in conversations
- **Voice Interaction** - Full text-to-speech and speech-to-text support
- **Emotional Understanding** - AI adapts tone based on conversation context

#### Question Answering System
- **Natural Language Questions** - Ask questions about your own memories
- **AI-Powered Search** - Gemini AI finds relevant memories and generates warm, friendly answers
- **Text-to-Speech Playback** - Listen to answers instead of reading
- **Question History** - Review all past questions and answers

#### Cognitive Health Tools
- **Memory Matching Games** - Brain training games with difficulty levels (Easy/Medium/Hard)
- **Daily Cognitive Prompts** - AI-generated prompts to stimulate memory recall
- **Cognitive Health Dashboard** - Track cognitive patterns and trends over time
- **Adaptive Questions** - AI generates personalized memory exercises

#### Face Recognition
- **People Scanner** - Camera-based face recognition using TensorFlow.js
- **Face Registration** - Register family members and friends with names/relationships
- **Real-time Recognition** - Instantly identify people and display relationship information
- **Privacy-First** - All face data stored locally and encrypted

#### Mood & Wellness Tracking
- **Daily Mood Check-ins** - Simple emoji-based mood logging
- **Mood History** - Visualize mood patterns over time
- **Caregiver Alerts** - Notify caregivers of concerning mood patterns

#### Time Capsules
- **Future Message Creation** - Record messages for loved ones' future milestones
- **Event Scheduling** - Set delivery for graduations, weddings, birthdays, anniversaries
- **Multi-Media Support** - Text, voice, and video messages
- **Automated Delivery** - Messages delivered automatically on the scheduled date

#### Safety Features
- **Emergency Panic Button** - One-touch SOS alert to caregivers and emergency contacts
- **3-Second Countdown** - Prevents accidental triggers with cancel option
- **Location Sharing** - Share location during emergencies
- **Alert Notifications** - Instant push notifications to all linked caregivers

#### Teleconsultation
- **Video Calls with Clinicians** - Built-in Jitsi video conferencing
- **Appointment Scheduling** - Book consultations with healthcare providers
- **Consultation History** - Track past and upcoming appointments

#### Family Connection
- **Family Messages** - Receive messages and updates from family members
- **Photo Sharing** - View photos shared by caregivers
- **Activity Sharing** - Share daily activities with loved ones

#### Accessibility
- **Large Text Mode** - Adjustable font sizes (Normal/Large/Extra-Large)
- **High Contrast Mode** - Enhanced visibility for visual impairments
- **Voice Navigation** - Full voice control support
- **Simple Interface** - Large buttons, minimal complexity

---

### For Caregivers

#### Caregiver Dashboard
- **Elder Monitoring** - View linked elder's memories, questions, and activities
- **Real-time Updates** - Live updates via Supabase real-time subscriptions
- **Multi-Elder Support** - Manage multiple elders from one account

#### Behavioral Signals
- **Activity Tracking** - Monitor elder's daily activities and engagement
- **Cognitive Patterns** - View trends in memory and cognitive exercises
- **Mood Alerts** - Receive notifications for mood changes
- **Engagement Metrics** - Track platform usage and interaction levels

#### Health Insights
- **Memory Analytics** - Charts showing memory recording frequency
- **Question Patterns** - Analysis of questions asked over time
- **Wellness Indicators** - Health-related behavioral signals
- **Weekly Reports** - AI-generated summaries of elder's week

#### Elder Linking
- **Email-Based Linking** - Connect to elders using their email
- **Secure Verification** - Verified linking process
- **Relationship Management** - Define caregiver-elder relationships

#### Cognitive Journal
- **Memory Highlights** - Curated view of significant memories
- **Conversation Insights** - Key themes from AI companion chats
- **Progress Tracking** - Monitor cognitive exercise completion

---

### For Clinicians

#### Command Center
- **Patient Grid View** - Overview of all elderly patients
- **Search & Filter** - Find patients by name or ID
- **Alert Management** - View and respond to patient alerts

#### Patient Records
- **Comprehensive View** - Full patient history and data
- **Memory Access** - Review patient's recorded memories
- **Behavioral Analysis** - Detailed behavioral signal history
- **Consultation Notes** - Add and view clinical notes

#### Diagnostic AI
- **Pattern Detection** - AI-assisted cognitive decline detection
- **Risk Assessment** - Early warning indicators
- **Trend Analysis** - Long-term cognitive trend visualization

#### Health Visualization
- **3D Brain Model** - Interactive Three.js brain visualization
- **Health Heatmaps** - Visual representation of health metrics
- **Health Timelines** - Chronological health event tracking

#### Teleconsultation Management
- **Appointment Calendar** - Manage consultation schedules
- **Video Consultations** - Conduct remote consultations
- **Patient Queue** - Manage consultation waiting list

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| shadcn/ui | UI Components |
| React Router | Navigation |
| TanStack Query | Data Fetching |
| Three.js | 3D Visualizations |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Supabase Storage | File Storage |
| Supabase Realtime | Live Updates |

### AI & Machine Learning
| Technology | Purpose |
|------------|---------|
| Google Gemini API | NLP & Question Answering |
| Groq API | Fast LLM Inference |
| TensorFlow.js | Face Recognition |
| face-api.js | Face Detection Models |
| Hugging Face | Additional ML Models |

### Communication
| Technology | Purpose |
|------------|---------|
| Jitsi | Video Conferencing |
| Resend | Email Notifications |
| Web Speech API | Voice Recognition |
| Speech Synthesis | Text-to-Speech |

---

## Project Structure

```
Elder AI/
├── app/                          # Next.js API Routes
│   └── api/
│       ├── memories/             # Memory CRUD operations
│       ├── questions/            # Question answering
│       ├── summaries/            # Daily summary generation
│       ├── memory-images/        # Image upload handling
│       ├── caregivers/           # Caregiver management
│       ├── health/               # Health check endpoint
│       └── support/              # Support email sending
├── src/
│   ├── components/
│   │   ├── elder/                # Elder-specific components
│   │   │   ├── ElderDashboard    # Main elder interface
│   │   │   ├── MemoryCompanion   # AI chatbot
│   │   │   ├── MemoryWall        # Photo gallery
│   │   │   ├── MemoryTimeline    # Life timeline
│   │   │   ├── PeopleScanner     # Face recognition
│   │   │   ├── CognitiveGames    # Brain games
│   │   │   ├── MoodTracker       # Mood logging
│   │   │   ├── TimeCapsule       # Future messages
│   │   │   ├── PanicButton       # Emergency SOS
│   │   │   └── DailyPrompts      # AI prompts
│   │   ├── caregiver/            # Caregiver components
│   │   │   ├── CaregiverDashboard
│   │   │   ├── CaregiverInsights
│   │   │   ├── HealthDashboard
│   │   │   └── CognitiveJournal
│   │   ├── clinician/            # Clinician components
│   │   │   ├── CommandCenter
│   │   │   ├── DiagnosticAI
│   │   │   ├── BrainModel3D
│   │   │   └── HealthHeatmap
│   │   ├── teleconsultation/     # Video call components
│   │   │   ├── VideoRoom
│   │   │   ├── ConsultationScheduler
│   │   │   └── UpcomingConsultations
│   │   └── ui/                   # Reusable UI components
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext           # Authentication state
│   │   ├── DemoContext           # Guest mode state
│   │   └── TourContext           # Onboarding tour
│   ├── hooks/                    # Custom hooks
│   │   ├── useSpeech             # Voice I/O
│   │   └── useEmergency          # Emergency alerts
│   ├── lib/                      # Utilities
│   │   ├── ai.ts                 # AI functions
│   │   ├── face-recognition.ts   # Face detection
│   │   └── utils.ts              # General utilities
│   ├── pages/                    # Page components
│   │   ├── Index                 # Landing page
│   │   ├── Auth                  # Login/Register
│   │   ├── Elder                 # Elder portal
│   │   ├── Caregiver             # Caregiver portal
│   │   ├── Clinician             # Clinician portal
│   │   └── Support               # Help center
│   └── integrations/
│       └── supabase/             # Supabase client
├── supabase/
│   ├── migrations/               # Database schema
│   └── functions/                # Edge functions
└── ElderAI-Mobile/               # React Native mobile app
```

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with roles (elder/caregiver/clinician) |
| `memories` | Memory entries with text, type, tags, image URLs |
| `questions` | Questions asked and AI-generated answers |
| `daily_summaries` | AI-generated daily summaries |
| `behavioral_signals` | Activity and behavioral data |
| `caregiver_elder_links` | Caregiver-elder relationships |
| `alerts` | Emergency and notification alerts |
| `teleconsultations` | Video call appointments |
| `mood_entries` | Daily mood check-ins |
| `time_capsules` | Future message scheduling |
| `known_faces` | Face recognition data |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account
- Google Gemini API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/elder-ai.git
   cd elder-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables**
   
   Create a `.env` file:
   ```env
   # Supabase
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # AI (Optional - enables enhanced features)
   GEMINI_API_KEY=your_gemini_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   VITE_GROQ_API_KEY=your_groq_api_key
   
   # Email (Optional)
   RESEND_API_KEY=your_resend_api_key
   
   # Face Recognition (Optional)
   VITE_HUGGINGFACE_API_KEY=your_huggingface_key
   ```

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run migrations from `supabase/migrations/`
   - Create storage bucket `memory-images` with public access
   - Enable realtime for required tables

5. **Start development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```
   
   Open [http://localhost:8080](http://localhost:8080)

---

## API Endpoints

### Memory Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/memories` | GET | Fetch memories with filters |
| `/api/memories` | POST | Create new memory |
| `/api/memory-images` | POST | Upload memory image |

### Question Answering
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/questions` | GET | Get recent questions |
| `/api/questions/answer` | POST | Get AI answer to question |

### Summaries
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/summaries` | GET | Fetch summaries |
| `/api/summaries/daily` | POST | Generate daily summary |

### Caregivers
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/caregivers/link-elder` | POST | Link caregiver to elder |
| `/api/current-elder` | GET | Get linked elder info |

### Support
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/support/send-email` | POST | Send support email |
| `/api/health` | GET | System health check |

---

## AI Features

### Memory Intelligence
- **Automatic Tag Extraction** - AI extracts people, places, and events from memories
- **Memory Categorization** - Smart classification of memory types
- **Semantic Search** - Find relevant memories using natural language

### Question Answering
- **Context-Aware Responses** - AI uses full memory context for answers
- **Warm, Friendly Tone** - Responses optimized for elderly users
- **Fallback System** - Keyword matching when AI is unavailable

### Companion AI
- **Empathetic Conversations** - Emotionally intelligent responses
- **Memory Prompts** - AI suggests memory-triggering questions
- **Personalization** - Learns from user's memory history

### Diagnostic Intelligence
- **Pattern Recognition** - Detects cognitive decline indicators
- **Behavioral Analysis** - Analyzes activity patterns
- **Risk Scoring** - Early warning system for clinicians

---

## Security & Privacy

- **Row-Level Security** - Database-level access control
- **Encrypted Storage** - Secure data at rest
- **HIPAA Considerations** - Designed with healthcare privacy in mind
- **Local Face Data** - Face recognition data never leaves device
- **Secure Authentication** - Supabase Auth with JWT tokens

---

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Environment Variables
Set all `.env` variables in your deployment platform's dashboard.

---

## Mobile App

A React Native mobile app is available in the `ElderAI-Mobile/` directory, providing native iOS and Android experiences with the same features.

---

## Contributing

This is a private project. For questions or collaboration inquiries, please contact the maintainer.

---

## License

All Rights Reserved - Private Project

---

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) - UI Components
- [Google Gemini](https://ai.google.dev) - AI/ML
- [Supabase](https://supabase.com) - Backend Infrastructure
- [Jitsi](https://jitsi.org) - Video Conferencing
- [TensorFlow.js](https://www.tensorflow.org/js) - Face Recognition

---

<p align="center">
  <strong>Made with care for elderly users and their families</strong>
</p>

<p align="center">
  by <strong>GARV ANAND</strong>
</p>
