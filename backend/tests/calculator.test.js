const {
  convertNumberToOvers,
  convertOversToNumber,
  calculateNRR,
  sortTeamsByPosition,
} = require("../services/pointsService");

describe("oversToNumbers", () => {
  test("should convert overs with balls to number", () => {
    expect(convertOversToNumber(20.3)).toBeCloseTo(20.5, 2);
    expect(convertOversToNumber(15.4)).toBeCloseTo(15.667, 2);
    expect(convertOversToNumber(10.0)).toBe(10);
  });

  test("should handle whole overs", () => {
    expect(convertOversToNumber(20)).toBe(20);
    expect(convertOversToNumber(15)).toBe(15);
  });

  test("should handle string input", () => {
    expect(convertOversToNumber("20.3")).toBeCloseTo(20.5, 2);
    expect(convertOversToNumber("15.4")).toBeCloseTo(15.667, 2);
  });
});

describe("NumberToOvers", () => {
  test("should convert number to overs format", () => {
    expect(convertNumberToOvers(20.5)).toBe("20.3");
    expect(convertNumberToOvers(15.667)).toBe("15.4");
    expect(convertNumberToOvers(10)).toBe("10.0");
  });
});

describe("calculateNRR", () => {
  test("should calculate positive NRR correctly", () => {
    const nrr = calculateNRR(1130, 133.1, 1071, 138.5);
    expect(nrr).toBeCloseTo(0.771, 1);
  });

  test("should calculate negative NRR correctly", () => {
    const nrr = calculateNRR(1003, 155.2, 1134, 138.1);
    expect(nrr).toBeCloseTo(-1.75, 1);
  });

  test("should handle zero runs", () => {
    const nrr = calculateNRR(0, 20, 100, 20);
    expect(nrr).toBe(-5);
  });
});

describe("sortTeamsByPosition", () => {
  test("should sort teams by points first", () => {
    const teams = [
      { team: "A", points: 8, nrr: 0.5 },
      { team: "B", points: 10, nrr: 0.3 },
      { team: "C", points: 6, nrr: 0.8 },
    ];

    const sorted = sortTeamsByPosition(teams);
    expect(sorted[0].team).toBe("B");
    expect(sorted[1].team).toBe("A");
    expect(sorted[2].team).toBe("C");
  });

  test("should sort teams by NRR when points are equal", () => {
    const teams = [
      { team: "A", points: 8, nrr: 0.3 },
      { team: "B", points: 8, nrr: 0.6 },
      { team: "C", points: 8, nrr: 0.1 },
    ];

    const sorted = sortTeamsByPosition(teams);
    expect(sorted[0].team).toBe("B");
    expect(sorted[1].team).toBe("A");
    expect(sorted[2].team).toBe("C");
  });
});
