import React from "react";
import logo from "../../imgs/logo.png";
import SearchBar from "../SearchBar/SearchBar";

const Banner = () => {
  return (
    <div className="banner text-white">
      <div className="container p-4 text-center">
        <img src={logo} alt="banner" />
        <div>
          <span id="get-part">A Place to get </span>
          <SearchBar />
          <span> the cool stuff.</span>
        </div>
      </div>
    </div>
  );
};

export default Banner;
