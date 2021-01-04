import React from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_BRANDID } from "../graphql/query";
import axios from "axios";
import { Loader } from "@dailykit/ui";
import { GET_FILE_PATH, GET_PAGE_MODULES } from "../graphql/query";

const Component = () => {
  let { pathname } = useLocation();
  const [fileId, setFileId] = React.useState([]);
  const [filePath, setFilePath] = React.useState([]);
  const [cssPath, setCssPath] = React.useState(null);
  const [jsPath, setJsPath] = React.useState(null);
  const [fileContent, setFileContent] = React.useState([]);
  const [cssFileContent, setCssFileContent] = React.useState(null);
  const [jsFileContent, setJsFileContent] = React.useState(null);
  const [webPages, setWebPages] = React.useState([]);
  const [brandId, setBrandId] = React.useState(null);
  const domain = window.location.hostname;

  //get brand info (id, and website links with the brand)
  const { loading } = useQuery(GET_BRANDID, {
    variables: {
      domain: domain,
    },
    onCompleted: ({ brands }) => {
      console.log(brands);
      if (brands.length > 1) {
        const pages = brands.filter((brand) => brand.domain === domain)[0];
        setWebPages(pages.website.websitePages);
        setBrandId(pages.id);
      } else {
        const pages = brands[0];
        setWebPages(pages.website.websitePages);
        setBrandId(pages.id);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  //get fileID or templateId or internalModuleIdentifier query
  const { loading: moduleLoading } = useQuery(GET_PAGE_MODULES, {
    variables: {
      brandId: brandId,
      route: pathname,
    },
    onCompleted: ({ website_website }) => {
      const modules = website_website[0]?.websitePages[0]?.websitePageModules;
      const filePaths = modules
        .filter((module) => module.moduleType === "file")
        .map((module) => {
          return module.file.path;
        });
      const linkedCssPaths = modules.map((module) => {
        return module.file.linkedCssFiles.map((file) => {
          return file.cssFile.path;
        });
      });
      const linkedJsPaths = modules.map((module) => {
        return module.file.linkedJsFiles.map((file) => {
          return file.jsFile.path;
        });
      });
      console.log(filePaths, linkedCssPaths.flat(1), linkedJsPaths.flat(1));
      setFilePath(filePaths);
      setCssPath(linkedCssPaths.flat(1));
      setJsPath(linkedJsPaths.flat(1));
    },
    onError: (error) => {
      console.log(error);
    },
    skip: !brandId,
  });

  React.useEffect(() => {
    if (filePath.length) {
      cssPath.forEach((path) => {
        const linkNode = document.createElement("link");
        linkNode.href = `https://test.dailykit.org/template/files${path}`;
        linkNode.rel = "stylesheet";
        linkNode.type = "text/css";
        console.log(linkNode);
        document.head.appendChild(linkNode);
      });
      (async () => {
        const htmlContents = await Promise.all(
          filePath.map(async (path) => {
            try {
              const { data } = await axios.get(
                `https://test.dailykit.org/template/files${path}`
              );
              return data;
            } catch (error) {
              console.log(error);
            }
          })
        );
        htmlContents.forEach((content) => {
          const htmlNode = document.createElement("div");
          htmlNode.className = "pageContent";
          htmlNode.innerHTML = content;
          document.body.appendChild(htmlNode);
        });
      })();

      jsPath.forEach((path) => {
        const scriptNode = document.createElement("script");
        scriptNode.src = `https://test.dailykit.org/template/files${path}`;
        scriptNode.type = "text/javascript";
        scriptNode.async = true;
        document.body.appendChild(scriptNode);
      });

      // setFileContent([...fileContent, ...content]);
    }
  }, [filePath]);

  if (loading || moduleLoading) {
    return <Loader />;
  }
  return null;
};

export default Component;
