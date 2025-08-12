export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlY2V3c0FDRTUiLCJhdXRoIjoiU3VwZXIgQWRtaW4iLCJuYW1lIjoiRUNFV1MgQUNFNSIsImV4cCI6MTc1MzY5NzE4OX0.sdiy0BJcrZBuRzwheq-dlIG6aryxNVhO_G8Lhiiheho_MSVDANZSNYg3i6h3yzSnh_nnqEkNVDm6PzdRC_TCtQ"
    : new URLSearchParams(window.location.search).get("jwt");
