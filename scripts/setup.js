/* eslint-disable import/no-extraneous-dependencies */
const {
  Rekognition,
  DatasetType,
  DatasetStatus,
} = require('@aws-sdk/client-rekognition');
const { S3 } = require('@aws-sdk/client-s3');
const axios = require('axios');
const { Upload } = require('@aws-sdk/lib-storage');
const { PassThrough } = require('stream');
const sharp = require('sharp');
const {
  ProjectName,
  ProjectVersionName,
  Bucket,
  ProjectVersionArnSecretName,
} = require('../variables.json');

const rekognition = new Rekognition({});
const s3 = new S3({});

let CURRENT_POKEMON_ID = 1;

/**
 * @typedef { DatasetArn: string } Dataset
 *
 * @param {string} name
 * @returns {Promise<string>}
 */
const getProject = async (name) =>
  rekognition
    .describeProjects({
      ProjectNames: [name],
    })
    .then(({ ProjectDescriptions: [{ ProjectArn }] }) => ProjectArn);

/**
 *
 * @param {string} ProjectArn
 * @param {DatasetType} DatasetType
 * @returns {Promise<string>} DatasetArn
 */
// eslint-disable-next-line no-shadow
const createDataset = async (ProjectArn, DatasetType) =>
  rekognition
    .createDataset({
      ProjectArn,
      DatasetType,
    })
    .then(({ DatasetArn }) => DatasetArn);

/**
 *
 * @param {string[]} paths
 * @returns {Promise<string[]>}
 */
const createDatasets = async (ProjectArn) =>
  Promise.all(
    Object.values(DatasetType).map((type) =>
      createDataset(ProjectArn, type).then((DatasetArn) => ({
        type,
        DatasetArn,
      }))
    )
  ).then((datasets) => datasets);

/**
 * @typedef {{
 *  id: number,
 *  name: string,
 *  OfficialArtwork: string,
 *  DreamWorld: string
 * }} Pokemon
 *
 * @param {number} id
 * @returns {Promise<Pokemon>}
 */
const getPokemonById = async (id) =>
  axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`).then(
    ({
      data: {
        name,
        sprites: { other },
      },
    }) => ({
      id,
      name,
      OfficialArtwork: other['official-artwork'].front_default,
      DreamWorld: other.dream_world.front_default,
    })
  );

/**
 *
 * @param {string} url
 * @return {Promise<NodeJS.ReadableStream>}
 */
const getImageStream = async (url) =>
  axios.get(url, { responseType: 'stream' }).then((response) => response.data);

/**
 *
 * @param {string} fileName
 * @param {NodeJS.ReadableStream} stream
 * @returns {Promise<void>}
 */
const uploadFile = async (fileName, stream) =>
  new Upload({
    client: s3,
    params: {
      Bucket,
      Key: fileName,
      Body: stream,
    },
  }).done();

/**
 *
 * @param {NodeJS.ReadableStream} stream
 * @param {string} name
 * @returns {Promise<string[]>}
 */
const storageRawAndGreyedOutImageVersion = async (stream, name) => {
  const uploaders = Array.from({ length: 2 }, () => new PassThrough());
  const [raw, transform] = uploaders;

  const png = sharp().png();
  const filter = sharp().linear(0, 0);
  stream.pipe(png).pipe(raw).pipe(filter).pipe(transform);

  return Promise.all(
    uploaders.map(async (pass, hidden) => {
      const fileName = `pokemons/${name}${hidden ? 'GreyedOut' : ''}.png`;
      return uploadFile(fileName, pass).then(() => fileName);
    })
  ).then((results) => results.flat());
};

/**
 * @typedef {{
 *  name: string,
 *  paths: string[]
 * }} Entry
 *
 * @param {Pokemon} pokemon
 * @returns {Promise<Entry>}
 */
const getAndStorePokemonImages = async (pokemon) =>
  Promise.all(
    ['OfficialArtwork', 'DreamWorld'].map((spriteType) =>
      getImageStream(pokemon[spriteType]).then((stream) =>
        storageRawAndGreyedOutImageVersion(
          stream,
          `${pokemon.name}${spriteType}`
        )
      )
    )
  ).then((results) => ({ name: pokemon.name, paths: results.flat() }));

/**
 *
 * @param {number} id
 * @returns {Promise<Entry>}
 */
const uploadPokemonById = async (id) =>
  getPokemonById(id).then(getAndStorePokemonImages);

/**
 *
 * @param {string[]} entries
 * @returns {Promise<Entry[]>}
 */
const uploadPokemons = async (entries = [], id = 1) => {
  const { name, paths } = await uploadPokemonById(id);

  process.stdout.write(`#${name} uploaded\n`);
  entries.push({ name, paths });

  if (id < LIMIT) {
    return uploadPokemons(entries, id + 1);
  }
  return entries;
};

