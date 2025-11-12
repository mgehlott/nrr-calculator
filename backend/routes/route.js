const express = require("express");
const pointsController = require("../controllers/pointsController");

const router = express.Router();

router.get("/points-table", pointsController.getPointsTable);

router.post("/calculate", pointsController.getCalculationForPosition);

module.exports = router;

