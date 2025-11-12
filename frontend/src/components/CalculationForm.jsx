import { useState } from "react";

const CalculationForm = ({ teams, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    team: "",
    oppositionTeam: "",
    matchOvers: 20,
    desiredPosition: 3,
    tossResult: "batting",
    runsScored: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      runsScored: parseInt(formData.runsScored, 10),
      matchOvers: parseInt(formData.matchOvers, 10),
      desiredPosition: parseInt(formData.desiredPosition, 10),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="calc-form">
      <form onSubmit={handleSubmit}>
        <div className="calc-grid">
          <div>
            <label htmlFor="team" className="calc-label">
              Your Team
            </label>
            <select
              id="team"
              name="team"
              value={formData.yourTeam}
              onChange={handleChange}
              required
              className="calc-select"
            >
              <option value="" key="1">
                Select team
              </option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.team}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="oppositionTeam" className="calc-label">
              Opposition Team
            </label>
            <select
              id="oppositionTeam"
              name="oppositionTeam"
              value={formData.oppositionTeam}
              onChange={handleChange}
              required
              className="calc-select"
            >
              <option value="" key={""}>
                Select team
              </option>
              {teams
                .filter((team) => team.id !== formData.team)
                .map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="matchOvers" className="calc-label">
              Match Overs
            </label>
            <input
              id="matchOvers"
              type="number"
              name="matchOvers"
              value={formData.matchOvers}
              onChange={handleChange}
              required
              min="1"
              // max="50"
              className="calc-input"
              onWheel={(e) => e.target.blur()}
            />
          </div>

          <div>
            <label htmlFor="desiredPosition" className="calc-label">
              Desired Position
            </label>
            <input
              id="desiredPosition"
              type="number"
              name="desiredPosition"
              value={formData.desiredPosition}
              onChange={handleChange}
              required
              min="1"
              max="5"
              className="calc-input"
              onWheel={(e) => e.target.blur()}
            />
          </div>

          <div>
            <label htmlFor="tossResult" className="calc-label">
              Toss Result
            </label>
            <select
              id="tossResult"
              name="tossResult"
              value={formData.tossResult}
              onChange={handleChange}
              required
              className="calc-select"
            >
              <option value="batting">Batting First</option>
              <option value="bowling">Bowling First</option>
            </select>
          </div>

          <div>
            <label htmlFor="runsScored" className="calc-label">
              {formData.tossResult === "batting"
                ? "Runs Scored"
                : "Runs to Chase"}
            </label>
            <input
              id="runsScored"
              type="number"
              name="runsScored"
              value={formData.runsScored}
              onChange={handleChange}
              required
              min="0"
              className="calc-input"
              onWheel={(e) => e.target.blur()}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="calc-btn">
          {loading ? "Calculating..." : "Calculate Required Performance"}
        </button>
      </form>
    </div>
  );
};

export default CalculationForm;
