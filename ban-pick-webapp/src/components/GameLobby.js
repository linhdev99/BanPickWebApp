// GameLobby.js - Component cho người chơi join room
import React, { useState, useEffect } from 'react';
import socketService from '../services/socketService';

const GameLobby = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('Blue');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if already connected before trying to connect
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    const handleConnected = () => {
      setIsConnected(true);
      setError('');
      console.log('GameLobby: Connected to server');
    };

    const handleDisconnected = data => {
      setIsConnected(false);
      const reason = data?.reason || 'Unknown reason';
      setError(`Disconnected from server: ${reason}`);
      console.log('GameLobby: Disconnected from server:', reason);
    };

    const handleError = errorData => {
      const message = errorData.message || 'An error occurred';
      setError(message);
      setIsConnecting(false);
      console.error('GameLobby: Error:', message);
    };

    const handleJoinedRoom = data => {
      setIsConnecting(false);
      console.log('GameLobby: Successfully joined room:', data);
      onJoinRoom(data);
    };

    socketService.on('connected', handleConnected);
    socketService.on('disconnected', handleDisconnected);
    socketService.on('error', handleError);
    socketService.on('joinedRoom', handleJoinedRoom);

    // Check initial connection state
    if (socketService.isConnected()) {
      setIsConnected(true);
    }

    return () => {
      socketService.off('connected', handleConnected);
      socketService.off('disconnected', handleDisconnected);
      socketService.off('error', handleError);
      socketService.off('joinedRoom', handleJoinedRoom);
    };
  }, [onJoinRoom]);

  const handleSubmit = e => {
    e.preventDefault();

    if (!isConnected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId.trim() || !playerName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsConnecting(true);
    setError('');
    socketService.joinRoom(roomId.trim(), playerName.trim(), selectedTeam);
  };

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  return (
    <div className='game-lobby'>
      <div className='lobby-container'>
        <h1>🎮 Ban-Pick Multiplayer</h1>
        <p className='subtitle'>Join a room to start playing with a friend!</p>

        <div className='connection-status'>
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className='lobby-form'>
          <div className='form-group'>
            <label htmlFor='roomId'>Room ID</label>
            <div className='room-input-group'>
              <input
                type='text'
                id='roomId'
                value={roomId}
                onChange={e => setRoomId(e.target.value.toUpperCase())}
                placeholder='Enter room ID'
                maxLength='6'
                disabled={isConnecting}
              />
              <button
                type='button'
                onClick={generateRoomId}
                className='generate-btn'
                disabled={isConnecting}
              >
                Generate
              </button>
            </div>
          </div>

          <div className='form-group'>
            <label htmlFor='playerName'>Your Name</label>
            <input
              type='text'
              id='playerName'
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder='Enter your name'
              maxLength='20'
              disabled={isConnecting}
            />
          </div>

          <div className='form-group'>
            <label>Choose Team</label>
            <div className='team-selection'>
              <label className={`team-option blue ${selectedTeam === 'Blue' ? 'selected' : ''}`}>
                <input
                  type='radio'
                  name='team'
                  value='Blue'
                  checked={selectedTeam === 'Blue'}
                  onChange={e => setSelectedTeam(e.target.value)}
                  disabled={isConnecting}
                />
                <span className='team-label'>Blue Team</span>
              </label>
              <label className={`team-option red ${selectedTeam === 'Red' ? 'selected' : ''}`}>
                <input
                  type='radio'
                  name='team'
                  value='Red'
                  checked={selectedTeam === 'Red'}
                  onChange={e => setSelectedTeam(e.target.value)}
                  disabled={isConnecting}
                />
                <span className='team-label'>Red Team</span>
              </label>
            </div>
          </div>

          {error && <div className='error-message'>{error}</div>}

          <button
            type='submit'
            className='join-btn'
            disabled={!isConnected || isConnecting || !roomId.trim() || !playerName.trim()}
          >
            {isConnecting ? '🔄 Joining...' : '🚀 Join Room'}
          </button>
        </form>

        <div className='how-to-play'>
          <h3>How to Play</h3>
          <ol>
            <li>🏠 Create or join a room with a friend</li>
            <li>🔵🔴 Choose different teams (Blue vs Red)</li>
            <li>🚫 Take turns banning items</li>
            <li>✅ Take turns picking items</li>
            <li>🏆 Complete all rounds to see results!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
