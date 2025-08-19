export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZGUiLCJhdXRoIjoiU3VwZXIgQWRtaW4sUkRFLFVzZXIiLCJuYW1lIjoicHJlcCBwcmVwbCIsImV4cCI6MTc1NTYzNTQ5OX0.FH3AIudam08GL7l_SuNRdiDNZLSpb1Yf5sFmnfPRnfFsSFptiwn5yqXUDUlKDgxj-B4uKz5bpdb6ivLVt05jKA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/websocket"
    : "/websocket";
