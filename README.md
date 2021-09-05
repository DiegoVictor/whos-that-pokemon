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

# Usage
First of all start up the server:
```
npm run dev:server
```
Or:
```
yarn dev:server
```

The server has just one endpoint that is responsible to upload the provided image to S3 bucket, send the image to Rekognition's model, delete the image from bucket and finally send the request response with a pokemon name if one was identified or an error message.

## Endpoint
After server's started up you will be able to see the endpoint's url and HTTP method:
```
POST | http://localhost:3000/dev/recognize
```

In the body of the request you must send just one field:

|field|description|example
|---|---|---
data|Image in [base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64) (You can use some online service to convert images to base64).|data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMNSURBVDhPbZLdb9tUGMafc2I7juN8NlnSpG3I0tCtW9qJwDoWQGKVqAQ3m0CI/4DLSfw5SEjcToOh3YAYH9qQGAg6DYRKgdGvpEndfNhJHTu24w8cc4XEe3F0dPT+nvc8zzkEfuWqRSZbYRbEDGnwcZrr/Db9RPrdGbmep47lE3fW838VwIXVYrz+Lv9hOEZuCCkqMhykqQlD67uStOs8ged93Nlxdg+3W/8RCs2WxSup5NxzzO3sMlOZKC4bnQul2DDJRtOknCjQ67aJTX9/X94XzpY3XmrMFZdov3U0YmawkKA1IUUuUl/K8bVdG1A7FYTZOmz7ANl88Xm2lH2YyPSweGmlPOpI9493/7pFq9eXouI58oGYofy/QgT60AVxqyiu1FFafQeltQYhUbG83ZfK1tQCHxMvFlYqGZqv0WvxPG0w4cA+2AiFNnDAsvO+VcAYj6GcdNE9OcUra+sI+WfUsBaqL643aIh1r1EG8YAMisLWzyOaSsOVR7j6VIL4RxuV5fPIppN4tP0EF7qmIJ4M36bWxHVNzfZMzYGmEvz4OIlp6AXE/EZON3GBS2DtcQthjkMslcDm66+BHnYhiGKdDlv4xnXdbvMXC38/rWJfWUAqPw+W5zFhQ/ii/QytQhQhSsGwLOIxEa3NVQzmIk5g9PLW+hvrW2/eKdU2korU8+EsHNuB2pdhGUYAMWHWfwUHU8NC96C529tvvk9nsJirLR/K01j7oAljpELXNMzS0pQhLH0CU9f9EEc468kglCAcieztfPv9DwGcns+9Kp+pIYZjYVgmPv38AVRZASEEQjIOToiAFXjEMimkCjlorl0rXbm0FMAsoZObb23hXCEP4k+MRnjwggBT0zE5G2MsD83B0fFPak/WFP82bXkQL9fXFgO4f9z5urd3NBk1O95U1YwbG1dBCbUtTZeIYcnTTv+jX798+N5YGX4V84N8+XKNCrbHBX9bTGf3OEV7Rofj73qHrc8ijifSwWhnvH98O246d6K2d+/BvbtthhV+5lyc0lPlrvTn3qN/AFGAVGhg7mYvAAAAAElFTkSuQmCC

