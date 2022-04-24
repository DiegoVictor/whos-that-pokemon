import { handlerPath } from "@libs/handlerResolver";
import schema from "./schema";

export default {
  handler: `${handlerPath(__dirname)}/handler.recognize`,
  events: [
    {
      http: {
        method: "post",
        path: "recognize",
      },
    },
  ],
};
