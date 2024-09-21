export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI2ODkwODE4fQ.pgjP1Dy1PnaOwCYGJbez2eXzSXZCKMBCHzLZGlK48G7VIgD4fYpyH1drS3yt_IYWc5J-_tMGx4kmzWKb89PDwQ" : new URLSearchParams(window.location.search).get("jwt");
