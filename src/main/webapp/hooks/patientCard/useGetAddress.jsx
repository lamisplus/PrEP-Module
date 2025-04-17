import React from 'react';

export const useGetAddress = () => {
  const getAddress = data => {
    const address = data?.personResponseDto?.address?.address?.[0];
    const city = address?.city || '';
    const addressLine = address?.district || '';
    const formattedAddress =
      city.includes(addressLine) || !addressLine
        ? city
        : `${city}, ${addressLine}`;
    return formattedAddress;
  };
  return { getAddress };
};
export default useGetAddress;
