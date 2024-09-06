// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAverageEmissionsOracle.sol";
import "./IProjectEmissionsOracle.sol";
// import "./ProjectApproval.sol"; // Import the ProjectApproval contract

/**
 * @title CarbonCreditNFT
 * @dev An ERC721 token that represents carbon credits. Tokens are minted based on CO2 reduction calculations.
 */
contract CarbonCreditNFT is ERC721, Pausable, Ownable(msg.sender) {
    uint256 public tokenCounter;
    IAverageEmissionsOracle public averageEmissionsOracle;
    IProjectEmissionsOracle public projectEmissionsOracle;
    ProjectApproval public projectApproval; // Reference to the ProjectApproval contract

    struct Project {
        address owner;
        bytes32 dataHash; // Store data hash as bytes32
        uint256 lastMintedTimestamp;
    }

    mapping(address => Project) public projects;

    /**
     * @dev Emitted when a new project is registered.
     * @param owner The address of the project owner.
     * @param dataHash The hash of the off-chain data related to the project.
     */
    event ProjectRegistered(address indexed owner, bytes32 dataHash);

    /**
     * @dev Emitted when carbon credits are minted.
     * @param owner The address of the project owner.
     * @param recipient The address receiving the minted tokens.
     * @param numberOfTokens The number of tokens minted.
     * @param timestamp The timestamp when the tokens were minted.
     */
    event CarbonCreditsMinted(address indexed owner, address indexed recipient, uint256 numberOfTokens, uint256 timestamp);

    /**
     * @dev Constructor for the CarbonCreditNFT contract.
     * @param _averageEmissionsOracle The address of the average emissions oracle contract.
     * @param _projectEmissionsOracle The address of the project emissions oracle contract.
     * @param _projectApproval The address of the project approval contract.
     */
    constructor(
        address _averageEmissionsOracle,
        address _projectEmissionsOracle,
        address _projectApproval
    ) ERC721("CarbonCreditNFT", "CCNFT") {
        tokenCounter = 0;
        averageEmissionsOracle = IAverageEmissionsOracle(_averageEmissionsOracle);
        projectEmissionsOracle = IProjectEmissionsOracle(_projectEmissionsOracle);
        projectApproval = ProjectApproval(_projectApproval); // Initialize the ProjectApproval contract
    }

    /**
     * @notice Registers a new project with the specified data hash.
     * @dev This function registers a new project and emits a ProjectRegistered event.
     *      It also interacts with the project emissions oracle to register the project.
     * @param dataHash The hash of the off-chain data related to the project.
     */
    function registerProject(bytes32 dataHash) public whenNotPaused {
        require(dataHash != bytes32(0), "Data hash must be provided");
        require(projects[msg.sender].owner == address(0), "Project already registered for this wallet");

        // Check if the hash is valid in the ProjectApproval contract
        require(projectApproval.isValidProjectHash(msg.sender, dataHash), "Invalid project hash or project not yet approved");

        projects[msg.sender] = Project({
            owner: msg.sender,
            dataHash: dataHash,
            lastMintedTimestamp: block.timestamp
        });

        emit ProjectRegistered(msg.sender, dataHash);
        projectEmissionsOracle.registerProject(msg.sender);
    }

    /**
     * @notice Mints carbon credit tokens for a given project.
     * @dev This function mints NFTs based on the CO2 reduction calculations. It requires oracle data to be up-to-date.
     * @param recipient The address receiving the minted tokens.
     */
    function mintCarbonCredit(address recipient) public whenNotPaused {
        Project storage project = projects[msg.sender];
        require(project.owner == msg.sender, "Only the project owner can mint NFTs");

        uint256 currentTime = block.timestamp;
        if (project.lastMintedTimestamp != 0) {
            // Reduce delay time to 30 seconds for testing purposes
            require(currentTime >= project.lastMintedTimestamp + 30 seconds, "NFTs can only be minted every 30 seconds");
        }

        uint256 energyProduced = projectEmissionsOracle.getEnergyProduced(msg.sender);
        uint256 projectEmissionsData = projectEmissionsOracle.getProjectEmissionsData(msg.sender);
        uint256 averageEmissionsFactor = averageEmissionsOracle.getAverageEmissionsFactor();

        require(energyProduced > 0, "Energy produced must be greater than zero");
        require(projectEmissionsData < averageEmissionsFactor, "Project emissions are too high!");
        require(averageEmissionsFactor > 0, "The average emissions factor is not updated by the oracle!");

        uint256 co2Reduction = calculateCO2Reduction(energyProduced, averageEmissionsFactor, projectEmissionsData);
        uint256 numberOfTokens = co2Reduction / 1000000; // 1 token per tonne of CO2
        require(numberOfTokens > 0, "No sufficient CO2 reduction for minting NFTs");

        project.lastMintedTimestamp = currentTime;

        // Mint tokens
        for (uint256 i = 0; i < numberOfTokens; i++) {
            _safeMint(recipient, tokenCounter);
            tokenCounter++;
        }

        // Calculate and update remaining energy produced
        uint256 remainingCO2Reduction = co2Reduction % 1000000;
        uint256 remainingEnergyProduced = remainingCO2Reduction / (averageEmissionsFactor - projectEmissionsData);

        projectEmissionsOracle.updateRemainingEnergy(msg.sender, remainingEnergyProduced);

        emit CarbonCreditsMinted(msg.sender, recipient, numberOfTokens, currentTime);
    }

    /**
     * @notice Calculates the CO2 reduction based on energy produced and emissions data.
     * @dev This is an internal function used to compute CO2 reductions for minting NFTs.
     * @param energyProduced The amount of energy produced by the project.
     * @param averageEmissionsFactor The average emissions factor from the oracle.
     * @param projectEmissionsData The emissions data for the project.
     * @return The calculated CO2 reduction in grams.
     */
    function calculateCO2Reduction(
        uint256 energyProduced,
        uint256 averageEmissionsFactor,
        uint256 projectEmissionsData
    ) internal pure returns (uint256) {
        uint256 avoidedEmissions = energyProduced * (averageEmissionsFactor - projectEmissionsData);
        return avoidedEmissions;
    }

    /**
     * @notice Pauses the contract.
     * @dev Only the contract owner can call this function to pause the contract.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses the contract.
     * @dev Only the contract owner can call this function to unpause the contract.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @notice Helper function to check if a project is registered.
     * @param _owner The address of the project owner to check.
     * @return True if the project is registered, false otherwise.
     */
    function isProjectRegistered(address _owner) public view returns (bool) {
        return projects[_owner].owner != address(0);
    }
}
