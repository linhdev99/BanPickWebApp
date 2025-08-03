# Ban-Pick Server

Real-time multiplayer server for the Ban-Pick WebApp game using Node.js and Socket.IO.

## 📁 Project Structure

```
ban-pick-server/
├── src/
│   ├── config/
│   │   └── server.config.js     # Server configuration
│   ├── controllers/
│   │   └── socketController.js  # Socket.IO event handling
│   ├── models/
│   │   └── GameRoom.js          # Game room model
│   ├── services/
│   │   └── roomManager.js       # Room management service
│   ├── utils/
│   │   └── logger.js            # Logging utility
│   └── app.js                   # Main application setup
├── index.js                     # Entry point
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 📜 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run dev:debug` - Start development server with debugging enabled
- `npm test` - Run tests (not implemented yet)
- `npm run lint` - Run linting (not implemented yet)

## 🔧 Configuration

The server can be configured through environment variables:

```bash
# Server settings
PORT=5000                    # Server port (default: 5000)
NODE_ENV=development         # Environment (development/production)

# Client settings
CLIENT_URL=http://localhost:3000  # Allowed client URL for CORS

# Logging
LOG_LEVEL=info              # Log level (error/warn/info/debug)
```

## 🎮 Game Features

### Room Management

- Create and join game rooms with unique IDs
- Maximum 2 players per room
- Automatic cleanup of idle rooms
- Real-time player status updates

### Game Mechanics

- **Ban Phase**: Teams take turns banning items
- **Pick Phase**: Teams take turns picking items
- **Multiple Rounds**: Configurable ban/pick rounds
- **Real-time Updates**: All players see changes instantly

### Game Configuration

```javascript
{
  banRounds: {
    1: { firstTeam: 'Blue', countPerTeam: 3 },
    2: { firstTeam: 'Red', countPerTeam: 2 }
  },
  pickRounds: {
    1: [
      { team: 'Blue', count: 1 },
      { team: 'Red', count: 2 },
      { team: 'Blue', count: 2 },
      { team: 'Red', count: 1 }
    ],
    2: [
      { team: 'Red', count: 1 },
      { team: 'Blue', count: 2 },
      { team: 'Red', count: 1 }
    ]
  }
}
```

## 🔌 Socket.IO Events

### Client → Server

- `joinRoom` - Join a game room
- `banItem` - Ban an item during ban phase
- `pickItem` - Pick an item during pick phase
- `resetGame` - Reset the current game
- `getRoomInfo` - Get room information
- `leaveRoom` - Leave current room

### Server → Client

- `joinedRoom` - Successfully joined a room
- `gameStateUpdate` - Game state changed
- `actionSuccess` - Action completed successfully
- `actionFailed` - Action failed with reason
- `gameReset` - Game was reset
- `roomInfo` - Room information response
- `error` - Error occurred

## 🌐 API Endpoints

- `GET /health` - Server health check
- `GET /api/info` - Server information and available endpoints

## 📊 Monitoring

The server provides real-time statistics and monitoring:

- Active rooms count
- Players count
- Game phases distribution
- Room cleanup activities
- Connection logs

## 🛠️ Development

### Adding New Features

1. **Models**: Add new game models in `src/models/`
2. **Controllers**: Add new controllers in `src/controllers/`
3. **Services**: Add new services in `src/services/`
4. **Configuration**: Update `src/config/server.config.js`

### Error Handling

- All errors are logged with appropriate levels
- Socket errors are handled gracefully
- Players are notified of disconnections

### Performance Considerations

- Automatic cleanup of idle rooms
- Efficient room lookup using Map
- Minimal data transfer in socket events
- Connection pooling for Socket.IO

## 🐛 Troubleshooting

### Common Issues

1. **Client can't connect**

   - Check CORS configuration in `server.config.js`
   - Verify client URL matches `CLIENT_URL` setting
   - Ensure server is running on correct port

2. **Players can't join room**

   - Check room ID format (6 characters)
   - Verify team selection (Blue/Red)
   - Ensure room isn't full (max 2 players)

3. **Game state not updating**
   - Check socket connection status
   - Verify player is in correct room
   - Check server logs for errors

### Debug Mode

```bash
# Start server with debug logging
LOG_LEVEL=debug npm run dev

# Start server with Node.js inspector
npm run dev:debug
```

## 📝 License

This project is part of the Ban-Pick WebApp and follows the same license terms.
