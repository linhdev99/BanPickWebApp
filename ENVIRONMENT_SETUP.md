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

## Notes

- All `.env` files are ignored by git for security
- Use `.env.example` as templates for team members
- Restart servers after changing environment variables
- For production, set `NODE_ENV=production` and update URLs accordingly
