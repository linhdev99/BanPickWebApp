import React, { useState, useEffect } from 'react';

const PickPhase = ({
  pickRounds,
  currentRound = 1,
  bannedItems,
  pickedItems: globalPickedItems = [],
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTeamCount, setCurrentTeamCount] = useState(0);
  const [pickedItems, setPickedItems] = useState([]);

  useEffect(() => {
    // Reset picked items for this round
    setPickedItems([]);
    setCurrentStepIndex(0);
    setCurrentTeamCount(0);
  }, [currentRound]);

  const getCurrentStep = () => {
    if (!pickRounds || !pickRounds[currentRound]) return null;
    return pickRounds[currentRound][currentStepIndex];
  };

  const handlePick = item => {
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    const newPickedItems = [
      ...pickedItems,
      {
        item,
        team: currentStep.team,
        round: currentRound,
        step: currentStepIndex + 1,
      },
    ];
    setPickedItems(newPickedItems);

    const newTeamCount = currentTeamCount + 1;

    // Kiểm tra xem đã đủ số lượt pick cho team hiện tại chưa
    if (newTeamCount >= currentStep.count) {
      // Chuyển sang step tiếp theo
      const nextStepIndex = currentStepIndex + 1;
      if (nextStepIndex < pickRounds[currentRound].length) {
        setCurrentStepIndex(nextStepIndex);
        setCurrentTeamCount(0);
      } else {
        // Hoàn thành pick round hiện tại
        onComplete(newPickedItems);
      }
    } else {
      setCurrentTeamCount(newTeamCount);
    }
  };

  const mockItems = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

  const currentStep = getCurrentStep();

  if (!pickRounds || !currentStep) {
    return <div>Pick phase completed or no pick rounds configured</div>;
  }

  const remainingPicks = currentStep.count - currentTeamCount;

  return (
    <div className='pick-phase'>
      <h2>Pick Phase - Round {currentRound}</h2>

      <div className='current-turn'>
        <h3>Current Turn: {currentStep.team} Team</h3>
        <p>Remaining picks: {remainingPicks}</p>
        <p>
          Step {currentStepIndex + 1} of {pickRounds[currentRound].length}
        </p>
      </div>

      <div className='round-overview'>
        <h4>Round {currentRound} Schedule:</h4>
        <ol>
          {pickRounds[currentRound].map((step, index) => (
            <li
              key={index}
              className={
                index === currentStepIndex ? 'current' : index < currentStepIndex ? 'completed' : ''
              }
            >
              {step.team} Team: {step.count} pick(s)
            </li>
          ))}
        </ol>
      </div>

      <div className='items-grid'>
        {mockItems.map((item, index) => {
          const isBanned = bannedItems.some(ban => ban.item === item);
          const isPicked =
            globalPickedItems.some(pick => pick.item === item) ||
            pickedItems.some(pick => pick.item === item);
          const isAvailable = !isBanned && !isPicked;

          // Tìm team nào đã pick item này
          const pickedBy =
            globalPickedItems.find(pick => pick.item === item) ||
            pickedItems.find(pick => pick.item === item);

          return (
            <button
              key={index}
              className={`item ${
                isBanned
                  ? 'banned'
                  : isPicked
                    ? `picked ${pickedBy ? pickedBy.team.toLowerCase() : ''}`
                    : ''
              }`}
              onClick={() => isAvailable && handlePick(item)}
              disabled={!isAvailable}
            >
              {item}
              {isBanned && <span className='status-label banned-label'>BANNED</span>}
              {isPicked && pickedBy && (
                <span className={`status-label picked-label ${pickedBy.team.toLowerCase()}`}>
                  PICKED BY {pickedBy.team.toUpperCase()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className='picked-items'>
        <h3>Picked Items This Round:</h3>
        <div className='team-picks'>
          <div className='blue-picks'>
            <h4>Blue Team:</h4>
            <ul>
              {pickedItems
                .filter(pick => pick.team === 'Blue')
                .map((pick, index) => (
                  <li key={index}>
                    {pick.item} (Step {pick.step})
                  </li>
                ))}
            </ul>
          </div>
          <div className='red-picks'>
            <h4>Red Team:</h4>
            <ul>
              {pickedItems
                .filter(pick => pick.team === 'Red')
                .map((pick, index) => (
                  <li key={index}>
                    {pick.item} (Step {pick.step})
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickPhase;
