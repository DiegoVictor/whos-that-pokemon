const { Rekognition } = require("@aws-sdk/client-rekognition");
const { S3 } = require("@aws-sdk/client-s3");
const {
  projectName,
  projectVersionName,
  bucket: Bucket,
} = require("../variables.json");

const rekognition = new Rekognition({});
const s3 = new S3({});

/**
 * @typedef { DatasetArn: string } Dataset
 *
 * @param {string} name
 * @returns {Promise<{ ProjectArn: string, Datasets: Dataset[] }>}
 */
const getProject = async (name) =>
  rekognition
    .describeProjects({
      ProjectNames: [name],
    })
    .then(({ ProjectDescriptions: [{ ProjectArn, Datasets }] }) => ({
      ProjectArn,
      Datasets,
    }));

/**
 *
 * @param {string} DatasetArn
 * @returns {Promise<void>}
 */
const deleteDataset = async (DatasetArn) =>
  rekognition.deleteDataset({
    DatasetArn,
  });

/**
 *
 * @param {Dataset[]} datasets
 * @returns @returns {Promise<void>}
 */
const deleteDatasets = async (datasets) =>
  Promise.all(datasets.map(({ DatasetArn }) => deleteDataset(DatasetArn))).then(
    () => process.stdout.write("Datasets removed\n")
  );

/**
 *
 * @param {string} ProjectArn
 * @returns {Promise<string>}
 */
const getProjectVersionArn = async (ProjectArn) =>
  rekognition
    .describeProjectVersions({
      ProjectArn,
      VersionNames: [projectVersionName],
    })
    .then(
      ({ ProjectVersionDescriptions: [{ ProjectVersionArn }] }) =>
        ProjectVersionArn
    );

/**
 *
 * @param {string} ProjectArn
 * @returns {Promise<void>}
 */
const deleteProjectVersion = async (ProjectArn) =>
  getProjectVersionArn(ProjectArn)
    .then((ProjectVersionArn) =>
      rekognition.deleteProjectVersion({
        ProjectVersionArn,
      })
    )
    .then(() => {
      process.stdout.write("Model removed\n");
      process.stdout.write(
        "The model is being deleted, checkout the progress in AWS Console\n"
      );
    });

/**
 *
 * @returns {Promise<void>}
 */
const cleanOutBucket = async () =>
  s3
    .listObjects({
      Bucket,
    })
    .then(({ Contents }) =>
      s3.deleteObjects({
        Bucket,
        Delete: {
          Objects: Contents.map(({ Key }) => ({ Key })),
        },
      })
    )
    .then(() => process.stdout.write("Bucket emptied\n"));

getProject(projectName)
  .then(({ ProjectArn, Datasets }) =>
    deleteDatasets(Datasets).then(() => deleteProjectVersion(ProjectArn))
  )
  .then(cleanOutBucket);
