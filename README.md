<h1 align="center">
  <a href="https://elpunto.evanxiong.com" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/948a0ab6-e48e-4d0b-9e34-daf1a254b717">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/2ed89018-0925-411d-a031-3f0e1782ef9b">
      <img alt="El Punto logo" height="36" src="https://github.com/user-attachments/assets/948a0ab6-e48e-4d0b-9e34-daf1a254b717">
    </picture>
  </a>
</h1>

<div align="center">
  
[El Punto](https://elpunto.evanxiong.com) uses Deepseek-V4-Flash and Sentence Transformers to aggregate and summarize top news headlines.

<a href="https://elpunto.evanxiong.com">
<img alt="Desktop screenshot of El Punto" src="https://github.com/user-attachments/assets/4ad8d63d-59fa-4f61-a128-348aa3f9911f">
</a>

</div>

## Introduction

Things move fast in today’s 24-hour news cycle. El Punto summarizes the most
important stories and presents them in a minimal, easy-to-scan format to help
you stay on top of the latest headlines.

El Punto automatically updates twice per day (at 13:00 and 21:00 UTC) using
articles from a [variety of sources](/feeds.csv). Prior to DeepSeek, El Punto
used OpenAI's GPT-3.5 Turbo model.

Check it out at [elpunto.evanxiong.com](https://elpunto.evanxiong.com).

<!-- [Read more about how El Punto works.]() -->

## In this repo

- [`frontend/`](/frontend/) - Next.js web app
- [`lambda/`](/lambda/) - backend scripts
  - [`src/lambda_function.py`](/lambda/src/lambda_function.py): update script
    that aggregates and summarizes headlines
  - [`build.sh`](/lambda/build.sh): bash script that builds Docker image
  - [`deploy.sh`](/lambda/deploy.sh): bash script that builds and deploys image
    to AWS
  - [`run.sh`](/lambda/run.sh): bash script that runs
    `lambda_function.lambda_handler()` directly, without Docker
- [`feeds.csv`](/feeds.csv) - news sources

## Usage

### Running update script locally

#### Requirements

- Python 3.12+

#### Instructions

1. Clone the repo:

   ```shell
   git clone https://github.com/evxiong/elpunto.git && cd elpunto
   ```

2. Copy `.env.example` to a new file called `.env` and fill in the missing
   values.

3. Install requirements:

   ```shell
   cd lamdba

   # Create a new venv
   python -m venv .venv

   # Activate venv
   source .venv/Scripts/activate

   # Install requirements
   pip install -r requirements.txt
   ```

4. Run the update script:

   ```shell
   ./run.sh
   ```

### Maintenance

#### Updating sources

To update news sources, edit `feeds.csv`. Changes will be reflected in the
frontend and backend when each service is rebuilt.

#### Upgrading packages

Assuming venv is active:

```shell
cd lambda

# Install pip-tools
pip install pip-tools

# Upgrade requirements
pip-compile --upgrade requirements.in

# Sync venv with new requirements
pip-sync requirements.txt
```

### Deploying to AWS

#### Requirements

- [Docker Desktop](https://docs.docker.com/get-started/get-docker/)
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)
- [Lambda deployment docs](https://docs.aws.amazon.com/lambda/latest/dg/python-image.html#python-image-clients)

#### Testing locally

To test the image locally using AWS Lambda runtime interface emulator,
[follow the AWS docs](https://docs.aws.amazon.com/lambda/latest/dg/python-image.html#python-image-clients).

```shell
# Build image with 'test' tag
cd lambda && ./build.sh test

# Start container (Git Bash)
cd ..
MSYS_NO_PATHCONV=1 docker run --env-file .env --platform linux/amd64 \
    -d -v ~//.aws-lambda-rie://aws-lambda -p 9000:8080 \
    --entrypoint //aws-lambda/aws-lambda-rie el-punto:test \
    //usr/local/bin/python -m awslambdaric lambda_function.lambda_handler

# Invoke the function
curl "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```

#### Deploying

When deployed, the update script runs on AWS Lambda via a Docker container
uploaded to Amazon ECR. The Lambda's run schedule is configured via EventBridge
Scheduler, and the results of the script are stored in DynamoDB, which is
queried by the frontend. Once these services have been set up, the backend can
easily be re-deployed to AWS:

```shell
cd lambda && ./deploy.sh
```

The `deploy.sh` script rebuilds the image, pushes it to ECR, points Lambda to
use the new image, deletes the old image, updates Lambda environment variables,
and updates the run schedule in EventBridge Scheduler.

## Built with

- **Frontend**: TypeScript, Next.js, React, Tailwind CSS, Radix UI
- **Backend**: Python, Amazon DynamoDB, AWS Lambda, Amazon ECR, Amazon
  EventBridge, Docker, DeepSeek, OpenAI, Sentence Transformers, BERTopic
