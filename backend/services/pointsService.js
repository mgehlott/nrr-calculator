function oversToBalls(overs) {
  if (overs === null || overs === undefined) return 0;
  const s = overs.toString();
  if (!s.includes(".")) {
    const full = Number(s);
    return Number.isNaN(full) ? 0 : full * 6;
  }
  const [wholeStr, decStr] = s.split(".");
  const whole = parseInt(wholeStr || "0", 10);

  const decNum = parseInt(decStr || "0", 10);
  if (!Number.isNaN(decNum) && decNum >= 0 && decNum < 6) {
    return whole * 6 + decNum;
  }

  const frac = parseFloat("0." + decStr);
  if (Number.isFinite(frac)) {
    const balls = Math.round(frac * 6);
    return whole * 6 + balls;
  }

  return whole * 6;
}

function ballsToOversDisplay(totalBalls) {
  const fullOvers = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  return `${fullOvers}.${balls}`;
}

function toDecimalOvers(totalBalls) {
  return totalBalls / 6;
}

function convertOversToNumber(overs) {
  const balls = oversToBalls(overs);
  return toDecimalOvers(balls);
}

function convertNumberToOvers(number) {
  const whole = Math.floor(number);
  const balls = Math.round((number - whole) * 6);
  return `${whole}.${balls}`;
}

function calculateNRR(runsFor, oversFor, runsAgainst, oversAgainst) {
  const ballsFor = oversToBalls(oversFor);
  const ballsAgainst = oversToBalls(oversAgainst);

  const oversForDecimal = ballsFor === 0 ? 0 : ballsFor / 6;
  const oversAgainstDecimal = ballsAgainst === 0 ? 0 : ballsAgainst / 6;

  const runRateFor = oversForDecimal === 0 ? 0 : runsFor / oversForDecimal;
  const runRateAgainst =
    oversAgainstDecimal === 0 ? 0 : runsAgainst / oversAgainstDecimal;

  return runRateFor - runRateAgainst;
}

function sortTeamsByPosition(teams) {
  const tempTeams = [...teams].map((t) => ({ ...t }));
  return tempTeams.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });
}

function findNeededPerformance(
  team,
  oppositionTeam,
  matchOvers,
  desiredPosition,
  tossResult,
  runsScored,
  pointsTable
) {
  const teamData = pointsTable.find((item) => item.id === team);
  const oppData = pointsTable.find((item) => item.id === oppositionTeam);

  if (!teamData || !oppData) {
    throw new Error("Team not found");
  }

  if (tossResult === "batting") {
    return calculateRestrictRuns(
      teamData,
      oppData,
      matchOvers,
      runsScored,
      desiredPosition,
      pointsTable
    );
  }
  return calculateChaseOvers(
    teamData,
    oppData,
    matchOvers,
    runsScored,
    desiredPosition,
    pointsTable
  );
}

