import React, { useState } from 'react';
import OthersiteModal from './OthersiteModal';

interface OthersitesProps {
  name: string;
  url: string;
  github: string;
  imgfile: string;
}

const Othersite: React.FC<OthersitesProps> = ({ name, url, github, imgfile }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="othersite-card" onClick={openModal}>
        <div className="iframe-container">
          <img className="othersite" alt={name} src={imgfile} />
          <a className="othersite-label" href={url}>
            {name}
          </a>
        </div>
      </div>
      {modalOpen && (
        <OthersiteModal name={name} url={url} github={github} imgfile={imgfile} onClose={closeModal} />
      )}
    </>
  );
};

export default Othersite;
