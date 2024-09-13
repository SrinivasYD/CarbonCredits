
import React, { useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin);

const ProjectPlan = () => {
  const chartRef = useRef(null);

  const data = {
    labels: ["1980", "1990", "2000", "2010", "2020", "2030"],
    datasets: [
      {
        label: "Carbon Emission",
        data: [21.2, 22.4, 25.6, 33.1, 31.5, 29.0], // Approximate values for carbon emissions (GtCO2)
        backgroundColor: "rgba(2, 171, 8, 0.8)", // More vibrant color with 80% opacity
        borderColor: "#02ab08", // Stronger border color
        borderWidth: 2, // Increase border width for visibility
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} GtCO2`,
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Year",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Carbon Emissions (GtCO2)",
        },
      },
    },
  };

  // Function to reset zoom on mouse leave
  const handleMouseLeave = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom(); // Reset zoom when mouse leaves the chart
    }
  };

  return (
    <section className="project-plan" onMouseLeave={handleMouseLeave}>
      <div className="chart-container">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
      <div className="description">
        <h2>Carbon Emission Over Decades</h2>
        <p>
          This bar chart illustrates the trend of global carbon emissions over the past few decades and projections for the near future. 
          The data shows an increasing trend, highlighting the urgent need for effective climate action and sustainability measures.
        </p>
      </div>
    </section>
  );
};

export default ProjectPlan;
