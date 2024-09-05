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

  // Deploy MockAverageEmissionsOracle (assuming you have this contract)
  const MockAverageEmissionsOracle = await ethers.getContractFactory(
    "MockAverageEmissionsOracle"
  );
  const mockAverageEmissionsOracle = await MockAverageEmissionsOracle.deploy();
  await mockAverageEmissionsOracle.waitForDeployment();
  const mockAvgOracleAddress = await mockAverageEmissionsOracle.getAddress();

  console.log("MockAverageEmissionsOracle deployed to:", mockAvgOracleAddress);

  // Deploy CarbonCreditNFT using the deployed Oracle addresses
  const CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
  const carbonCreditNFT = await CarbonCreditNFT.deploy(
    mockAvgOracleAddress, // Pass MockAverageEmissionsOracle address
    mockOracleAddress // Pass MockProjectEmissionsOracle address
  );
  await carbonCreditNFT.waitForDeployment();
  const carbonCreditNFTAddress = await carbonCreditNFT.getAddress();

  console.log("CarbonCreditNFT deployed to:", carbonCreditNFTAddress);

  // Save the deployment info to a file
  // Correct path for the contracts directory
  const contractsDir = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true }); // Create the directory recursively if it doesn't exist
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-addresses.json"),
    JSON.stringify(
      {
        MockProjectEmissionsOracle: mockProjectEmissionsOracle.target,
        MockAverageEmissionsOracle: mockAverageEmissionsOracle.target,
        CarbonCreditNFT: carbonCreditNFT.target,
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
  const CarbonCreditNFTArtifact = artifacts.readArtifactSync("CarbonCreditNFT");

  fs.writeFileSync(
    path.join(contractsDir, "MockProjectEmissionsOracle.json"),
    JSON.stringify(MockProjectEmissionsOracleArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "MockAverageEmissionsOracle.json"),
    JSON.stringify(MockAverageEmissionsOracleArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "CarbonCreditNFT.json"),
    JSON.stringify(CarbonCreditNFTArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
