import { APIGatewayProxyEvent } from 'aws-lambda';
import faker from '@faker-js/faker';

import { recognize } from '@functions/recognize/handler';
import { ZodError, ZodIssueCode, ZodParsedType } from 'zod';
import { PokemonUnrecognized } from '@application/errors/PokemonUnrecognized';

const mockBase64Image = jest.fn();
jest.mock('@application/validators/base64Image', () => ({
  base64Image: (data: Record<string, any>) => mockBase64Image(data),
}));

const mockRecognizePokemon = jest.fn();
jest.mock('@application/use_cases/recognizePokemon', () => ({
  recognizePokemon: (base64Image: string) => mockRecognizePokemon(base64Image),
}));

describe('recognize', () => {
  it('should be able to recognize a pokemon', async () => {
    const base64Image = `data:image/png;base64,${faker.random.alphaNumeric(
      50
    )}`;
    const pokemonName = faker.random.word();

    mockBase64Image.mockReturnValueOnce({ base64Image });
    mockRecognizePokemon.mockResolvedValueOnce(pokemonName);

    const response = await recognize({
      body: JSON.stringify({ base64Image }),
    } as APIGatewayProxyEvent);

    expect(response).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify({
        pokemonName,
      }),
    });
    expect(mockBase64Image).toHaveBeenCalledWith({ base64Image });
    expect(mockRecognizePokemon).toHaveBeenCalledWith(base64Image);
  });

  it('should be able to return validation errors', async () => {
    const error = {
      message: 'fake error message',
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.integer,
      received: ZodParsedType.boolean,
      path: [''],
    };
    const zodError = new ZodError([error]);
    mockBase64Image.mockImplementationOnce(() => {
      throw zodError;
    });

    const log = jest.spyOn(console, 'log');
    log.mockImplementationOnce(() => {});

    const response = await recognize({} as APIGatewayProxyEvent);

    expect(response).toStrictEqual({
      statusCode: 400,
      body: JSON.stringify([error]),
    });
    expect(mockBase64Image).toHaveBeenCalledWith({});
    expect(mockRecognizePokemon).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(zodError);
  });

  it('should be able to return a pokemon unrecognized error', async () => {
    const base64Image = `data:image/png;base64,${faker.random.alphaNumeric(
      50
    )}`;
    const error = new PokemonUnrecognized();

    mockBase64Image.mockReturnValueOnce({ base64Image });
    mockRecognizePokemon.mockImplementationOnce(() => {
      throw error;
    });

    const log = jest.spyOn(console, 'log');
    log.mockImplementationOnce(() => {});

    const response = await recognize({
      body: JSON.stringify({ base64Image }),
    } as APIGatewayProxyEvent);

    expect(response).toStrictEqual({
      statusCode: 400,
      body: JSON.stringify({
        message: error.message,
      }),
    });
    expect(mockBase64Image).toHaveBeenCalledWith({ base64Image });
    expect(mockRecognizePokemon).toHaveBeenCalledWith(base64Image);
    expect(log).toHaveBeenCalledWith(error);
  });

  it('should be able to return internal errors', async () => {
    const base64Image = `data:image/png;base64,${faker.random.alphaNumeric(
      50
    )}`;
    const error = new Error('Test Error');

    mockBase64Image.mockReturnValueOnce({ base64Image });
    mockRecognizePokemon.mockRejectedValueOnce(error);

    const log = jest.spyOn(console, 'log');
    log.mockImplementationOnce(() => {});

    const response = await recognize({
      body: JSON.stringify({ base64Image }),
    } as APIGatewayProxyEvent);

    expect(response).toStrictEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'Ops! Something goes wrong, try again later.',
      }),
    });
    expect(mockBase64Image).toHaveBeenCalledWith({ base64Image });
    expect(mockRecognizePokemon).toHaveBeenCalledWith(base64Image);
    expect(log).toHaveBeenCalledWith(error);
  });
});
