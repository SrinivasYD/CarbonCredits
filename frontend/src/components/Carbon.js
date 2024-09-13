import React, { useState, useEffect } from "react";

const CarbonPage = () => {
  // State to store the count of carbon emissions
  const [carbonCount, setCarbonCount] = useState(0);

  // useEffect hook to update the carbon count every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCarbonCount(prevCount => prevCount + 1);
    }, 1000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="outer-box">
      <div className="split-page">
        <div className="image-half">
          {/* Add your image here */}
        </div>
        <div className="content-half">
          <h1>What Are Carbon Credits?</h1>
          <p>
            Carbon Credit represents a certain amount of carbon-dioxide or other greenhouse gases that are allocated for an organization to emit. One Carbon Credit equals the elimination of one tonne of CO2 and GHG emissions. An actual reduction in emissions makes a credit tradeable. The organization can trade, sell, or store the excess carbon credits if it emits fewer tonnes of carbon dioxide than it is allowed to. The emissions allowance of the seller is purchased when credit is sold. The Carbon Offset Credits can be classified as Compliance credits, and Voluntary credits.
          </p>
          <div className="carbon-counter">
            <h2>Current Carbon Emissions:</h2>
            <p>{carbonCount} kg</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonPage;
