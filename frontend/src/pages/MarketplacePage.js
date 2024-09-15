import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import CarbonCreditNFTMarketplaceABI from "../contracts/CarbonCreditNFTMarketplace.json";
import CarbonCreditNFTABI from "../contracts/CarbonCreditNFT.json";
import contractAddresses from "../contracts/contract-addresses.json";
import "../styles/Marketplace.css"; // CSS for styling

const MarketplacePage = () => {
  const [nftsForSale, setNftsForSale] = useState([]); // NFTs listed for sale
  const [ownedNfts, setOwnedNfts] = useState([]); // NFTs owned by the connected wallet
  const [loading, setLoading] = useState(true);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  // Load the NFT and blockchain data
  const loadBlockchainData = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum); // Use BrowserProvider for ethers v6
      const signer = await provider.getSigner();
      setSigner(signer);

      const accountAddress = await signer.getAddress();
      setAccount(accountAddress);

      const { CarbonCreditNFTMarketplace, CarbonCreditNFT } = contractAddresses;

      // Initialize contracts using the fetched addresses
      const marketplace = new Contract(
        CarbonCreditNFTMarketplace,
        CarbonCreditNFTMarketplaceABI.abi,
        signer
      );
      const nft = new Contract(CarbonCreditNFT, CarbonCreditNFTABI.abi, signer);

      setMarketplaceContract(marketplace);
      setNftContract(nft);

      // Fetch total supply of NFTs
      const totalSupply = await nft.totalSupply();
      const nftsForSaleList = [];
      const ownedNftsList = [];

      // Loop through token IDs to check listings and ownership
      for (let i = 0; i < totalSupply; i++) {
        try {
          const owner = await nft.ownerOf(i);
          const imageUrl = `https://plus.unsplash.com/premium_photo-1663950774974-956d44f6aa53?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z3JlZW5lcnl8ZW58MHx8MHx8fDA%3D`;

          // Check if the NFT is listed in the marketplace
          const listing = await marketplace.listings(i);

          if (listing && listing.price > 0 && !listing.isSold) {
            const originalOwner = listing.seller;

            if (originalOwner.toLowerCase() === accountAddress.toLowerCase()) {
              // For "Your NFTs": If it's the current user's NFT, display it with "Listed" status
              ownedNftsList.push({
                tokenId: i,
                isListed: true,
                listedPrice: formatEther(listing.price),
                imageUrl,
              });
            } else {
              // For "Buy NFTs": Show the NFT for sale by other owners
              nftsForSaleList.push({
                tokenId: i,
                owner: originalOwner, // Show original seller as the owner
                price: formatEther(listing.price),
                imageUrl,
              });
            }
          } else {
            // For "Your NFTs": Show unlisted NFTs owned by the user
            if (owner.toLowerCase() === accountAddress.toLowerCase()) {
              ownedNftsList.push({
                tokenId: i,
                isListed: false,
                imageUrl,
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching data for token ${i}:`, error);
          continue;
        }
      }

      setNftsForSale(nftsForSaleList);
      setOwnedNfts(ownedNftsList);
      setLoading(false);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };

  // UseEffect to load data initially
  useEffect(() => {
    loadBlockchainData();

    // Listen to MetaMask account change and reload data
    window.ethereum.on("accountsChanged", (accounts) => {
      loadBlockchainData();
    });

    return () => {
      window.ethereum.removeListener("accountsChanged", loadBlockchainData);
    };
  }, []);

  // Function to approve the marketplace to handle all NFTs and list the NFT
  const setApprovalForAllAndListNFT = async (tokenId, price) => {
    try {
      // Check if approval is already given to the marketplace for all NFTs
      const isApproved = await nftContract.isApprovedForAll(
        account,
        marketplaceContract.target
      );

      // If not approved, set approval for all NFTs
      if (!isApproved) {
        const approvalTx = await nftContract.setApprovalForAll(
          marketplaceContract.target,
          true
        );
        await approvalTx.wait();
        console.log(`Marketplace approved to handle all NFTs`);
      }

      // Convert price to wei format before listing
      const tx = await marketplaceContract.listNFT(tokenId, parseEther(price));
      await tx.wait();
      alert("NFT listed successfully!");

      // Reload NFT data after listing
      await loadBlockchainData(); // Refresh the NFT data
    } catch (error) {
      console.error("Listing failed:", error);
    }
  };

  const buyNFT = async (tokenId, price) => {
    try {
      const tx = await marketplaceContract.purchaseNFT(tokenId, {
        value: parseEther(price),
      });
      await tx.wait();
      alert("NFT purchased successfully!");
      // Re-fetch the blockchain data after the transaction is complete
      loadBlockchainData(); // Call the function that loads the NFT data
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  if (loading) return <div>Loading Marketplace...</div>;

  return (
    <div className="marketplace-container">
      <h1>NFT Marketplace</h1>

      {/* Section 1: Listed NFTs for Sale with Horizontal Scroll */}
      {/* Section 1: Listed NFTs for Sale */}
      <div className="nft-section">
        <h2>Buy NFTs</h2>
        <div className="nft-scrollbar">
          {nftsForSale.length === 0 ? (
            <div>No NFTs available for sale</div>
          ) : (
            <div className="nft-card-container">
              {nftsForSale.map((nft) => (
                <div key={nft.tokenId} className="nft-card">
                  <img src={nft.imageUrl} alt={`NFT ${nft.tokenId}`} />
                  <div className="nft-info">
                    <h3>NFT #{nft.tokenId}</h3>
                    <p>Owner: {nft.owner}</p>
                    <p>Price: {nft.price} ETH</p>

                    {/* Make sure the button is inside the card */}
                    {nft.owner.toLowerCase() !== account.toLowerCase() ? (
                      <button
                        className="buy-button"
                        onClick={() => buyNFT(nft.tokenId, nft.price)}
                      >
                        Buy NFT
                      </button>
                    ) : (
                      <p>You own this NFT</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Owned NFTs with Horizontal Scroll */}
      <div className="nft-section">
        <h2>Your NFTs</h2>
        <div className="nft-scrollbar">
          {ownedNfts.length === 0 ? (
            <div>You don't own any NFTs</div>
          ) : (
            ownedNfts.map((nft) => (
              <div key={nft.tokenId} className="nft-card">
                <img src={nft.imageUrl} alt={`NFT ${nft.tokenId}`} />
                <div className="nft-info">
                  <h3>NFT #{nft.tokenId}</h3>
                  {nft.isListed ? (
                    <p>Listed for {nft.listedPrice} ETH</p>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="Enter price in ETH"
                        id={`price-${nft.tokenId}`}
                      />
                      <button
                        onClick={() =>
                          setApprovalForAllAndListNFT(
                            nft.tokenId,
                            document.getElementById(`price-${nft.tokenId}`)
                              .value
                          )
                        }
                      >
                        List NFT for Sale
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
