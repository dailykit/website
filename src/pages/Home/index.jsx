import React from "react";
import { Renderer } from "../../components";

const Home = () => {
  return (
    <div>
      <Renderer filePath="components/collections.liquid" />
      <Renderer
        filePath="components/recent-orders.liquid"
        variables={{ amount: 10 }}
      />
    </div>
  );
};

export default Home;
