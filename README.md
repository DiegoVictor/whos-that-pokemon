# Who's that pokemon?
[![serverless](https://img.shields.io/badge/serverless-2.55.0-FD5750?style=flat-square&logo=serverless)](https://www.serverless.com/)
[![typescript](https://img.shields.io/badge/typescript-4.3.5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![nodemon](https://img.shields.io/badge/nodemon-2.0.12-76d04b?style=flat-square&logo=nodemon)](https://nodemon.io/)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://raw.githubusercontent.com/DiegoVictor/whos-that-pokemon/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
I always wished to have a pokedex and today my dream comes true!

## Table of Contents
* [Requirements](#requirements)
* [Install](#install)
  * [Configure](#configure)
    * [Script](#script)
    * [S3 Bucket](#s3-bucket)
    * [Rekognition](#rekognition)
    * [env](#env)
* [Usage](#usage)
  * [Endpoint](#endpoint)
  * [Demo](#demo)
    * [Web](#web)
    * [App](#app)
      * [Configure](#configure)
      * [Using](#using)

# Requirements
* Node.js ^14.15.0
* Serveless
* AWS Account 
  * [S3](https://aws.amazon.com/s3/)
  * [Rekognition](https://aws.amazon.com/rekognition/)
  * [Lambda](https://aws.amazon.com/lambda)

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

The images will be downloaded in the `scripts/images` folder, upload theses images to train your model (see the next sections).

### S3 Bucket
To create a S3's bucket just see [Step 1: Create your first S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html) help page. This bucket is utilized to upload photos taken by the app before sent to analysis.
> Write down the bucket's name it will be necessary when configuring the [environment variables](#env)

### Rekognition
First create a project as described in the [Creating an Amazon Rekognition Custom Labels project](https://docs.aws.amazon.com/rekognition/latest/customlabels-dg/cp-create-project.html) document.

Then you need to create and prepare a dataset with the pokemons' images (look to a [script](#script) attached to this repo that downloads these images for you), to achieve this read the [Creating an Amazon Rekognition Custom Labels dataset](https://docs.aws.amazon.com/rekognition/latest/customlabels-dg/cd-create-dataset.html) article.

Now, [train your model](https://docs.aws.amazon.com/rekognition/latest/customlabels-dg/tm-console.html).

After the training finish [start your model](https://docs.aws.amazon.com/rekognition/latest/customlabels-dg/start-running-model.html). When the model be started look for the model's ARN in the `Use your model` tab!
> Pay attention to the limits of the free tier, remember to always [stop the model](https://docs.aws.amazon.com/rekognition/latest/customlabels-dg/stop-running-model.html) after the tests!
> Write down the model's ARN it will be necessary when configuring the [environment variables](#env).

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
After server started up you will be able to see the endpoint's url and HTTP method:
```
POST | http://localhost:3000/dev/recognize
```

In the body of the request you must send just one field:

|field|description|example
|---|---|---
data|Image in [base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64) (You can use some online service to convert images to base64).|data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMNSURBVDhPbZLdb9tUGMafc2I7juN8NlnSpG3I0tCtW9qJwDoWQGKVqAQ3m0CI/4DLSfw5SEjcToOh3YAYH9qQGAg6DYRKgdGvpEndfNhJHTu24w8cc4XEe3F0dPT+nvc8zzkEfuWqRSZbYRbEDGnwcZrr/Db9RPrdGbmep47lE3fW838VwIXVYrz+Lv9hOEZuCCkqMhykqQlD67uStOs8ged93Nlxdg+3W/8RCs2WxSup5NxzzO3sMlOZKC4bnQul2DDJRtOknCjQ67aJTX9/X94XzpY3XmrMFZdov3U0YmawkKA1IUUuUl/K8bVdG1A7FYTZOmz7ANl88Xm2lH2YyPSweGmlPOpI9493/7pFq9eXouI58oGYofy/QgT60AVxqyiu1FFafQeltQYhUbG83ZfK1tQCHxMvFlYqGZqv0WvxPG0w4cA+2AiFNnDAsvO+VcAYj6GcdNE9OcUra+sI+WfUsBaqL643aIh1r1EG8YAMisLWzyOaSsOVR7j6VIL4RxuV5fPIppN4tP0EF7qmIJ4M36bWxHVNzfZMzYGmEvz4OIlp6AXE/EZON3GBS2DtcQthjkMslcDm66+BHnYhiGKdDlv4xnXdbvMXC38/rWJfWUAqPw+W5zFhQ/ii/QytQhQhSsGwLOIxEa3NVQzmIk5g9PLW+hvrW2/eKdU2korU8+EsHNuB2pdhGUYAMWHWfwUHU8NC96C529tvvk9nsJirLR/K01j7oAljpELXNMzS0pQhLH0CU9f9EEc468kglCAcieztfPv9DwGcns+9Kp+pIYZjYVgmPv38AVRZASEEQjIOToiAFXjEMimkCjlorl0rXbm0FMAsoZObb23hXCEP4k+MRnjwggBT0zE5G2MsD83B0fFPak/WFP82bXkQL9fXFgO4f9z5urd3NBk1O95U1YwbG1dBCbUtTZeIYcnTTv+jX798+N5YGX4V84N8+XKNCrbHBX9bTGf3OEV7Rofj73qHrc8ijifSwWhnvH98O246d6K2d+/BvbtthhV+5lyc0lPlrvTn3qN/AFGAVGhg7mYvAAAAAElFTkSuQmCC
> The base64 initial part (`data:image/png;base64`) is crucial to identify the image type, be sure to always send it too!

## Demo
The project comes with a demo, at the project root there is a `demo` folder. Read the next sections to know how to configure and use.

### Web
In the `demo/web` folder there is a web page (`index.html`) where a random pokemon is selected and shown to you to guess *who is that pokemon*. Just open it and start to guess:

<img src="https://raw.githubusercontent.com/DiegoVictor/whos-that-pokemon/main/screenshots/web.gif">

### App
The `demo/app` folder contains a [expo](https://expo.dev/) mobile app that you can run in a [emulator or in your device through USB](https://docs.expo.dev/get-started/installation/?redirected#2-expo-go-app-for-ios-and).

#### Configure
Before emulate or build the app you need to configure the url of the [recognition endpoint](#endpoint) to the app too. Make the same process in the [env](#env) section previously, but this time inside the `demo/app`. Rename the `.env.example` to `.env` and chage the values. I strongly recommend to use your machine IP as the host of the url:
```
RECOGNITION_URL="http://184.148.178.90:3000/dev/recognize"
```
> Sometimes the firewall can block Expo or the requests comming from the app to the server, pay attention to it!

As you can imagine the app will just send the photo in base64 to the server recognize the pokemon to you!

#### Using
After install and configure the app, open it and take a picture of the greyed out pokemon in the [web page](#web), press the button at right to send the photo to analysis, then after some seconds the app will tell you what pokemon is that! (if one was identified)

<img src="https://github.com/DiegoVictor/whos-that-pokemon/raw/main/screenshots/app.gif" width="400px">
