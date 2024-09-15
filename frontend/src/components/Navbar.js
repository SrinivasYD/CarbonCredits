import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({
  account,
  handleWallet,
  showDappLink,
  showOracleLink,
  showRegisterLink,
  showApproveLink,
}) => {
  const handleConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        handleWallet(accounts[0]); // Update account in parent
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const handleDisconnect = () => {
    handleWallet(null); // Update account in parent
  };

  const shortenAddress = (address) => {
    return address
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : "Connect Wallet";
  };

  return (
    <nav>
      <div
        className="logo"
        onClick={() => window.location.href = "/"}
        style={{ cursor: "pointer" }}
      >
        CarbonCredit
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/marketplace">NFT Marketplace</Link>
        </li>
        {showDappLink && (
          <li>
            <Link to="/dapp">Dapp</Link>
          </li>
        )}
        {showOracleLink && (
          <li>
            <Link to="/oracle">Oracles</Link>
          </li>
        )}
        {showRegisterLink && (
          <li>
            <Link to="/register">Register Project</Link>
          </li>
        )}
        {showApproveLink && (
          <li>
            <Link to="/approve">Approve Project</Link>
          </li>
          
        )}
         {/* Add FAQ Link */}
         <li>
          <a href="/faq" target="_blank" rel="noopener noreferrer">
            FAQ
          </a>
        </li>
      </ul>
      <button
        className="connect-wallet"
        onClick={account ? handleDisconnect : handleConnect}
      >
        {account ? shortenAddress(account) : "Connect Wallet"}
      </button>
    </nav>
  );
};

export default Navbar;
