# 📡 Brodly

> Share beautiful moments of your life with everyone with customizable real-time broadcasts

A stylish, modern, high-security, and fully anonymous live streaming platform for the web.

[![Live Website](https://img.shields.io/badge/🌐_Live-brodly.by.nikdelv.in-success)](https://brodly.by.nikdelv.in)
[![App](https://img.shields.io/badge/🚀_App-brodly.app.nikdelv.in-primary)](https://brodly.app.nikdelv.in)
[![GitHub](https://img.shields.io/badge/GitHub-nikdelvin/brodly-blue)](https://github.com/nikdelvin/brodly)

## 🌟 Overview

Brodly is an innovative live streaming platform that combines:

- 🎨 **30 Color Themes** - Beautifully crafted color overlays for your streams
- 👥 **Multi-Streamer Support** - Broadcast solo or with up to 3 friends simultaneously
- 🔒 **Military-Grade Security** - Zero tracking, anonymous auth, and full encryption
- 💬 **Smart Chat** - Intelligent moderation system for meaningful conversations

## ✨ Features

### Capture Moments With Style

Share your experiences with powerful streaming tools:

- **30 Colorful Themes**: Carefully designed themes with video loop backgrounds and copyright-free lo-fi music library
- **1-4 Streamers**: Broadcast solo or collaborate with up to 3 friends in real-time
- **Smart Chat**: Intelligent moderation system keeps conversations meaningful and safe
- **Real-Time Editor**: Customize your stream on-the-fly, add friends, and rearrange webcam boxes dynamically

### Security & Privacy First

Streams for everyone who needs anonymity:

- **Zero Tracking**: Protection from IP tracking, browser fingerprint detection, and cookie-based tracking
- **Anonymous Authentication**: Authenticate without email or personal data using cryptographic tokens
- **Two-Way Encryption**: SHA-512 hashing applied to all stream data (video, audio, messages, events, donations)
- **Zero-Trail Protocol**: All data is erased after your stream ends—nothing is stored permanently

### Customize Your Broadcast

Make your experience unique:

- **9 Unique Sticker Packs**: Use pre-made sticker packs or create your own with the integrated pixel art tool
- **Dynamic Layouts**: Drag-and-drop interface for arranging multiple webcam feeds
- **Live Editing**: Adjust themes, music, and layout without interrupting your stream

## 🗺️ Project Roadmap

### Phase I: Web Privacy Jailbreak (Current)

**Timeline**: Next 3 months

- Zero-cookies browser policy blocking cookie-based tracking
- Browser fingerprint obfuscation (user-agent generation, canvas parameter modification, WebGL suppression)
- Personal information-free authentication using cryptographic tokens

### Phase II: Data Stream Encryption

**Timeline**: Months 3-6

- Two-sided SHA-512 hashing for every byte of data
- Multimedia streaming encryption (messages, events, donations)
- Regular security audits on encryption features

### Phase III: AES-Secured Messaging

**Timeline**: Months 6-9

- AES-256 encryption for all messaging
- Backtracking protection (ephemeral keys, message nonce)
- No-storage data transfer protocol ensuring zero-trail

### Phase IV: Themes & Customization

**Timeline**: Months 9-12

- 30 color themes with video backgrounds and lo-fi music library
- Sticker Art Tool for personalized sticker pack creation
- Robust real-time editor for drag-and-drop stream customization

## 🛠️ Tech Stack

- **Framework**: [Next.JS](https://nextjs.org/) - The React Framework for the Web
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- **Real-time Communication**: WebSocket API
- **Security**: SHA-512 hashing, AES-256 encryption (roadmap)
- **Language**: TypeScript - Type-safe JavaScript
- **Deployment**: Firebase App Hosting

## 🚀 Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/nikdelvin/brodly.git
cd brodly

# Install dependencies
npm install
```

### Development

```bash
# Start development server with linting and formatting
npm run dev
```

The site will be available at `http://localhost:3000`

### Build

```bash
# Build for production (includes linting and type checking)
npm run build

# Preview production build
npm run start
```

## 📁 Project Structure

```text
brodly/
├── public/                     # Static assets (images, videos, etc.)
│   ├── favicon.svg
│   ├── main-1.png
│   ├── main-2.png
│   ├── main-3.png
│   ├── placeholder.mp4
│   └── socket.io-stream.js
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   └── page.css            # Page-specific styles
│   ├── icons/                  # Reusable icon components
│   │   └── brodly.tsx          # Brodly logo SVG component
│   └── pages/                  # API routes (Pages Router)
│       └── api/
│           └── ws/
│               └── index.ts    # WebSocket API endpoint
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.js           # PostCSS configuration
├── apphosting.yaml             # Firebase App Hosting config
└── package.json                # Dependencies and scripts
```

## 📜 Available Scripts

| Command            | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `npm run dev`      | Formats, lints, and starts dev server                  |
| `npm run build`    | Formats, lints, type-checks, and builds for production |
| `npm run start`    | Preview production build locally                       |
| `npm run lint`     | Run ESLint on TypeScript and Astro files               |

## 👨‍💻 Creator

Created by [Nikita Stadnik](https://nikdelv.in) - Passionate Fullstack Web Developer

- 📧 Email: [the@nikdelv.in](mailto:the@nikdelv.in)
- 🐙 GitHub: [@nikdelvin](https://github.com/nikdelvin)
- 💼 LinkedIn: [@nikdelvin](https://www.linkedin.com/in/nikdelvin)

## 🔗 Related Projects

- [TailyUI](https://tailyui.app.nikdelv.in) - Modern UI Library built with pure Tailwind CSS
- [Feelicy](https://feelicy.app.nikdelv.in) - Self-improvement platform with meditation and habit tracking
- [Scientry](https://scientry.app.nikdelv.in) - Data management & visualization tool
- [Scripty](https://scripty.app.nikdelv.in) - Practice-oriented educational platform to learn JavaScript
- [Neuroly](https://neuroly.app.nikdelv.in) - STT and voice synthesis AI chatbot

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/nikdelvin/brodly/issues).

---

**Start broadcasting today!** 📡 Visit [brodly.app.nikdelv.in](https://brodly.app.nikdelv.in)
