import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OracleDashboard = ({
  mockProjectEmissionsOracle,
  mockAverageEmissionsOracle,
  account,
  handleWallet,
}) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTrustedSource, setIsTrustedSource] = useState(false);
  const [newTrustedSource, setNewTrustedSource] = useState("");
  const [projectAddress, setProjectAddress] = useState(""); // New state for project address
  const [energyProduced, setEnergyProduced] = useState("");
  const [projectEmissions, setProjectEmissions] = useState("");
  const [averageEmissionsFactor, setAverageEmissionsFactor] = useState("");
  const [oracleStatus, setOracleStatus] = useState("");

  useEffect(() => {
    if (account && mockProjectEmissionsOracle && mockAverageEmissionsOracle) {
      checkIfAdminOrTrustedSource(); // Check if the connected account is an admin or trusted source
    }
  }, [account, mockProjectEmissionsOracle, mockAverageEmissionsOracle]);

  const checkIfAdminOrTrustedSource = async () => {
    try {
      // Check if the connected account is the admin
      const adminAddress = await mockProjectEmissionsOracle.methods
        .admin()
        .call();
      if (adminAddress.toLowerCase() === account.toLowerCase()) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      // Check if the connected account is a trusted source
      const isTrusted = await mockProjectEmissionsOracle.methods
        .trustedSources(account)
        .call();
      setIsTrustedSource(isTrusted);
    } catch (error) {
      console.error("Error checking admin or trusted source status:", error);
    }
  };

  const handleAddTrustedSource = async () => {
    if (!newTrustedSource) {
      toast.error("Please enter a valid address.");
      return;
    }

    try {
      // Add trusted source to the Project Emissions Oracle
      await mockProjectEmissionsOracle.methods
        .addTrustedSource(newTrustedSource)
        .send({ from: account });

      // Add trusted source to the Average Emissions Oracle
      await mockAverageEmissionsOracle.methods
        .addTrustedSource(newTrustedSource)
        .send({ from: account });

      toast.success("Trusted source added successfully to both oracles!");
      setNewTrustedSource(""); // Clear input after successful addition
    } catch (error) {
      console.error("An error occurred while adding a trusted source:", error);
      toast.error("Failed to add trusted source.");
    }
  };

  const handleUpdateOracleData = async () => {
    if (!isTrustedSource) {
      toast.error("Only trusted sources can update oracle data.");
      return;
    }

    if (!projectAddress) {
      toast.error("Please enter a valid project address.");
      return;
    }

    try {
      await mockProjectEmissionsOracle.methods
        .updateProjectData(projectAddress, energyProduced, projectEmissions)
        .send({ from: account });

      // setOracleStatus("Project data updated successfully!");
      toast.success("Project data updated successfully!");
    } catch (error) {
      console.error("Error updating oracle data:", error);
      // setOracleStatus("Failed to update project data.");
      toast.error("Failed to update project data.");
    }
  };

  const handleUpdateAverageEmissions = async () => {
    if (!isTrustedSource) {
      toast.error("Only trusted sources can update the average emissions factor.");
      return;
    }

    try {
      await mockAverageEmissionsOracle.methods
        .updateAverageEmissionsFactor(averageEmissionsFactor)
        .send({ from: account });

      //setOracleStatus("Average emissions factor updated successfully!");
      toast.success("Average emissions factor updated successfully!");
    } catch (error) {
      console.error("Error updating average emissions factor:", error);
      //setOracleStatus("Failed to update average emissions factor.");
      toast.error("Failed to update average emissions factor.");
    }
  };

  return (
    <div className="oracle-dashboard">
      <ToastContainer /> {/* Add this line to render Toast notifications */}
      {!account ? (
        <button onClick={handleWallet} className="connect-wallet">
          Connect Wallet
        </button>
      ) : (
        <>
          {isAdmin && (
            <div className="admin-panel">
              <h2 className="panel-heading">Admin Panel</h2>
              <p>You are logged in as the admin.</p>
              <div className="admin-controls">
                <input
                  type="text"
                  placeholder="Enter trusted source address"
                  value={newTrustedSource}
                  onChange={(e) => setNewTrustedSource(e.target.value)}
                  className="data-input"
                />
                <button
                  onClick={handleAddTrustedSource}
                  className="action-button"
                >
                  Add Trusted Source
                </button>
              </div>
            </div>
          )}

          {isTrustedSource && !isAdmin && (
            <div className="trusted-source-panel">
              <h2 className="panel-heading">Trusted Source Panel</h2>
              <p>You are logged in as a trusted source.</p>
              <div className="oracle-controls">
                {/* Project Address Input */}
                <input
                  type="text"
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  placeholder="Enter Project Owner's Wallet Address"
                  className="data-input"
                />
                {/* Project Emissions Oracle Data */}
                <input
                  type="number"
                  value={energyProduced}
                  onChange={(e) => setEnergyProduced(e.target.value)}
                  placeholder="Energy Produced (kWh)"
                  className="data-input"
                />
                <input
                  type="number"
                  value={projectEmissions}
                  onChange={(e) => setProjectEmissions(e.target.value)}
                  placeholder="Project Emissions (gCO2/kWh)"
                  className="data-input"
                />
                <button
                  onClick={handleUpdateOracleData}
                  className="action-button"
                >
                  Update Project Data
                </button>

                {/* Average Emissions Oracle Data */}
                <input
                  type="number"
                  value={averageEmissionsFactor}
                  onChange={(e) => setAverageEmissionsFactor(e.target.value)}
                  placeholder="Average Emissions Factor (gCO2/kWh)"
                  className="data-input"
                />
                <button
                  onClick={handleUpdateAverageEmissions}
                  className="action-button"
                >
                  Update Average Emissions
                </button>

                {oracleStatus && <p>{oracleStatus}</p>}
              </div>
            </div>
          )}

          {!isAdmin && !isTrustedSource && (
            <div className="non-trusted-message">
              <p>
                You are not a trusted source. Only trusted sources can update
                oracle data.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OracleDashboard;
