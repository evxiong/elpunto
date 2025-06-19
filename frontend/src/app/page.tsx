import Card from "@/app/components/card";
import { getKey, getTop } from "./lib/db";
import Navbar from "@/app/components/navbar";

export default async function Home() {
  const headlines = await getTop(getKey());

  return (
    <>
      <Navbar />
      <main id="content" className="mb-10">
        <Card headlines={headlines} />
      </main>
    </>
  );
}

// Call getTop every 2m at most
export const revalidate = 120;
