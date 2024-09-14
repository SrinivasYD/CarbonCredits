// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IProjectEmissionsOracle.sol";

/**
 * @title MockProjectEmissionsOracle
 * @dev Mock implementation of the IProjectEmissionsOracle interface for testing purposes.
 */
contract MockProjectEmissionsOracle is IProjectEmissionsOracle {
    address public admin;
    mapping(address => bool) public trustedSources;
    mapping(address => bool) public registeredProjects;
    mapping(address => uint256) public energyProducedData;
    mapping(address => uint256) public projectEmissionsData;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyTrustedSource() {
        require(trustedSources[msg.sender], "Only trusted sources can call this function");
        _;
    }

    mapping(address => bool) public authorizedCallers;

    constructor() {
        admin = msg.sender;
    }

    function addTrustedSource(address source) external onlyAdmin {
        trustedSources[source] = true;
    }

    function removeTrustedSource(address source) external onlyAdmin {
        trustedSources[source] = false;
    }

    function registerProject(address project) external override {
        require(!registeredProjects[project], "Project is already registered");
    
        // Register the project
        registeredProjects[project] = true;
    
        // Automatically authorize the project as a caller
        authorizedCallers[project] = true;
    }

    function updateProjectData(
        address project,
        uint256 energyProduced,
        uint256 emissions
    ) external override onlyTrustedSource {
        require(registeredProjects[project], "Project not registered");

        // Instead of overwriting, add the new energy produced to the existing energy
        energyProducedData[project] += energyProduced;
        projectEmissionsData[project] = emissions; // This can be overwritten as it represents the new emissions data
    }

    function getProjectEmissionsData(address project) external view override returns (uint256) {
        require(registeredProjects[project], "Project not registered");
        return projectEmissionsData[project];
    }

    function getEnergyProduced(address project) external view override returns (uint256) {
        require(registeredProjects[project], "Project not registered");
        return energyProducedData[project];
    }

    function updateRemainingEnergy(address project, uint256 remainingEnergy) external override {
        require(registeredProjects[project], "Project not registered");
        require(authorizedCallers[project], "Not an authorized caller");
        energyProducedData[project] = remainingEnergy; // Directly set the remaining energy
    }

    function deauthorizeCaller(address caller) external onlyAdmin {
        authorizedCallers[caller] = false;
    }
}
