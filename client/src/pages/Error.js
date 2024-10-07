import React from "react";
import error from "../images/error.svg";
import {Button} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

import './Error.css';

const ErrorPage = () => {
    const navigate = useNavigate();
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
        <div>
        <div
        className="d-flex align-items-center justify-content-center"
      >
        <img src={error} alt="error"></img>
      </div>
      <div className="mt-5">
        <Button style={{backgroundColor:'#6c63ff'}} className="border-0 goback" onClick={()=>{navigate("/")}}>Go Back!</Button>
      </div>
        </div>
    </div>
  );
};

export default ErrorPage;