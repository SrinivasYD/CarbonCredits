// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProjectApproval {
    address public approver; // Address of the project approver (contract deployer)
    mapping(address => bytes32) public approvedProjects; // Mapping of project owner to approved hash
    mapping(address => bool) public hasSubmitted; // Mapping to track if a project is submitted by the user
    mapping(address => Project) public submittedProjects; // Mapping to track submitted project details
    mapping(address => bool) public revokedProjects; // Mapping to track revoked projects

    struct Project {
        bytes32 projectDetailsHash;
        bytes32 certificateHash;
        bool isApproved;
    }

    /**
     * @dev Emitted when a project is submitted for approval.
     * @param owner The address of the project owner.
     * @param projectDetailsHash The hash of the project details submitted.
     * @param certificateHash The hash of the certificate submitted.
     */
    event ProjectSubmitted(address indexed owner, bytes32 projectDetailsHash, bytes32 certificateHash);

    /**
     * @dev Emitted when a project is approved.
     * @param owner The address of the project owner.
     * @param approvalHash The combined hash of the project details and certificate.
     */
    event ProjectApproved(address indexed owner, bytes32 approvalHash);

    /**
     * @dev Emitted when a project approval is revoked.
     * @param owner The address of the project owner.
     */
    event ProjectRevoked(address indexed owner);

    /**
     * @dev Constructor to set the approver.
     */
    constructor() {
        approver = msg.sender; // The deployer of the contract becomes the approver
    }

    /**
     * @notice Submits a project for approval.
     * @param projectDetailsHash The hash of the project details to be submitted.
     * @param certificateHash The hash of the certificate to be submitted.
     */
    function submitProject(bytes32 projectDetailsHash, bytes32 certificateHash) public {
        require(projectDetailsHash != bytes32(0), "Project details hash cannot be empty");
        require(certificateHash != bytes32(0), "Certificate hash cannot be empty");
        require(!hasSubmitted[msg.sender], "Project already submitted by this owner");

        // Store submitted project details in the mapping
        submittedProjects[msg.sender] = Project(projectDetailsHash, certificateHash, false);
        hasSubmitted[msg.sender] = true;

        emit ProjectSubmitted(msg.sender, projectDetailsHash, certificateHash);
    }

    /**
     * @notice Approves a project and generates a combined hash.
     * @dev Only the approver can approve projects.
     * @param owner The address of the project owner.
     */
    function approveProject(address owner) public {
        require(msg.sender == approver, "Only the approver can approve projects");
        require(submittedProjects[owner].projectDetailsHash != bytes32(0), "Project not found for this owner");
        require(!submittedProjects[owner].isApproved, "Project is already approved");

        // Combine the project details hash and certificate hash
        bytes32 combinedHash = keccak256(abi.encodePacked(submittedProjects[owner].projectDetailsHash, submittedProjects[owner].certificateHash));

        // Mark project as approved and store the combined hash in the approvedProjects mapping
        submittedProjects[owner].isApproved = true;
        approvedProjects[owner] = combinedHash;

        emit ProjectApproved(owner, combinedHash);
    }

    /**
     * @notice Revokes an approved project, preventing the owner from minting NFTs.
     * @dev Only the approver can revoke projects.
     * @param owner The address of the project owner to revoke.
     */
    function revokeProject(address owner) public {
        require(msg.sender == approver, "Only the approver can revoke projects");
        require(submittedProjects[owner].isApproved, "Project is not approved");
        require(!revokedProjects[owner], "Project is already revoked");

        // Mark the project as revoked
        revokedProjects[owner] = true;

        emit ProjectRevoked(owner);
    }

    /**
     * @notice Checks if a project owner has a valid approval hash.
     * @param owner The address of the project owner.
     * @param approvalHash The combined hash to check.
     * @return True if the provided hash matches the stored hash for the owner.
     */
    function isValidProjectHash(address owner, bytes32 approvalHash) public view returns (bool) {
        return approvedProjects[owner] == approvalHash;
    }

    /**
     * @notice Retrieves the submitted project details for a specific owner.
     * @param owner The address of the project owner.
     * @return projectDetailsHash, certificateHash, and approval status.
     */
    function getProject(address owner) public view returns (bytes32, bytes32, bool) {
        Project memory project = submittedProjects[owner];
        return (project.projectDetailsHash, project.certificateHash, project.isApproved);
    }

    /**
     * @notice Returns the revocation status of a project.
     * @param owner The address of the project owner.
     * @return True if the project is revoked, false otherwise.
     */
    function isProjectRevoked(address owner) public view returns (bool) {
        return revokedProjects[owner];
    }
}
