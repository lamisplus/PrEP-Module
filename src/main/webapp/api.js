export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI4MjU4MjEwfQ.Cl01sNo2_J88UveqK48wn4AF-DLSmt9SfAemk9VfWgFQADN_KT7IgLww1uU5E_Ank95bZI6EIK1N3k84pYjDvA"
    : new URLSearchParams(window.location.search).get("jwt");
