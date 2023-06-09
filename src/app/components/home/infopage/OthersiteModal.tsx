import React, { useState } from 'react';

interface OthersiteModalProps {
  name: string;
  url: string;
  github: string;
  imgfile: string;
  onClose: () => void;
}

const OthersiteModal: React.FC<OthersiteModalProps> = ({ name, url, github, imgfile, onClose }) => {
  const [isClosed, setIsClosed] = useState(false);

  const handleonClosed = () => {
    setIsClosed(true);
    setTimeout(onClose, 1000); 
  };

  return (
    <dialog open className="othersite-modal">
      <div className={`othersite-modal-container animate__animated ${isClosed ? 'animate__backOutDown' : 'animate__backInUp'}`}>
        <img className="othersite-modal-image" src={imgfile} alt={name} />
        <a className="othersite-modal-label" href={url}>
          {name}
        </a>
        <a className="othersite-modal-icon" href={github}>
          <img className='icon' src="https://particles.js.org/images/GitHub-Mark-120px-plus.png" alt="" />
        </a>
        <button className="exitmodal-button" onClick={handleonClosed}>
          X
        </button>
      </div>
    </dialog>
  );
};

export default OthersiteModal;
