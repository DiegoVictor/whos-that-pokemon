export class PokemonUnrecognized extends Error {
  constructor() {
    super('Was not possible to reconize a pokemon from the provided picture');
  }
}
