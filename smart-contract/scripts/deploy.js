const fs = require("fs");
const path = require("path");

async function main() {
  // Deploy MockProjectEmissionsOracle
  const MockProjectEmissionsOracle = await ethers.getContractFactory(
    "MockProjectEmissionsOracle"
  );
  const mockProjectEmissionsOracle = await MockProjectEmissionsOracle.deploy();
  await mockProjectEmissionsOracle.waitForDeployment();
  const mockOracleAddress = await mockProjectEmissionsOracle.getAddress();

  console.log("MockProjectEmissionsOracle deployed to:", mockOracleAddress);

  // Deploy MockAverageEmissionsOracle
  const MockAverageEmissionsOracle = await ethers.getContractFactory(
    "MockAverageEmissionsOracle"
  );
  const mockAverageEmissionsOracle = await MockAverageEmissionsOracle.deploy();
  await mockAverageEmissionsOracle.waitForDeployment();
  const mockAvgOracleAddress = await mockAverageEmissionsOracle.getAddress();

  console.log("MockAverageEmissionsOracle deployed to:", mockAvgOracleAddress);

  // Deploy ProjectApproval contract
  const ProjectApproval = await ethers.getContractFactory("ProjectApproval");
  const projectApproval = await ProjectApproval.deploy();
  await projectApproval.waitForDeployment();
  const projectApprovalAddress = await projectApproval.getAddress();

  console.log("ProjectApproval deployed to:", projectApprovalAddress);

  // Deploy CarbonCreditNFT using the deployed Oracle addresses and ProjectApproval address
  const CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
  const carbonCreditNFT = await CarbonCreditNFT.deploy(
    mockAvgOracleAddress, // Pass MockAverageEmissionsOracle address
    mockOracleAddress, // Pass MockProjectEmissionsOracle address
    projectApprovalAddress // Pass ProjectApproval address
  );
  await carbonCreditNFT.waitForDeployment();
  const carbonCreditNFTAddress = await carbonCreditNFT.getAddress();

  console.log("CarbonCreditNFT deployed to:", carbonCreditNFTAddress);

  // Deploy CarbonCreditNFTMarketplace with CarbonCreditNFT address
  const CarbonCreditNFTMarketplace = await ethers.getContractFactory(
    "CarbonCreditNFTMarketplace"
  );
  const carbonCreditNFTMarketplace = await CarbonCreditNFTMarketplace.deploy(
    carbonCreditNFTAddress // Pass the deployed CarbonCreditNFT address
  );
  await carbonCreditNFTMarketplace.waitForDeployment();
  const carbonCreditNFTMarketplaceAddress =
    await carbonCreditNFTMarketplace.getAddress();

  console.log(
    "CarbonCreditNFTMarketplace deployed to:",
    carbonCreditNFTMarketplaceAddress
  );

  // Save the deployment info to a file
  const contractsDir = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-addresses.json"),
    JSON.stringify(
      {
        MockProjectEmissionsOracle: mockOracleAddress,
        MockAverageEmissionsOracle: mockAvgOracleAddress,
        ProjectApproval: projectApprovalAddress,
        CarbonCreditNFT: carbonCreditNFTAddress,
        CarbonCreditNFTMarketplace: carbonCreditNFTMarketplaceAddress,
      },
      undefined,
      2
    )
  );

  const MockProjectEmissionsOracleArtifact = artifacts.readArtifactSync(
    "MockProjectEmissionsOracle"
  );
  const MockAverageEmissionsOracleArtifact = artifacts.readArtifactSync(
    "MockAverageEmissionsOracle"
  );
  const ProjectApprovalArtifact = artifacts.readArtifactSync("ProjectApproval");
  const CarbonCreditNFTArtifact = artifacts.readArtifactSync("CarbonCreditNFT");
  const CarbonCreditNFTMarketplaceArtifact = artifacts.readArtifactSync(
    "CarbonCreditNFTMarketplace"
  );

  fs.writeFileSync(
    path.join(contractsDir, "MockProjectEmissionsOracle.json"),
    JSON.stringify(MockProjectEmissionsOracleArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "MockAverageEmissionsOracle.json"),
    JSON.stringify(MockAverageEmissionsOracleArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "ProjectApproval.json"),
    JSON.stringify(ProjectApprovalArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "CarbonCreditNFT.json"),
    JSON.stringify(CarbonCreditNFTArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "CarbonCreditNFTMarketplace.json"),
    JSON.stringify(CarbonCreditNFTMarketplaceArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