function calculateChaseOvers(
  teamData,
  oppData,
  matchOvers,
  runsToChase,
  desiredPosition,
  pointsTable
) {
  const totalBalls = oversToBalls(matchOvers);

  const teamForBalls = oversToBalls(teamData.oversFor);
  const teamAgainstBalls = oversToBalls(teamData.oversAgainst);
  const oppForBalls = oversToBalls(oppData.oversFor);
  const oppAgainstBalls = oversToBalls(oppData.oversAgainst);

  if (desiredPosition >= teamData.position) {
    return null;
  }

  function simulateChase(chaseBalls) {
    const newRunsFor = teamData.runsFor + runsToChase;
    const newOversForBalls = teamForBalls + chaseBalls;

    const newRunsAgainst = teamData.runsAgainst + (runsToChase - 1);
    const newOversAgainstBalls = teamAgainstBalls + totalBalls;

    const newNRR = calculateNRR(
      newRunsFor,
      ballsToOversDisplay(newOversForBalls),
      newRunsAgainst,
      ballsToOversDisplay(newOversAgainstBalls)
    );

    const updatedTeam = {
      ...teamData,
      matches: teamData.matches + 1,
      won: teamData.won + 1,
      points: teamData.points + 2,
      nrr: newNRR,
      runsFor: newRunsFor,
      oversFor: ballsToOversDisplay(newOversForBalls),
      runsAgainst: newRunsAgainst,
      oversAgainst: ballsToOversDisplay(newOversAgainstBalls),
    };

    const oppNewRunsFor = oppData.runsFor + (runsToChase - 1);
    const oppNewOversForBalls = oppForBalls + totalBalls;
    const oppNewRunsAgainst = oppData.runsAgainst + runsToChase;
    const oppNewOversAgainstBalls = oppAgainstBalls + chaseBalls;

    const oppNewNRR = calculateNRR(
      oppNewRunsFor,
      ballsToOversDisplay(oppNewOversForBalls),
      oppNewRunsAgainst,
      ballsToOversDisplay(oppNewOversAgainstBalls)
    );

    const updatedOpp = {
      ...oppData,
      matches: oppData.matches + 1,
      lost: oppData.lost + 1,
      nrr: oppNewNRR,
      runsFor: oppNewRunsFor,
      oversFor: ballsToOversDisplay(oppNewOversForBalls),
      runsAgainst: oppNewRunsAgainst,
      oversAgainst: ballsToOversDisplay(oppNewOversAgainstBalls),
    };

    const updatedTable = pointsTable.map((t) => {
      if (t.id === teamData.id) return updatedTeam;
      if (t.id === oppData.id) return updatedOpp;
      return t;
    });

    const sortedTable = sortTeamsByPosition(updatedTable);
    const newPosition = sortedTable.findIndex((t) => t.id === teamData.id) + 1;

    return { newPosition, newNRR: newNRR };
  }

  function findMinBalls() {
    let low = 1;
    let high = totalBalls;
    let result = null;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const { newPosition, newNRR } = simulateChase(mid);

      if (newPosition <= desiredPosition) {
        result = { chaseBalls: mid, newNRR };
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return result;
  }

  function findMaxBalls() {
    let low = 1;
    let high = totalBalls;
    let result = null;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const { newPosition, newNRR } = simulateChase(mid);

      if (newPosition <= desiredPosition) {
        result = { chaseBalls: mid, newNRR };
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return result;
  }

  const minResult = findMinBalls();
  const maxResult = findMaxBalls();

  if (!minResult || !maxResult) return null;

  return {
    type: "chase",
    minOvers: ballsToOversDisplay(minResult.chaseBalls),
    maxOvers: ballsToOversDisplay(maxResult.chaseBalls),
    minNRR: parseFloat(minResult.newNRR.toFixed(3)),
    maxNRR: parseFloat(maxResult.newNRR.toFixed(3)),
    runsToChase,
  };
}

function calculateRestrictRuns(
  teamData,
  oppData,
  matchOvers,
  runsScored,
  desiredPosition,
  pointsTable
) {
  const totalBalls = oversToBalls(matchOvers);

  const teamForBalls = oversToBalls(teamData.oversFor);
  const teamAgainstBalls = oversToBalls(teamData.oversAgainst);
  const oppForBalls = oversToBalls(oppData.oversFor);
  const oppAgainstBalls = oversToBalls(oppData.oversAgainst);

  if (desiredPosition >= teamData.position) {
    return null;
  }

  const minRuns = 0;
  const maxRuns = Math.max(0, runsScored - 1);

  function simulateRestrict(restrictTo) {
    const newRunsFor = teamData.runsFor + runsScored;
    const newOversForBalls = teamForBalls + totalBalls;

    const newRunsAgainst = teamData.runsAgainst + restrictTo;
    const newOversAgainstBalls = teamAgainstBalls + totalBalls;

    const newNRR = calculateNRR(
      newRunsFor,
      ballsToOversDisplay(newOversForBalls),
      newRunsAgainst,
      ballsToOversDisplay(newOversAgainstBalls)
    );

    const updatedTeam = {
      ...teamData,
      matches: teamData.matches + 1,
      won: teamData.won + 1,
      points: teamData.points + 2,
      nrr: newNRR,
      runsFor: newRunsFor,
      oversFor: ballsToOversDisplay(newOversForBalls),
      runsAgainst: newRunsAgainst,
      oversAgainst: ballsToOversDisplay(newOversAgainstBalls),
    };

    const oppNewRunsFor = oppData.runsFor + restrictTo;
    const oppNewOversForBalls = oppForBalls + totalBalls;
    const oppNewRunsAgainst = oppData.runsAgainst + runsScored;
    const oppNewOversAgainstBalls = oppAgainstBalls + totalBalls;

    const oppNewNRR = calculateNRR(
      oppNewRunsFor,
      ballsToOversDisplay(oppNewOversForBalls),
      oppNewRunsAgainst,
      ballsToOversDisplay(oppNewOversAgainstBalls)
    );

    const updatedOpp = {
      ...oppData,
      matches: oppData.matches + 1,
      lost: oppData.lost + 1,
      nrr: oppNewNRR,
      runsFor: oppNewRunsFor,
      oversFor: ballsToOversDisplay(oppNewOversForBalls),
      runsAgainst: oppNewRunsAgainst,
      oversAgainst: ballsToOversDisplay(oppNewOversAgainstBalls),
    };

    const updatedTable = pointsTable.map((t) => {
      if (t.id === teamData.id) return updatedTeam;
      if (t.id === oppData.id) return updatedOpp;
      return t;
    });
     
    const sortedTable = sortTeamsByPosition(updatedTable);
    const newPosition = sortedTable.findIndex((t) => t.id === teamData.id) + 1;
    console.log('ss',restrictTo ,sortedTable, updatedTeam, updatedOpp);

    return { newPosition, newNRR: newNRR };
  }

  function findMinRestrict() {
    let low = minRuns;
    let high = maxRuns;
    let result = null;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const { newPosition, newNRR } = simulateRestrict(mid);

      if (newPosition <= desiredPosition) {
        result = { restrictTo: mid, newNRR };
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return result;
  }

  function findMaxRestrict() {
    let low = minRuns;
    let high = maxRuns;
    let result = null;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const { newPosition, newNRR } = simulateRestrict(mid);

      if (newPosition <= desiredPosition) {
        result = { restrictTo: mid, newNRR };
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return result;
  }

  const minResult = findMinRestrict();
  const maxResult = findMaxRestrict();
  console.log(minResult, maxResult);

  if (!minResult || !maxResult) return null;

  return {
    type: "restrict",
    minRuns: minResult.restrictTo,
    maxRuns: maxResult.restrictTo,
    minNRR: parseFloat(minResult.newNRR.toFixed(3)),
    maxNRR: parseFloat(maxResult.newNRR.toFixed(3)),
    runsScored,
  };
}

module.exports = {
  findNeededPerformance,
  convertOversToNumber,
  convertNumberToOvers,
  calculateNRR,
  sortTeamsByPosition,
  oversToBalls,
  ballsToOversDisplay,
  toDecimalOvers,
};
