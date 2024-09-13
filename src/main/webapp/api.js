export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI2MjM1NjEyfQ.RX82N6Vb4frVNaeV6YCJEDTvnye7JXco_BXY6laZFD-yc4geiWAevHSgpqihYdXK9hWwwmhW7OsQwJ5NufeysA"
    : new URLSearchParams(window.location.search).get("jwt");
