import { Liquid } from "liquidjs";
import pug from "pug";
import ejs from "ejs";
import Mustache from "mustache";
import { parseHTML } from "jquery";
import { fileAgent } from "../fetch";

const liquid = new Liquid();

export const DailyKit = {
  engine: async (path, data) => {
    try {
      const source = await (await fileAgent(path)).text();
      const [ext] = path.split(".").slice(-1);

      if (ext === "pug") {
        const compiled = `${pug.compile(source)(data)}`;
        const html = parseHTML(compiled);
        if (html?.length === 0) throw Error("Empty file!");
        return html;
      }

      if (ext === "ejs") {
        const compiled = `${ejs.render(source, data)}`;
        const html = parseHTML(compiled);
        if (html?.length === 0) throw Error("Empty file!");
        return html;
      }

      if (ext === "liquid") {
        const compiled = await liquid.parseAndRender(source, data);
        const html = parseHTML(compiled);
        if (html?.length === 0) throw Error("Empty file!");
        return html;
      }

      if (ext === "mustache") {
        const compiled = await Mustache.render(source, data);
        const html = parseHTML(compiled);
        if (html?.length === 0) throw Error("Empty file!");
        return html;
      }

      throw Error("File format not supported!");
    } catch (error) {
      console.log(error);
      return <p>Error rendering template: {error.message}</p>;
    }
  },
};
