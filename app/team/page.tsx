import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { LandingPageRenderer } from "@/components/site/LandingPageRenderer";
import { getPublishedPage } from "@/lib/page-store";
import styles from "./page.module.css";
import { getSiteUrl } from "@/lib/site-url";
import { connection } from "next/server";

const leaders = [
  {
    initials: "DB",
    name: "Dwayne Bramlett",
    bio: "Owner of Big Shanty Auction and longtime owner of Big Shanty Antiques, Dwayne brings deep knowledge of antiques and collectibles.",
  },
  {
    initials: "DR",
    name: "Drennon Rackley ",
    bio: "An experienced auctioneer, Drennon has conducted auctions throughout the Southeast and built broad knowledge of auction practices and collectibles.",
  },
];

const crew = [
  { initials: "DW", name: "Dana Worley", role: "Concession Vendor" },
  { initials: "AT", name: 'Abbigale "Tattletail"', role: "Auction Coordinator" },
  { initials: "SH", name: 'Scott "Cash" Houston', role: "Antiquities Dealer" },
  { initials: "DA", name: 'Dean "Elvis" Ayers', role: "Auction Logistics Specialist" },
  { initials: "S", name: "Stephanie", role: "Bidder Services Coordinator" },
  { initials: "BK", name: 'Breeze "The Knees"', role: "Furniture Moving Specialist" },
];

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const canonical = siteUrl ? new URL("/team", siteUrl).href : undefined;
  const description =
    "Meet the auctioneers and dedicated crew behind Big Shanty Auction in Marietta, Georgia.";

  return {
    title: "Our Team | Big Shanty Auction",
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: "Our Team | Big Shanty Auction",
      description,
      type: "website",
      siteName: "Big Shanty Auction",
      ...(canonical ? { url: canonical } : {}),
    },
  };
}

export default async function TeamPage() {
  await connection();
  const page = await getPublishedPage("team");

  if (page.published) {
    return (
      <div className={`${styles.page} team-page`}>
        <SiteHeader currentPage="Team" />
        <LandingPageRenderer page={page} />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className={`${styles.page} team-page`}>
      <SiteHeader currentPage="Team" />

      <main>
        <section className={styles.hero} aria-labelledby="team-title">
          <p className={styles.eyebrow}>Our Team</p>
          <h1 id="team-title">The People Behind <em>the Gavel</em></h1>
          <p className={styles.heroText}>
            An experienced crew of auctioneers and staff, dedicated to getting the
            best result for every client.
          </p>
        </section>

        <section className={styles.leadership} aria-labelledby="leadership-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Leadership</p>
            <h2 id="leadership-title">Our <em>Auctioneers</em></h2>
          </div>
          <div className={styles.leaders}>
            {leaders.map((leader) => (
              <article className={styles.leader} key={leader.name}>
                <div className={styles.initials} aria-hidden="true">{leader.initials}</div>
                <div>
                  <h3>{leader.name}</h3>
                  <p className={styles.role}>Auctioneer</p>
                  <p className={styles.bio}>{leader.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.crewSection} aria-labelledby="crew-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>The Crew</p>
            <h2 id="crew-title">A Dedicated Team Behind <em>Every Sale</em></h2>
            <p>
              From cataloguing and photography to running the shop and helping
              bidders and consignors, our crew keeps every sale moving.
            </p>
          </div>
          <div className={styles.crew}>
            {crew.map((member) => (
              <article className={styles.crewMember} key={member.name}>
                <div className={styles.crewInitials} aria-hidden="true">{member.initials}</div>
                <h3>{member.name}</h3>
                <p className={styles.role}>{member.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.contact} aria-labelledby="contact-title">
          <p className={styles.eyebrow}>Work With Us</p>
          <h2 id="contact-title">Ready to talk about <em>your collection?</em></h2>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="/contact">
              Contact Us
            </a>
            <a className={styles.button} href="tel:7702312019">
              Call (770) 231-2019
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
