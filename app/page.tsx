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
  const initialWorldTimes = Object.fromEntries(
    [
      ["ACC", "Africa/Accra"],
      ["LDN", "Europe/London"],
      ["NYC", "America/New_York"],
    ].map(([label, timeZone]) => [
      label,
      new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now),
    ]),
  );

  return (
    <>
      <Header issueDate={issueDate} initialWorldTimes={initialWorldTimes} />
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
