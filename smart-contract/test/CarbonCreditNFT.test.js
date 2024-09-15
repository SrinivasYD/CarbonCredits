 
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCreditNFT with Project Approval", function () {
  let CarbonCreditNFT, ProjectApproval;
  let carbonCreditNFT, projectApproval;
  let owner, addr1, addr2;
  let averageEmissionsOracleMock, projectEmissionsOracleMock;

  beforeEach(async function () {
    [owner, addr1, addr2, _] = await ethers.getSigners();

    // Deploy the mock oracles
    const AverageEmissionsOracleMock = await ethers.getContractFactory(
      "MockAverageEmissionsOracle"
    );
    averageEmissionsOracleMock = await AverageEmissionsOracleMock.deploy();
    await averageEmissionsOracleMock.waitForDeployment();
    console.log(
      "MockAverageEmissionsOracle deployed at:",
      averageEmissionsOracleMock.target
    );

    const ProjectEmissionsOracleMock = await ethers.getContractFactory(
      "MockProjectEmissionsOracle"
    );
    projectEmissionsOracleMock = await ProjectEmissionsOracleMock.deploy();
    await projectEmissionsOracleMock.waitForDeployment();
    console.log(
      "MockProjectEmissionsOracle deployed at:",
      projectEmissionsOracleMock.target
    );

    // Check if the mock contracts were deployed successfully
    if (
      !averageEmissionsOracleMock.target ||
      !projectEmissionsOracleMock.target
    ) {
      throw new Error("Mock contracts were not deployed correctly");
    }

    // Deploy ProjectApproval contract
    ProjectApproval = await ethers.getContractFactory("ProjectApproval");
    projectApproval = await ProjectApproval.deploy();
    await projectApproval.waitForDeployment();

    // Deploy the CarbonCreditNFT contract with mock oracles and project approval
    CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
    carbonCreditNFT = await CarbonCreditNFT.deploy(
      averageEmissionsOracleMock.target, // Pass MockAverageEmissionsOracle address
      projectEmissionsOracleMock.target, // Pass MockProjectEmissionsOracle address
      projectApproval.target // Pass ProjectApproval address
    );
    await carbonCreditNFT.waitForDeployment();
    console.log("CarbonCreditNFT deployed at:", carbonCreditNFT.target);

    // Authorize the CarbonCreditNFT contract to interact with the mock oracles
    // await projectEmissionsOracleMock.authorizeCaller(carbonCreditNFT.target);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await carbonCreditNFT.owner()).to.equal(owner.address);
    });

    it("Should set the correct initial token counter", async function () {
      expect(await carbonCreditNFT.tokenCounter()).to.equal(0);
    });
  });

  describe("Project Submission and Approval", function () {
    it("Should submit a new project", async function () {
      const projectDetailsHash =
        "0x7f3d2e5b9a8f4c7e1d9f2b3c4a5e6f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f";
      const certificateHash =
        "0x7f3d2e5b9a8f4c7e1d9f2b3c4a5e6f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f";

      await expect(
        projectApproval
          .connect(addr1)
          .submitProject(projectDetailsHash, certificateHash)
      )
        .to.emit(projectApproval, "ProjectSubmitted")
        .withArgs(addr1.address, projectDetailsHash, certificateHash);

      const project = await projectApproval.getProject(addr1.address);
      expect(project[0]).to.equal(projectDetailsHash);
      expect(project[1]).to.equal(certificateHash);
    });

    it("Should approve a submitted project", async function () {
      const projectDetailsHash =
        "0x7f3d2e5b9a8f4c7e1d9f2b3c4a5e6f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f";
      const certificateHash =
        "0x7f3d2e5b9a8f4c7e1d9f2b3c4a5e6f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f";

      await projectApproval
        .connect(addr1)
        .submitProject(projectDetailsHash, certificateHash);

      await expect(projectApproval.approveProject(addr1.address)).to.emit(
        projectApproval,
        "ProjectApproved"
      );

      const project = await projectApproval.getProject(addr1.address);
      expect(project[2]).to.equal(true); // isApproved should be true
    });

    it("Should revoke an approved project", async function () {
      const projectDetailsHash =
        "0x7f3d2e5b9a8f4c7e1d9f2b3c4a5e6f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f";
      const certificateHash =
        "0x7f3d2e5b9a8f4c7e1d9f2b3c4a5e6f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f";

      await projectApproval
        .connect(addr1)
        .submitProject(projectDetailsHash, certificateHash);
      await projectApproval.approveProject(addr1.address);

      await expect(projectApproval.revokeProject(addr1.address)).to.emit(
        projectApproval,
        "ProjectRevoked"
      );

      expect(await projectApproval.isProjectRevoked(addr1.address)).to.equal(
        true
      );
    });

    it("Should prevent minting if the project is revoked", async function () {
      const projectDetailsHash =
        "0x7f3d2e5b9a8f4c7e1d9f2b3c4a5e6f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f";
      const certificateHash =
        "0x7f3d2e5b9a8f4c7e1d9f2b3c4a5e6f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f";

      await projectApproval
        .connect(addr1)
        .submitProject(projectDetailsHash, certificateHash);
      await projectApproval.approveProject(addr1.address);
      await projectApproval.revokeProject(addr1.address);

      const dataHash = projectDetailsHash;
      await expect(
        carbonCreditNFT.connect(addr1).registerProject(dataHash)
      ).to.be.revertedWith("Invalid or revoked project hash");
    });
  });

  describe("Project Registration", function () {
    it("Should submit, approve, and register a new project using approvalHash", async function () {
      const projectDetailsHash = "0x" + "a".repeat(64); // Valid 64-character hash
      const certificateHash = "0x" + "b".repeat(64); // Valid 64-character hash

      // Submit the project
      await expect(
        projectApproval
          .connect(addr1)
          .submitProject(projectDetailsHash, certificateHash)
      )
        .to.emit(projectApproval, "ProjectSubmitted")
        .withArgs(addr1.address, projectDetailsHash, certificateHash);

      // Approve the project
      await projectApproval.approveProject(addr1.address);

      // Generate approvalHash using AbiCoder
      const abiCoder = new ethers.AbiCoder();
      const approvalHash = ethers.keccak256(
        abiCoder.encode(
          ["bytes32", "bytes32"],
          [projectDetailsHash, certificateHash]
        )
      );

      // Register the project in CarbonCreditNFT using approvalHash
      await expect(carbonCreditNFT.connect(addr1).registerProject(approvalHash))
        .to.emit(carbonCreditNFT, "ProjectRegistered")
        .withArgs(addr1.address, approvalHash);

      const project = await carbonCreditNFT.projects(addr1.address);
      expect(project.owner).to.equal(addr1.address);
      expect(project.dataHash).to.equal(approvalHash);
    });

    it("Should not allow registering a project if already registered", async function () {
      const projectDetailsHash = "0x" + "a".repeat(64); // Valid 64-character hash
      const certificateHash = "0x" + "b".repeat(64); // Valid 64-character hash

      // Submit and approve the project
      await projectApproval
        .connect(addr1)
        .submitProject(projectDetailsHash, certificateHash);
      await projectApproval.approveProject(addr1.address);

      // Generate approvalHash
      const abiCoder = new ethers.AbiCoder();
      const approvalHash = ethers.keccak256(
        abiCoder.encode(
          ["bytes32", "bytes32"],
          [projectDetailsHash, certificateHash]
        )
      );

      // First registration
      await carbonCreditNFT.connect(addr1).registerProject(approvalHash);

      // Attempt re-registration
      await expect(
        carbonCreditNFT.connect(addr1).registerProject(approvalHash)
      ).to.be.revertedWith("Project already registered");
    });
  });

  describe("Minting Carbon Credits", function () {
    beforeEach(async function () {
      const projectDetailsHash = "0x" + "a".repeat(64); // Valid 64-character hash
      const certificateHash = "0x" + "b".repeat(64); // Valid 64-character hash

      // Submit, approve, and register the project before minting
      await projectApproval
        .connect(addr1)
        .submitProject(projectDetailsHash, certificateHash);
      await projectApproval.approveProject(addr1.address);

      // Generate approvalHash
      const abiCoder = new ethers.AbiCoder();
      const approvalHash = ethers.keccak256(
        abiCoder.encode(
          ["bytes32", "bytes32"],
          [projectDetailsHash, certificateHash]
        )
      );

      await carbonCreditNFT.connect(addr1).registerProject(approvalHash);
    });

    it("Should mint carbon credits for a registered project", async function () {
      // Set mock oracle responses
      await projectEmissionsOracleMock.addTrustedSource(owner.address);
      await projectEmissionsOracleMock.updateProjectData(
        addr1.address,
        5000,
        200
      ); // Update energy produced to ensure sufficient CO2 reduction

      await averageEmissionsOracleMock.addTrustedSource(owner.address);
      await averageEmissionsOracleMock.updateAverageEmissionsFactor(500);

      // Move the time forward by 31 seconds to bypass the minting restriction
      await ethers.provider.send("evm_increaseTime", [31]);
      await ethers.provider.send("evm_mine");

      await expect(
        carbonCreditNFT.connect(addr1).mintCarbonCredit(addr1.address)
      ).to.emit(carbonCreditNFT, "CarbonCreditsMinted");

      expect(await carbonCreditNFT.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should not mint carbon credits if energy produced is zero", async function () {
      await projectEmissionsOracleMock.addTrustedSource(owner.address);
      await projectEmissionsOracleMock.updateProjectData(addr1.address, 0, 500);

      await averageEmissionsOracleMock.addTrustedSource(owner.address);
      await averageEmissionsOracleMock.updateAverageEmissionsFactor(1000);

      // Move the time forward by 31 seconds to bypass the minting restriction
      await ethers.provider.send("evm_increaseTime", [31]);
      await ethers.provider.send("evm_mine");

      await expect(
        carbonCreditNFT.connect(addr1).mintCarbonCredit(addr1.address)
      ).to.be.revertedWith("Energy produced must be greater than zero");
    });

    it("Should not mint carbon credits if project emissions are too high", async function () {
      await projectEmissionsOracleMock.addTrustedSource(owner.address);
      await projectEmissionsOracleMock.updateProjectData(
        addr1.address,
        1000,
        1500
      );

      await averageEmissionsOracleMock.addTrustedSource(owner.address);
      await averageEmissionsOracleMock.updateAverageEmissionsFactor(1000);

      // Move the time forward by 31 seconds to bypass the minting restriction
      await ethers.provider.send("evm_increaseTime", [31]);
      await ethers.provider.send("evm_mine");

      await expect(
        carbonCreditNFT.connect(addr1).mintCarbonCredit(addr1.address)
      ).to.be.revertedWith("Project emissions too high");
    });
  });

  describe("Pause/Unpause", function () {
    it("Should submit, approve, register, and pause/unpause the contract", async function () {
      const projectDetailsHash = "0x" + "a".repeat(64); // Valid 64-character hash
      const certificateHash = "0x" + "b".repeat(64); // Valid 64-character hash

      // Submit, approve, and register the project
      await projectApproval
        .connect(addr1)
        .submitProject(projectDetailsHash, certificateHash);
      await projectApproval.approveProject(addr1.address);

      // Generate approvalHash
      const abiCoder = new ethers.AbiCoder();
      const approvalHash = ethers.keccak256(
        abiCoder.encode(
          ["bytes32", "bytes32"],
          [projectDetailsHash, certificateHash]
        )
      );

      await carbonCreditNFT.connect(addr1).registerProject(approvalHash);

      // Pause the contract
      await carbonCreditNFT.pause();
      expect(await carbonCreditNFT.paused()).to.equal(true);

      // Attempt registration when paused
      await expect(
        carbonCreditNFT.connect(addr1).registerProject("0x" + "a".repeat(64))
      ).to.be.revertedWithCustomError(carbonCreditNFT, "EnforcedPause");

      // Unpause the contract
      await carbonCreditNFT.unpause();
      expect(await carbonCreditNFT.paused()).to.equal(false);
    });

    it("Should only allow the owner to pause or unpause the contract", async function () {
      await expect(
        carbonCreditNFT.connect(addr1).pause()
      ).to.be.revertedWithCustomError(
        carbonCreditNFT,
        "OwnableUnauthorizedAccount"
      );
    });
  });
});