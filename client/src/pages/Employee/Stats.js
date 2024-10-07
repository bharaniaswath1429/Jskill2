import { useEffect, useState } from 'react';
import { EmployeeStatsContainer, Loading, ChartsContainer } from '../../components';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Stats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [testAttempts, setTestAttempts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decodedToken = jwtDecode(token);
        const empId = decodedToken.userId;

        try {
          const attemptsResponse = await axios.get(
            `http://localhost:8000/api/employee-performance?employeeID=${empId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const attemptsData = attemptsResponse.data;

          const aggregatedAttempts = attemptsData.reduce((acc, attempt) => {
            const courseName = attempt.course;

            if (!acc[courseName]) {
              acc[courseName] = {
                courseName: courseName,
                attempts: 0,
              };
            }
            acc[courseName].attempts += 1;
            return acc;
          }, {});

          const formattedAttempts = Object.values(aggregatedAttempts).map(item => ({
            courseName: item.courseName,
            count: item.attempts,
          }));

          setTestAttempts(formattedAttempts);
        } catch (error) {
          console.error("Error fetching test attempts data", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.error("No token found, user is not authenticated.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <EmployeeStatsContainer />
      {testAttempts.length > 0 && <ChartsContainer data={testAttempts} />}
    </>
  );
};

export default Stats;
