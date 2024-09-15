// Testimonials.js
import React from 'react';
import Slider from 'react-slick';
import '../styles/Marketplace.css'; // Import your custom CSS file

const Testimonials = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="testimonials-section">
      <h2 style={{ color: '#ffffff' }}>What Our Users Say</h2>
      <Slider {...settings} className="testimonials-carousel">
        <div className="testimonial">
          <p>"This marketplace made it so easy for my company to offset its carbon footprint and invest in a sustainable future." - <strong>John D., CEO of GreenTech</strong></p>
        </div>
        <div className="testimonial">
          <p>"I love the transparency and traceability that blockchain brings to carbon credits. It feels great to contribute to eco-friendly projects!" - <strong>Sarah L., NFT Investor</strong></p>
        </div>
        <div className="testimonial">
          <p>"The ability to support sustainable projects and trade carbon credits seamlessly has been a game-changer for our organization." - <strong>Emily W., Sustainability Manager</strong></p>
        </div>
        <div className="testimonial">
          <p>"Being a part of this platform has allowed me to support environmental initiatives while participating in the NFT space." - <strong>Michael T., Green Investor</strong></p>
        </div>
        <div className="testimonial">
          <p>"The integration of blockchain technology with carbon credits provides a new level of accountability and trust in sustainability efforts." - <strong>Jessica P., Eco-entrepreneur</strong></p>
        </div>
        <div className="testimonial">
          <p>"I appreciate the user-friendly interface and comprehensive data provided by this marketplace. It makes tracking my contributions easy." - <strong>David R., Environmental Activist</strong></p>
        </div>
      </Slider>
    </div>
  );
};

export default Testimonials;

