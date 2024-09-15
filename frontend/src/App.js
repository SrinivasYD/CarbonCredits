import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Web3 from "web3";
import HomePage from "./pages/HomePage";
import DappPage from "./pages/DappPage";
import OracleDashboard from "./pages/OracleDashboard";
import RegisterProject from "./pages/RegisterProject";
import ApproveProject from "./pages/ApproveProject";
import MarketplacePage from "./pages/MarketplacePage";
import Navbar from "./components/Navbar";
import "./styles/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

// Import ABI and contract addresses
import MockProjectEmissionsOracleArtifact from "./contracts/MockProjectEmissionsOracle.json";
import MockAverageEmissionsOracleArtifact from "./contracts/MockAverageEmissionsOracle.json";
import CarbonCreditNFTArtifact from "./contracts/CarbonCreditNFT.json";
import ProjectApprovalArtifact from "./contracts/ProjectApproval.json";
import contractAddresses from "./contracts/contract-addresses.json";
import FAQPage from "./pages/FAQPage";

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [carbonCreditNFT, setCarbonCreditNFT] = useState(null);
  const [projectApproval, setProjectApproval] = useState(null);
  const [mockProjectEmissionsOracle, setMockProjectEmissionsOracle] =
    useState(null);
  const [mockAverageEmissionsOracle, setMockAverageEmissionsOracle] =
    useState(null);
  const [approverAddress, setApproverAddress] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
      });

      // Load contract instances
      const carbonCreditNFTInstance = new web3Instance.eth.Contract(
        CarbonCreditNFTArtifact.abi,
        contractAddresses.CarbonCreditNFT
      );
      setCarbonCreditNFT(carbonCreditNFTInstance);

      const projectApprovalInstance = new web3Instance.eth.Contract(
        ProjectApprovalArtifact.abi,
        contractAddresses.ProjectApproval
      );
      setProjectApproval(projectApprovalInstance);

      const mockProjectEmissionsOracleInstance = new web3Instance.eth.Contract(
        MockProjectEmissionsOracleArtifact.abi,
        contractAddresses.MockProjectEmissionsOracle
      );
      setMockProjectEmissionsOracle(mockProjectEmissionsOracleInstance);

      const mockAverageEmissionsOracleInstance = new web3Instance.eth.Contract(
        MockAverageEmissionsOracleArtifact.abi,
        contractAddresses.MockAverageEmissionsOracle
      );
      setMockAverageEmissionsOracle(mockAverageEmissionsOracleInstance);

      // Fetch the approver's address from the ProjectApproval contract
      projectApprovalInstance.methods
        .approver()
        .call()
        .then((approver) => setApproverAddress(approver));
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", setAccount);
      }
    };
  }, []);

  const handleWallet = async (account) => {
    if (account === null) {
      setAccount(null);
      return;
    }
    
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <Router>
      <AppContent
        account={account}
        handleWallet={handleWallet}
        carbonCreditNFT={carbonCreditNFT}
        projectApproval={projectApproval}
        mockProjectEmissionsOracle={mockProjectEmissionsOracle}
        mockAverageEmissionsOracle={mockAverageEmissionsOracle}
        approverAddress={approverAddress}
      />
    </Router>
  );
}

function AppContent({
  account,
  handleWallet,
  carbonCreditNFT,
  projectApproval,
  mockProjectEmissionsOracle,
  mockAverageEmissionsOracle,
  approverAddress,
}) {
  const location = useLocation();
  const showDappLink = location.pathname !== "/dapp";
  const showOracleLink = location.pathname !== "/oracle";
  const showRegisterLink = location.pathname !== "/register";
  const showApproveLink =
    account?.toLowerCase() === approverAddress?.toLowerCase() &&
    location.pathname !== "/approve";

  return (
    <div className="App">
      <Navbar
        account={account}
        handleWallet={handleWallet}
        showDappLink={showDappLink}
        showOracleLink={showOracleLink}
        showRegisterLink={showRegisterLink}
        showApproveLink={showApproveLink}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dapp"
          element={
            <DappPage
              account={account}
              carbonCreditNFT={carbonCreditNFT}
              mockProjectEmissionsOracle={mockProjectEmissionsOracle}
              mockAverageEmissionsOracle={mockAverageEmissionsOracle}
            />
          }
        />
        <Route
          path="/oracle"
          element={
            <OracleDashboard
              account={account}
              handleWallet={handleWallet}
              mockProjectEmissionsOracle={mockProjectEmissionsOracle}
              mockAverageEmissionsOracle={mockAverageEmissionsOracle}
            />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterProject
              account={account}
              projectApproval={projectApproval}
            />
          }
        />
        <Route
          path="/approve"
          element={
            <ApproveProject
              account={account}
              projectApproval={projectApproval}
            />
          }
        />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/faq" element={<FAQPage />} />  
      </Routes>
    </div>
  );
}

export default App;
