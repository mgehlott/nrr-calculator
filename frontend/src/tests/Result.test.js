import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ResultDisplay from "../components/Result";

const mockFormData = {
  team: "rr",
  oppositionTeam: "dc",
  matchOvers: 20,
  desiredPosition: 3,
  tossResult: "batting",
  runsScored: 120,
};

describe("ResultDisplay", () => {
  test("should render nothing when result is null", () => {
    const { container } = render(
      <ResultDisplay result={null} formData={mockFormData} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("should render error message for unsuccessful result", () => {
    const result = {
      success: false,
      message: "Unable to reach desired position with given parameters",
    };

    render(<ResultDisplay result={result} formData={mockFormData} />);

    expect(screen.getByText("Result")).toBeInTheDocument();
    expect(screen.getByText(result.message)).toBeInTheDocument();
  });

  test("should render batting first result correctly", () => {
    const result = {
      success: true,
      result: {
        type: "restrict",
        minRuns: 110,
        maxRuns: 113,
        maxNRR: 0.456,
        minNRR: 0.512,
        runsScored: 120,
      },
    };

    render(<ResultDisplay result={result} formData={mockFormData} />);

    expect(screen.getByText("Prediction Result")).toBeInTheDocument();
    expect(screen.getAllByText(/Rajasthan Royals/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Delhi Capitals/)).toBeInTheDocument();
    expect(screen.getByText(/110–113/)).toBeInTheDocument();
    expect(screen.getByText(/0.456 and 0.512/)).toBeInTheDocument();
  });

  test("should render bowling first result correctly", () => {
    const result = {
      success: true,
      result: {
        type: "chase",
        minOvers: "14.2",
        maxOvers: "15.4",
        maxNRR: 0.478,
        minNRR: 0.530,
        runsToChase: 119,
      },
    };

    const bowlingFormData = {
      ...mockFormData,
      tossResult: "bowling",
      runsScored: 119,
    };

    render(<ResultDisplay result={result} formData={bowlingFormData} />);

    expect(screen.getByText("Prediction Result")).toBeInTheDocument();
    expect(screen.getByText(/chase/)).toBeInTheDocument();
    expect(screen.getByText(/119/)).toBeInTheDocument();
    expect(screen.getByText(/14.2–15.4/)).toBeInTheDocument();
    expect(screen.getByText(/0.478 and 0.530/)).toBeInTheDocument();
  });
});
