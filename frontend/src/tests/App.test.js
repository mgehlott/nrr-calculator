import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import * as api from "../apis/index";

jest.mock("../apis/index");

const mockPointsTable = [
  {
    id: "csk",
    position: 1,
    team: "Chennai Super Kings",
    matches: 7,
    won: 5,
    lost: 2,
    nrr: 0.771,
    points: 10,
  },
  {
    id: "rcb",
    position: 2,
    team: "Royal Challengers Bangalore",
    matches: 7,
    won: 4,
    lost: 3,
    nrr: 0.597,
    points: 8,
  },
];

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render main components", async () => {
    api.fetchPointsTable.mockResolvedValue(mockPointsTable);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("NRR Prediction Calculator")).toBeInTheDocument();
    });
  });

  it("should load points table on mount", async () => {
    api.fetchPointsTable.mockResolvedValue(mockPointsTable);

    render(<App />);

    await waitFor(() => {
      expect(api.fetchPointsTable).toHaveBeenCalled();
      expect(screen.getAllByText("Chennai Super Kings").length).toBeGreaterThan(
        0
      );
      expect(
        screen.getAllByText("Royal Challengers Bangalore").length
      ).toBeGreaterThan(0);
    });
  });

  it("should handle calculation submission", async () => {
    api.fetchPointsTable.mockResolvedValue(mockPointsTable);
    api.calculateRequiredPerformance.mockResolvedValue({
      success: true,
      result: {
        type: "restrict",
        minRuns: 110,
        maxRuns: 113,
        minNRR: 0.456,
        maxNRR: 0.512,
        runsScored: 120,
      },
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText("Chennai Super Kings").length).toBeGreaterThan(
        0
      );
    });

    const yourTeamSelect = screen.getByLabelText("Your Team");
    const oppTeamSelect = screen.getByLabelText("Opposition Team");
    const runsInput = screen.getByLabelText("Runs Scored");
    const submitButton = screen.getByRole("button", { name: /Calculate/i });

    await userEvent.selectOptions(yourTeamSelect, "Chennai Super Kings");
    await userEvent.selectOptions(oppTeamSelect, "Royal Challengers Bangalore");
    await userEvent.clear(runsInput);
    await userEvent.type(runsInput, "120");

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.calculateRequiredPerformance).toHaveBeenCalled();
      expect(screen.getByText("Prediction Result")).toBeInTheDocument();
    });
  });


});
