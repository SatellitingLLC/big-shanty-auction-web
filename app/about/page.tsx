import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { LandingPageRenderer } from "@/components/site/LandingPageRenderer";
import { getPublishedPage } from "@/lib/page-store";
import { getSiteUrl } from "@/lib/site-url";
import { connection } from "next/server";
import styles from "./page.module.css";

const chapters = [
  {
    chapter: "Chapter I",
    title: "The Backroom",
    description: "A small auction company takes root in the back of a big antique mall.",
  },
  {
    chapter: "Chapter II",
    title: "A Following",
    description: "People from all walks of life gather for the auctions and stay for the company.",
  },
  {
    chapter: "Chapter III",
    title: "Room to Grow",
    description:
      "A 5,000+ sq ft space built for auctions, alongside a 5,000+ sq ft warehouse for future sales.",
  },
  {
    chapter: "Chapter IV",
    title: "Today",
    description:
      "An antique mall, monthly auctions featuring 500+ items, and several estate sales each month.",
  },
];

const facts = [
  { value: "5,000+", label: "Sq Ft Auction Space" },
  { value: "5,000+", label: "Sq Ft Warehouse" },
  { value: "500+", label: "Items Per Monthly Auction" },
  { value: "3", label: "Ways We Serve You" },
];

const siteUrl = getSiteUrl();
const description =
  "Learn how Big Shanty Auction grew from a backroom auction into a Marietta, Georgia destination for antiques, monthly auctions, and estate sales.";
const canonical = siteUrl ? new URL("/about", siteUrl).href : undefined;

export const metadata: Metadata = {
  title: "About Us | Big Shanty Auction",
  description,
  alternates: canonical ? { canonical } : undefined,
  openGraph: {
    title: "About Us | Big Shanty Auction",
    description,
    type: "website",
    siteName: "Big Shanty Auction",
    ...(canonical ? { url: canonical } : {}),
  },
};

export default async function AboutPage() {
  await connection();
  const page = await getPublishedPage("about");

  if (page.published) {
    return (
      <div className={`${styles.page} about-page`}>
        <SiteHeader currentPage="About" />
        <LandingPageRenderer page={page} />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className={`${styles.page} about-page`}>
      <SiteHeader currentPage="About" />

      <main>
        <header className={styles.hero} aria-labelledby="about-title">
          <p className={styles.eyebrow}>About Us</p>
          <h1 id="about-title">
            Every Great Piece Has a <em>Provenance.</em> So Do We.
          </h1>
          <p className={styles.heroText}>
            Big Shanty Auction is the auction venture of Big Shanty Antiques. This is how a
            backroom auction became a destination.
          </p>
        </header>

        <section className={styles.story} aria-labelledby="story-title">
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Who We Are</p>
            <h2 id="story-title">
              The Auction Venture of <em>Big Shanty Antiques</em>
            </h2>
            <p>
              We started as a small auction company in the backroom of a big antique mall,
              building a following of people who enjoyed the auctions and getting to know us.
            </p>
            <p>
              Today, our auction space and warehouse each span more than 5,000 square feet.
              We work closely with consignors and bidders to make every sale worth coming back for.
            </p>
          </div>
          <aside className={styles.catalogue} aria-label="Big Shanty Auction at a glance">
            <div className={styles.catalogueTop}>
              <span>Catalogue Entry</span>
              <span>Lot No. 1</span>
            </div>
            <h3>Big Shanty Auction</h3>
            <p className={styles.location}>Marietta, Georgia</p>
            <dl>
              <dt>Origin</dt>
              <dd>The backroom of an antique mall</dd>
              <dt>Specialty</dt>
              <dd>Antiques, collectibles, and estates</dd>
              <dt>Space</dt>
              <dd>5,000+ sq ft auction space and warehouse</dd>
              <dt>Status</dt>
              <dd>Still growing</dd>
            </dl>
            <span className={styles.seal} aria-hidden="true">Est. in<br />the<br />backroom</span>
          </aside>
        </section>

        <section className={styles.storySection} aria-labelledby="chapters-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Provenance</p>
            <h2 id="chapters-title">Chapters of <em>Our Story</em></h2>
          </div>
          <ol className={styles.timeline}>
            {chapters.map(({ chapter, title, description }) => (
              <li className={styles.chapter} key={chapter}>
                <p className={styles.chapterLabel}>{chapter}</p>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.factsSection} aria-label="Big Shanty Auction facts">
          <ul className={styles.facts}>
            {facts.map(({ value, label }) => (
              <li key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <p className={styles.services}>Antique mall · Monthly auctions · Estate sales</p>
        </section>

        <section className={styles.missionSection} aria-label="Our mission and vision">
          <article className={styles.principle}>
            <p className={styles.chapterLabel}>i.</p>
            <h2>Our Mission</h2>
            <p>
              To care for consignors’ items and give bidders the chance to find remarkable
              pieces at a fair price.
            </p>
          </article>
          <article className={styles.principle}>
            <p className={styles.chapterLabel}>ii.</p>
            <h2>Our Vision</h2>
            <p>
              To grow Big Shanty Antiques &amp; Auction into a leading antiques and auction
              destination across the Southeast.
            </p>
          </article>
        </section>

        <section className={styles.contact} aria-labelledby="contact-title">
          <p className={styles.eyebrow}>Be Part of the Story</p>
          <h2 id="contact-title">
            The next chapter could include <em>your collection.</em>
          </h2>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="/contact">
              Get in Touch
            </a>
            <a
              className={styles.button}
              href="https://bigshantyauction.hibid.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bid Online
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
