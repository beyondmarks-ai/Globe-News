import { NewsSentimentMap } from "@/components/NewsSentimentMap";
import { HaltedNotification } from "@/components/HaltedNotification";

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <NewsSentimentMap />
      <HaltedNotification />
    </main>
  );
}
