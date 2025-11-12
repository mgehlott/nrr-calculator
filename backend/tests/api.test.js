const request = require("supertest");
const app = require("../server.js");

describe("API Endpoints", () => {
  describe("GET /api/points-table", () => {
    test("should return points table", async () => {
      const response = await request(app).get("/api/points-table");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("team");
      expect(response.body[0]).toHaveProperty("nrr");
      expect(response.body[0]).toHaveProperty("points");
    });
  });

  describe("POST /api/calculate", () => {
    test("should calculate required performance for batting first", async () => {
      const payload = {
        team: "rr",
        oppositionTeam: "dc",
        matchOvers: 20,
        desiredPosition: 3,
        tossResult: "batting",
        runsScored: 120,
      };
      const response = await request(app).post("/api/calculate").send(payload);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.result).toHaveProperty("type", "restrict");
      expect(response.body.result).toHaveProperty("minRuns");
      expect(response.body.result).toHaveProperty("maxRuns");
      expect(response.body.result).toHaveProperty("minNRR");
      expect(response.body.result).toHaveProperty("maxNRR");
    });

    test("should calculate required performance for bowling first", async () => {
      const payload = {
        team: "rcb",
        oppositionTeam: "csk",
        matchOvers: 20,
        desiredPosition: 1,
        tossResult: "bowling",
        runsScored: 120,
      };
      const response = await request(app).post("/api/calculate").send(payload);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.result).toHaveProperty("type", "chase");
      expect(response.body.result).toHaveProperty("minOvers");
      expect(response.body.result).toHaveProperty("maxOvers");
      expect(response.body.result).toHaveProperty("minNRR");
      expect(response.body.result).toHaveProperty("maxNRR");
    });

    test("should return 400 for missing fields", async () => {
      const payload = {
        team: "rr",
        oppositionTeam: "dc",
      };
      const response = await request(app).post("/api/calculate").send(payload);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("should handle impossible scenarios", async () => {
      const payload = {
        team: "mi",
        oppositionTeam: "csk",
        matchOvers: 20,
        desiredPosition: 1,
        tossResult: "batting",
        runsScored: 50,
      };
      const response = await request(app).post("/api/calculate").send(payload);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty("message");
    });

    test("should handle case where team want to same or lower position", async () => {
      const payload = {
        team: "csk",
        oppositionTeam: "rcb",
        matchOvers: 20,
        desiredPosition: 1,
        tossResult: "batting",
        runsScored: 150,
      };
      const response = await request(app).post("/api/calculate").send(payload);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
    });
   
  });
});
