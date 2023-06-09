import React from "react";
import Othersite from "./Othersite";

 const Otherproducts: React.FC = () => {

  const othersites = [
    {
      name: "CommonFunLib",
      url: "https://commonfunlib.onrender.com",
      github: "http://github.com",
      imgfile:"CommonfunLib.png"
    },
    {
      name: "CodeShifter",
      url: "https://code-shifter.vercel.app",
      github: "http://github.com",
      imgfile:"CodeShifter.png"
    },
    {
      name: "Portyfolio",
      url: "https://portyfolio.vercel.app",
      github: "http://github.com",
      imgfile:"Portyfolio.png"
    },
    {
      name: "Mi.Projects",
      url: "https://mi-projects.vercel.app",
      github: "http://github.com",
      imgfile:"Mi-Projects.png"
    }
  ];
  
   return (
    <aside className="otherproducts-card">
      {othersites.map(site => (
        <Othersite
          key={site.url}
          name={site.name}
          url={site.url}
          github={site.github}
          imgfile ={site.imgfile}
        />
      ))}
    </aside>
  );
};
 export default Otherproducts;