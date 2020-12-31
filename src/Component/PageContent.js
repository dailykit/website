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

  // // get file path query
  // const { loading: filePathLoading } = useQuery(GET_FILE_PATH, {
  //   variables: {
  //     id: fileId,
  //   },
  //   onCompleted: ({ editor_file_aggregate: { nodes = [] } = {} }) => {
  //     const filePaths = nodes.map((node) => {
  //       return node.path;
  //     });
  //     const linkedCssPaths = nodes.map((node) => {
  //       return node.linkedCssFiles.map((file) => {
  //         return file.cssFile.path;
  //       });
  //     });
  //     const linkedJsPaths = nodes.map((node) => {
  //       return node.linkedJsFiles.map((file) => {
  //         return file.jsFile.path;
  //       });
  //     });
  //     console.log(filePaths, linkedCssPaths, linkedJsPaths);
  //     setFilePath(filePaths);
  //     setCssPath(linkedCssPaths);
  //     setJsPath(linkedJsPaths);
  //   },
  //   skip: !fileId.length,
  //   onError: (error) => {
  //     console.log(error);
  //   },
  // });

  React.useEffect(() => {
    if (filePath.length) {
      let content = [];
      filePath.map((path) =>
        axios
          .get(`https://test.dailykit.org/template/files${path}`)
          .then((data) => {
            // content.push(data.data);
            const htmlNode = document.createElement("div");
            htmlNode.className = "pageContent";
            htmlNode.innerHTML = data.data;
            document.body.appendChild(htmlNode);
          })
          .catch((error) => console.error(error))
      );
      jsPath.map((path) => {
        const scriptNode = document.createElement("script");
        scriptNode.src = `https://test.dailykit.org/template/files${path}`;
        scriptNode.type = "text/javascript";
        scriptNode.async = true;
        return document.body.appendChild(scriptNode);
      });
      cssPath.map((path) => {
        const linkNode = document.createElement("link");
        linkNode.href = `https://test.dailykit.org/template/files${path}`;
        linkNode.rel = "stylesheet";
        linkNode.type = "text/css";
        console.log(linkNode);
        return document.head.appendChild(linkNode);
      });
      // setFileContent([...fileContent, ...content]);
    }
  }, [filePath]);

  // React.useEffect(() => {
  //   if (document.getElementsByClassName("pageContent").length === 0) {
  //     console.log("file");
  //     if (fileContent.length) {
  //       fileContent.map((content) => {
  //         const htmlNode = document.createElement("div");
  //         htmlNode.className = "pageContent";
  //         htmlNode.innerHTML = content;
  //         return document.body.appendChild(htmlNode);
  //       });
  //     }
  //     if (fileContent.length && jsPath.length) {
  //       jsPath.map((path) => {
  //         const scriptNode = document.createElement("script");
  //         scriptNode.src = `https://test.dailykit.org/template/files${path}`;
  //         scriptNode.type = "text/javascript";
  //         scriptNode.async = true;
  //         return document.body.appendChild(scriptNode);
  //       });
  //     }
  //     if (fileContent.length && cssPath.length) {
  //       cssPath.map((path) => {
  //         const linkNode = document.createElement("link");
  //         linkNode.href = `https://test.dailykit.org/template/files${cssPath}`;
  //         linkNode.rel = "stylesheet";
  //         linkNode.type = "text/css";
  //         return document.head.appendChild(linkNode);
  //       });
  //     }
  //   }
  // }, [fileContent, cssPath, jsPath]);

  if (loading || moduleLoading) {
    return <Loader />;
  }
  return null;
};

export default Component;
