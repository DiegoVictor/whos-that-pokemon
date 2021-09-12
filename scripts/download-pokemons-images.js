const { request } = require("https");
const fs = require("fs");
const path = require("path");
const { save } = require("node-css-image");
const sizeOf = require("image-size");
const sharp = require("sharp");
const { pipeline } = require("stream/promises");

const url = "https://pokeapi.co/api/v2/pokemon/";
const requestsInParallel = 5;
const limit = 151;
let processed = 0;

let id = 1;
const poll = [];

const applyFilters = async (filePath, output) => {
  const dimensions = sizeOf(filePath);
  return save({
    src: filePath,
    height: dimensions.height,
    width: dimensions.width,
    filters: {
      contrast: 0,
      brightness: 0,
    },
    output,
  });
};

async function getJSONFrom(response, callback) {
  let buffer = "";
  response
    .on("data", (chunk) => {
      buffer += chunk;
    })
    .on("end", () => {
      callback(JSON.parse(buffer));
    });
}

const saveGreyedOutImage = async (ext, name, imagePath) => {
  if (ext === ".svg") {
    const convertedImagePath = `${__dirname}/images/${name}.png`;
    return sharp(imagePath)
      .png()
      .toFile(convertedImagePath)
      .then(() =>
        applyFilters(
          convertedImagePath,
          `${__dirname}/images/${name}-greyed-out.png`
        )
      )
      .then(() => fs.promises.unlink(imagePath));
  } else {
    return applyFilters(
      imagePath,
      `${__dirname}/images/${name}-greyed-out${ext}`
    );
  }
};

const push = () => {
  while (poll.length - processed < requestsInParallel && id <= limit) {
    poll.push(
      new Promise((resolve) => {
        request(new URL(`${url}${id}`), (response) => {
          getJSONFrom(response, (json) => {
            const {
              id: number,
              name,
              sprites: { other },
            } = json;

            Promise.all(
              ["dream_world", "official-artwork"].map((key) => {
                const ext = path.extname(other[key].front_default);
                const imagePath = `${__dirname}/images/${name}-${key}${ext}`;

                return new Promise((done) => {
                  request(new URL(other[key].front_default), (stream) =>
                    pipeline(stream, fs.createWriteStream(imagePath)).then(() =>
                      saveGreyedOutImage(ext, `${name}-${key}`, imagePath).then(
                        done
                      )
                    )
                  ).end();
                });
              })
            ).then(() => {
              processed++;
              console.log(
                `(${processed}/${limit}) #${number} ${name} processed`
              );
              resolve(name);
            });
          });
        }).end();
      })
    );
    id++;
  }

  return Promise.all(poll);
};

const run = async () => {
  if (processed < poll.length || processed < limit) {
    return push().then(run);
  }
  return poll;
};

console.time("Pipeline took");

run().then((results) => {
  Promise.all(results.map((promise) => Promise.resolve(promise)))
    .then((labels) =>
      fs.promises.writeFile(
        `${__dirname}/labels.json`,
        JSON.stringify(labels, null, 2)
      )
    )
    .then(() => console.timeEnd("Pipeline took"));
});
