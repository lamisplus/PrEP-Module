export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUiLCJhdXRoIjoiU3VwZXIgQWRtaW4sUkRFLFVzZXIiLCJuYW1lIjoicHJlcCBwcmVwbCIsImV4cCI6MTc1NjIzNDQ1Nn0.uW90uhBtonOwXkrXdn9PN7RBkepw3hhimM8pWIxTSoE2TSoqvvckqgG1WigmZfKY6x6L90w4Fl9XUZ38HI3TaA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/websocket"
    : "/websocket";
