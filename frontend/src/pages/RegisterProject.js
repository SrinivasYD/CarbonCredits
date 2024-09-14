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
import "../styles/regApprovePage.css";

const RegisterProject = ({ projectApproval }) => {
  const [account, setAccount] = useState("");
  const [projectDetailsHash, setProjectDetails] = useState("");
  const [certificateHash, setCertificate] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedProject, setSubmittedProject] = useState(null);
  const [isRevoked, setIsRevoked] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (projectApproval) {
            checkIfSubmitted(accounts[0]); // Fetch data for the new account
          }
        } else {
          setAccount(""); // Reset state if no account
        }
      });

      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (projectApproval) {
            checkIfSubmitted(accounts[0]);
          }
        }
      });
    }
  }, [projectApproval]);

  const checkIfSubmitted = async (account) => {
    if (!projectApproval) {
      toast.error("ProjectApproval contract is not loaded.");
      return;
    }

    try {
      const submissionStatus = await projectApproval.methods
        .hasSubmitted(account)
        .call();
      setHasSubmitted(submissionStatus);

      if (submissionStatus) {
        fetchSubmittedProjectDetails(account);
      }
    } catch (error) {
      toast.error("Error checking submission status.");
      console.error("Error checking submission status:", error);
    }
  };

  const fetchSubmittedProjectDetails = async (account) => {
    try {
      const projectData = await projectApproval.methods
        .getProject(account)
        .call();
      const revokedStatus = await projectApproval.methods
        .isProjectRevoked(account)
        .call();
      setIsRevoked(revokedStatus);
      setSubmittedProject({
        projectDetailsHash: projectData[0],
        certificateHash: projectData[1],
        isApproved: projectData[2],
        approvalHash:
          projectData[2] && !revokedStatus
            ? await projectApproval.methods.approvedProjects(account).call()
            : null,
      });
    } catch (error) {
      toast.error("Error fetching submitted project details.");
      console.error("Error fetching submitted project details:", error);
    }
  };

  const handleRegister = async () => {
    if (!projectApproval) {
      toast.error("ProjectApproval contract is not loaded.");
      return;
    }

    try {
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
      // After successful submission, re-fetch project data to reflect in the UI
      checkIfSubmitted(account);
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
            <Alert
              variant={
                isRevoked
                  ? "danger"
                  : submittedProject.isApproved
                  ? "success"
                  : "info"
              }
            >
              <p>
                {isRevoked
                  ? "Your project has been revoked."
                  : submittedProject.isApproved
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
                  {submittedProject.isApproved && !isRevoked && (
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
// export the feature
export default RegisterProject;
