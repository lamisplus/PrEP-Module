export const useBasicPatientDetails = () => {
  const getSex = data => data?.personResponseDto?.sex || '';
  const getUniqueId = data => data?.uniqueId || '';
  const getDateOfBirth = data => data?.personResponseDto?.dateOfBirth || '';
  const getFirstName = data => data?.personResponseDto?.firstName || '';
  const getSurname = data => data?.personResponseDto?.surname || '';

  return {
    getSex,
    getUniqueId,
    getDateOfBirth,
    getFirstName,
    getSurname,
  };
};

export default useBasicPatientDetails;
