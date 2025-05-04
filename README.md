# Secret Echo

A real-time 1-to-1 messaging application with simulated AI responses, built with a MERN stack.

## Project Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/secret-echo.git
   cd secret-echo
   ```

2. Install dependencies
   ```
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. Set up environment variables
   - Create `.env` file in the backend directory
   - Create `.env.local` file in the frontend directory
   - See example files in `docs/backend-env.example` and `docs/frontend-env.example`

### Running the Application

1. Start the backend server
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server
   ```
   cd frontend
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

### Docker Setup

You can also run the application using Docker:

1. Create a `.env` file in the root directory using the template in `docs/env.example`
2. Run `docker-compose up` to start all services
3. Access the application at `http://localhost:3001`

## Architecture Overview

Secret Echo follows a modern full-stack architecture with clear separation between frontend and backend:

### Project Structure

```
secret-echo/
├── frontend/           # Next.js React application
│   ├── app/            # Application code (pages, components, contexts)
│   └── public/         # Static assets
│
└── backend/            # Express.js REST API
    ├── controllers/    # Request handlers
    ├── middleware/     # Express middleware
    ├── models/         # Mongoose models
    ├── routes/         # API route definitions
    ├── socket/         # Socket.io setup
    ├── tests/          # Unit tests
    └── utils/          # Utility functions
```

### Key Design Decisions

1. **Authentication Flow**: JWT-based authentication with tokens stored in localStorage and managed via React Context. This provides secure authentication without requiring server-side sessions.

2. **Real-time Communication**: Socket.io enables bidirectional, event-based communication between the client and server. This technology supports instant message delivery and typing indicators.

3. **State Management**: React Context API provides a lightweight solution for global state management without additional dependencies.

4. **Database Design**: MongoDB with Mongoose ODM provides a flexible schema for user profiles and message history, ideal for a chat application.

5. **Error Handling**: Centralized error handling middleware with standardized response formats ensures consistent error reporting.

6. **Testing Strategy**: Comprehensive Jest test coverage for the backend ensures reliability.

## Trade-offs and Limitations

- **AI Response System**: The pattern-based AI response system has limited understanding capabilities compared to advanced LLMs. It can only respond to predefined patterns and lacks true comprehension.

- **Scalability**: The current implementation is designed for moderate user loads. High-scale deployments would require additional infrastructure:
  - Database sharding or read replicas
  - Load balancing for Socket.io connections
  - Redis for shared socket state in multi-server deployments

- **Offline Support**: While the application stores messages locally when offline, the offline experience is limited and doesn't support full offline operation.

- **Authentication**: Uses simple JWT tokens without a refresh token mechanism. Long-running sessions require re-authentication, which may impact user experience.

- **Message History**: No pagination is implemented for conversation history. Large conversation histories may impact performance.

- **Testing Coverage**: Backend has extensive test coverage (99%+), but frontend component testing is more limited.

## Technologies

### Frontend
- Next.js 15.x (React 19.x)
- Tailwind CSS
- Socket.io Client
- Axios

### Backend
- Node.js & Express
- MongoDB Atlas
- Socket.io
- JSON Web Tokens
- bcrypt
- Jest 