import React from "react";

import { MenuContext, SettingsContext } from "../../context";
import { DailyKit, fileAgent, removeChildren } from "../../utils";
import { Loader } from "..";
import { gql, useLazyQuery } from "@apollo/client";

const Renderer = ({ filePath, variables }) => {
  const dynamicQuery = React.useRef(null);
  const [, theme, folder, file] = filePath.split("/");
  const [name] = file.split(".").slice(0, 1);

  const { settings } = React.useContext(SettingsContext);
  const { menu } = React.useContext(MenuContext);
  const [loading, setLoading] = React.useState(true);
  const [queryData, setQueryData] = React.useState(null);

  const [runDynamicQuery, { loading: runningQuery }] = useLazyQuery(
    dynamicQuery.current,
    {
      onCompleted: (data) => {
        setQueryData(data);
      },
    }
  );

  React.useEffect(() => {
    (async () => {
      let displayConfig;

      try {
        // check if graphql query exists
        const queryRes = await fileAgent(
          `/${theme}/${folder}/graphql/${name}.json`
        );

        if (queryRes) {
          const queryObject = await queryRes.json();
          dynamicQuery.current = gql(queryObject.query);

          if (dynamicQuery.current) {
            runDynamicQuery({
              variables,
            });
          }
        }

        // check for config file
        const configObject = await (
          await fileAgent(`/${theme}/${folder}/config/${name}.json`)
        ).json();

        if (configObject.display) {
          displayConfig = configObject.display;
        }
      } catch (error) {
        console.log(error);
      }

      const parsedHtml = await DailyKit.engine(filePath, {
        ...settings,
        ...(displayConfig && { local: displayConfig }),
        ...(name === "collections" && { categories: menu.categories }),
        ...(queryData && { ...queryData }),
      });
      // setHtml(parsedHtml);
      setLoading(false);
      let element = document.getElementById(name);
      if (element && parsedHtml.length) {
        removeChildren(element);
        for (let el of parsedHtml) {
          element.appendChild(el);
        }
      }
    })();
  }, [settings, menu, queryData]);

  if (loading || runningQuery) return <Loader />;
  return <div className="Wrapper" id={name}></div>;
};

export default Renderer;
