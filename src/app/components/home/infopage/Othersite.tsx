import React from 'react';

interface OthersitesProps {
  name: string;
  url: string;
  github: string;
  imgfile: string;
}

const Othersite: React.FC<OthersitesProps> = ({ name, url, github,imgfile}) => {
  return (
    <div className='othersite-card'>
      <a className='othersite-label' href={github}>{name}</a>
      <div className='iframe-container'>
        <img  className='othersite' title={name} src={imgfile}>
          </img>
      </div>
    </div>
  );
}

export default Othersite;
