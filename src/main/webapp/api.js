export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI2ODMwMDQwfQ.mRgmsA4M9PgBEH2nnI6htGJI2Qo1tN66j1r6k8jWJrEYRl_8DjNsdXvVuBW-BQ_l8MMbFw1nPRPrZdOo-cRY5A"
    : new URLSearchParams(window.location.search).get("jwt");
