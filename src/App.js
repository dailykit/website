import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import PageContent from "./Component/Component";

function App() {
  return (
    <Router>
      <Route to="/" render={() => <PageContent />} />
    </Router>
  );
}

export default App;
