import { handlerPath } from "@utils/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.recognize`,
  environment: {
    PROJECT_VERSION_ARN_SECRET_NAME:
      "${self:custom.projectVersionArnSecretName}",
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
