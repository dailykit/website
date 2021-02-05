import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useLocation } from "react-router-dom";
import { SettingsContext } from "../../context";
import { GET_PAGE_MODULES } from "../../graphql";

import { Loader, Renderer } from "../../components";

const Main = () => {
  let { pathname } = useLocation();
  const { settings } = React.useContext(SettingsContext);

  const [files, setFiles] = React.useState([]);

  const { loading } = useQuery(gql(GET_PAGE_MODULES), {
    skip: !settings?.brand?.id,
    variables: {
      brandId: settings?.brand?.id,
      route: pathname,
    },
    onCompleted: (data) => {
      const modules =
        data.website_website[0]?.websitePages[0]?.websitePageModules;
      const fetchedFiles = modules
        .filter((module) => module.moduleType === "file")
        .map(({ file }) => {
          return { path: file.path, variables: file.variables };
        });
      const linkedCssPaths = modules
        .map((module) => {
          return module.file.linkedCssFiles.map((file) => {
            return file.cssFile.path;
          });
        })
        .flat(1);
      const linkedJsPaths = modules
        .map((module) => {
          return module.file.linkedJsFiles.map((file) => {
            return file.jsFile.path;
          });
        })
        .flat(1);
      setFiles(fetchedFiles);
      // setCssPath(linkedCssPaths);
      // setJsPath(linkedJsPaths);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  if (loading) {
    return <Loader />;
  }
  return (
    <>
      {files.map(({ path, variables }, index) => (
        <Renderer filePath={path} key={index} variables={variables} />
      ))}
    </>
  );
};

export default Main;
