import React, { useState, useEffect } from 'react';

const BanPhase = ({
  banRounds,
  currentRound = 1,
  bannedItems: globalBannedItems = [],
  pickedItems: globalPickedItems = [],
  onComplete,
}) => {
  const [currentTeam, setCurrentTeam] = useState('Blue');
  const [banCount, setBanCount] = useState({});
  const [bannedItems, setBannedItems] = useState([]);

  useEffect(() => {
    if (banRounds && banRounds[currentRound]) {
      setCurrentTeam(banRounds[currentRound].firstTeam);
      setBanCount({
        Blue: 0,
        Red: 0,
      });
      setBannedItems([]); // Reset banned items for this round
    }
  }, [currentRound, banRounds]);

  const handleBan = item => {
    const round = banRounds[currentRound];
    if (!round) return;

    const newBannedItems = [...bannedItems, { item, team: currentTeam, round: currentRound }];
    setBannedItems(newBannedItems);

    const newBanCount = { ...banCount };
    newBanCount[currentTeam]++;

    setBanCount(newBanCount);

    // Chuyển team nếu team hiện tại chưa đạt đủ số lượt ban
    // và team kia cũng chưa đạt đủ số lượt ban
    if (newBanCount[currentTeam] < round.countPerTeam) {
      const nextTeam = currentTeam === 'Blue' ? 'Red' : 'Blue';
      if (newBanCount[nextTeam] < round.countPerTeam) {
        setCurrentTeam(nextTeam);
      }
    } else {
      // Nếu team hiện tại đã đạt đủ số lượt, chuyển sang team kia (nếu team kia chưa đủ)
      const nextTeam = currentTeam === 'Blue' ? 'Red' : 'Blue';
      if (newBanCount[nextTeam] < round.countPerTeam) {
        setCurrentTeam(nextTeam);
      }
    }

    // Kiểm tra xem round hiện tại đã hoàn thành chưa
    if (newBanCount.Blue >= round.countPerTeam && newBanCount.Red >= round.countPerTeam) {
      // Hoàn thành ban round này
      onComplete(newBannedItems);
    }
  };

  const mockItems = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

  if (!banRounds || !banRounds[currentRound]) {
    return <div>No ban rounds configured</div>;
  }

  const round = banRounds[currentRound];
  const isRoundComplete = banCount.Blue >= round.countPerTeam && banCount.Red >= round.countPerTeam;

  return (
    <div className='ban-phase'>
      <h2>Ban Phase - Round {currentRound}</h2>

      <div className='team-info'>
        <div className={`team ${currentTeam === 'Blue' ? 'active' : ''}`}>
          <h3>Blue Team</h3>
          <p>
            Bans: {banCount.Blue || 0}/{round.countPerTeam}
          </p>
        </div>
        <div className={`team ${currentTeam === 'Red' ? 'active' : ''}`}>
          <h3>Red Team</h3>
          <p>
            Bans: {banCount.Red || 0}/{round.countPerTeam}
          </p>
        </div>
      </div>

      {!isRoundComplete && (
        <div className='current-turn'>
          <h3>Current Turn: {currentTeam} Team</h3>
        </div>
      )}

      <div className='items-grid'>
        {mockItems.map((item, index) => {
          const isBanned =
            globalBannedItems.some(bannedItem => bannedItem.item === item) ||
            bannedItems.some(bannedItem => bannedItem.item === item);
          const isPicked = globalPickedItems.some(pickedItem => pickedItem.item === item);
          const isDisabled = isBanned || isPicked || isRoundComplete;

          // Tìm team nào đã pick item này
          const pickedBy = globalPickedItems.find(pickedItem => pickedItem.item === item);

          return (
            <button
              key={index}
              className={`item ${
                isBanned ? 'banned' : isPicked ? `picked ${pickedBy.team.toLowerCase()}` : ''
              }`}
              onClick={() => !isDisabled && handleBan(item)}
              disabled={isDisabled}
            >
              {item}
              {isBanned && <span className='banned-label'>BANNED</span>}
              {isPicked && (
                <span className={`picked-label ${pickedBy.team.toLowerCase()}`}>
                  PICKED BY {pickedBy.team.toUpperCase()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className='banned-items'>
        <h3>Banned Items This Round:</h3>
        <ul>
          {bannedItems.map((ban, index) => (
            <li key={index}>
              {ban.item} - {ban.team} Team
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BanPhase;
