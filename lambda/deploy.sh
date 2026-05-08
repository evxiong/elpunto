#!/bin/bash

# AWS deploy script
#   - Builds Docker image locally
#   - Pushes image to ECR
#   - Points Lambda to use new image
#   - Deletes old ECR image
#   - Updates Lambda env vars
#   - Updates EventBridge Scheduler rule
#
# Usage:
#   ./deploy.sh
#
# AWS docs:
#   https://docs.aws.amazon.com/lambda/latest/dg/python-image.html#python-image-clients

set -eu

# Load env vars from top-level .env
set -a
source ../.env
set +a

# Validate $SCHEDULE
echo 'Validating $SCHEDULE...'
source .venv/Scripts/activate
CRON=$(python cron.py)

# Authenticate Docker CLI
echo 'Authenticating Docker CLI...'
aws ecr get-login-password --region "${AWS_LAMBDA_REGION}" | docker login \
    --username AWS \
    --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_LAMBDA_REGION}.amazonaws.com"

# Build image
echo 'Building image...'
./build.sh

# Tag image
echo 'Tagging image...'
docker tag el-punto:latest "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_LAMBDA_REGION}.amazonaws.com/el-punto:latest"

# Push to ECR
echo 'Pushing image to ECR...'
docker push "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_LAMBDA_REGION}.amazonaws.com/el-punto:latest"

# Point Lambda to use new image
echo 'Pointing Lambda to new image...'
aws lambda update-function-code \
    --function-name el-punto \
    --region "${AWS_LAMBDA_REGION}" \
    --image-uri "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_LAMBDA_REGION}.amazonaws.com/el-punto:latest" \
    --no-cli-pager \
    --publish

aws lambda wait function-updated-v2 \
    --function-name el-punto \
    --region "${AWS_LAMBDA_REGION}"

# Delete old ECR image(s)
echo 'Deleting old ECR images...'
UNTAGGED_IMAGES=$(aws ecr list-images \
    --repository-name el-punto \
    --region "${AWS_LAMBDA_REGION}" \
    --filter tagStatus=UNTAGGED \
    --query 'imageIds[*]' \
    --output json)

if [ "${UNTAGGED_IMAGES}" != "[]" ]; then
    aws ecr batch-delete-image \
        --repository-name el-punto \
        --region "${AWS_LAMBDA_REGION}" \
        --image-ids "${UNTAGGED_IMAGES}"
fi

# Update Lambda env vars
echo 'Updating Lambda env vars...'
aws lambda update-function-configuration \
    --function-name el-punto \
    --region "${AWS_LAMBDA_REGION}" \
    --no-cli-pager \
    --environment "{
        \"Variables\": {
            \"AI_API_KEY\": \"$AI_API_KEY\",
            \"AWS_DB_REGION\": \"$AWS_DB_REGION\",
            \"AWS_DB_TABLE_NAME\": \"$AWS_DB_TABLE_NAME\",
            \"SCHEDULE\": \"$SCHEDULE\",
            \"SCHEDULE_BUFFER\": \"$SCHEDULE_BUFFER\",
            \"TRANSFORMERS_CACHE\": \"/tmp\"
        }
    }"

aws lambda wait function-updated-v2 \
    --function-name el-punto \
    --region "${AWS_LAMBDA_REGION}"

# Update EventBridge Scheduler rule
echo 'Updating EventBridge rule...'
echo "cron(${CRON})"
aws events put-rule \
    --name "${AWS_EVENTBRIDGE_RULE_NAME}" \
    --region "${AWS_LAMBDA_REGION}" \
    --schedule-expression "cron(${CRON})"

echo 'Successfully deployed to AWS.'
