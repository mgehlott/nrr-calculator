function convertOversToNumber(overs) {
  if (typeof overs === "number" && !overs.toString().includes(".")) {
    return overs;
  }
  const overString = overs.toString();
  const [wholePart, decimalPart] = overString.split(".");
  const totalOvers = parseInt(wholePart, 10);
  const balls = decimalPart ? parseInt(decimalPart, 10) : 0;
  return totalOvers + balls / 6;
}

function convertNumberToOvers(number) {
  const totalOvers = Math.floor(number);
  const balls = Math.round((number - totalOvers) * 6);
  return `${totalOvers}.${balls}`;
}

function calculateNRR(runsFor, oversFor, runsAgainst, oversAgainst) {
  const runRateFor = oversFor == 0 ? 0 : runsFor / oversFor;
  const runRateAgainst = oversAgainst == 0 ? 0 : runsAgainst / oversAgainst;

  return runRateFor - runRateAgainst;
}

function sortTeamsByPosition(teams) {
  let tempTeams = [...teams].map((item) => ({ ...item }));

  return tempTeams.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return b.nrr - a.nrr;
  });
}
// Note: No  limits applied.
// NRR is calculated purely based on the mathematical formula,
// even for extreme or unrealistic cases.
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

  let result = [];

  if (tossResult === "batting") {
    result = calculateRestrictRuns(
      teamData,
      oppData,
      matchOvers,
      runsScored,
      desiredPosition,
      pointsTable
    );
  } else {
    result = calculateChaseOvers(
      teamData,
      oppData,
      matchOvers,
      runsScored,
      desiredPosition,
      pointsTable
    );
  }
  return result;
}

