export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI3OTc1MTY2fQ.yf06BBR1iRzoqn10PoHPyQoMVSP9ScrZZXXD6DcmlKNj8qvatkBUep8GRAWMTU7lp5Xl1iPVFVbRIaroehl4Ng"
    : new URLSearchParams(window.location.search).get("jwt");
