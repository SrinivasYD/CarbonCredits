import React, { useState, useEffect } from "react";
import { Button, Container, Table, Alert } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

const ApproveProject = ({ account, projectApproval }) => {
  const [submittedProjects, setSubmittedProjects] = useState([]);
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [approverAddress, setApproverAddress] = useState("");

  useEffect(() => {
    if (projectApproval) {
      fetchApproverAddress();
      fetchSubmittedProjects();
      fetchApprovedProjects();
    }
  }, [projectApproval]);

  const fetchApproverAddress = async () => {
    try {
      const approver = await projectApproval.methods.approver().call();
      setApproverAddress(approver.toLowerCase());
    } catch (error) {
      toast.error("Error fetching approver address.");
      console.error("Error fetching approver address:", error);
    }
  };

  const fetchSubmittedProjects = async () => {
    try {
      const events = await projectApproval.getPastEvents("ProjectSubmitted", {
        fromBlock: 0,
        toBlock: "latest",
      });

      const projects = events.map((event) => ({
        owner: event.returnValues.owner,
        projectDetailsHash: event.returnValues.projectDetailsHash,
        certificateHash: event.returnValues.certificateHash,
        isApproved: false,
      }));

      const projectsWithStatus = await Promise.all(
        projects.map(async (project) => {
          const projectData = await projectApproval.methods
            .getProject(project.owner)
            .call();
          project.isApproved = projectData[2];
          return project;
        })
      );

      setSubmittedProjects(projectsWithStatus);
    } catch (error) {
      toast.error("Error fetching submitted projects.");
      console.error("Error fetching submitted projects:", error);
    }
  };

  const fetchApprovedProjects = async () => {
    try {
      const events = await projectApproval.getPastEvents("ProjectApproved", {
        fromBlock: 0,
        toBlock: "latest",
      });

      const approvedProjects = events.map((event) => ({
        owner: event.returnValues.owner,
        approvalHash: event.returnValues.approvalHash,
      }));

      setApprovedProjects(approvedProjects);
    } catch (error) {
      toast.error("Error fetching approved projects.");
      console.error("Error fetching approved projects:", error);
    }
  };

  const handleApprove = async (owner) => {
    try {
      await projectApproval.methods
        .approveProject(owner)
        .send({ from: account });
      toast.success(`Project approved successfully for ${owner}`);
      fetchSubmittedProjects();
      fetchApprovedProjects();
    } catch (error) {
      toast.error("Failed to approve project.");
      console.error("Error approving project:", error);
    }
  };

  return (
    <Container className="mt-5">
      <ToastContainer />
      <h2>Approve Projects</h2>
      {account && account.toLowerCase() === approverAddress ? (
        <>
          {submittedProjects.length > 0 ? (
            <Table striped bordered hover responsive className="mt-4">
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Project Details Hash</th>
                  <th>Certificate Hash</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submittedProjects.map((project, index) => (
                  <tr key={index}>
                    <td>{project.owner}</td>
                    <td>{project.projectDetailsHash}</td>
                    <td>{project.certificateHash}</td>
                    <td>{project.isApproved ? "Approved" : "Pending"}</td>
                    <td>
                      {!project.isApproved && (
                        <Button
                          variant="success"
                          onClick={() => handleApprove(project.owner)}
                        >
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">No projects submitted for approval.</Alert>
          )}

          {approvedProjects.length > 0 && (
            <div className="mt-5">
              <h3>Approved Projects</h3>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Owner</th>
                    <th>Approval Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedProjects.map((project, index) => (
                    <tr key={index}>
                      <td>{project.owner}</td>
                      <td>{project.approvalHash}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      ) : (
        <Alert variant="danger">
          You are not authorized to approve projects.
        </Alert>
      )}
    </Container>
  );
};

export default ApproveProject;
