import React from "react";
import Othersite from "./othersite";

 const Otherproducts: React.FC = () => {

  const othersites = [
    {
      name: "CommonFunLib",
      url: "https://commonfunlib.onrender.com",
      github: "http://github.com"
    },
    {
      name: "CodeShifter",
      url: "https://code-shifter.vercel.app",
      github: "http://github.com"
    },
    {
      name: "Portyfolio",
      url: "https://portyfolio.vercel.app",
      github: "http://github.com"
    },
    {
      name: "Mi.Projects",
      url: "https://mi-projects.vercel.app",
      github: "http://github.com"
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
        />
      ))}
    </aside>
  );
};
 export default Otherproducts;