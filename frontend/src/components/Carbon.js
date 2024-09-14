import React, { useState, useEffect } from "react";
import axios from "axios";

const CarbonPage = () => {
  const [carbonCount, setCarbonCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarbonEmissionData = async () => {
      try {
        console.log("Fetching carbon emission data...");
        const response = await axios.get("http://localhost:5000/api/carbon-emissions");

        console.log("API Response:", response.data);

        if (response.data && response.data.data && response.data.data.carbonIntensity) {
          const carbonIntensity = response.data.data.carbonIntensity;
          setCarbonCount(carbonIntensity);
        } else {
          setError("Invalid data structure");
        }
      } catch (err) {
        console.error("Error fetching carbon emission data:", err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchCarbonEmissionData();
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
            <h2>Current Carbon Intensity:</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{carbonCount !== null ? `${carbonCount} gCO2/kWh` : "Data not available"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonPage;
