import { Header } from "./components/Header";
import { HeroStory } from "./components/HeroStory";
import { LowerEditorial } from "./components/LowerEditorial";
import { Manuals } from "./components/Manuals";
import { Newsletter } from "./components/Newsletter";
import { QuickReads } from "./components/QuickReads";
import { SiteFooter } from "./components/SiteFooter";
import { StartHere } from "./components/StartHere";

export default function Home() {
  const now = new Date();
  const issueDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Accra",
  }).format(now);

  return (
    <>
      <Header issueDate={issueDate} />
      <main>
        <HeroStory />
        <StartHere />
        <Manuals />
        <QuickReads />
        <LowerEditorial />
        <Newsletter />
      </main>
      <SiteFooter year={now.getFullYear()} />
    </>
  );
}
