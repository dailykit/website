import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_BRANDID } from "./graphql/query";
import PageContent from "./Component/Component";

function App() {
  // const [webPages, setWebPages] = React.useState([]);
  // const [brandId, setBrandId] = React.useState(null);
  // const domain = window.location.hostname;
  // const { loading } = useQuery(GET_BRANDID, {
  //   variables: {
  //     domain: domain,
  //   },
  //   onCompleted: ({ brands }) => {
  //     if (brands.length > 1) {
  //       const pages = brands.filter((brand) => brand.domain === domain)[0];
  //       setWebPages(pages.website.websitePages);
  //       setBrandId(pages.id);
  //     } else {
  //       const pages = brands[0];
  //       setWebPages(pages.website.websitePages);
  //       setBrandId(pages.id);
  //     }
  //   },
  //   onError: (error) => {
  //     console.log(error);
  //   },
  // });
  // if (loading) return "Loading...";
  return (
    <Router>
      {/* {Boolean(webPages.length) ? (
        webPages.map((page) => {
          return ( */}
      <Route to="*" render={() => <PageContent />} />
      {/* );
        })
      ) : (
        <p>Sorry No website found for this domain :(</p>
      )} */}
    </Router>
  );
}

export default App;
