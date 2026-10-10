import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SocialLinks } from "@/components/site/SocialLinks";
import { LandingPageRenderer } from "@/components/site/LandingPageRenderer";
import { getPublishedPage } from "@/lib/page-store";
import { connection } from "next/server";
import { getSiteUrl } from "@/lib/site-url";
import styles from "./page.module.css";
import { ContactForm } from "./ContactForm";

const siteUrl = getSiteUrl();
const canonical = siteUrl ? new URL("/contact", siteUrl).href : undefined;
const description =
  "Contact Big Shanty Auction in Marietta, Georgia about consigning, bidding, antiques, or estate sales.";

export const metadata: Metadata = {
  title: "Contact Us | Big Shanty Auction",
  description,
  alternates: canonical ? { canonical } : undefined,
  openGraph: {
    title: "Contact Us | Big Shanty Auction",
    description,
    type: "website",
    siteName: "Big Shanty Auction",
    ...(canonical ? { url: canonical } : {}),
  },
};

export default async function ContactPage() {
  await connection();
  const page = await getPublishedPage("contact");

  if (page.published) {
    return (
      <div className={`${styles.page} contact-page`}>
        <SiteHeader currentPage="Contact" />
        <LandingPageRenderer page={page} />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className={`${styles.page} contact-page`}>
      <SiteHeader currentPage="Contact" />

      <main>
        <header className={styles.hero} aria-labelledby="contact-title">
          <p className={styles.eyebrow}>Contact</p>
          <h1 id="contact-title">
            Going Once. Going Twice. <em>Say Hello.</em>
          </h1>
          <p className={styles.heroText}>
            Consigning an estate, asking about a lot, or just curious what’s on the block?
            We’d love to hear from you.
          </p>
        </header>

        <section className={styles.contactSection} aria-label="Contact Big Shanty Auction">
          <div className={styles.ticket}>
            <div className={styles.ticketHeader}>
              <strong>Big Shanty Auction</strong>
              <span>Lot No. <em>2932</em></span>
            </div>
            <div className={styles.perforation} aria-hidden="true" />
            <ContactForm />
          </div>

          <aside className={styles.detailsColumn} aria-label="Visit or call us">
            <section className={styles.detailCard}>
              <p className={styles.eyebrow}>Come On In</p>
              <h2>Visit the <em>Auction House</em></h2>
              <address>
                2932 Canton Rd, Suite 110
                <br />
                Marietta, GA 30066
              </address>
              <a
                className={styles.textLink}
                href="https://www.google.com/maps/search/?api=1&query=2932+Canton+Rd+Suite+110+Marietta+GA+30066"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get directions <span aria-hidden="true">↗</span>
              </a>
            </section>

            <section className={styles.detailCard}>
              <p className={styles.eyebrow}>Call or Email</p>
              <h2>We’re Easy to <em>Reach</em></h2>
              <a className={styles.detailLink} href="tel:7702312019">
                (770) 231-2019
              </a>
              <a className={styles.detailLink} href="mailto:dwaynesantiques@gmail.com">
                dwaynesantiques@gmail.com
              </a>
            </section>

            <section className={styles.detailCard}>
              <p className={styles.eyebrow}>Store Hours</p>
              <h2>Stop By <em>Any Day</em></h2>
              <dl className={styles.hours}>
                <div><dt>Monday–Saturday</dt><dd>10 a.m.–6 p.m.</dd></div>
                <div><dt>Sunday</dt><dd>Noon–6 p.m.</dd></div>
              </dl>
              <p className={styles.hoursNote}>Hours can change; please call ahead to confirm.</p>
            </section>

            <section className={`${styles.detailCard} ${styles.socialCard}`}>
              <p className={styles.eyebrow}>Follow Along</p>
              <h2>Find us <em>around town.</em></h2>
              <p className={styles.socialText}>
                Follow the latest finds, auction updates, and the latest Big Shanty updates.
              </p>
              <SocialLinks />
            </section>
          </aside>
        </section>

        <section className={styles.bidderSection} aria-labelledby="bidder-title">
          <div>
            <p className={styles.eyebrow}>New to Our Auctions?</p>
            <h2 id="bidder-title">A few helpful things to <em>know.</em></h2>
          </div>
          <div className={styles.bidderInfo}>
            <p>Our auctions are held online through HiBid, and bidder registration is free.</p>
            <p>Payment is due within three days after the auction closes. Items must be picked up within ten days.</p>
            <a
              className={styles.bidLink}
              href="https://bigshantyauction.hibid.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Browse auctions on HiBid <span aria-hidden="true">↗</span>
            </a>
            <a
              className={styles.bidLink}
              href="https://www.auctionzip.com/ga-auctioneers/371513.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Browse auctions on AuctionZip <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
