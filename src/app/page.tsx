import Card from "@/app/_components/card";
import { getTop } from "./_utils/db";
import Navbar from "@/app/_components/navbar";

const LAMBDA_EARLY = 13; // Time 1 (UTC) that Lambda runs
const LAMBDA_LATE = 21; // Time 2 (UTC) that Lambda runs

function getKey() {
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

export default async function Home() {
  const headlines = await getTop(getKey());

  return (
    <>
      <Navbar />
      <main className="mb-10">
        <Card headlines={headlines} />
      </main>
    </>
  );
}
