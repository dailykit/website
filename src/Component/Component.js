import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import ReactHtmlParser from "react-html-parser";
import {
  GET_BRANDID,
  GET_FILE_PATH,
  GET_FILE_CONTENT,
  GET_PAGE_MODULES,
} from "../graphql/query";

const Component = () => {
  const [brandId, setBrandId] = React.useState(1);
  const [fileId, setFileId] = React.useState(null);
  const [filePath, setFilePath] = React.useState(null);
  const [cssPath, setCssPath] = React.useState(null);
  const [fileContent, setFileContent] = React.useState(null);
  const [cssFileContent, setCssFileContent] = React.useState(null);
  //   let location = window.location.href;

  let { pathname } = useLocation();
  //   console.log(location);
  //   const { loading, error } = useQuery(GET_BRANDID, {
  //     variables: {
  //       domain: "localhost",
  //     },
  //       onCompleted: ({ brands }) => {
  //         if(brands.length >1){
  //           brands.map(brand=>{
  //               if(brand.domain === '')
  //           })
  //         }
  //       },
  //   });

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
  });

  const { loading: filePathLoading } = useQuery(GET_FILE_PATH, {
    variables: {
      id: fileId,
    },
    onCompleted: ({ editor_file_by_pk: { path, linkedCssFiles } }) => {
      // console.log(path, linkedCssFiles);
      setFilePath(path);
      setCssPath(linkedCssFiles[0].cssFile.path);
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
      console.log(content);
      setCssFileContent(content);
    },
    skip: !cssPath,
    onError: (error) => {
      console.log(error);
    },
  });

  //   if (
  //     moduleLoading ||
  //     filePathLoading ||
  //     fileContentLoading ||
  //     fileCssLoading
  //   ) {
  //     return "Loding...";
  //   }
  return (
    <>{ReactHtmlParser(fileContent + `<style> ${cssFileContent} </style>`)}</>
  );
};

export default Component;
