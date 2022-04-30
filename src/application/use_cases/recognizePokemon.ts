import { randomUUID } from 'crypto';

import { PokemonUnrecognized } from '@application/errors/PokemonUnrecognized';
import * as recognitionService from '@infra/services/recognition';
import * as storageService from '@infra/services/storage';

const getKeyAndData = (base64Image: string) => {
  const [metadata, data] = base64Image.split(',');
  const [mimeType] = metadata.match(/image\/\w+/);

  const uuid = randomUUID();
  const key = `${uuid}.${mimeType.split('/').pop()}`;

  return { key, data };
};

export const recognizePokemon = async (
  base64Image: string
): Promise<string> => {
  const { key, data } = getKeyAndData(base64Image);

  await storageService.upload(key, Buffer.from(data, 'base64'));

  const labels = await recognitionService.recognize(key);
  await storageService.deleteByKey(key);

  if (!labels.CustomLabels.length) {
    throw new PokemonUnrecognized();
  }
  const [{ Name: pokemonName }] = labels.CustomLabels;

  return pokemonName;
};
