export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI2Nzg4NTY3fQ._Ut2XeErEeKDu455Ajil9S8G5cUvYStr3Tpg8TIktpjMPXgr9Mhc8YGkYqUCpUukglHTgnSTHtAhHzpocYc8rQ"
    : new URLSearchParams(window.location.search).get("jwt");
