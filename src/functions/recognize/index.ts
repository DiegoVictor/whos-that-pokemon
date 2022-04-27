import { handlerPath } from "@utils/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.recognize`,
  environment: {
    BUCKET_NAME: {
      "Fn::GetAtt": ["WhosThatPokemonBucket", "Arn"],
    },
    REKOGNITION_PROJECT_VERION_ARN: "",
  },
  name: "WhosThatPokemonRecognize",
  events: [
    {
      http: {
        method: "post",
        path: "recognize",
      },
    },
  ],
};