function calculateChaseOvers(
  teamData,
  oppData,
  matchOvers,
  runsToChase,
  desiredPosition,
  pointsTable
) {
  const oversInNumber = convertOversToNumber(matchOvers);

  const teamOversForNum = convertOversToNumber(teamData.oversFor);
  const teamOversAgainstNum = convertOversToNumber(teamData.oversAgainst);
  const oppOversForNum = convertOversToNumber(oppData.oversFor);
  const oppOversAgainstNum = convertOversToNumber(oppData.oversAgainst);
  // since a team can not be go below its current position as we are always going to win by runs or while chasing
  if (desiredPosition >= teamData.position) {
    return null;
  }

  function simulateChase(chaseOvers) {
    const newRunsFor = teamData.runsFor + runsToChase;
    const newOversFor = teamOversForNum + chaseOvers;
    const newRunsAgainst = teamData.runsAgainst + (runsToChase - 1);
    const newOversAgainst = teamOversAgainstNum + oversInNumber;

    const newNRR = calculateNRR(
      newRunsFor,
      newOversFor,
      newRunsAgainst,
      newOversAgainst
    );

    const updatedTeam = {
      ...teamData,
      matches: teamData.matches + 1,
      won: teamData.won + 1,
      points: teamData.points + 2,
      nrr: newNRR,
      runsFor: newRunsFor,
      oversFor: newOversFor,
      runsAgainst: newRunsAgainst,
      oversAgainst: newOversAgainst,
    };

    const oppNewRunsFor = oppData.runsFor + (runsToChase - 1);
    const oppNewOversFor = oppOversForNum + oversInNumber;
    const oppNewRunsAgainst = oppData.runsAgainst + runsToChase;
    const oppNewOversAgainst = oppOversAgainstNum + chaseOvers;

    const oppNewNRR = calculateNRR(
      oppNewRunsFor,
      oppNewOversFor,
      oppNewRunsAgainst,
      oppNewOversAgainst
    );

    const updatedOpp = {
      ...oppData,
      matches: oppData.matches + 1,
      lost: oppData.lost + 1,
      nrr: oppNewNRR,
      runsFor: oppNewRunsFor,
      oversFor: oppNewOversFor,
      runsAgainst: oppNewRunsAgainst,
      oversAgainst: oppNewOversAgainst,
    };

    const updatedTable = pointsTable.map((t) => {
      if (t.id === teamData.id) return updatedTeam;
      if (t.id === oppData.id) return updatedOpp;
      return t;
    });

    const sortedTable = sortTeamsByPosition(updatedTable);
    const newPosition = sortedTable.findIndex((t) => t.id === teamData.id) + 1;

    return { newPosition, newNRR };
  }

  // Used binary search since we have monotonic space in both cases
  function findMinOvers() {
    let low = 0.1;
    let high = oversInNumber;
    let result = null;

    while (high - low > 0.1) {
      const mid = Math.round(((low + high) / 2) * 10) / 10;

      const { newPosition, newNRR } = simulateChase(mid);

      if (newPosition <= desiredPosition) {
        result = { chaseOvers: mid, newNRR };
        high = mid - 0.1;
      } else {
        low = mid + 0.1;
      }
    }

    return result;
  }

  function findMaxOvers() {
    let low = 0.1;
    let high = oversInNumber;
    let result = null;

    while (high - low > 0.1) {
      const mid = Math.round(((low + high) / 2) * 10) / 10;

      const { newPosition, newNRR } = simulateChase(mid);

      if (newPosition <= desiredPosition) {
        result = { chaseOvers: mid, newNRR };
        low = mid + 0.1;
      } else {
        high = mid - 0.1;
      }
    }
    return result;
  }

  const minResult = findMinOvers();
  const maxResult = findMaxOvers();

  if (!minResult || !maxResult) {
    return null;
  }

  return {
    type: "chase",
    minOvers: convertNumberToOvers(minResult.chaseOvers),
    maxOvers: convertNumberToOvers(maxResult.chaseOvers),
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
  const oversInNumber = convertOversToNumber(matchOvers);

  const teamOversForNum = convertOversToNumber(teamData.oversFor);
  const teamOversAgainstNum = convertOversToNumber(teamData.oversAgainst);
  const oppOversForNum = convertOversToNumber(oppData.oversFor);
  const oppOversAgainstNum = convertOversToNumber(oppData.oversAgainst);

  const minRuns = 0;
  const maxRuns = runsScored - 1;
  // since a team can not be go below its current position as we are always going to win by runs or while chasing
  if (desiredPosition >= teamData.position) {
    return null;
  }

  function simulateRestrict(restrictTo) {
    const newRunsFor = teamData.runsFor + runsScored;
    const newOversFor = teamOversForNum + oversInNumber;
    const newRunsAgainst = teamData.runsAgainst + restrictTo;
    const newOversAgainst = teamOversAgainstNum + oversInNumber;

    const newNRR = calculateNRR(
      newRunsFor,
      newOversFor,
      newRunsAgainst,
      newOversAgainst
    );

    const updatedTeam = {
      ...teamData,
      matches: teamData.matches + 1,
      won: teamData.won + 1,
      points: teamData.points + 2,
      nrr: newNRR,
      runsFor: newRunsFor,
      oversFor: newOversFor,
      runsAgainst: newRunsAgainst,
      oversAgainst: newOversAgainst,
    };

    const oppNewRunsFor = oppData.runsFor + restrictTo;
    const oppNewOversFor = oppOversForNum + oversInNumber;
    const oppNewRunsAgainst = oppData.runsAgainst + runsScored;
    const oppNewOversAgainst = oppOversAgainstNum + oversInNumber;

    const oppNewNRR = calculateNRR(
      oppNewRunsFor,
      oppNewOversFor,
      oppNewRunsAgainst,
      oppNewOversAgainst
    );

    const updatedOpp = {
      ...oppData,
      matches: oppData.matches + 1,
      lost: oppData.lost + 1,
      nrr: oppNewNRR,
      runsFor: oppNewRunsFor,
      oversFor: oppNewOversFor,
      runsAgainst: oppNewRunsAgainst,
      oversAgainst: oppNewOversAgainst,
    };

    const updatedTable = pointsTable.map((t) => {
      if (t.id === teamData.id) return updatedTeam;
      if (t.id === oppData.id) return updatedOpp;
      return t;
    });

    const sortedTable = sortTeamsByPosition(updatedTable);
    const newPosition = sortedTable.findIndex((t) => t.id === teamData.id) + 1;

    return { newPosition, newNRR };
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

  if (!minResult || !maxResult) {
    return null;
  }
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
};
