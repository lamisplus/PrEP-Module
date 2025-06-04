import React from 'react';

export const useGetPhoneNumber = () => {
  const getPhoneNumber = data => {
    const phoneContact =
      data?.personResponseDto?.contactPoint?.contactPoint?.find(
        contact => contact.type === 'phone'
      );
    return phoneContact ? phoneContact.value : '';
  };
  return { getPhoneNumber };
};

export default useGetPhoneNumber;
