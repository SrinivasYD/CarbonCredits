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

  // Path to the frontend/src/contracts folder
  const contractsDir = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "src",
    "contracts"
  );

  // Check if the contracts folder exists, if not create it
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save the contract addresses in contract-addresses.json
  fs.writeFileSync(
    path.join(contractsDir, "contract-addresses.json"),
    JSON.stringify(
      {
        MockProjectEmissionsOracle: mockOracleAddress,
        MockAverageEmissionsOracle: mockAvgOracleAddress,
        ProjectApproval: projectApprovalAddress,
        CarbonCreditNFT: carbonCreditNFTAddress,
      },
      undefined,
      2
    )
  );

  // Save the ABI files for each deployed contract
  const MockProjectEmissionsOracleArtifact = artifacts.readArtifactSync(
    "MockProjectEmissionsOracle"
  );
  const MockAverageEmissionsOracleArtifact = artifacts.readArtifactSync(
    "MockAverageEmissionsOracle"
  );
  const ProjectApprovalArtifact = artifacts.readArtifactSync("ProjectApproval");
  const CarbonCreditNFTArtifact = artifacts.readArtifactSync("CarbonCreditNFT");

  // Write each ABI file to the contracts folder in frontend/src
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
}

// Handle any errors during deployment
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
