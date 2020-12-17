import React from "react";
import { useLocation } from "react-router-dom";
// import ReactHtmlParser from "react-html-parser";
import ScriptTag from "react-script-tag";
import { useQuery } from "@apollo/client";
import { GET_BRANDID } from "../graphql/query";
import axios from "axios";
import {
  GET_FILE_PATH,
  GET_FILE_CONTENT,
  GET_PAGE_MODULES,
} from "../graphql/query";

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

  //get brand info (id, and website links with the brand)
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

  //get fileID or templateId or internalModuleIdentifier query
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

  // get file path query
  const { loading: filePathLoading } = useQuery(GET_FILE_PATH, {
    variables: {
      id: fileId,
    },
    onCompleted: ({
      editor_file_by_pk: { path, linkedCssFiles, linkedJsFiles },
    }) => {
      console.log(
        path,
        linkedCssFiles[0]?.cssFile?.path,
        linkedJsFiles[0]?.jsFile?.path
      );
      setFilePath(path);
      setCssPath(linkedCssFiles[0]?.cssFile?.path);
      setJsPath(linkedJsFiles[0]?.jsFile?.path);
    },
    skip: !fileId,
    onError: (error) => {
      console.log(error);
    },
  });

  //   // get file content query
  //   const { loading: fileContentLoading } = useQuery(GET_FILE_CONTENT, {
  //     variables: {
  //       path: filePath,
  //     },
  //     onCompleted: ({ getFile: { content } }) => {
  //       setFileContent(content);
  //     },
  //     skip: !filePath,
  //     onError: (error) => {
  //       console.log(error);
  //     },
  //   });

  //   const { loading: fileCssLoading } = useQuery(GET_FILE_CONTENT, {
  //     variables: {
  //       path: cssPath,
  //     },
  //     onCompleted: ({ getFile: { content } }) => {
  //       setCssFileContent(content);
  //     },
  //     skip: !cssPath,
  //     onError: (error) => {
  //       console.log(error);
  //     },
  //   });
  //   const { loading: fileJsLoading } = useQuery(GET_FILE_CONTENT, {
  //     variables: {
  //       path: jsPath,
  //     },
  //     onCompleted: ({ getFile: { content } }) => {
  //       setJsFileContent(content);
  //     },
  //     skip: !jsPath,
  //     onError: (error) => {
  //       console.log(error);
  //     },
  //   });

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
    const node = document.createElement("script");
    node.src = `https://test.dailykit.org/template/files${jsPath}`;
    node.type = "text/javascript";
    node.async = true;
    document.body.appendChild(node);
    const link = document.createElement("link");
    link.href = `https://test.dailykit.org/template/files${cssPath}`;
    link.rel = "stylesheet";
    link.type = "text/css";
    document.body.appendChild(link);
  });

  if (moduleLoading || filePathLoading) {
    return "Loding...";
  }

  return (
    <>
      <>
        <div
          id="htmlContent"
          dangerouslySetInnerHTML={{
            __html: fileContent,
          }}
        />
        {/* <link
          rel="stylesheet"
          type="text/css"
          href={`https://test.dailykit.org/template/files${cssPath}`}
        /> */}
        {/* <ScriptTag
          type="text/javascript"
          src={`https://test.dailykit.org/template/files${jsPath}`}
        /> */}
        {/* <script src={`https://test.dailykit.org/template/files${jsPath}`} /> */}
      </>
    </>

    // <>
    //   {Boolean(fileContent) && (
    //     <>{ReactHtmlParser(`${fileContent} <style>body{margin: 0}</style>`)}</>
    //   )}
    // </>
  );
};

export default Component;
