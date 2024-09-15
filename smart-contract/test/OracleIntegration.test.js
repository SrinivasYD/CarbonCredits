const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Oracle Integration with CarbonCreditNFT", function () {
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

    const ProjectEmissionsOracleMock = await ethers.getContractFactory(
      "MockProjectEmissionsOracle"
    );
    projectEmissionsOracleMock = await ProjectEmissionsOracleMock.deploy();
    await projectEmissionsOracleMock.waitForDeployment();

    // Deploy ProjectApproval contract
    ProjectApproval = await ethers.getContractFactory("ProjectApproval");
    projectApproval = await ProjectApproval.deploy();
    await projectApproval.waitForDeployment();

    // Deploy CarbonCreditNFT contract with the oracles and ProjectApproval
    CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
    carbonCreditNFT = await CarbonCreditNFT.deploy(
      averageEmissionsOracleMock.target,
      projectEmissionsOracleMock.target,
      projectApproval.target
    );
    await carbonCreditNFT.waitForDeployment();

    // Authorize CarbonCreditNFT to interact with mock oracles
    // await projectEmissionsOracleMock.authorizeCaller(carbonCreditNFT.target);
  });

  describe("Integration with MockAverageEmissionsOracle", function () {
    it("Should correctly read the average emissions factor from MockAverageEmissionsOracle", async function () {
      // Set a value in the mock oracle
      await averageEmissionsOracleMock.addTrustedSource(owner.address);
      await averageEmissionsOracleMock.updateAverageEmissionsFactor(1500);

      // Fetch the value from the MockAverageEmissionsOracle contract directly
      const emissionsFactor =
        await averageEmissionsOracleMock.getAverageEmissionsFactor();
      expect(emissionsFactor).to.equal(1500);
    });
  });

  describe("Integration with MockProjectEmissionsOracle", function () {
    it("Should correctly read the energy produced from MockProjectEmissionsOracle", async function () {
      // Set mock data
      await projectEmissionsOracleMock.addTrustedSource(owner.address);
      await projectEmissionsOracleMock.registerProject(addr1.address);
      await projectEmissionsOracleMock.updateProjectData(
        addr1.address,
        2000,
        500
      );

      // Check if the CarbonCreditNFT contract reads the energy produced correctly
      const energyProduced = await projectEmissionsOracleMock.getEnergyProduced(
        addr1.address
      );
      expect(energyProduced).to.equal(2000);
    });

    it("Should correctly read project emissions data from MockProjectEmissionsOracle", async function () {
      // Set mock data
      await projectEmissionsOracleMock.addTrustedSource(owner.address);
      await projectEmissionsOracleMock.registerProject(addr1.address);
      await projectEmissionsOracleMock.updateProjectData(
        addr1.address,
        2000,
        800
      );

      // Check if the CarbonCreditNFT contract reads the project emissions data correctly
      const projectEmissionsData =
        await projectEmissionsOracleMock.getProjectEmissionsData(addr1.address);
      expect(projectEmissionsData).to.equal(800);
    });
  });

  describe("Oracle Integration Checks During Minting", function () {
    beforeEach(async function () {
      const projectDetailsHash = "0x" + "a".repeat(64);
      const certificateHash = "0x" + "b".repeat(64);

      // Submit and approve the project using ProjectApproval
      await projectApproval
        .connect(addr1)
        .submitProject(projectDetailsHash, certificateHash);
      await projectApproval.approveProject(addr1.address);

      // Generate the approvalHash
      const abiCoder = new ethers.AbiCoder();
      const approvalHash = ethers.keccak256(
        abiCoder.encode(
          ["bytes32", "bytes32"],
          [projectDetailsHash, certificateHash]
        )
      );

      // Register the project before minting
      await carbonCreditNFT.connect(addr1).registerProject(approvalHash);

      // Set oracle values to simulate real scenarios
      await projectEmissionsOracleMock.addTrustedSource(owner.address);
      // await projectEmissionsOracleMock.registerProject(addr1.address);
      await projectEmissionsOracleMock.updateProjectData(
        addr1.address,
        5000,
        200
      );
      await averageEmissionsOracleMock.addTrustedSource(owner.address);
      await averageEmissionsOracleMock.updateAverageEmissionsFactor(500);
    });

    it("Should mint carbon credits if oracle data meets requirements", async function () {
      // Move the time forward by 31 seconds to bypass the minting restriction
      await ethers.provider.send("evm_increaseTime", [31]);
      await ethers.provider.send("evm_mine");

      // Fetch oracle data and convert to JavaScript numbers
      const energyProduced = await projectEmissionsOracleMock.getEnergyProduced(
        addr1.address
      );
      const emissionsData =
        await projectEmissionsOracleMock.getProjectEmissionsData(addr1.address);
      const averageEmissionsFactor =
        await averageEmissionsOracleMock.getAverageEmissionsFactor();

      console.log("Energy Produced:", energyProduced);
      console.log("Project Emissions Data:", emissionsData);
      console.log("Average Emissions Factor:", averageEmissionsFactor);

      // Calculate expected CO2 reduction and number of NFTs to mint
      const co2Reduction =
        energyProduced * (averageEmissionsFactor - emissionsData);
      const numberOfTokens = co2Reduction / BigInt(1000000); // 1 token per tonne of CO2

      console.log("Calculated CO2 Reduction (grams):", co2Reduction);
      console.log("Expected Number of NFTs to Mint:", numberOfTokens);

      // Attempt to mint carbon credits
      const tx = await carbonCreditNFT
        .connect(addr1)
        .mintCarbonCredit(addr1.address);
      const receipt = await tx.wait();

      // Verify the user's balance to ensure the correct number of NFTs was minted
      const userBalance = await carbonCreditNFT.balanceOf(addr1.address);
      console.log("User NFT Balance:", userBalance);

      // Check if the number of NFTs minted matches the calculated number of tokens
      expect(userBalance).to.equal(numberOfTokens);
    });

    it("Should not mint carbon credits if project emissions are too high", async function () {
      // Set project emissions higher than the average emissions factor
      await projectEmissionsOracleMock.updateProjectData(
        addr1.address,
        1000,
        1200
      ); // Project emissions are too high compared to average

      // Move the time forward by 31 seconds
      await ethers.provider.send("evm_increaseTime", [31]);
      await ethers.provider.send("evm_mine");

      // Attempt to mint should fail
      await expect(
        carbonCreditNFT.connect(addr1).mintCarbonCredit(addr1.address)
      ).to.be.revertedWith("Project emissions too high");
    });
  });
});
