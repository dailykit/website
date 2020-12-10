import React from "react";
import { useLocation } from "react-router-dom";
// import { useQuery } from "@apollo/client";
import ReactHtmlParser from "react-html-parser";
import {
  GET_FILE_PATH,
  GET_FILE_CONTENT,
  GET_PAGE_MODULES,
} from "../graphql/query";

import { useQuery } from "@apollo/client";
import { GET_BRANDID } from "../graphql/query";

const Component = () => {
  let { pathname } = useLocation();
  const [fileId, setFileId] = React.useState(null);
  const [filePath, setFilePath] = React.useState(null);
  const [cssPath, setCssPath] = React.useState(null);
  const [jsPath, setJsPath] = React.useState(null);
  const [fileContent, setFileContent] = React.useState(null);
  const [cssFileContent, setCssFileContent] = React.useState(null);
  const [jsFileContent, setJsFileContent] = React.useState(null);
  const [webPages, setWebPages] = React.useState([]);
  const [brandId, setBrandId] = React.useState(null);
  const domain = window.location.hostname;
  const { loading } = useQuery(GET_BRANDID, {
    variables: {
      domain: domain,
    },
    onCompleted: ({ brands }) => {
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

  const { loading: moduleLoading } = useQuery(GET_PAGE_MODULES, {
    variables: {
      brandId: brandId,
      route: pathname,
    },
    onCompleted: ({ website_website }) => {
      setFileId(
        website_website[0]?.websitePages[0]?.websitePageModules[0]?.fileId
      );
    },
    onError: (error) => {
      console.log(error);
    },
    skip: !brandId,
  });

  const { loading: filePathLoading } = useQuery(GET_FILE_PATH, {
    variables: {
      id: fileId,
    },
    onCompleted: ({
      editor_file_by_pk: { path, linkedCssFiles, linkedJsFiles },
    }) => {
      // console.log(path, linkedCssFiles);
      setFilePath(path);
      setCssPath(linkedCssFiles[0]?.cssFile?.path);
      setJsPath(linkedJsFiles[0]?.jsFile?.path);
    },
    skip: !fileId,
    onError: (error) => {
      console.log(error);
    },
  });

  const { loading: fileContentLoading } = useQuery(GET_FILE_CONTENT, {
    variables: {
      path: filePath,
    },
    onCompleted: ({ getFile: { content } }) => {
      console.log(content);
      setFileContent(content);
    },
    skip: !filePath,
    onError: (error) => {
      console.log(error);
    },
  });
  const { loading: fileCssLoading } = useQuery(GET_FILE_CONTENT, {
    variables: {
      path: cssPath,
    },
    onCompleted: ({ getFile: { content } }) => {
      //   console.log(content);
      setCssFileContent(content);
    },
    skip: !cssPath,
    onError: (error) => {
      console.log(error);
    },
  });
  const { loading: fileJsLoading } = useQuery(GET_FILE_CONTENT, {
    variables: {
      path: jsPath,
    },
    onCompleted: ({ getFile: { content } }) => {
      //   console.log(content);
      setJsFileContent(content);
    },
    skip: !jsPath,
    onError: (error) => {
      console.log(error);
    },
  });

  if (
    moduleLoading ||
    filePathLoading ||
    fileContentLoading ||
    fileCssLoading ||
    fileJsLoading
  ) {
    return "Loding...";
  }
  return (
    <>
      {Boolean(fileContent) && (
        <>
          {ReactHtmlParser(
            `${fileContent} <style>body{margin: 0} ${cssFileContent}</style> <script>${jsFileContent}</script>`
          )}
        </>
      )}
    </>
  );
};

export default Component;
