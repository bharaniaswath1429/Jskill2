import { useEffect, useState } from 'react';
import { ManagerStatsContainer, Loading, ChartsContainer } from '../../components';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ManagerStats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decodedToken = jwtDecode(token);
        const managerId = decodedToken.empId;
        try{
            const response = await axios.get(`http://localhost:8000/api/employees/manager/${managerId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            setEmployees(response.data.employees);

        } catch (error) {
          console.error("Error fetching test attempts data", error);
        } 
        finally {
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
      <ManagerStatsContainer data={employees}/>
      {employees.length > 0 && <ChartsContainer data={employees} />}
    </>
  );
};

export default ManagerStats;
