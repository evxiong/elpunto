import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Headline } from "./types";

// partition key is <section#timestamp> where section is "Top" for now
// sort key is <cluster>
// lambda will run at 12:45, 20:45 UTC daily

const LAMBDA_EARLY = 13; // Time 1 (UTC) that Lambda runs
const LAMBDA_LATE = 21; // Time 2 (UTC) that Lambda runs

export async function getTop(pk: string) {
  console.log("Entered getTop(): " + pk);
  const client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-west-1" }),
  );
  const response = await client.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "PK = :partitionKey",
      ExpressionAttributeValues: {
        ":partitionKey": "Top#" + pk,
      },
    }),
  );
  const res = response.Items as Headline[];
  return res;
}

export function getKey() {
  const now = new Date();
  const nowHour = now.getUTCHours();

  if (nowHour >= LAMBDA_EARLY && nowHour < LAMBDA_LATE) {
    now.setUTCHours(LAMBDA_EARLY);
  } else {
    if (nowHour < LAMBDA_EARLY) {
      now.setUTCDate(now.getUTCDate() - 1);
    }
    now.setUTCHours(LAMBDA_LATE);
  }

  now.setUTCMinutes(0);
  now.setUTCSeconds(0);
  return now.toISOString().split(".")[0] + "Z";
}
