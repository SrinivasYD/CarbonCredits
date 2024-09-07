import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Button,
  Container,
  Form,
  Row,
  Col,
  Alert,
  Table,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "../styles/regApprovePage.css"; // Assuming you're using the same CSS file

const RegisterProject = ({ account, projectApproval }) => {
  const [projectDetailsHash, setProjectDetails] = useState("");
  const [certificateHash, setCertificate] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedProject, setSubmittedProject] = useState(null);

  useEffect(() => {
    if (account && projectApproval) {
      checkIfSubmitted();
    }
  }, [account, projectApproval]);

  const checkIfSubmitted = async () => {
    try {
      const submissionStatus = await projectApproval.methods
        .hasSubmitted(account)
        .call();
      setHasSubmitted(submissionStatus);

      if (submissionStatus) {
        fetchSubmittedProjectDetails();
      }
    } catch (error) {
      toast.error("Error checking submission status.");
      console.error("Error checking submission status:", error);
    }
  };

  const fetchSubmittedProjectDetails = async () => {
    try {
      const projectData = await projectApproval.methods
        .getProject(account)
        .call();
      setSubmittedProject({
        projectDetailsHash: projectData[0],
        certificateHash: projectData[1],
        isApproved: projectData[2],
        approvalHash: projectData[2]
          ? await projectApproval.methods.approvedProjects(account).call()
          : null,
      });
    } catch (error) {
      toast.error("Error fetching submitted project details.");
      console.error("Error fetching submitted project details:", error);
    }
  };

  const handleRegister = async () => {
    try {
      if (!projectApproval) {
        setStatusMessage("ProjectApproval contract is not loaded.");
        return;
      }

      if (hasSubmitted) {
        toast.warn("You have already submitted a project.");
        return;
      }

      if (
        !ethers.isHexString(projectDetailsHash, 32) ||
        !ethers.isHexString(certificateHash, 32)
      ) {
        throw new Error("Input must be a valid 32-byte hex string");
      }

      await projectApproval.methods
        .submitProject(projectDetailsHash, certificateHash)
        .send({ from: account });

      toast.success("Project submitted for approval successfully.");
      checkIfSubmitted();
    } catch (error) {
      toast.error("Failed to submit project. Please try again.");
      console.error("Error submitting project:", error);
    }
  };

  return (
    <Container className="mt-5 register-page">
      <ToastContainer />
      <h2 className="gold-heading">Register Project</h2>
      {hasSubmitted ? (
        submittedProject ? (
          <div>
            <Alert variant={submittedProject.isApproved ? "success" : "info"}>
              <p>
                {submittedProject.isApproved
                  ? "Your project has been approved!"
                  : "Your project is submitted and pending approval."}
              </p>
              <Table bordered className="styled-table mt-3">
                <tbody>
                  <tr>
                    <td>Project Details Hash:</td>
                    <td>{submittedProject.projectDetailsHash}</td>
                  </tr>
                  <tr>
                    <td>Certificate Hash:</td>
                    <td>{submittedProject.certificateHash}</td>
                  </tr>
                  {submittedProject.isApproved && (
                    <tr>
                      <td>Approval Hash:</td>
                      <td>{submittedProject.approvalHash}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Alert>
          </div>
        ) : (
          <Alert variant="info">Loading project details...</Alert>
        )
      ) : (
        <Form>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="form-label">
              Project Details Hash
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                className="form-control"
                type="text"
                placeholder="Enter project details"
                value={projectDetailsHash}
                onChange={(e) => setProjectDetails(e.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="form-label">
              Certificate Hash
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                className="form-control"
                type="text"
                placeholder="Enter certificate details"
                value={certificateHash}
                onChange={(e) => setCertificate(e.target.value)}
              />
            </Col>
          </Form.Group>
          <Button variant="primary" onClick={handleRegister}>
            Register Project
          </Button>
        </Form>
      )}
      {statusMessage && <Alert className="mt-3">{statusMessage}</Alert>}
    </Container>
  );
};

export default RegisterProject;
