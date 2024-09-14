import React, { useState, useEffect } from "react";
import { Button, Container, Table, Alert } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "../styles/regApprovePage.css";

const ApproveProject = ({ account, projectApproval }) => {
  const [submittedProjects, setSubmittedProjects] = useState([]);
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [revokedProjects, setRevokedProjects] = useState([]);
  const [approverAddress, setApproverAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectApproval) {
      fetchApproverAddress();
      fetchProjects();
      fetchRevokedProjects();
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

  // Function to fetch both submitted and approved projects
  const fetchProjects = async () => {
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
        isRevoked: false,
      }));

      const projectsWithStatus = await Promise.all(
        projects.map(async (project) => {
          const projectData = await projectApproval.methods
            .getProject(project.owner)
            .call();
          project.isApproved = projectData[2];
          project.isRevoked = await projectApproval.methods
            .isProjectRevoked(project.owner)
            .call();

          // Fetch approvalHash if the project is approved
          if (project.isApproved) {
            project.approvalHash = await projectApproval.methods
              .approvedProjects(project.owner)
              .call();
          }

          return project;
        })
      );

      const submitted = projectsWithStatus.filter(
        (project) => !project.isApproved && !project.isRevoked
      );

      const approved = projectsWithStatus.filter(
        (project) => project.isApproved && !project.isRevoked
      );

      setSubmittedProjects(submitted);
      setApprovedProjects(approved);
    } catch (error) {
      toast.error("Error fetching projects.");
      console.error("Error fetching projects:", error);
    }
  };

  const fetchRevokedProjects = async () => {
    try {
      const events = await projectApproval.getPastEvents("ProjectRevoked", {
        fromBlock: 0,
        toBlock: "latest",
      });

      const revokedProjects = events.map((event) => ({
        owner: event.returnValues.owner,
      }));

      setRevokedProjects(revokedProjects);
    } catch (error) {
      toast.error("Error fetching revoked projects.");
      console.error("Error fetching revoked projects.", error);
    }
  };

  const handleApprove = async (owner) => {
    try {
      setIsLoading(true); // Set loading state to true
      await projectApproval.methods
        .approveProject(owner)
        .send({ from: account });
      toast.success(`Project approved successfully for ${owner}`);
      // Re-fetch projects after approval
      await fetchProjects();
    } catch (error) {
      toast.error("Failed to approve project.");
      console.error("Error approving project:", error);
    } finally {
      setIsLoading(false); // Set loading state back to false
    }
  };

  const handleRevoke = async (owner) => {
    try {
      setIsLoading(true); // Set loading state to true
      await projectApproval.methods
        .revokeProject(owner)
        .send({ from: account });
      toast.success(`Project revoked successfully for ${owner}`);
      // Re-fetch projects after revocation
      await fetchProjects();
      await fetchRevokedProjects();
    } catch (error) {
      toast.error("Failed to revoke project.");
      console.error("Error revoking project:", error);
    } finally {
      setIsLoading(false); // Set loading state back to false
    }
  };

  return (
    <Container className="mt-5">
      <ToastContainer />
      <h2 className="gold-heading">Approve or Revoke Projects</h2>

      {account && account.toLowerCase() === approverAddress ? (
        <>
          {/* Submitted Projects (Pending Approval) */}
          {submittedProjects.length > 0 ? (
            <div className="mt-5">
              <h3 className="gold-heading">
                Submitted Projects (Pending Approval)
              </h3>
              <Table
                striped
                bordered
                hover
                responsive
                className="glowing-table mt-4"
              >
                <thead>
                  <tr>
                    <th>Owner</th>
                    <th>Project Details Hash</th>
                    <th>Certificate Hash</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedProjects.map((project, index) => (
                    <tr key={index}>
                      <td>{project.owner}</td>
                      <td>{project.projectDetailsHash}</td>
                      <td>{project.certificateHash}</td>
                      <td>
                        <Button
                          className="custom-button"
                          onClick={() => handleApprove(project.owner)}
                          disabled={isLoading}
                        >
                          {isLoading ? "Processing..." : "Approve"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">No projects submitted for approval.</Alert>
          )}

          {/* Approved Projects */}
          {approvedProjects.length > 0 && (
            <div className="mt-5">
              <h3 className="gold-heading">Approved Projects</h3>
              <Table
                striped
                bordered
                hover
                responsive
                className="glowing-table"
              >
                <thead>
                  <tr>
                    <th>Owner</th>
                    <th>Project Details Hash</th>
                    <th>Certificate Hash</th>
                    <th>Approval Hash</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedProjects.map((project, index) => (
                    <tr key={index}>
                      <td>{project.owner}</td>
                      <td>{project.projectDetailsHash}</td>
                      <td>{project.certificateHash}</td>
                      <td>{project.approvalHash}</td>
                      <td>
                        <Button
                          className="custom-button"
                          variant="danger"
                          onClick={() => handleRevoke(project.owner)}
                          disabled={isLoading}
                        >
                          {isLoading ? "Processing..." : "Revoke"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Revoked Projects */}
          {revokedProjects.length > 0 && (
            <div className="mt-5">
              <h3 className="gold-heading">Revoked Projects</h3>
              <Table
                striped
                bordered
                hover
                responsive
                className="glowing-table"
              >
                <thead>
                  <tr>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {revokedProjects.map((project, index) => (
                    <tr key={index}>
                      <td>{project.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      ) : (
        <Alert variant="danger">
          You are not authorized to approve or revoke projects.
        </Alert>
      )}
    </Container>
  );
};

export default ApproveProject;
