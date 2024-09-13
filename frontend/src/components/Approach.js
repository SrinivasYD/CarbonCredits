import React from 'react';
import { FaUserFriends, FaGlobe, FaLeaf, FaHandHoldingUsd, FaBalanceScale } from 'react-icons/fa';

const Approach = () => {
  return (
    <div className="approach-container">
      <div className="approach-content">
        <h2>Our Approach</h2>
        <p>
          Our approach brings together innovation, decentralization, and eco-friendliness, making sure that every individual has access to technology that drives positive change.
        </p>

        <div className="approach-icons">
          <div className="icon-item">
            <FaUserFriends className="icon" />
            <p>Access</p>
          </div>
          <div className="icon-item">
            <FaGlobe className="icon" />
            <p>Decentralization</p>
          </div>
          <div className="icon-item">
            <FaLeaf className="icon" />
            <p>Eco-Friendly</p>
          </div>
          <div className="icon-item">
            <FaHandHoldingUsd className="icon" />
            <p>Incentivized NFTs</p>
          </div>
          <div className="icon-item">
            <FaBalanceScale className="icon" />
            <p>Equity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Approach;
