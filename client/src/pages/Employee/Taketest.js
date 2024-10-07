import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import './Taketest.css';

const Taketest = () => {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      const empName = decodedToken.name;
      localStorage.setItem("userId", userId);
      localStorage.setItem("empName", empName);

      axios
        .get(`http://localhost:8000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setCourse(response.data.course);
          setTimeLeft(response.data.course.duration * 60);
        })
        .catch((error) => console.error(error));
    }
  }, [courseId, token]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && quizStarted) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizStarted) {
      handleSubmit();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted]);

  const handleAnswerChange = (questionIndex, selectedAnswer) => {
    setAnswers({ ...answers, [questionIndex]: selectedAnswer });
  };

  const handleSubmit = useCallback(() => {
    const empID = localStorage.getItem("userId");
    const empName = localStorage.getItem("empName");
    const submissionData = {
      employeeID: empID,
      name: empName,
      courseID: courseId,
      course: course?.title,
      answers,
      time: course?.duration * 60 - timeLeft,
    };

    axios
      .post(`http://localhost:8000/api/submit-quiz`, submissionData)
      .then((response) => {
        toast.success("Quiz submitted successfully");
        setTimeout(() => {
          navigate('/employee');
        }, 2000);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to submit quiz");
      });
  }, [answers, courseId, course?.title, course?.duration, timeLeft, navigate]);

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return course ? (
    <div className="quiz-container">
      <div className="quiz-card">
        <h2 className="quiz-title">{course.title}</h2>
        <p className="quiz-duration">Duration: {course.duration} min</p>
        {quizStarted ? (
          <>
            <p className="quiz-timer">Time left: {formatTime(timeLeft)}</p>
            <form className="quiz-form">
              {course.questions.map((q, index) => (
                <div key={index} className="quiz-question">
                  <h4>{q.question}</h4>
                  {q.answers.map((answer, idx) => (
                    <div key={idx} className="quiz-answer" onClick={() => handleAnswerChange(index, answer)}>
                      <label className={`answer-label ${answers[index] === answer ? 'selected' : ''}`}>
                        {answer}
                      </label>
                    </div>
                  ))}
                </div>
              ))}
              <button type="button" className="submit-button" onClick={handleSubmit}>
                Submit Quiz
              </button>
            </form>
          </>
        ) : (
          <button className="start-button" onClick={startQuiz}>
            Start Quiz
          </button>
        )}
      </div>
    </div>
  ) : (
    <p>Loading course details...</p>
  );
};

export default Taketest;

