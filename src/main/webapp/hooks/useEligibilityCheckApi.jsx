import axios from 'axios';

export const useEligibilityCheckApi = async (
  baseUrl,
  personId,
  visitDate,
  token
) => {
  const [isEligibleForCabLa, setIsEligibleForCabLa] = useState(false);
  const checkEligibility = useMemo(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}prep-clinic/checkEnableCab/${personId}/${visitDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching eligibility:', error);
      throw error;
    }
  }, []);
  useEffect(() => {
    const isEligible = checkEligibility();
    setIsEligibleForCabLa(isEligible);
  }, []);
  return { isEligibleForCabLa, setIsEligibleForCabLa };
};
