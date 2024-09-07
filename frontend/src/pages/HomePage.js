import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Team from "../components/Team";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <>
      <Hero />
      <About />
      <Team />
      <Footer />
    </>
  );
};

export default HomePage;
