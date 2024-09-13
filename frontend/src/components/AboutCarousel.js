import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faSeedling, faGlobe, faLink } from '@fortawesome/free-solid-svg-icons';

const aboutItems = [
  {
    title: <><FontAwesomeIcon icon={faRocket} style={{ marginRight: '12px', color: '#f5c100' }}  /> Our Mission</>,
    description: "Our mission is to leverage blockchain to manage and trade carbon credits, ensuring transparency and efficiency in the fight against climate change."
  },
  {
    title: <><FontAwesomeIcon icon={faSeedling}  style={{ marginRight: '12px', color: '#f5c100' }} /> Empowering Renewable Energy</>,
    description: "We empower renewable energy projects by making it easier to track and trade carbon credits, ensuring that every contribution to sustainability is accounted for."
  },
  {
    title: <><FontAwesomeIcon icon={faGlobe} style={{ marginRight: '12px', color: '#f5c100' }}  /> Supporting Reforestation</>,
    description: "Our platform supports global reforestation efforts, making it possible to fund projects that help restore forests and absorb carbon dioxide."
  },
  {
    title: <><FontAwesomeIcon icon={faLink} style={{ marginRight: '12px', color: '#f5c100' }}  /> Innovative Carbon Credit Trading</>,
    description: "We provide an innovative platform for carbon credit trading, ensuring that credits are traded securely and transparently using blockchain technology."
  }
];

const AboutCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {aboutItems.map((item, index) => (
          <div key={index} className="carousel-item">
            <div className="about-carousel-content">
              <h2 style={{ color: '#02ab08'  , textShadow: 'none', fontSize: '23px'}}>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default AboutCarousel;
