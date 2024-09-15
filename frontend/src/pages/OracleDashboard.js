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
  const [removeTrustedSource, setRemoveTrustedSource] = useState("");
  const [deauthorizeCaller, setDeauthorizeCaller] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [energyProduced, setEnergyProduced] = useState("");
  const [projectEmissions, setProjectEmissions] = useState("");
  const [averageEmissionsFactor, setAverageEmissionsFactor] = useState("");
  const [oracleStatus, setOracleStatus] = useState("");

  useEffect(() => {
    if (account && mockProjectEmissionsOracle && mockAverageEmissionsOracle) {
      checkIfAdminOrTrustedSource();
    }
  }, [account, mockProjectEmissionsOracle, mockAverageEmissionsOracle]);

  const checkIfAdminOrTrustedSource = async () => {
    try {
      const adminAddress = await mockProjectEmissionsOracle.methods
        .admin()
        .call();
      setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());

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
      await mockProjectEmissionsOracle.methods
        .addTrustedSource(newTrustedSource)
        .send({ from: account });
      await mockAverageEmissionsOracle.methods
        .addTrustedSource(newTrustedSource)
        .send({ from: account });
      toast.success("Trusted source added successfully to both oracles!");
      setNewTrustedSource("");
    } catch (error) {
      toast.error("Failed to add trusted source.");
    }
  };

  const handleRemoveTrustedSource = async () => {
    if (!removeTrustedSource) {
      toast.error("Please enter a valid address.");
      return;
    }
    try {
      await mockProjectEmissionsOracle.methods
        .removeTrustedSource(removeTrustedSource)
        .send({ from: account });
      toast.success("Trusted source removed successfully!");
      setRemoveTrustedSource("");
    } catch (error) {
      toast.error("Failed to remove trusted source.");
    }
  };

  const handleDeauthorizeCaller = async () => {
    if (!deauthorizeCaller) {
      toast.error("Please enter a valid address.");
      return;
    }
    try {
      await mockProjectEmissionsOracle.methods
        .deauthorizeCaller(deauthorizeCaller)
        .send({ from: account });
      toast.success("Caller deauthorized successfully!");
      setDeauthorizeCaller("");
    } catch (error) {
      toast.error("Failed to deauthorize caller.");
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
      toast.success("Project data updated successfully!");
    } catch (error) {
      toast.error("Failed to update project data.");
    }
  };

  const handleUpdateAverageEmissions = async () => {
    if (!isTrustedSource) {
      toast.error(
        "Only trusted sources can update the average emissions factor."
      );
      return;
    }
    try {
      await mockAverageEmissionsOracle.methods
        .updateAverageEmissionsFactor(averageEmissionsFactor)
        .send({ from: account });
      toast.success("Average emissions factor updated successfully!");
    } catch (error) {
      toast.error("Failed to update average emissions factor.");
    }
  };

  return (
    <div className="oracle-dashboard">
      <ToastContainer />
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

              {/* Add Trusted Source */}
              <div className="input-button-wrapper">
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

              {/* Remove Trusted Source */}
              <div className="input-button-wrapper">
                <input
                  type="text"
                  placeholder="Enter address to remove as trusted source"
                  value={removeTrustedSource}
                  onChange={(e) => setRemoveTrustedSource(e.target.value)}
                  className="data-input"
                />
                <button
                  onClick={handleRemoveTrustedSource}
                  className="action-button"
                >
                  Remove Trusted Source
                </button>
              </div>

              {/* Deauthorize Caller */}
              <div className="input-button-wrapper">
                <input
                  type="text"
                  placeholder="Enter address to deauthorize caller"
                  value={deauthorizeCaller}
                  onChange={(e) => setDeauthorizeCaller(e.target.value)}
                  className="data-input"
                />
                <button
                  onClick={handleDeauthorizeCaller}
                  className="action-button"
                >
                  Deauthorize Caller
                </button>
              </div>
            </div>
          )}

          {isTrustedSource && !isAdmin && (
            <div className="trusted-source-panel">
              <h2 className="panel-heading">Trusted Source Panel</h2>
              <p>You are logged in as a trusted source.</p>
              <div className="oracle-controls">
                <input
                  type="text"
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  placeholder="Enter Project Owner's Wallet Address"
                  className="data-input1"
                />
                <input
                  type="number"
                  value={energyProduced}
                  onChange={(e) => setEnergyProduced(e.target.value)}
                  placeholder="Energy Produced (kWh)"
                  className="data-input1"
                />
                <input
                  type="number"
                  value={projectEmissions}
                  onChange={(e) => setProjectEmissions(e.target.value)}
                  placeholder="Project Emissions (gCO2/kWh)"
                  className="data-input1"
                />
                <button
                  onClick={handleUpdateOracleData}
                  className="action-button"
                >
                  Update Project Data
                </button>

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
