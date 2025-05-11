import axios from 'axios';
import { useEffect, useState } from 'react';

export const useEligibilityCheckApi = (baseUrl, personId, visitDate, token) => {
  const [isEligibleForCabLa, setIsEligibleForCabLa] = useState(false);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        if (visitDate) {
          const response = await axios.get(
            `${baseUrl}prep-clinic/checkEnableCab/${personId}/${visitDate}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('isElig: ', response.data);

          setIsEligibleForCabLa(response.data);
        }
      } catch (error) {
        console.error('Error fetching eligibility:', error);
      }
    };

    checkEligibility();
  }, [baseUrl, personId, visitDate, token]);
  return { isEligibleForCabLa, setIsEligibleForCabLa };
};
