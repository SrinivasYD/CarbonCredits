import React from "react"; 

const CarbonPage = () => {
  return (
    <div className="carbon-page">
      <h1 className="carbon-title">Carbon Pricing Mechanism</h1>
      
      <div className="carbon-image-grid">
        <div className="carbon-image-card">
          <img src="/home6.jpg" alt="Carbon Tax" className="carbon-image" />
          <div className="carbon-card-content">
            <h2>Carbon Tax</h2>
            <p>
              Taxes are popular with governments as they generate income and are also simple to administer. These taxes are an excellent control measure as well. If you put more taxes on anything, the price goes up; if the price goes up, fewer people will be able to buy the thing or utilize the service. Likewise, imposing more taxes can lead to less carbon emissions.
            </p>
          </div>
        </div>

        <div className="carbon-image-card">
          <img src="/co2.png" alt="Emission Trading System" className="carbon-image" />
          <div className="carbon-card-content">
            <h2>Emission Trading System</h2>
            <p>
              Creation of a CO2 emissions trading system creates a basic carbon market. Price determination can be left to the market, at least within certain bounds. In addition, an ETS enables regulatory agencies to launch a starting price that rises over time to encourage decarbonization.
            </p>
          </div>
        </div>

        <div className="carbon-image-card">
          <img src="/home.jpg" alt="Carbon Offset Mechanism" className="carbon-image" />
          <div className="carbon-card-content">
            <h2>Carbon Offset Mechanism</h2>
            <p>
              The carbon offset mechanism allows companies and individuals to invest in environmental projects worldwide to balance out their carbon footprints. By funding projects that reduce carbon emissions, they can offset the emissions they produce, creating a more sustainable future.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonPage;
