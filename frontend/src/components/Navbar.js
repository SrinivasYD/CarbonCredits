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
  const shortenAddress = (address) => {
    return address
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : "Connect Wallet";
  };

  const navigateToHome = () => {
    window.location.href = "/"; // Assuming the homepage route is '/'
  };

  return (
    <nav>
      <div
        className="logo"
        onClick={navigateToHome}
        style={{ cursor: "pointer" }}
      >
        CarbonCredit
      </div>
      <ul className="nav-links">
        <li>
          <a href="/marketplace" target="_blank" rel="noopener noreferrer">
            NFT Marketplace
          </a>
        </li>
        {showDappLink && (
          <li>
            <a href="/dapp" target="_blank" rel="noopener noreferrer">
              Dapp
            </a>
          </li>
        )}
        {showOracleLink && (
          <li>
            <a href="/oracle" target="_blank" rel="noopener noreferrer">
              Oracles
            </a>
          </li>
        )}
        {showRegisterLink && (
          <li>
            <a href="/register" target="_blank" rel="noopener noreferrer">
              Register Project
            </a>
          </li>
        )}
        {showApproveLink && (
          <li>
            <a href="/approve" target="_blank" rel="noopener noreferrer">
              Approve Project
            </a>
          </li>
        )}
      </ul>
      <button className="connect-wallet" onClick={handleWallet}>
        {account ? shortenAddress(account) : "Connect Wallet"}
      </button>
    </nav>
  );
};

export default Navbar;
