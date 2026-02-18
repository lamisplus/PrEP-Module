export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFJERSIsIm5hbWUiOiJHdWVzdCBHdWVzdCIsImV4cCI6MTc3MTQzMjEzMX0.q7kpADdMtLsriQbW3NSFvH15wFcwtAVbfRNxxBhHaFOQ6n6HjtMTr28dParA4NsKUqkYcLxyYoFjpkueGJpCJA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/websocket"
    : "/websocket";
