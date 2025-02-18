export class PokemonUnrecognized extends Error {
  constructor() {
    super("We couldn't recognize a pokemon in the given picture");
  }
}
