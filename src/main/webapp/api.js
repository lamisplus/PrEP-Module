export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI4MDA0NTA3fQ.69yvXUL69qatEv8u5HQFVJOuB8zx_BdwfGKC8wDvF1FxTuse4KjgAZw0jcybkQUOi2NMsoJ8FJO0Mi1kNUV2ow"
    : new URLSearchParams(window.location.search).get("jwt");
