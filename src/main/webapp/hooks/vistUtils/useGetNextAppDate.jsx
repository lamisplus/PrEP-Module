import React from 'react';

const useGetNextAppDate = () => {
  function getNextAppDate(dateString, daysToAdd) {
    const date = new Date(dateString);
    if (
      isNaN(date.getTime()) ||
      typeof daysToAdd !== 'number' ||
      isNaN(daysToAdd)
    ) {
      return '';
    }
    date.setDate(date.getDate() + daysToAdd);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return { getNextAppDate };
};

export default useGetNextAppDate;
