import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faRocket, faLightbulb, faTrophy } from '@fortawesome/free-solid-svg-icons';

const Team = () => {
  return (
    <section className="team">
      <h2>Meet Our Experts</h2>

      <div className="team-members">
        <div className="member">
          <h3>Pradeep Reddy</h3>
          <p>
            Full-Stack Blockchain Developers <FontAwesomeIcon icon={faStar} />
          </p>
        </div>
        <div className="member">
          <h3>Durga Srinivas</h3>
          <p>
            Full-Stack Blockchain Developers <FontAwesomeIcon icon={faRocket} />
          </p>
        </div>
        <div className="member">
          <h3>Sindhuja</h3>
          <p>
            Full-Stack Blockchain Developers <FontAwesomeIcon icon={faLightbulb} />
          </p>
        </div>
        <div className="member">
          <h3>Dimple Sharma</h3>
          <p>
            Full-Stack Blockchain Developers <FontAwesomeIcon icon={faTrophy} />
          </p>
        </div>
      </div>
    </section>
  );
};

export default Team;
