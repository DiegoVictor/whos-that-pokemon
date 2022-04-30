import { APIGatewayProxyEvent } from 'aws-lambda';
import 'source-map-support/register';
import { ZodError } from 'zod';

import * as validate from '@application/validators/base64Image';
import { recognizePokemon } from '@application/use_cases/recognizePokemon';
import { PokemonUnrecognized } from '@application/errors/PokemonUnrecognized';

export const recognize = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { base64Image } = validate.base64Image(body);

    const pokemonName = await recognizePokemon(base64Image);

    return {
      statusCode: 200,
      body: JSON.stringify({
        pokemonName,
      }),
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);

    if (err instanceof ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify(err.errors),
      };
    }
    if (err instanceof PokemonUnrecognized) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: err.message }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Ops! Something goes wrong, try again later.',
      }),
    };
  }
};
