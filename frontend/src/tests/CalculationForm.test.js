import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalcuationForm from "../components/CalculationForm";

const mockTeams = [
  { team: "Chennai Super Kings", position: 1 ,id  :"csk"},
  { team: "Royal Challengers Bangalore", position: 2 ,id :"rcb"},
  { team: "Delhi Capitals", position: 3 ,id :"dc"},
];

describe("CalcuationForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render form with all fields", () => {
    const mockOnCalculate = jest.fn();
    render(
      <CalcuationForm
        teams={mockTeams}
        onSubmit={mockOnCalculate}
        loading={false}
      />
    );

    expect(screen.getByLabelText(/Your Team/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Opposition Team/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Match Overs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Desired Position/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Toss Result/i)).toBeInTheDocument();
  });

  it("should populate team dropdowns", () => {
    const mockOnCalculate = jest.fn();
    render(
      <CalcuationForm
        teams={mockTeams}
        onCalculate={mockOnCalculate}
        loading={false}
      />
    );

    mockTeams.forEach((team) => {
      expect(screen.getAllByText(team.team).length).toBeGreaterThan(0);
    });
  });

  it("should update label when toss result changes", async () => {
    const mockOnCalculate = jest.fn();
    render(
      <CalcuationForm
        teams={mockTeams}
        onCalculate={mockOnCalculate}
        loading={false}
      />
    );

    expect(screen.getByLabelText(/Runs Scored/i)).toBeInTheDocument();

    const tossSelect = screen.getByLabelText(/Toss Result/i);
    await userEvent.selectOptions(tossSelect, "bowling");

    expect(screen.getByLabelText(/Runs to Chase/i)).toBeInTheDocument();
  });

  it("should call onCalculate with correct data on submit", async () => {
    const mockOnCalculate = jest.fn();
    render(
      <CalcuationForm
        teams={mockTeams}
        onSubmit={mockOnCalculate}
        loading={false}
      />
    );

    const yourTeamSelect = screen.getByLabelText(/Your Team/i);
    const oppTeamSelect = screen.getByLabelText(/Opposition Team/i);
    const runsInput = screen.getByLabelText(/Runs Scored/i);
    const submitButton = screen.getByRole("button", { name: /Calculate/i });

    await userEvent.selectOptions(yourTeamSelect, "Chennai Super Kings");
    await userEvent.selectOptions(oppTeamSelect, "Delhi Capitals");
    await userEvent.clear(runsInput);
    await userEvent.type(runsInput, "120");

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCalculate).toHaveBeenCalledWith({
        team: "csk",
        oppositionTeam: "dc",
        matchOvers: 20,
        desiredPosition: 3,
        tossResult: "batting",
        runsScored: 120,
      });
    });
  });

  it("should disable button when loading", () => {
    const mockOnCalculate = jest.fn();
    render(
      <CalcuationForm
        teams={mockTeams}
        onSubmit={mockOnCalculate}
        loading={true}
      />
    );

    const submitButton = screen.getByRole("button", { name: /Calculating/i });
    expect(submitButton).toBeDisabled();
  });

  it("should require all fields", async () => {
    const mockOnCalculate = jest.fn();
    render(
      <CalcuationForm
        teams={mockTeams}
        onSubmit={mockOnCalculate}
        loading={false}
      />
    );

    const submitButton = screen.getByRole("button", { name: /Calculate/i });
    await userEvent.click(submitButton);

    expect(mockOnCalculate).not.toHaveBeenCalled();
  });
});
