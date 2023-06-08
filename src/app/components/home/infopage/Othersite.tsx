import React from 'react';

interface OthersitesProps {
  name: string;
  url: string;
  github: string;
}

const Othersite: React.FC<OthersitesProps> = ({ name, url, github }) => {
  return (
    <div className='othersite-card'>
      <a className='othersite-label' href={github}>{name}</a>
      <div className='iframe-container'>
        <iframe className='othersite' title={name} src={url} />
      </div>
    </div>
  );
}

export default Othersite;
