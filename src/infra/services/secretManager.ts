import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const secretManager = new SecretsManager({});

export const getSecret = async (
  SecretId: string
): Promise<Record<string, string>> =>
  secretManager
    .getSecretValue({
      SecretId,
    })
    .then(({ SecretString }) => JSON.parse(SecretString));
