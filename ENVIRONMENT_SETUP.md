# Environment Variables Setup

This document explains how to set up environment variables for the Ban-Pick application.

## Quick Start

### Server Setup

1. Navigate to the server directory:

   ```bash
   cd ban-pick-server
   ```

2. Copy the example environment file:

   ```bash
   copy .env.example .env
   ```

3. Edit `.env` file with your desired values:
   ```bash
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   LOG_LEVEL=info
   ```

### Client Setup

1. Navigate to the client directory:

   ```bash
   cd ban-pick-webapp
   ```

2. Copy the example environment file:

   ```bash
   copy .env.example .env
   ```

3. Edit `.env` file with your server URL:
   ```bash
   PORT=3000
   REACT_APP_SERVER_URL=http://localhost:5000
   ```

## Quick Start with Root Package.json

For the easiest development experience, you can run both server and client from the root directory:

1. **First-time setup:**

   ```bash
   cd ban-pick-app
   npm install
   npm run setup
   ```

2. **Start both server and client in development mode:**

   ```bash
   npm run dev
   ```

3. **Alternative individual commands:**

   ```bash
   # Run server only in dev mode
   npm run server:dev

   # Run client only in dev mode
   npm run client:dev

   # Install dependencies for both
   npm run install:all
   ```

## Environment Variables Reference

### Server (.env)

| Variable     | Default               | Description                               |
| ------------ | --------------------- | ----------------------------------------- |
| `PORT`       | 5000                  | Server port number                        |
| `NODE_ENV`   | development           | Environment mode (development/production) |
| `CLIENT_URL` | http://localhost:3000 | Allowed client URL for CORS               |
| `LOG_LEVEL`  | info                  | Logging level (error/warn/info/debug)     |

### Client (.env)

| Variable               | Default               | Description                                 |
| ---------------------- | --------------------- | ------------------------------------------- |
| `PORT`                 | 3000                  | Client development server port              |
| `REACT_APP_SERVER_URL` | http://localhost:5000 | Server URL for socket connection            |
| `BROWSER`              | none                  | Browser to open (none to disable auto-open) |
| `GENERATE_SOURCEMAP`   | true                  | Generate source maps for debugging          |

## Available Root Scripts

| Script                 | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | 🚀 Start both server and client in development mode |
| `npm run start`        | 🏭 Start both in production mode                    |
| `npm run setup`        | ⚙️ Install all dependencies and setup .env files    |
| `npm run install:all`  | 📦 Install dependencies for both server and client  |
| `npm run server:dev`   | 🔧 Start only server in development mode            |
| `npm run client:dev`   | ⚛️ Start only client in development mode            |
| `npm run client:build` | 🔨 Build client for production                      |
| `npm run clean`        | 🧹 Clean all node_modules and build files           |

## Notes

- All `.env` files are ignored by git for security
- Use `.env.example` as templates for team members
- Restart servers after changing environment variables
- For production, set `NODE_ENV=production` and update URLs accordingly
