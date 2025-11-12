const BASE_URL = "http://localhost:3000/api";

export async function fetchPointsTable() {
  const response = await fetch(`${BASE_URL}/points-table`);
  if (!response.ok) {
    throw new Error("There was an error fetching the points table");
  }
  return await response.json();
}
export async function calculateRequiredPerformance(data) {
  const response = await fetch(`${BASE_URL}/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("There was an error calculating the required performance");
  }

  return response.json();
}
