// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAverageEmissionsOracle.sol";
import "./IProjectEmissionsOracle.sol";
import "./ProjectApproval.sol";

/**
 * @title CarbonCreditNFT
 * @dev ERC721 token representing carbon credits. Tokens are minted based on CO2 reduction data.
 */
contract CarbonCreditNFT is ERC721, Pausable, Ownable(msg.sender) {
    uint256 public tokenCounter;
    IAverageEmissionsOracle public averageEmissionsOracle;
    IProjectEmissionsOracle public projectEmissionsOracle;
    ProjectApproval public projectApproval;

    struct Project {
        address owner;
        bytes32 dataHash;
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
        projectApproval = ProjectApproval(_projectApproval);
    }

    /**
     * @notice Registers a new project with the specified data hash.
     * @param dataHash The hash of the off-chain data related to the project.
     */
    function registerProject(bytes32 dataHash) public whenNotPaused {
        require(dataHash != bytes32(0), "Data hash must be provided");
        require(projects[msg.sender].owner == address(0), "Project already registered");

        // Check if the project hash is valid and not revoked
        require(projectApproval.isValidProjectHash(msg.sender, dataHash), "Invalid or revoked project hash");

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
     * @param recipient The address receiving the minted tokens.
     */
    function mintCarbonCredit(address recipient) public whenNotPaused {
        Project storage project = projects[msg.sender];
        require(project.owner == msg.sender, "Only the project owner can mint NFTs");

        // Ensure minting is only allowed after a certain delay (30 seconds for testing)
        uint256 currentTime = block.timestamp;
        require(currentTime >= project.lastMintedTimestamp + 30 seconds, "Minting delay not met");

        uint256 energyProduced = projectEmissionsOracle.getEnergyProduced(msg.sender);
        uint256 projectEmissionsData = projectEmissionsOracle.getProjectEmissionsData(msg.sender);
        uint256 averageEmissionsFactor = averageEmissionsOracle.getAverageEmissionsFactor();

        require(energyProduced > 0, "Energy produced must be greater than zero");
        require(projectEmissionsData < averageEmissionsFactor, "Project emissions too high");
        require(averageEmissionsFactor > 0, "Average emissions factor not updated");

        uint256 co2Reduction = calculateCO2Reduction(energyProduced, averageEmissionsFactor, projectEmissionsData);
        uint256 numberOfTokens = co2Reduction / 1000000; // 1 token per tonne of CO2
        require(numberOfTokens > 0, "Insufficient CO2 reduction for minting");

        project.lastMintedTimestamp = currentTime;

        // Mint tokens
        for (uint256 i = 0; i < numberOfTokens; i++) {
            _safeMint(recipient, tokenCounter);
            tokenCounter++;
        }

        uint256 remainingCO2Reduction = co2Reduction % 1000000;
        uint256 remainingEnergyProduced = remainingCO2Reduction / (averageEmissionsFactor - projectEmissionsData);

        projectEmissionsOracle.updateRemainingEnergy(project.owner, remainingEnergyProduced);

        emit CarbonCreditsMinted(msg.sender, recipient, numberOfTokens, currentTime);
    }

    /**
     * @notice Returns the total number of NFTs (tokens) minted by the contract.
     * @dev This function simply returns the value of the tokenCounter, 
     * which tracks the number of NFTs minted so far.
     * @return The total supply of NFTs (tokens) minted in the contract.
     */
    function totalSupply() public view returns (uint256) {
        return tokenCounter;
    }


    /**
     * @dev Internal function to calculate CO2 reduction.
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
     * @param _owner The address of the project owner.
     * @return True if the project is registered, false otherwise.
     */
    function isProjectRegistered(address _owner) public view returns (bool) {
        return projects[_owner].owner != address(0);
    }
}
