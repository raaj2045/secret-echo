# Secret Echo Deployment Guide

This guide will help you deploy the Secret Echo application using free services.

## Deploying the Backend to Render

1. **Sign up for Render**:
   - Go to [Render.com](https://render.com/) and create an account
   - Connect your GitHub account

2. **Create a New Web Service**:
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Choose the repository containing your Secret Echo project

3. **Configure the Web Service**:
   - Name: `secret-echo-backend`
   - Root Directory: `backend` (important!)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

4. **Add Environment Variables**:
   - Click "Environment" tab and add the following variables:
     - `NODE_ENV`: `production`
     - `PORT`: `10000` (Render will override this, but include it anyway)
     - `JWT_SECRET`: (generate a long, random string)
     - `MONGODB_URI`: (your MongoDB Atlas connection string)

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for the deployment to complete
   - Note the URL provided (e.g., `https://secret-echo-backend.onrender.com`)

## Deploying with Docker on Render

Render also supports deploying your application using Docker, which eliminates the need for separate frontend and backend deployments.

1. **Sign up for Render**:
   - Go to [Render.com](https://render.com/) and create an account
   - Connect your GitHub account

2. **Deploy using Blueprint**:
   - From your Render dashboard, click "New +"
   - Select "Blueprint"
   - Connect your GitHub repository
   - Choose the repository containing your Secret Echo project
   - Render will automatically detect the `render.yaml` file in the root
   - Review the services that will be created (backend and frontend)

3. **Set Environment Variables**:
   - The `render.yaml` file already includes configurations for:
     - Automatically connecting frontend to backend
     - Generating a secure JWT_SECRET
   - You'll only need to add your MongoDB connection string in the UI

4. **Deploy**:
   - Click "Apply"
   - Render will build and deploy both services according to their Dockerfiles
   - This may take 5-10 minutes for the initial build

5. **Access Your Application**:
   - Once deployment is complete, click on the secret-echo-frontend service
   - Render will provide a URL to access your application

## Advantages of Docker Deployment

- **Consistency**: The same container runs locally and in production
- **Dependencies**: All dependencies are bundled in the container
- **Configuration**: Environment is identical between environments
- **Simplicity**: Deploy both services with a single blueprint

## Post-Deployment Configuration

1. **Update CORS in Backend**:
   - If your Vercel domain wasn't included in the CORS configuration:
   - Go to Render → secret-echo-backend → Environment
   - Add your Vercel domain to the allowed origins in index.js

2. **Test the Connection**:
   - Visit your Vercel app URL
   - Register an account
   - Test the real-time messaging features

## Troubleshooting

1. **WebSocket Connection Issues**:
   - Check browser console for errors
   - Ensure CORS is correctly configured
   - Verify your Socket.io URLs are correct

2. **MongoDB Connection Issues**:
   - Ensure your MongoDB Atlas IP allowlist includes Render's IPs
   - Check Render logs for connection errors

3. **Frontend Can't Connect to Backend**:
   - Verify environment variables are correctly set in Vercel
   - Check that backend is running properly
   - Make sure APIs are correctly formatted (/api/auth, etc.)

## Maintenance

- Both Render and Vercel free tiers may "sleep" when inactive
- The first request might be slow after inactivity
- For a fully production-ready solution, consider upgrading to paid plans 