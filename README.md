# Who's that pokemon?
I always wished to have a pokedex and today my dream comes true!

# Requirements
* Node.js ^14.15.0
* Serveless
* AWS Account 
  * [S3](https://aws.amazon.com/s3/)
  * [Rekognition](https://aws.amazon.com/rekognition/)

# Install
```
npm install
```
Or simple:
```
yarn
```

## Configure
To get the project running follow the next sections instructions.

### Script
This repo comes together with a script (in Node) to download pokemons' images (2 versions of each pokemon) from [Pokemon API](https://pokeapi.co/) and from them create a blackened version of each of this images. The script can be executed as following:
```
$ node scripts/download-pokemons-images.js
```
> The script is configured to download only the firsts 151th pokemons

The images will downloaded in the `scripts/images` folder, upload theses images to train your model (see the next sections).

### S3 Bucket
To create a S3's bucket just see [Step 1: Create your first S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html) help page. This bucket is utilized to upload photos taken by the app before sent to analysis.
> Write down the bucket's name it will be necessary when configuring the [environment variables](#env)

### Rekognition
First create a project as described in the [Creating an Amazon Rekognition Custom Labels project](https://docs.aws.amazon.com/rekognition/latest/customlabels-dg/cp-create-project.html) document.

Then you need to create and prepare a dataset with the pokemons' images (see also a (script)[#script] attached to this repo that downloads these images for you), to achieve this read the [Creating an Amazon Rekognition Custom Labels dataset](https://docs.aws.amazon.com/rekognition/latest/customlabels-dg/cd-create-dataset.html) article.

Now, [train your model](https://docs.aws.amazon.com/rekognition/latest/customlabels-dg/tm-console.html).

After the training finish [start your model](https://docs.aws.amazon.com/rekognition/latest/customlabels-dg/start-running-model.html). When the model be started look for the model's ARN in the `Use your model` tab!
> Pay attention to the limits of the free tier, remember to always [stop the model](https://docs.aws.amazon.com/rekognition/latest/customlabels-dg/stop-running-model.html) after the tests!
> Write down the model's ARN it will be necessary when configuring the [environment variables](#env)

### env
In this file you may configure your bucket name and Rekognition model's ARN. Rename the `.env.example` in the root directory to `.env` then just update with your settings.
|key|description
|---|---
BUCKET_NAME|Name of the [S3's](#s3-bucket) bucket where the photos will be uploaded before sent to [Amazon Rekognition](https://aws.amazon.com/rekognition/).
REKOGNITION_MODEL_ARN|The ARN of the [Amazon Rekognition](#rekognition) model.
