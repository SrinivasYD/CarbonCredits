import React, { useState, useEffect } from "react";

const DappPage = ({
  account,
  carbonCreditNFT,
  mockProjectEmissionsOracle,
  mockAverageEmissionsOracle,
  isAdmin,
}) => {
  const [projectRegistered, setProjectRegistered] = useState(false);
  const [mintingStatus, setMintingStatus] = useState("");
  const [energyProduced, setEnergyProduced] = useState(null);
  const [projectEmissions, setProjectEmissions] = useState(null);
  const [averageEmissions, setAverageEmissions] = useState(null);
  const [dataHash, setDataHash] = useState("");
  const [oracleDataFetched, setOracleDataFetched] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState(account);
  const [authorizationStatus, setAuthorizationStatus] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [nftDetails, setNftDetails] = useState(null);

  useEffect(() => {
    fetchData();
  }, [
    account,
    carbonCreditNFT,
    mockProjectEmissionsOracle,
    mockAverageEmissionsOracle,
  ]);

  const fetchData = async () => {
    await fetchOracleData();
    await fetchNFTDetails();
    await checkAuthorization();
  };

  const fetchOracleData = async () => {
    if (
      carbonCreditNFT &&
      mockProjectEmissionsOracle &&
      mockAverageEmissionsOracle &&
      account
    ) {
      try {
        const isRegistered = await carbonCreditNFT.methods
          .isProjectRegistered(account)
          .call();
        setProjectRegistered(isRegistered);

        if (isRegistered) {
          const energyProduced = await mockProjectEmissionsOracle.methods
            .getEnergyProduced(account)
            .call();
          const projectEmissions = await mockProjectEmissionsOracle.methods
            .getProjectEmissionsData(account)
            .call();
          const averageEmissionsFactor =
            await mockAverageEmissionsOracle.methods
              .getAverageEmissionsFactor()
              .call();

          setEnergyProduced(BigInt(energyProduced)); // Convert to BigInt
          setProjectEmissions(BigInt(projectEmissions)); // Convert to BigInt
          setAverageEmissions(BigInt(averageEmissionsFactor)); // Convert to BigInt
          setOracleDataFetched(true);
        } else {
          setOracleDataFetched(false);
        }
      } catch (error) {
        console.error(
          "Error fetching oracle data or checking registration:",
          error
        );
      }
    }
  };

  const checkAuthorization = async () => {
    if (mockProjectEmissionsOracle && account) {
      try {
        const isAuthorizedCaller = await mockProjectEmissionsOracle.methods
          .authorizedCallers(carbonCreditNFT.options.address)
          .call();
        setIsAuthorized(isAuthorizedCaller);
      } catch (error) {
        console.error("Error checking contract authorization:", error);
      }
    }
  };

  const fetchNFTDetails = async () => {
    if (carbonCreditNFT && account) {
      try {
        const balance = await carbonCreditNFT.methods.balanceOf(account).call();
        if (BigInt(balance) > BigInt(0)) {
          const tokenId = BigInt(balance) - BigInt(1); // Assuming we want the latest minted NFT
          const owner = await carbonCreditNFT.methods.ownerOf(tokenId).call();
          const tokenURI = await carbonCreditNFT.methods
            .tokenURI(tokenId)
            .call();
          setNftDetails({
            tokenId: tokenId.toString(), // Convert to string for display
            owner,
            tokenURI,
          });
        } else {
          setNftDetails(null);
        }
      } catch (error) {
        console.error("Error fetching NFT details:", error);
      }
    }
  };

  const handleRegisterProject = async () => {
    if (dataHash.length !== 64) {
      alert("Data hash must be a 64-character hex string");
      return;
    }

    try {
      console.log("Registering project...");
      await carbonCreditNFT.methods
        .registerProject(dataHash)
        .send({ from: account });

      setProjectRegistered(true);
      alert("Project registered successfully!");

      fetchData(); // Fetch all data again after registration
    } catch (error) {
      console.error("Error registering project:", error);
    }
  };

  const handleAuthorizeContract = async () => {
    if (isAuthorized) {
      alert("Contract is already authorized.");
      return;
    }

    try {
      setAuthorizationStatus("Authorizing...");
      await mockProjectEmissionsOracle.methods
        .authorizeCaller(carbonCreditNFT.options.address)
        .send({ from: account });

      setAuthorizationStatus("Authorization successful!");
      setIsAuthorized(true);
      alert("CarbonCreditNFT contract authorized successfully!");
    } catch (error) {
      console.error("Error authorizing contract:", error);
      setAuthorizationStatus("Authorization failed.");
    }
  };

  const handleMintNFT = async () => {
    if (!projectRegistered) {
      alert("Project is not registered!");
      return;
    }

    if (!isAuthorized) {
      alert("Contract is not authorized! Please authorize the contract first.");
      return;
    }

    if (energyProduced <= BigInt(0)) {
      alert("Insufficient energy produced to mint an NFT.");
      return;
    }

    const co2Reduction = energyProduced * (averageEmissions - projectEmissions);
    const numberOfTokens = co2Reduction / BigInt(1000000);

    if (numberOfTokens < BigInt(1)) {
      alert("No sufficient CO2 reduction for minting NFTs.");
      return;
    }

    try {
      console.log("Minting NFT...");
      setMintingStatus("Minting...");

      const mintResult = await carbonCreditNFT.methods
        .mintCarbonCredit(recipientAddress)
        .send({ from: account });

      setMintingStatus("Minting successful!");
      alert("NFT minted successfully!");

      fetchData(); // Fetch data again after minting
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMintingStatus("Minting failed.");
    }
  };

  return (
    <div className="dapp-page">
      {account ? (
        <>
          {!projectRegistered ? (
            <section className="register-project">
              <h2 style={{ color: "gold" }}>Register Your Project</h2>
              <p>To participate, please register your green project first.</p>
              <input
                type="text"
                value={dataHash}
                onChange={(e) => setDataHash(e.target.value)}
                placeholder="Enter 64 character data hash"
                className="data-input"
              />
              <button onClick={handleRegisterProject}>Register Project</button>
            </section>
          ) : (
            <>
              <section className="authorize-contract">
                <h2 style={{ color: "gold" }}>
                  Authorize CarbonCreditNFT Contract
                </h2>
                <p>
                  Authorize the CarbonCreditNFT contract to update project data.
                </p>
                <button onClick={handleAuthorizeContract}>
                  Authorize Contract
                </button>
                {authorizationStatus && <p>{authorizationStatus}</p>}
              </section>

              <section className="mint-nft">
                <h2 style={{ color: "gold" }}>Mint Your NFT</h2>
                <p>
                  Once your project is registered and authorized, you can mint
                  NFTs based on your green efforts.
                </p>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter recipient address"
                  className="data-input"
                />
                <button onClick={handleMintNFT}>Mint NFT</button>
                {mintingStatus && <p>{mintingStatus}</p>}
              </section>

              {nftDetails && (
                <section className="nft-details">
                  <h2 style={{ color: "gold" }}>NFT Details</h2>
                  <p>Token ID: {nftDetails.tokenId}</p>
                  <p>Owner: {nftDetails.owner}</p>
                  <p>Token URI: {nftDetails.tokenURI}</p>
                </section>
              )}
            </>
          )}

          {projectRegistered && (
            <section className="oracle-data">
              <h2 style={{ color: "gold" }}>Oracle Data</h2>
              {oracleDataFetched ? (
                <>
                  <p>
                    Energy Produced:{" "}
                    {energyProduced !== null
                      ? `${energyProduced.toString()} kWh`
                      : "No data available"}
                  </p>
                  <p>
                    Project Emissions:{" "}
                    {projectEmissions !== null
                      ? `${projectEmissions.toString()} gCO2/kWh`
                      : "No data available"}
                  </p>
                  <p>
                    Average Emissions Factor:{" "}
                    {averageEmissions !== null
                      ? `${averageEmissions.toString()} gCO2/kWh`
                      : "No data available"}
                  </p>
                </>
              ) : (
                <p>No oracle data available yet.</p>
              )}
            </section>
          )}
        </>
      ) : (
        <p className="disconnected-message">
          Please connect your wallet using the button above to interact with the
          Dapp.
        </p>
      )}
    </div>
  );
};

export default DappPage;
