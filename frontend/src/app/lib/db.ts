import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { Headline } from "./types";

export async function getTop(timestamp: string) {
  // partition key is `<section>#<timestamp> where <section> is "Top" for now
  // sort key is <cluster>

  // lambda runs 15 min before each time in process.env.SCHEDULE

  console.log("Entered getTop(): " + timestamp);
  const client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-west-1" }),
  );
  const response = await client.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "PK = :partitionKey",
      ExpressionAttributeValues: {
        ":partitionKey": "Top#" + timestamp,
      },
    }),
  );
  const res = response.Items as Headline[];
  return res;
}

export function getTimestamp() {
  const schedule = getSchedule();

  const now = new Date();
  const nowHHMM = now.getUTCHours() * 100 + now.getUTCMinutes();

  if (nowHHMM < schedule[0]) {
    // current time before earliest schedule time, so set key to prev day latest
    // schedule time
    now.setUTCDate(now.getUTCDate() - 1);
    const scheduleHHMM = schedule[schedule.length - 1];
    now.setUTCHours(Math.trunc(scheduleHHMM / 100), scheduleHHMM % 100, 0, 0);
  } else {
    for (let i = 0; i < schedule.length; i++) {
      if (
        nowHHMM >= schedule[i] &&
        (i + 1 === schedule.length || nowHHMM < schedule[i + 1])
      ) {
        // current time between schedule times or after latest schedule time, so
        // set key to schedule[i]
        now.setUTCHours(Math.trunc(schedule[i] / 100), schedule[i] % 100, 0, 0);
        break;
      }
    }
  }

  return now.toISOString().split(".")[0] + "Z";
}

/** Parses, validates, and sorts `process.env.SCHEDULE`. */
function getSchedule(): number[] {
  if (!process.env.SCHEDULE) {
    throw Error("process.env.SCHEDULE not set");
  }

  if (
    !(
      process.env.SCHEDULE.trim().startsWith("[") &&
      process.env.SCHEDULE.trim().endsWith("]")
    )
  ) {
    throw Error("process.env.SCHEDULE is not an array");
  }

  const schedule: number[] = process.env.SCHEDULE.trim()
    .slice(1, -1)
    .split(",")
    .map((t) => parseInt(t.trim()));

  if (schedule.length === 0) {
    throw Error("process.env.SCHEDULE is empty");
  }
  for (const time of schedule) {
    if (Number.isNaN(time) || time < 0 || time > 2359 || time % 100 > 59) {
      throw Error(`process.env.SCHEDULE contains invalid time: ${time}`);
    }
  }

  // sort asc
  schedule.sort((a, b) => a - b);

  return schedule;
}
