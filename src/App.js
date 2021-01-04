import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PageContent from "./Component/PageContent";

function App() {
  return (
    <Router>
      <Route to="/" component={PageContent} />
    </Router>
  );
}

export default App;
