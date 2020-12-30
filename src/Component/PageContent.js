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
  const [filePath, setFilePath] = React.useState(null);
  const [cssPath, setCssPath] = React.useState(null);
  const [jsPath, setJsPath] = React.useState(null);
  const [fileContent, setFileContent] = React.useState(null);
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
      const files = website_website[0]?.websitePages[0]?.websitePageModules
        .filter((module) => module.moduleType === "file")
        .map((file) => {
          return file.fileId;
        });
      console.log(files);
      setFileId(files);
    },
    onError: (error) => {
      console.log(error);
    },
    skip: !brandId,
  });

  // get file path query
  const { loading: filePathLoading } = useQuery(GET_FILE_PATH, {
    variables: {
      id: fileId,
    },
    onCompleted: ({ editor_file_aggregate: { nodes = [] } = {} }) => {
      const filePaths = nodes.map((node) => {
        return node.path;
      });
      const linkedCssPaths = nodes.map((node) => {
        return node.linkedCssFiles.map((file) => {
          return file.cssFile.path;
        });
      });
      const linkedJsPaths = nodes.map((node) => {
        return node.linkedJsFiles.map((file) => {
          return file.jsFile.path;
        });
      });
      console.log(filePaths, linkedCssPaths, linkedJsPaths);
      setFilePath(filePaths);
      setCssPath(linkedCssPaths);
      setJsPath(linkedJsPaths);
    },
    skip: !fileId.length,
    onError: (error) => {
      console.log(error);
    },
  });

  React.useEffect(() => {
    if (filePath) {
      axios
        .get(`https://test.dailykit.org/template/files${filePath}`)
        .then((data) => {
          setFileContent(data.data);
        });
    }
  });

  React.useEffect(() => {
    if (document.getElementsByClassName("pageContent").length === 0) {
      if (fileContent) {
        const htmlNode = document.createElement("div");
        htmlNode.className = "pageContent";
        htmlNode.innerHTML = fileContent;
        document.body.appendChild(htmlNode);
      }
      if (fileContent && jsPath) {
        const scriptNode = document.createElement("script");
        scriptNode.src = `https://test.dailykit.org/template/files${jsPath}`;
        scriptNode.type = "text/javascript";
        scriptNode.async = true;
        document.body.appendChild(scriptNode);
      }
      if (fileContent && cssPath) {
        const linkNode = document.createElement("link");
        linkNode.href = `https://test.dailykit.org/template/files${cssPath}`;
        linkNode.rel = "stylesheet";
        linkNode.type = "text/css";
        document.body.appendChild(linkNode);
      }
    }
  });

  if (loading || moduleLoading || filePathLoading) {
    return <Loader />;
  }
  return null;
};

export default Component;
