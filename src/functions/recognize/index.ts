import { handlerPath } from "@libs/handlerResolver";
import schema from "./schema";

export default {
  handler: `${handlerPath(__dirname)}/handler.recognize`,
  environment: {
    BUCKET_NAME: {
      "Fn::GetAtt": ["WhosThatPokemonBucket", "Arn"],
    },
  },
  events: [
    {
      http: {
        method: "post",
        path: "recognize",
      },
    },
  ],
};
