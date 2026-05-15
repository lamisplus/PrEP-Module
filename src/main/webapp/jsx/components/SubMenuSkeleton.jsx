import React from "react";
import ContentLoader from "react-content-loader";

export function SubMenuSkeleton() {
  return (
    <div style={{ width: "100%" }}>
      <ContentLoader
        speed={2}
        width="100%"
        height={50}
        viewBox="0 0 100 10"
        backgroundColor="#333"
        foregroundColor="#555"
        preserveAspectRatio="none"
      >
        <rect x="0%" y="20%" rx="1" ry="1" width="10%" height="50%" />
        <rect x="12%" y="20%" rx="1" ry="1" width="20%" height="50%" />
        <rect x="34%" y="20%" rx="1" ry="1" width="15%" height="50%" />
        <rect x="51%" y="20%" rx="1" ry="1" width="10%" height="50%" />
        <rect x="67%" y="20%" rx="1" ry="1" width="20%" height="50%" />
        <rect x="73%" y="20%" rx="1" ry="1" width="20%" height="50%" />
        <rect x="79%" y="20%" rx="1" ry="1" width="20%" height="50%" />
        <rect x="75%" y="20%" rx="1" ry="1" width="20%" height="50%" />
        <rect x="76%" y="20%" rx="1" ry="1" width="20%" height="50%" />
      </ContentLoader>
    </div>
  );
}
