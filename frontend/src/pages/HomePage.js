import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Team from "../components/Team";
import Footer from "../components/Footer";
import Approach from "../components/Approach";
import ProjectPlan from "../components/ProjectPlan";
import CarbonPage from "../components/CarbonPage";
import Carbon from "../components/Carbon";

const HomePage = () => {
  return (
    <>
      <Hero />
      <Carbon />
      <ProjectPlan />
      <Approach /> 
      <CarbonPage />
      <About />
      <Team />
      <Footer />
    </>
  );
};

export default HomePage;
