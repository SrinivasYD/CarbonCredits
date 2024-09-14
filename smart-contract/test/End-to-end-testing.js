// Import the necessary Hardhat modules
const { ethers } = require("hardhat");

async function main() {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy the IAverageEmissionsOracle contract
    const IAverageEmissionsOracle = await ethers.getContractFactory("IAverageEmissionsOracle");
    const averageEmissionsOracle = await IAverageEmissionsOracle.deploy();
    await averageEmissionsOracle.waitForDeployment();

    console.log("IAverageEmissionsOracle deployed to:", averageEmissionsOracle.address);

    // Deploy the IProjectEmissionsOracle contract
    const IProjectEmissionsOracle = await ethers.getContractFactory("IProjectEmissionsOracle");
    const projectEmissionsOracle = await IProjectEmissionsOracle.deploy();
    await projectEmissionsOracle.waitForDeployment();

    console.log("IProjectEmissionsOracle deployed to:", projectEmissionsOracle.address);

    // Deploy the ProjectApproval contract
    const ProjectApproval = await ethers.getContractFactory("ProjectApproval");
    const projectApproval = await ProjectApproval.deploy();
    await projectApproval.waitForDeployment();

    console.log("ProjectApproval deployed to:", projectApproval.address);

    // Deploy the CarbonCreditNFT contract
    const CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT");
    const carbonCreditNFT = await CarbonCreditNFT.deploy(
        averageEmissionsOracle.address,
        projectEmissionsOracle.address,
        projectApproval.address
    );
    await carbonCreditNFT.waitForDeployment();

    console.log("CarbonCreditNFT deployed to:", carbonCreditNFT.address);
}

// Run the script and handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
