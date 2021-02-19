import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useLocation } from "react-router-dom";
import { SettingsContext } from "../../context";
import { GET_PAGE_MODULES } from "../../graphql";
import { useHistory, useParams } from "react-router-dom";

import { Loader, Renderer } from "../../components";
import { getFullPath } from "../../utils";

const Main = () => {
  let { pathname, search } = useLocation();
  const history = useHistory();
  const { settings } = React.useContext(SettingsContext);
  const [modules, setModules] = React.useState([]);
  const [files, setFiles] = React.useState([]);
  const [cssFiles, setCssFiles] = React.useState([]);
  const [jsFiles, setJsFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useQuery(gql(GET_PAGE_MODULES), {
    skip: !settings?.brand?.id,
    variables: {
      brandId: settings?.brand?.id,
      route: pathname,
    },
    onCompleted: (data) => {
      const pageModules =
        data?.website_website[0]?.websitePages[0]?.websitePageModules;
      setModules(pageModules);
      const fetchedFiles = pageModules
        ?.filter((module) => module?.moduleType === "file")
        ?.map(({ file }) => {
          return { path: file.path, variables: file.variables };
        });
      const fetchedLinkedCssFiles = pageModules
        ?.map((module) => {
          return module?.file?.linkedCssFiles?.map((file) => {
            return file?.cssFile?.path;
          });
        })
        ?.flat(1);
      const fetchedLinkedJsFiles = pageModules
        ?.map((module) => {
          return module?.file?.linkedJsFiles?.map((file) => {
            return file?.jsFile?.path;
          });
        })
        ?.flat(1);
      setFiles(fetchedFiles);
      setCssFiles(fetchedLinkedCssFiles);
      setJsFiles(fetchedLinkedJsFiles);
      // setLoading(false);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  React.useEffect(() => {
    if (cssFiles?.length || jsFiles?.length) {
      const body = document.querySelector("body");
      cssFiles.forEach(async (filePath) => {
        const linkNode = document.createElement("link");
        linkNode.href = await getFullPath(filePath);
        linkNode.rel = "stylesheet";
        linkNode.type = "text/css";
        console.log(linkNode);
        document.head.appendChild(linkNode);
      });
      // attach js files
      const fragment = document.createDocumentFragment();
      jsFiles.forEach((filePath) => {
        const script = document.createElement("script");
        script.setAttribute("src", getFullPath(filePath));
        fragment.appendChild(script);
      });
      body.appendChild(fragment);
    }
    setLoading(false);
  }, [cssFiles, jsFiles]);

  React.useEffect(() => {
    var element = document.getElementById("root");
    element.addEventListener("navigator", function (e) {
      // setLoading(true);
      history.push({ pathname: e.detail.pathname, search: e.detail.query });
    });
    return () => {
      element.removeEventListener("yo", () => {
        console.log("unmount eventlistener......");
      });
    };
  }, []);

  if (loading) {
    return <Loader />;
  }
  // if (pageModuleLoading || loading) {
  //   console.log("loading", pageModuleLoading, loading);
  //   return (
  //     <h1 style={{ marginTop: "6rem" }}>
  //       loading...pageModuleLoading:{pageModuleLoading.toString()} loading:
  //       {loading.toString()}
  //     </h1>
  //   );
  // }
  return (
    <div id="WebsiteWrapper">
      {modules?.map(({ id, moduleType, file }) => (
        <React.Fragment key={id}>
          <div id={id} className={file.path.split("/").pop()}></div>
          <Renderer moduleId={id} moduleType={moduleType} moduleFile={file} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default Main;
