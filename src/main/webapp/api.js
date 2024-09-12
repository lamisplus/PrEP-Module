export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI2MTkwMTU2fQ.ft8Ekoz0RTrKDpcRSkNAcIHRAwVgb6fWIN9ANcsaUI3aaIjWWTHvfWjhRKhBGiT7ctYB2dvvNm2nPoDoAH55tg"
    : new URLSearchParams(window.location.search).get("jwt");
