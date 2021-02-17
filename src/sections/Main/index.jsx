import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useLocation } from "react-router-dom";
import { SettingsContext } from "../../context";
import { GET_PAGE_MODULES } from "../../graphql";
import { useHistory } from "react-router-dom";

import { Loader, Renderer } from "../../components";
import { getFullPath } from "../../utils";

const Main = () => {
  let { pathname } = useLocation();
  const history = useHistory();
  const { settings } = React.useContext(SettingsContext);

  const [modules, setModules] = React.useState([]);
  const [files, setFiles] = React.useState([]);
  const [cssFiles, setCssFiles] = React.useState([]);
  const [jsFiles, setJsFiles] = React.useState([]);

  const { loading, data } = useQuery(gql(GET_PAGE_MODULES), {
    skip: !settings?.brand?.id,
    variables: {
      brandId: settings?.brand?.id,
      route: pathname,
    },
    onError: (error) => {
      console.log(error);
    },
    fetchPolicy: "network-only",
  });

  React.useEffect(() => {
    if (!loading) {
      const pageModules =
        data?.website_website[0]?.websitePages[0]?.websitePageModules;
      console.log(
        "🚀 ~ file: index.jsx ~ line 27 ~ const{loading}=useQuery ~ pageModules",
        pageModules
      );
      setModules(pageModules);
      // pageModules.forEach((module) => {
      //   const div = document.createElement("div");
      //   div.setAttribute("id", module.id);
      //   document.body.appendChild(div);
      // });

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
    }
  }, [loading, data]);

  React.useEffect(() => {
    if (cssFiles?.length || jsFiles?.length) {
      const body = document.querySelector("body");

      // attach js files
      const fragment = document.createDocumentFragment();
      jsFiles.forEach((filePath) => {
        const script = document.createElement("script");
        script.setAttribute("src", getFullPath(filePath));
        fragment.appendChild(script);
      });
      body.appendChild(fragment);
    }
  }, [cssFiles, jsFiles]);

  React.useEffect(() => {
    const node = document.getElementsByClassName("WebsiteWraaper")[0];
    if (node) {
      node.remove();
    }
  }, []);
  if (loading) {
    return <Loader />;
  }
  return (
    <div class="WebsiteWrapper">
      {modules?.map(({ id, moduleType, file }) => (
        <>
          <div id={id} className={file.path.split("/").pop()}></div>
          <Renderer moduleId={id} moduleType={moduleType} moduleFile={file} />
        </>
      ))}
    </div>
  );
};

export default Main;
