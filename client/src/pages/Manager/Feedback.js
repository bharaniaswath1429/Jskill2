import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, InputGroup, FormControl } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

const Feedback = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [statusFilter, setStatusFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState(""); 
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [managerId, setManagerId] = useState("");
  const [feedback, setFeedback] = useState({
    employeeID: "",
    name: "",
    designation: "",
    questions: [1, 1, 1, 1, 1],
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      const managerId = decodedToken.empId;
      setManagerId(managerId);
      fetchEmployees(token, managerId);
      fetchEmployeeFeedback(token, managerId);
    } else {
      console.error("No token found, user is not authenticated.");
    }
  }, []);

  const fetchEmployees = (token, managerId) => {
    axios
      .get(`http://localhost:8000/api/employees/manager/${managerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setEmployees(response.data.employees);
        setFilteredEmployees(response.data.employees);
      })
      .catch((error) => console.error("Error fetching employees", error));
  };

  const fetchEmployeeFeedback = (token, managerId) => {
    axios
      .get(`http://localhost:8000/api/feedback/manager/${managerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const feedbacks = response.data.feedbacks;
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) => ({
            ...emp,
            status: feedbacks.some((fb) => fb.employeeID === emp.employeeID)
              ? "Completed"
              : "Pending",
          }))
        );
        setFilteredEmployees((prevEmployees) =>
          prevEmployees.map((emp) => ({
            ...emp,
            status: feedbacks.some((fb) => fb.employeeID === emp.employeeID)
              ? "Completed"
              : "Pending",
          }))
        );
      })
      .catch((error) => console.error("Error fetching feedback", error));
  };

  const handleFeedbackChange = (index, value) => {
    const updatedFeedback = feedback.questions.map((q, i) =>
      i === index ? parseInt(value) : q
    );
    setFeedback({ ...feedback, questions: updatedFeedback });
  };

  const handleProvideFeedback = (employee) => {
    setSelectedEmployee(employee);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    const feedbackData = {
      employeeID: selectedEmployee.employeeID,
      name: selectedEmployee.name,
      designation: selectedEmployee.designation,
      questions: feedback.questions,
      managerId: managerId,
    };
    axios
      .post(
        `http://localhost:8000/api/feedback`,
        { feedback: feedbackData },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        toast.success("Feedback submitted successfully");
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.employeeID === selectedEmployee.employeeID
              ? { ...emp, status: "Completed" }
              : emp
          )
        );
        setShowFeedbackModal(false);
      })
      .catch((error) => {
        toast.error("Error submitting feedback");
        console.error(error);
      });
  };

  // Search and Filter Logic
  const filterEmployees = () => {
    let filtered = employees;

    // Filter by search term (name, employeeID, designation)
    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employeeID.toString().includes(searchTerm) ||
          emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((emp) => emp.status === statusFilter);
    }

    if (designationFilter) {
      filtered = filtered.filter((emp) => emp.designation === designationFilter);
    }

    setFilteredEmployees(filtered);
  };

  // Handle input changes for search and filter
  useEffect(() => {
    filterEmployees(); // Call filter function whenever search/filter changes
  }, [searchTerm, statusFilter, designationFilter, employees]);

  return (
    <div>
      <h2 style={{ fontWeight: "700", color: "#6C63FF" }}>Employee Feedback</h2>

      {/* Search Bar and Filters */}
      <div className="row">
        <div className="col-6 d-flex align-items-end justify-content-center">
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Search by Name, Employee ID, or Designation"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="col-6">
          <div className="row">
            <div className="col-6">
              <Form.Group controlId="filterStatus" className="mb-3">
                <Form.Label>Status Filter</Form.Label>
                <Form.Control
                  as="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </Form.Control>
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group controlId="filterDesignation" className="mb-3">
                <Form.Label>Designation Filter</Form.Label>
                <Form.Control
                  as="select"
                  value={designationFilter}
                  onChange={(e) => setDesignationFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {[...new Set(employees.map((emp) => emp.designation))].map((desig) => (
                    <option key={desig} value={desig}>
                      {desig}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
          </div>
        </div>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr style={{ color: "#6C63FF", fontWeight: "500" }}>
            <th>Name</th>
            <th>Designation</th>
            <th>Employee ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No employees available
              </td>
            </tr>
          ) : (
            filteredEmployees.map((employee) => (
              <tr key={employee.employeeID}>
                <td>{employee.name}</td>
                <td>{employee.designation}</td>
                <td>{employee.employeeID}</td>
                <td>
                  <button
                    className={`btn ${employee.status === "Completed" ? "bg-success" : "bg-danger"} text-white`}
                    onClick={() => handleProvideFeedback(employee)}
                    disabled={employee.status === "Completed"}
                  >
                    {employee.status === "Completed" ? "Completed" : "Pending"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Feedback Modal */}
      <Modal
        show={showFeedbackModal}
        onHide={() => setShowFeedbackModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "#6C63FF" }}>
            Feedback Form for {selectedEmployee?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitFeedback}>
            {[
              "Punctuality",
              "Teamwork",
              "Problem Solving",
              "Leadership",
              "Work Quality",
            ].map((question, index) => (
              <Form.Group key={index}>
                <Form.Label>{question}</Form.Label>
                <Form.Control
                  as="select"
                  value={feedback.questions[index]}
                  onChange={(e) =>
                    handleFeedbackChange(index, e.target.value)
                  }
                >
                  <option value="1">1 (Poor)</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5 (Excellent)</option>
                </Form.Control>
              </Form.Group>
            ))}
            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              style={{ backgroundColor: "#6C63FF", border: "none" }}
            >
              Submit Feedback
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Feedback;
