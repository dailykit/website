import { Liquid } from "liquidjs";
import pug from "pug";
import Mustache from "mustache";
import { parseHTML } from "jquery";
import Parser from "html-react-parser";

const liquid = new Liquid();

export const DailyKit = {
  engine: async (url, data) => {
    try {
      const source = await (await fetch(url)).text();

      const [ext] = url.split(".").slice(-1);

      if (ext === "pug") {
        const compiled = `${pug.compile(source)(data)}`;
        const html = parseHTML(compiled);
        if (html?.length === 0) throw Error("Empty file!");
        return html;
      }

      if (ext === "liquid") {
        const compiled = await liquid.parseAndRender(source, data);
        //   const html = parseHTML(compiled);
        const html = Parser(compiled);
        // , {
        //  replace: (node) => {
        //    if (node.name === "button") {
        //      console.log(node);
        //      return (
        //        <button
        //          {...node.attribs}
        //          onClick={new Function("event", node.attribs.onclick)}
        //        >
        //          yo
        //        </button>
        //      );
        //    }
        //    return node;
        //  },
        //   });
        if (html?.length === 0) throw Error("Empty file!");
        return html;
      }

      // if (ext === "mustache") {
      //   const compiled = await Mustache.render(source, data);
      //   const html = Parser(compiled, {
      //     replace: (node) => {
      //       if (node.name === "button") {
      //         console.log(node);
      //         return (
      //           <button
      //             {...node.attribs}
      //             onClick={new Function("event", node.attribs.onclick)}
      //           >
      //             yo
      //           </button>
      //         );
      //       }
      //     },
      //   });
      //   if (html?.length === 0) throw Error("Empty file!");
      //   return html;
      // }

      throw Error("File format not supported!");
    } catch (error) {
      console.log(error);
      return <p>Error rendering template: {error.message}</p>;
    }
  },
};