/**
 *
 * @param {string} DatasetArn
 * @param {string[]} data
 * @returns {Promise<void>}
 */
const setDatasetEntries = async (DatasetArn, data) =>
  rekognition.updateDatasetEntries({
    DatasetArn,
    Changes: {
      GroundTruth: Buffer.from(data.join('\n').toString('base64')),
    },
  });

/**
 *
 * @param {Entry[]} entries
 * @param {DatasetType} type
 * @returns {string[]}
 */
const prepare = (entries, type) => {
  const rows = entries
    .slice()
    .map(({ name, paths }) =>
      paths.map((path) =>
        JSON.stringify({
          'source-ref': `s3://${Bucket}/${path}`,
          [name]: 1,
          [`${name}-metadata`]: {
            confidence: 1,
            'class-name': name,
            'human-annotated': 'yes',
            'creation-date': new Date(),
            type: 'groundtruth/image-classification',
          },
        })
      )
    )
    .flat();

  if (type === DatasetType.TEST) {
    const size = Math.ceil(rows.length * 0.2);
    const minimum = 3;

    rows.sort(() => Math.floor(Math.random() * 3) - 1);
    return rows.slice(0, size > minimum ? size : minimum);
  }

  return rows;
};

/**
 *
 * @param {string} DatasetArn
 * @returns {DatasetStatus}
 */
const getDatasetStatus = async (DatasetArn) =>
  rekognition
    .describeDataset({ DatasetArn })
    .then(({ DatasetDescription: { Status } }) => Status);

/**
 *
 * @param {string} DatasetArn
 * @returns {Promise<void>}
 */
const waitDatasetUpdate = async (DatasetArn) => {
  process.stdout.write('Checking datasets update progress...\n');
  const createWaiter = (resolve) =>
    setTimeout(
      () =>
        getDatasetStatus(DatasetArn).then((Status) => {
          if (Status === DatasetStatus.UPDATE_COMPLETE) {
            return resolve(true);
          }
          return createWaiter(resolve);
        }),
      3000
    );

  return new Promise((resolve) => {
    createWaiter(resolve);
  });
};

/**
 *
 * @param {Entry[]} entries
 * @param {string} DatasetArn
 * @returns {Promise<void>}
 */
const updateDatasetEntries = async (entries, datasets) =>
  Promise.all(
    datasets.map(({ type, DatasetArn }) =>
      setDatasetEntries(DatasetArn, prepare(entries, type))
        .then(() => {
          process.stdout.write(`${type} dataset entries added\n`);
          return DatasetArn;
        })
        .then(waitDatasetUpdate)
    )
  ).then(() => process.stdout.write(`Datasets updated\n`));

/**
 *
 * @param {string} ProjectArn
 * @returns {Promise<void>}
 */
const trainModel = async (ProjectArn) => {
  process.stdout.write(`Start model training at ${new Date()}\n`);
  await rekognition
    .createProjectVersion({
      ProjectArn,
      VersionName: ProjectVersionName,
      OutputConfig: {
        S3Bucket: Bucket,
      },
    })
    .then(({ ProjectVersionArn }) =>
      process.stdout.write(`ProjectVersionArn: ${ProjectVersionArn}\n`)
    );
  process.stdout.write(
    'The training has started, checkout the progress in AWS Console\n'
  );
};

uploadPokemons().then((entries) =>
  getProject(ProjectName).then(async (ProjectArn) => {
    const datasets = await createDatasets(ProjectArn);

    return updateDatasetEntries(entries, datasets).then(() =>
      trainModel(ProjectArn)
    );
  })
);
