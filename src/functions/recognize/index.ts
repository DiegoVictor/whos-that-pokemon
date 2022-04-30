import { handlerPath } from '@utils/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.recognize`,
  environment: {
    BUCKET_NAME: '${self:custom.bucketName}',
    PROJECT_VERSION_ARN_SECRET_NAME:
      '${self:custom.projectVersionArnSecretName}',
  },
  name: 'WhosThatPokemonRecognize',
  events: [
    {
      http: {
        method: 'post',
        path: 'recognize',
      },
    },
  ],
};
