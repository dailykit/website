import React from "react";

import { MenuContext, SettingsContext } from "../../context";
import { DailyKit, removeChildren } from "../../utils";
import { Loader } from "..";
import { gql, useLazyQuery } from "@apollo/client";

const Renderer = ({ filePath, variables }) => {
  const dynamicQuery = React.useRef(null);
  const [folder, file] = filePath.split("/");
  const [name] = file.split(".").slice(0, 1);

  const { settings } = React.useContext(SettingsContext);
  const { menu } = React.useContext(MenuContext);
  const [loading, setLoading] = React.useState(true);
  const [queryData, setQueryData] = React.useState(null);

  const [runDynamicQuery, { loading: runningQuery }] = useLazyQuery(
    dynamicQuery.current,
    {
      onCompleted: (data) => {
        console.log("🚀 ~ file: index.jsx ~ line 22 ~ Renderer ~ data", data);
        setQueryData(data);
      },
    }
  );

  React.useEffect(() => {
    (async () => {
      try {
        // check if graphql query exists
        const queryRes = await fetch(
          `${window.location.origin}/${folder}/graphql/${name}.json`
        );

        console.log(queryRes);
        if (queryRes) {
          const queryObject = await queryRes.json();
          console.log(
            "🚀 ~ file: index.jsx ~ line 26 ~ queryObject",
            queryObject
          );

          dynamicQuery.current = gql(queryObject.query);

          runDynamicQuery({
            variables,
          });

          // check for config file
          const configObject = await (
            await fetch(
              `${window.location.origin}/${folder}/config/${name}.json`
            )
          ).json();
          console.log(configObject);
        }
      } catch (error) {
        console.log(error);
      }

      console.log("queryData:", queryData);

      const parsedHtml = await DailyKit.engine(
        `${window.location.origin}/${filePath}`,
        {
          ...settings,
          ...(name === "collections" && { categories: menu.categories }),
          ...(queryData && { ...queryData }),
        }
      );
      setLoading(false);
      let element = document.getElementById(name);
      if (element) {
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
