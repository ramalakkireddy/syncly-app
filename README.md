
# ProjectSync - Modern Project Management SaaS

A production-ready, full-stack project management and collaboration tool built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### ✅ Authentication & Security
- Email/password authentication via Supabase
- Secure session management
- Protected routes and layouts
- Row Level Security (RLS) for data access

### 🎨 Modern UI/UX
- Beautiful, responsive design inspired by Linear and Notion
- Dark/Light mode toggle with system preference detection
- Smooth animations and transitions
- Mobile-first responsive layout

### 👥 Team Management
- Create and manage teams
- Invite team members by email
- Role-based access control (Owner, Admin, Member)
- Team-scoped project visibility

### 📁 Project Management
- Create, edit, and delete projects
- Project status tracking (Active, Completed, Archived)
- Tagging system for organization
- Project filtering and search

### 📝 Task Management
- Task creation with rich details
- Due dates and priority levels
- Task assignment to team members
- Status tracking (To Do, In Progress, Done)
- Real-time updates via Supabase

### 🔄 Real-time Features
- Live updates for project and task changes
- Collaborative editing
- Real-time notifications

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + HeadlessUI
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **UI Components**: Radix UI + Custom components
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 🏗️ Database Schema

### Tables
- `teams` - Team information and ownership
- `team_members` - Team membership with roles
- `projects` - Project details and metadata
- `tasks` - Task management with assignments

### Security
- Row Level Security (RLS) policies
- User-based data access control
- Secure API endpoints

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd projectsync
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL migrations for tables
   - Configure RLS policies
   - Enable real-time subscriptions

## 📦 Deployment

The app is ready for deployment on Vercel:

```bash
npm run build
```

Deploy to Vercel with automatic builds from your Git repository.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
