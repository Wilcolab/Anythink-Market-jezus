import React from "react";
import logo from "../../imgs/logo.png";
import agent from "../../agent";

const Banner = () => {
  return (
    <div className="banner text-white">
      <div className="container p-4 text-center">
        <img src={logo} alt="banner" />
        <div>
          <span id="get-part">A place to get</span>
          <input
            id="search-box"
            placeholder="What is it that you truly desire?"
            onInput={(e) => {
              const searchValue = e.target.value;
              if (searchValue.length <= 3) return;
              agent.Items.byTitle(searchValue);
            }}
          ></input>
          <span> the cool stuff.</span>
        </div>
      </div>
    </div>
  );
};

export default Banner;
