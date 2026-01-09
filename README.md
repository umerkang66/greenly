# Evalynx 🌿

**Evalynx** is a modern, AI-powered sustainability platform designed to help communities monitor, track, and forecast their collective carbon footprint. By combining social engagement, gamification, and advanced analytics, Evalynx empowers users to take actionable steps towards a greener future.

## ✨ Features

### 🌍 Community & Social
- **Community Spaces**: Create or join public/private communities focused on specific eco-goals.
- **Interactive Feed**: Share tips, achievements, and news with community members. Support for anonymous posting.
- **Global & Community Leaderboards**: Compete with friends and other communities to see who saves the most carbon.
- **Smart Invites**: Invite system with notifications to grow your tribe.

### 📊 Carbon Tracking & Analytics
- **Activity Logging**: Log daily activities across Transport, Diet, Energy, and Waste categories.
- **Real-time Impact**: Instant calculation of CO2e emissions vs. savings.
- **AI Carbon Forecast**: Uses **Google Gemini AI** to predict a community's potential carbon reduction based on current engagement and challenge participation.
- **Visual Stats**: Beautiful charts and summaries of your eco-journey.

### 🏆 Gamification
- **Challenges**: Participate in time-bound challenges (e.g., "Cycle to Work Week", "Plastic Free July").
- **Points & Badges**: Earn rewards for consistent sustainable actions and community contributions.
- **Levels**: Progress through user levels as you increase your impact.

## 🛠️ Technology Stack

**Frontend**
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion (for smooth animations & transitions)
- **Icons**: Lucide React

**Backend**
- **API**: [tRPC](https://trpc.io/) (End-to-end typesafe APIs)
- **Database**: MongoDB (via Prisma ORM)
- **Auth**: Better-Auth / NextAuth (Secure user authentication)
- **AI**: Google Gemini API (`@google/generative-ai`)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Database URL
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/evalynx.git
   cd evalynx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mongodb+srv://..."
   GEMINI_API_KEY="your_google_gemini_key"
   NEXTAUTH_SECRET="your_secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Run Database Push**
   ```bash
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```bash
├── src
│   ├── app              # Next.js App Router pages
│   ├── components       # Reusable UI components
│   │   ├── community    # Community-specific components (Feed, Forecast, etc.)
│   │   └── ...
│   ├── server
│   │   ├── routers      # tRPC routers (backend logic)
│   │   └── trpc.ts      # tRPC context & initialization
│   ├── lib              # Utility functions (db, auth, etc.)
│   └── styles           # Global styles
├── prisma               # Database schema
└── public               # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
