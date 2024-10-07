import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Table } from "react-bootstrap";
import Chart from "react-apexcharts";

const AdminStats = () => {
  const [employees, setEmployees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [managers, setManagers] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const [averageFeedback, setAverageFeedback] = useState(0);
  const [topCourse, setTopCourse] = useState(null);
  const [retention, setRetention] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [totalPerformance, setTotalPerformance] = useState([]);
  const [designationChartData, setDesignationChartData] = useState([]);
  const [retainedEmployees, setRetainedEmployees] = useState([]);
  const [uniqueCourses, setUniqueCourses] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [courseStats, setCourseStats] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          const [
            employeeRes,
            managerRes,
            coursesRes,
            performanceRes,
            feedbackRes,
          ] = await Promise.all([
            axios.get(`http://localhost:8000/api/admin/users/employee`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`http://localhost:8000/api/admin/users/manager`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`http://localhost:8000/api/allcourses`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`http://localhost:8000/api/performance`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`http://localhost:8000/api/feedback/feedback`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const uniqueCourseTitles = Array.from(
            new Set(coursesRes.data.map((course) => course.title))
          );
          setUniqueCourses(uniqueCourseTitles);

          setEmployees(employeeRes.data.employees);
          setManagers(managerRes.data.employees);
          setCourses(coursesRes.data);
          setPerformance(performanceRes.data);
          setFeedback(feedbackRes.data.feedbacks);

          calculateAverageFeedback(feedbackRes.data.feedbacks);
          calculateAverageScores(performanceRes.data, coursesRes.data);
          calculateRetention(performanceRes.data, feedbackRes.data.feedbacks);
          calculateScoresByDesignation(
            performanceRes.data,
            employeeRes.data.employees
          );
        } catch (error) {
          console.error("Error fetching data", error);
        }
      }
    };
    fetchData();
  }, [token]);

  const calculateAverageFeedback = (feedbacks) => {
    const totalFeedback = feedbacks.reduce(
      (acc, feedback) => acc + feedback.aggregatedScore,
      0
    );
    const avgFeedback =
      feedbacks.length > 0 ? (totalFeedback / feedbacks.length).toFixed(2) : 0;
    setAverageFeedback(avgFeedback);
  };

  const calculateAverageScores = (performanceData, coursesData) => {
    const courseScores = performanceData.reduce((acc, performance) => {
      const { courseID, score } = performance;
      if (!acc[courseID]) {
        acc[courseID] = { totalScore: 0, count: 0 };
      }
      acc[courseID].totalScore += score;
      acc[courseID].count++;
      return acc;
    }, {});

    const chartData = Object.entries(courseScores).map(([courseID, data]) => {
      const course =
        coursesData.find((course) => course.id === parseInt(courseID)) || {};
      return {
        courseName: course.title || "Unknown Course",
        averageScore: (data.totalScore / data.count).toFixed(2),
      };
    });

    setChartData(chartData);

    const highestScoreCourse = chartData.reduce(
      (prev, current) => {
        return prev.averageScore > current.averageScore ? prev : current;
      },
      { averageScore: 0 }
    );

    setTopCourse(highestScoreCourse);
  };

  const calculateRetention = (performanceData, feedbacks) => {
    const latestPerformance = performanceData.reduce((acc, perf) => {
      const key = `${perf.employeeID}-${perf.courseID}`;
      if (!acc[key] || acc[key].attempt < perf.attempt) {
        acc[key] = perf;
      }
      return acc;
    }, {});

    setTotalPerformance(latestPerformance);

    const employeeScores = employees.map((employee) => {
      const feedback = feedbacks.find(
        (fb) => fb.employeeID === employee.employeeID
      );
      const performance = Object.values(latestPerformance).filter(
        (perf) => perf.employeeID === employee.employeeID
      );

      const avgPerformanceScore =
        performance.length > 0
          ? performance.reduce((sum, perf) => sum + perf.score, 0) /
            performance.length
          : 0;

      const avgFeedbackScore = feedback ? feedback.aggregatedScore : 0;
      const avgTotalScore = (avgPerformanceScore + avgFeedbackScore) / 2;

      return { ...employee, avgTotalScore };
    });

    const retained = employeeScores.filter(
      (employee) => employee.avgTotalScore >= 50
    );
    setRetainedEmployees(retained);

    const retentionPercentage = (retained.length / employees.length) * 100;
    setRetention(retentionPercentage.toFixed(2));
  };

  const calculateScoresByDesignation = (performanceData, employeesData) => {
    const designationScores = performanceData.reduce((acc, performance) => {
      const employee = employeesData.find(
        (emp) => emp.id === performance.employeeID
      );
      const designation = employee ? employee.designation : "Unknown";

      if (!acc[designation]) {
        acc[designation] = { totalScore: 0, count: 0 };
      }
      acc[designation].totalScore += performance.score;
      acc[designation].count++;
      return acc;
    }, {});

    const chartData = Object.entries(designationScores).map(
      ([designation, data]) => ({
        designation,
        averageScore: (data.totalScore / data.count).toFixed(2),
      })
    );

    setDesignationChartData(chartData);
  };
  useEffect(() => {
    const stats = courses.map((course) => {
      const completedUsers = performance.filter(
        (p) => p.courseID === course.id
      );
      const totalUsers = employees.filter(
        (user) => user.designation === course.designation
      );

      return {
        courseName: course.title,
        completedCount: completedUsers.length,
        notCompletedCount: totalUsers.length - completedUsers.length,
      };
    });

    setCourseStats(stats);
  }, [courses, performance, employees]);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    toggleDropdown();
  };

  return (
    <div>
      <div className="row">
        <StatCard title="Total Employees" value={employees.length} />
        <StatCard title="Total Managers" value={managers.length} />
        <StatCard title="Total Courses" value={courses.length} />
        <StatCard title="Top Course" value={topCourse?.courseName || "N/A"} />
        <StatCard title="Retention (%)" value={`${retention || "N/A"}%`} />
        <StatCard title="Average Feedback" value={averageFeedback} />
      </div>
      <div className="row mt-5">
        <div className="col-6">
          <h5>Average Scores by Course</h5>
          <Chart
            options={{
              chart: { id: "average-scores-by-course" },
              colors: ["#6C63FF"],
              xaxis: { categories: chartData.map((item) => item.courseName) },
              yaxis: { title: { text: "Average Score" } },
            }}
            series={[
              {
                name: "Average Score",
                data: chartData.map((item) => parseFloat(item.averageScore)),
              },
            ]}
            type="bar"
            height={400}
          />
        </div>
        <div className="col-6">
          <h5>Average Performance Scores by Designation</h5>
          <Chart
            options={{
              chart: { id: "average-scores-by-designation" },
              colors: ["#6C63FF"],
              xaxis: {
                categories: designationChartData.map(
                  (item) => item.designation
                ),
              },
              yaxis: { title: { text: "Average Score" } },
            }}
            series={[
              {
                name: "Average Score",
                data: designationChartData.map((item) =>
                  parseFloat(item.averageScore)
                ),
              },
            ]}
            type="bar"
            height={400}
          />
        </div>
      </div>

      <div className="row my-5 d-flex align-items-center justify-content-center">
        <div className="col-2">
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            id="courseDropdown"
            onClick={toggleDropdown}
          >
            Select Course
          </button>
          <div
            className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}
            aria-labelledby="courseDropdown"
          >
            {courseStats.map((stat, index) => (
              <div
                className="dropdown-item"
                key={index}
                onClick={() => handleCourseSelect(stat)}
              >
                {stat.courseName}
              </div>
            ))}
          </div>
        </div>
        {selectedCourse && (
          <>
            <div className="col-2">
              <h3>Details for {selectedCourse.courseName}</h3>
            </div>
            <div className="col-4">
              <h5>Completed</h5>
              <Card className="mb-4 px-5 pt-4 pb-5" style={{ height: "75%" }}>
                <Card.Body className="p-0">
                  <Card.Text className="fw-600 fs-1 content">
                    {selectedCourse.completedCount}
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
            <div className="col-4">
              <h5>Pending</h5>
              <Card className="mb-4 px-5 pt-4 pb-5" style={{ height: "75%" }}>
                <Card.Body className="p-0">
                  <Card.Text className="fw-600 fs-1 content">
                  {selectedCourse.notCompletedCount}
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          </>
        )}
      </div>

      <div className="row">
        <h4>Top 5 Performers:</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
              <th>Course</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(totalPerformance).map((performer, index) => (
              <tr key={index}>
                <td>{performer.name}</td>
                <td>{performer.score}</td>
                <td>
                  {courses.find((course) => course.id === performer.courseID)
                    ?.title || "Unknown"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="col-2">
    <h5>{title}:</h5>
    <Card className="mb-4 px-5 pt-4 pb-5" style={{ height: "75%" }}>
      <Card.Body className="p-0">
        <Card.Text className="fw-600 fs-1 content">{value}</Card.Text>
      </Card.Body>
    </Card>
  </div>
);

export default AdminStats;
