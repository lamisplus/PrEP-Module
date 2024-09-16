export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI2MjQ3Mzk5fQ.W6cP7cjjb2GFrkej2nIVOD79u8SODE-Vvjg9uHi8NYgKqBRUcO-SaWwOSexvSTuU8wlf7Cj2WUOS8Gp1Q8QGyQ"
    : new URLSearchParams(window.location.search).get("jwt");
