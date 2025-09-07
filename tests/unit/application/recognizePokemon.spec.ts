import { faker } from '@faker-js/faker';

import { recognizePokemon } from '@application/use_cases/recognizePokemon';
import { PokemonUnrecognized } from '@application/errors/PokemonUnrecognized';

const mockUpload = jest.fn();
const mockDeleteByKey = jest.fn();
jest.mock('@infra/services/storage', () => {
  return {
    upload: (key: string, buf: Buffer) => mockUpload(key, buf),
    deleteByKey: (key: string) => mockDeleteByKey(key),
  };
});

const mockRecognize = jest.fn();
jest.mock('@infra/services/recognition', () => {
  return {
    recognize: (key: string) => mockRecognize(key),
  };
});

describe('recognizePokemon', () => {
  it('should be able to recognize a pokemon', async () => {
    const data = faker.string.alphanumeric(50);
    const base64Image = `data:image/png;base64,${data}`;
    const pokemonName = faker.lorem.word();

    mockRecognize.mockResolvedValueOnce({
      CustomLabels: [{ Name: pokemonName }],
    });

    const response = await recognizePokemon(base64Image);

    expect(mockUpload).toHaveBeenCalledWith(
      expect.any(String),
      Buffer.from(data, 'base64'),
    );
    expect(mockRecognize).toHaveBeenCalledWith(expect.any(String));
    expect(mockDeleteByKey).toHaveBeenCalledWith(expect.any(String));
    expect(response).toBe(pokemonName);
  });

  it('should not be able to recognize a pokemon', async () => {
    const data = faker.string.alphanumeric(50);
    const base64Image = `data:image/png;base64,${data}`;

    mockRecognize.mockResolvedValueOnce({
      CustomLabels: [],
    });

    await expect(async () => recognizePokemon(base64Image)).rejects.toThrow(
      PokemonUnrecognized,
    );

    expect(mockUpload).toHaveBeenCalledWith(
      expect.any(String),
      Buffer.from(data, 'base64'),
    );
    expect(mockRecognize).toHaveBeenCalledWith(expect.any(String));
    expect(mockDeleteByKey).toHaveBeenCalledWith(expect.any(String));
  });
});
