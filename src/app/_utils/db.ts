import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
// import { unstable_cache } from "next/cache";
import { Headline } from "../_components/card";

// partition key is <section#timestamp> where section is "Top" for now
// sort key is <cluster>
// lambda will run at 12:45, 20:45 UTC daily

export const getTop = async (pk: string) => {
  console.log("Entered getTop()");
  const client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-west-1" })
  );
  const response = await client.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "PK = :partitionKey",
      ExpressionAttributeValues: {
        ":partitionKey": "Top#" + pk,
      },
    })
  );
  const res = response.Items as Headline[];
  return res;
};
