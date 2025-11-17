import { useEffect, useRef, useState } from "react";
import "./App.css";
import { calculateRequiredPerformance, fetchPointsTable } from "./apis";
import PointTable from "./components/PointTable";
import CalculationForm from "./components/CalculationForm";
import Result from "./components/Result";

function App() {
  const [pointsTable, setPointsTable] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    getPointsTable();
  }, []);
  useEffect(() => {
    if (resultRef?.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);
  async function getPointsTable() {
    const data = await fetchPointsTable();
    setPointsTable(data);
  }

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setFormData(data);

    try {
      const response = await calculateRequiredPerformance(data);
      setResult(response);
    } catch (err) {
      setError("Failed to calculate prediction. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div>
        <h2>NRR Prediction Calculator</h2>
      </div>
      <div className="card">
        <PointTable pointTable={pointsTable} />
      </div>
      <div className="card">
        {" "}
        <CalculationForm
          teams={pointsTable}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
      {result && (
        <div className="result-card" ref={resultRef}>
          <Result result={result} formData={formData} />
        </div>
      )}
    </div>
  );
}

export default App;
