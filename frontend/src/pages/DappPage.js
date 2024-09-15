import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table } from "react-bootstrap";

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
  const [nftDetails, setNftDetails] = useState(null);
  const [mintedNFTs, setMintedNFTs] = useState([]);

  useEffect(() => {
    if (carbonCreditNFT) {
      fetchData();
      fetchMintedNFTs(); // Fetch past NFTs minted from blockchain events
    }
  }, [
    account,
    carbonCreditNFT,
    mockProjectEmissionsOracle,
    mockAverageEmissionsOracle,
  ]);

  const fetchData = async () => {
    await fetchOracleData();
    await fetchNFTDetails();
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
        toast.error("Error fetching oracle data or checking registration.");
        console.error(
          "Error fetching oracle data or checking registration:",
          error
        );
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
          setNftDetails({
            tokenId: tokenId.toString(), // Convert to string for display
            owner,
          });
        } else {
          setNftDetails(null);
        }
      } catch (error) {
        toast.error("Error fetching NFT details.");
        console.error("Error fetching NFT details:", error);
      }
    }
  };

  const fetchMintedNFTs = async () => {
    try {
      console.log("Fetching minted NFTs from blockchain...");
      const events = await carbonCreditNFT.getPastEvents(
        "CarbonCreditsMinted",
        {
          fromBlock: 0,
          toBlock: "latest",
        }
      );

      const nfts = events.map((event) => ({
        owner: event.returnValues.owner,
        recipient: event.returnValues.recipient,
        numberOfTokens: event.returnValues.numberOfTokens.toString(), // Convert BigInt to string
        timestamp: new Date(
          Number(event.returnValues.timestamp) * 1000
        ).toLocaleString(), // Convert BigInt timestamp to number and then to Date
      }));

      setMintedNFTs(nfts); // Store the NFTs in state to display later
      console.log("Minted NFTs fetched:", nfts);
    } catch (error) {
      toast.error("Error fetching minted NFTs.");
      console.error("Error fetching minted NFTs:", error);
    }
  };

  const handleRegisterProject = async () => {
    if (!/^0x[a-fA-F0-9]{64}$/.test(dataHash)) {
      toast.warning(
        "Data hash must be a valid 64-character hex string prefixed with 0x"
      );
      return;
    }

    try {
      console.log("Registering project with dataHash:", dataHash);
      await carbonCreditNFT.methods
        .registerProject(dataHash)
        .send({ from: account });

      setProjectRegistered(true);
      toast.success("Project registered successfully!");

      fetchData(); // Fetch all data again after registration
    } catch (error) {
      toast.error("Error registering project.");
      console.error("Error registering project:", error);
    }
  };

  const handleMintNFT = async () => {
    if (!projectRegistered) {
      toast.warning("Project is not registered!");
      return;
    }

    try {
      console.log("Minting NFT...");
      setMintingStatus("Minting...");
      toast.info("Minting NFT...");

      const mintResult = await carbonCreditNFT.methods
        .mintCarbonCredit(recipientAddress)
        .send({ from: account });

      setMintingStatus("Minting successful!");
      toast.success("NFT minted successfully!");

      fetchData(); // Fetch data again after minting
      fetchMintedNFTs(); // Fetch updated minted NFTs after minting
    } catch (error) {
      toast.error("Error minting NFT.");
      console.error("Error minting NFT:", error);
      setMintingStatus("Minting failed.");
    }
  };

  return (
    <div className="dapp-page">
      <ToastContainer />
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
              <section className="mint-nft">
                <h2 style={{ color: "gold" }}>Mint Your NFT</h2>
                <p>
                  Once your project is registered, you can mint NFTs based on
                  your green efforts.
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

              {/* Minted NFTs Table */}
              <section className="minted-nfts">
                <h2 style={{ color: "gold" }}>Minted NFTs</h2>
                {mintedNFTs.length > 0 ? (
                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    className="glowing-table mt-4"
                  >
                    <thead>
                      <tr>
                        <th>Owner</th>
                        <th>Recipient</th>
                        <th>Number of Tokens</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mintedNFTs.map((nft, index) => (
                        <tr key={index}>
                          <td>{nft.owner}</td>
                          <td>{nft.recipient}</td>
                          <td>{nft.numberOfTokens}</td>
                          <td>{nft.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>No NFTs have been minted yet.</p>
                )}
              </section>
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
                      ? `${projectEmissions.toString()} tons CO2/kWh`
                      : "No data available"}
                  </p>
                  <p>
                    Average Emissions Factor:{" "}
                    {averageEmissions !== null
                      ? `${averageEmissions.toString()} tons CO2/kWh`
                      : "No data available"}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: "1.5em", color: "#ffcc00" }}>
                  No data available. Register your project to fetch oracle data.
                </p>
              )}
            </section>
          )}
        </>
      ) : (
        <p style={{ fontSize: "1.5em", color: "#ffcc00" }}>
          Please connect your wallet to interact with the Dapp.
        </p>
      )}
    </div>
  );
};

export default DappPage;
