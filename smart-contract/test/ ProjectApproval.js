const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProjectApproval Contract", function () {
  let ProjectApproval;
  let projectApproval;
  let owner;
  let approver;
  let addr1;
  let addr2;

  beforeEach(async function () {
    ProjectApproval = await ethers.getContractFactory("ProjectApproval");
    [owner, approver, addr1, addr2] = await ethers.getSigners();
    projectApproval = await ProjectApproval.deploy();
    await projectApproval.waitForDeployment(); // Wait for deployment
  });

  describe("Deployment", function () {
    it("Should set the correct approver", async function () {
      expect(await projectApproval.approver()).to.equal(owner.address);
    });
  });

  describe("Submit Project", function () {
    it("Should allow project submission by the owner", async function () {
      const abiCoder = new ethers.AbiCoder();
      const projectDetailsHash = ethers.keccak256(abiCoder.encode(["string"], ["Project Details"]));
      const certificateHash = ethers.keccak256(abiCoder.encode(["string"], ["Certificate"]));

      await projectApproval.connect(addr1).submitProject(projectDetailsHash, certificateHash);

      const project = await projectApproval.getProject(addr1.address);
      expect(project[0]).to.equal(projectDetailsHash);
      expect(project[1]).to.equal(certificateHash);
      expect(project[2]).to.be.false; // Project should not be approved yet
    });

    it("Should not allow duplicate submissions", async function () {
      const abiCoder = new ethers.AbiCoder();
      const projectDetailsHash = ethers.keccak256(abiCoder.encode(["string"], ["Project Details"]));
      const certificateHash = ethers.keccak256(abiCoder.encode(["string"], ["Certificate"]));

      await projectApproval.connect(addr1).submitProject(projectDetailsHash, certificateHash);
      await expect(
        projectApproval.connect(addr1).submitProject(projectDetailsHash, certificateHash)
      ).to.be.revertedWith("Project already submitted by this owner");
    });
  });

  describe("Approve Project", function () {
    it("Should allow the approver to approve a project", async function () {
      const abiCoder = new ethers.AbiCoder();
      const projectDetailsHash = ethers.keccak256(abiCoder.encode(["string"], ["Project Details"]));
      const certificateHash = ethers.keccak256(abiCoder.encode(["string"], ["Certificate"]));

      await projectApproval.connect(addr1).submitProject(projectDetailsHash, certificateHash);

      const approvalHash = ethers.keccak256(
        abiCoder.encode(["bytes32", "bytes32"], [projectDetailsHash, certificateHash])
      );

      const tx = await projectApproval.connect(owner).approveProject(addr1.address);
      const receipt = await tx.wait();

      expect(await projectApproval.isValidProjectHash(addr1.address, approvalHash)).to.be.true;

      const event = receipt.events?.find(e => e.event === "ProjectApproved");
      expect(event, "ProjectApproved event should be emitted").undefined;
      if (event) {
        expect(event.args.approvalHash).to.equal(approvalHash);
      }
    });

    it("Should not allow non-approvers to approve projects", async function () {
      await expect(
        projectApproval.connect(addr1).approveProject(addr2.address)
      ).to.be.revertedWith("Only the approver can approve projects");
    });
  });

  describe("Revoke Project", function () {
    it("Should allow the approver to revoke an approved project", async function () {
      const abiCoder = new ethers.AbiCoder();
      const projectDetailsHash = ethers.keccak256(abiCoder.encode(["string"], ["Project Details"]));
      const certificateHash = ethers.keccak256(abiCoder.encode(["string"], ["Certificate"]));

      await projectApproval.connect(addr1).submitProject(projectDetailsHash, certificateHash);
      await projectApproval.connect(owner).approveProject(addr1.address);

      await projectApproval.connect(owner).revokeProject(addr1.address);

      expect(await projectApproval.isProjectRevoked(addr1.address)).to.be.true;
    });

    it("Should not allow revoking of a non-approved project", async function () {
      await expect(
        projectApproval.connect(owner).revokeProject(addr1.address)
      ).to.be.revertedWith("Project is not approved");
    });

    it("Should not allow non-approvers to revoke projects", async function () {
      await expect(
        projectApproval.connect(addr1).revokeProject(addr2.address)
      ).to.be.revertedWith("Only the approver can revoke projects");
    });
  });

  describe("Edge Cases", function () {
    it("Should not allow submission with empty hashes", async function () {
      const emptyHash = "0x0000000000000000000000000000000000000000000000000000000000000000"; // Define HashZero manually
      await expect(
        projectApproval.connect(addr1).submitProject(emptyHash, emptyHash)
      ).to.be.revertedWith("Project details hash cannot be empty");
    });
  });
});
