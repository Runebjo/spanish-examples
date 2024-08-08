import Image from "next/image";
import SpanishStoryComponent from "./spanish-story";
import SpanishStoryStreamComponent from "./spanish-story-stream";

export default function Home() {
  return (
    <div>
      {/* <SpanishStoryComponent /> */}
      <SpanishStoryStreamComponent />
    </div>
  );
}
