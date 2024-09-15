import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css"; // Toastify CSS
import { toast, ToastContainer } from 'react-toastify'; 
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import CarbonCreditNFTMarketplaceABI from "../contracts/CarbonCreditNFTMarketplace.json";
import CarbonCreditNFTABI from "../contracts/CarbonCreditNFT.json";
import contractAddresses from "../contracts/contract-addresses.json";
import "../styles/Marketplace.css"; // CSS for styling

import NFT1 from "../nft-images/NFT1.jpg";
import NFT2 from "../nft-images/NFT2.png";
import NFT3 from "../nft-images/NFT3.png";
import NFT4 from "../nft-images/NFT4.jpg";  // Adjust path according to your project structure
import NFT5 from "../nft-images/NFT5.png";
import NFT6 from "../nft-images/NFT6.png";
import Testimonials from '../components/Testimonials';


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
      const isApproved = await nftContract.isApprovedForAll(
        account,
        marketplaceContract.target
      );

      if (!isApproved) {
        const approvalTx = await nftContract.setApprovalForAll(
          marketplaceContract.target,
          true
        );
        await approvalTx.wait();
        toast.success("Marketplace approved to handle all NFTs");
      }

      const tx = await marketplaceContract.listNFT(tokenId, parseEther(price));
      await tx.wait();
      toast.success("NFT listed successfully!");

      await loadBlockchainData();
    } catch (error) {
      toast.error("Listing failed: " + error.message);
      console.error("Listing failed:", error);
    }
  };

  const buyNFT = async (tokenId, price) => {
    try {
      const tx = await marketplaceContract.purchaseNFT(tokenId, {
        value: parseEther(price),
      });
      await tx.wait();
      toast.success("NFT purchased successfully!");
      loadBlockchainData();
    } catch (error) {
      toast.error("Transaction failed: " + error.message);
      console.error("Transaction failed:", error);
    }
  };



  const trendingNFTs = [
    { rank: 1, collection: "Rainforest Conservation", floorPrice: "2.5 ETH", volume: "300 ETH", image: NFT1 },
    { rank: 2, collection: "Ocean Cleanup Project", floorPrice: "1.8 ETH", volume: "220 ETH", image: NFT2 },
    { rank: 3, collection: "Wind Energy Credits", floorPrice: "1.2 ETH", volume: "180 ETH", image: NFT3 },
    { rank: 4, collection: "Solar Power Projects", floorPrice: "2.0 ETH", volume: "250 ETH", image: NFT4 },
    { rank: 5, collection: "Reforestation Program", floorPrice: "1.5 ETH", volume: "200 ETH", image: NFT5 },
    { rank: 6, collection: "Waste Recycling Initiative", floorPrice: "1.1 ETH", volume: "150 ETH", image: NFT6 },
  ];


  if (loading) return <div>Loading Marketplace...</div>;


  return (
    <div className="nft-marketplace">
      <ToastContainer />
      <div className="hero-section">
        <h1 className="hero-heading">Trade Carbon Credits with NFTs to Offset Your Carbon Footprint</h1>
        <p className="hero-subheading">Join the leading marketplace for eco-friendly, sustainable NFTs and carbon credits.</p>
      </div>

      <div className="trending-section">
        <h2 style={{ color: '#ffffff' }}>Top Trending NFTs</h2>
        <table className="trending-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Collection</th>
              <th>Floor Price</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {trendingNFTs.map((nft, index) => (
              <tr key={index}>
                <td>{nft.rank}</td>
                <td>
                  <img src={nft.image} alt={`Trending NFT ${nft.rank}`} className="trending-image" />
                  {nft.collection}
                </td>
                <td>{nft.floorPrice}</td>
                <td>{nft.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Section 1: Listed NFTs for Sale with Horizontal Scroll */}
      {/* Section 1: Listed NFTs for Sale */}
      <div className="nft-section">
        <h2 style={{ color: '#ffffff' }}>Buy NFTs</h2>
        <div className="nft-scrollbar-vertical">
          {nftsForSale.length === 0 ? (
            <div style={{ color: '#ffffff'}} className="nonft" >No NFTs available for sale</div>
          ) : (
            <div className="nft-scrollbar">
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
        <h2 style={{ color: '#ffffff' }}>Your NFTs</h2>
        <div className="nft-scrollbar">
          {ownedNfts.length === 0 ? (
            <div style={{ color: '#ffffff'}} className="nonft"  >You don't own any NFTs</div>
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
      <Testimonials />
    </div>
  );
};
// export the marketplace page

export default MarketplacePage;
