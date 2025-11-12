import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PointsTable from "../components/PointTable";

const mockPointsTable = [
  {
    position: 1,
    team: "Chennai Super Kings",
    matches: 7,
    won: 5,
    lost: 2,
    nrr: 0.771,
    points: 10,
    id  :"csk"
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
  {
    id: "dc",
    position: 3,
    team: "Delhi Capitals",
    matches: 7,
    won: 4,
    lost: 3,
    nrr: 0.319,
    points: 8,
  },
];

describe("PointsTable", () => {
  test("renders table with header", () => {
    render(<PointsTable pointTable={mockPointsTable} />);

    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("NRR")).toBeInTheDocument();
    expect(screen.getByText("Points")).toBeInTheDocument();
  });

  test("renders all teams", () => {
    render(<PointsTable pointTable={mockPointsTable} />);

    mockPointsTable.forEach((team) => {
      expect(screen.getByText(team.team)).toBeInTheDocument();
    });
  });

  test("formats NRR to 3 decimal places", () => {
    render(<PointsTable pointTable={mockPointsTable} />);
    expect(screen.getByText("0.771")).toBeInTheDocument();
    expect(screen.getByText("0.597")).toBeInTheDocument();
    expect(screen.getByText("0.319")).toBeInTheDocument();
  });

  test("displays position numbers", () => {
    render(<PointsTable pointTable={mockPointsTable} />);

    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
  });

  test("displays match statistics", () => {
    render(<PointsTable pointTable={mockPointsTable} />);

    expect(screen.getAllByText("7").length).toBeGreaterThan(0);
    expect(screen.getAllByText("5").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
  });
});
