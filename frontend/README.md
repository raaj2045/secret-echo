# Secret Echo Frontend

This is the frontend application for Secret Echo, a 1-to-1 messaging application with simulated AI responses.

## Technologies Used

- **Next.js 15.x**: React framework for server-rendered applications
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.io-client**: Client library for real-time bidirectional communication
- **Axios**: Promise-based HTTP client
- **React Hot Toast**: Notifications library
- **JWT Decode**: Library for decoding JWT tokens

## Features

- **JWT Authentication**
  - Secure login and registration
  - Automatic token refreshing
  - Protected routes with redirect
  - Auth persistence with localStorage

- **Real-time Messaging**
  - Instant message delivery
  - Typing indicators
  - Optimistic UI updates
  - Offline message storage
  - Automatic reconnection

- **UI/UX**
  - Responsive design for all devices
  - Dark mode support
  - Loading states and transitions
  - Toast notifications
  - Form validation

## Setup

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/secret-echo.git
   cd secret-echo/frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

#### Development Mode
```
npm run dev
```

#### Production Build
```
npm run build
npm start
```

## Application Structure

```
frontend/
├── app/               # Next.js app directory
│   ├── (auth)/        # Authentication pages (login, register)
│   ├── (chat)/        # Chat application pages
│   ├── components/    # Reusable UI components
│   │   ├── auth/      # Auth-related components
│   │   ├── chat/      # Chat interface components
│   │   └── ui/        # Generic UI components
│   ├── context/       # React context for global state
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Utility functions and API clients
├── public/            # Static assets
└── styles/            # Global styles
```

## Architecture

### Client-side Rendering with Next.js
The application primarily uses client-side rendering for chat functionality to enable real-time updates without page refreshes. Next.js App Router is used for routing and navigation.

### Authentication
JWT tokens are stored in localStorage and automatically included in API requests via Axios interceptors. The application includes logout functionality and automatic redirection for unauthenticated users.

### Real-time Communication
Socket.io is used to establish a persistent connection with the server. The application implements:
- Direct 1-to-1 messaging with the AI
- Optimistic UI updates for better UX
- Automatic reconnection upon disconnection
- Local storage for offline message persistence
- Debounced typing indicators

### State Management
React Context API is used for global state management:
- AuthContext: User authentication state
- SocketContext: WebSocket connection and events
- ChatContext: Messages and chat UI state

### Styling
Tailwind CSS is used for styling with a mobile-first approach. The application supports dark mode with automatic detection of system preferences.

## Key Components

### ChatWindow
The main chat interface component that:
- Displays messages in chronological order
- Shows typing indicators
- Implements auto-scroll to latest messages
- Handles message formatting and display

### MessageInput
Handles message composition and sending:
- Input validation
- Optimistic message updates
- Typing indicator signals
- Special command handling

### SocketProvider
Manages the WebSocket connection:
- Automatic connection/reconnection
- Event handling
- Room management
- Message delivery

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Tailwind CSS](https://tailwindcss.com/docs) - CSS framework documentation
- [Socket.io Client](https://socket.io/docs/v4/client-api/) - WebSocket client library

## Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).
