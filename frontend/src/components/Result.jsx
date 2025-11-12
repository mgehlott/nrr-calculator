const teamsIdMap = {
  mi: "Mumbai Indians",
  csk: "Chennai Super Kings",
  rcb: "Royal Challengers Bangalore",
  dc: "Delhi Capitals",
  rr: "Rajasthan Royals",
};


const Result = ({ result, formData }) => {
  if (!result) return null;

  if (!result.success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          {/* <XCircle className="w-6 h-6 text-red-600" /> */}
          <h3 className="text-xl font-bold text-gray-800">Result</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{result.message}</p>
        </div>
      </div>
    );
  }

  const { result: data } = result;
  const isBatting = data.type === "restrict";

  return (
    <div className="result-card">
      <div className="result-header">
        <h3 className="result-title">Prediction Result</h3>
      </div>

      <div className="result-box">
        <div>
          <p className="result-text">
            {isBatting ? (
              <>
                If <span className="result-highlight">{teamsIdMap[formData.team]}</span>{" "}
                score{" "}
                <span className="result-highlight">{data.runsScored}</span> runs
                in{" "}
                <span className="result-highlight">{formData.matchOvers}</span>{" "}
                overs, they must restrict{" "}
                <span className="result-highlight">
                  {teamsIdMap[formData.oppositionTeam]}
                </span>{" "}
                between{" "}
                <span className="result-range">
                  {data.minRuns}–{data.maxRuns}
                </span>{" "}
                runs.
              </>
            ) : (
              <>
                <span className="result-highlight">{teamsIdMap[formData.team]}</span> need
                to chase{" "}
                <span className="result-highlight">{data.runsToChase}</span>{" "}
                runs between{" "}
                <span className="result-range">
                  {data.minOvers}–{data.maxOvers}
                </span>{" "}
                overs.
              </>
            )}
          </p>
        </div>

        <div className="result-section">
          <p className="result-text">
            Revised NRR of{" "}
            <span className="result-highlight">{teamsIdMap[formData.team]}</span> will
            be between{" "}
            <span className="result-range">
              {data?.maxNRR?.toFixed(3)} and {data?.minNRR.toFixed(3)}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Result;
