# Brodly

**Share beautiful moments of your life with everyone with customizable real-time broadcasts.**

A stylish, modern, high-security, and fully anonymous live streaming platform for the web.

🔗 **Live Demo:** [https://brodly.app.nikdelv.in](https://brodly.app.nikdelv.in)

## ✨ Key Features

### 🎨 Capture Moments With

- **30 Color Themes** - Beautifully crafted color overlays for your streams
- **1-4 Streamers** - Broadcast solo or with up to 3 friends simultaneously
- **100% Safe** - Military-grade encryption ensures your privacy
- **Smart Chat** - Intelligent moderation system for meaningful conversations

### 🔒 Security & Privacy First

#### Streams for Everyone Who Needs Anonymity

- **Zero Tracking:** Protection from IP tracking, browser fingerprint detection, and cookie-based tracking
- **Personal Information-Free Auth:** Authenticate without email or personal data using cryptographic tokens
- **Two-Way Encryption:** SHA-512 hashing applied to all stream data (video, audio, messages, events, donations, and viewer information)
- **Zero-Trail Protocol:** All data is erased after your stream ends—nothing is stored permanently

### 🎭 Customize Your Broadcast

#### Make Your Experience Unique

- **30 Colorful Themes:** Carefully designed themes with video loop backgrounds and copyright-free lo-fi music library
- **9 Unique Sticker Packs:** Use pre-made sticker packs or create your own with the integrated pixel art tool
- **Real-Time Editor:** Customize your stream on-the-fly with built-in redactor, add friends, and rearrange webcam boxes dynamically

## 🚀 Project Roadmap

### Phase I: Web Privacy Jailbreak

**Timeline:** Next 3 months

- Zero-cookies browser policy blocking cookie-based tracking
- Browser fingerprint obfuscation (user-agent generation, canvas parameter modification, WebGL suppression)
- Personal information-free authentication using cryptographic tokens

### Phase II: Data Stream Encryption

**Timeline:** Months 3-6

- Two-sided SHA-512 hashing for every byte of data
- Multimedia streaming encryption (messages, events, donations)
- Regular security audits on encryption features

### Phase III: AES-Secured Messaging

**Timeline:** Months 6-9

- AES-256 encryption for all messaging
- Backtracking protection (ephemeral keys, message nonce)
- No-storage data transfer protocol ensuring zero-trail

### Phase IV: Themes & Customization

**Timeline:** Months 9-12

- 30 color themes with video backgrounds and lo-fi music library
- Sticker Art Tool for personalized sticker pack creation
- Robust real-time editor for drag-and-drop stream customization

## 🛠️ Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/nikdelvin/brodly.git
    cd brodly
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Run the development server:

    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Development

- Edit the main page by modifying `src/app/page.tsx`
- The app will automatically reload as you make changes
- WebSocket API endpoint: `src/pages/api/ws/index.ts`

## 📁 Project Structure

```markdown
brodly/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # App layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── icons/
│   │   └── brodly.tsx          # Brodly logo component
│   └── pages/
│       └── api/
│           └── ws/
│               └── index.ts    # WebSocket API
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── package.json
```

## 🔧 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) - React framework for production
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Real-time Communication:** WebSocket API
- **Security:** SHA-512 hashing, AES-256 encryption (roadmap)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/)

## 🚢 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com/):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically build and deploy your app

See [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests and open issues for bugs or feature requests.

## 📞 Support

For questions or support, please open an issue on [GitHub](https://github.com/nikdelvin/brodly/issues).

**Made with ❤️ by [nikdelvin](https://github.com/nikdelvin)**
