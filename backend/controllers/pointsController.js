const { initialPointsTable } = require("../data/pointsTable");
const { findNeededPerformance } = require("../services/pointsService");

const pointsTable = [...initialPointsTable];

exports.getPointsTable = (req, res, next) => {
  res.status(200).json(pointsTable);
};

exports.getCalculationForPosition = (req, res, next) => {
  const {
    team,
    oppositionTeam,
    matchOvers,
    desiredPosition,
    tossResult,
    runsScored,
  } = req.body;
  try {
    if (
      !team ||
      !oppositionTeam ||
      !matchOvers ||
      !desiredPosition ||
      !tossResult ||
      runsScored === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = findNeededPerformance(
      team,
      oppositionTeam,
      matchOvers,
      desiredPosition,
      tossResult,
      runsScored,
      pointsTable
    );
    if (!result) {
      return res.json({
        success: false,
        message: "Unable to reach desired position with given parameters",
      });
    }
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
