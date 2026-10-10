import Image from "next/image";
import Link from "next/link";

import { SocialLinks } from "./SocialLinks";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.grid}>
        <div>
          <Link href="/" aria-label="Big Shanty Auction home">
            <Image
              src="/assets/auction-photo.png"
              width={600}
              height={393}
              alt="Big Shanty Auction"
            />
          </Link>
          <p>Family owned and operated in Marietta, Georgia.</p>
        </div>
        <div>
          <h2>Company</h2>
          <Link href="/about">About Us</Link>
          <Link href="/#services">Services</Link>
          <Link href="/team">Our Team</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <h2>Services</h2>
          <a href="https://bigshantyauction.com" target="_blank" rel="noopener noreferrer">Auctions</a>
          <a href="https://bigshantyestatesales.com" target="_blank" rel="noopener noreferrer">Estate Sales</a>
          <a href="https://bigshantyantique.com" target="_blank" rel="noopener noreferrer">Antique Mall</a>
        </div>
        <div>
          <h2>Get in Touch</h2>
          <p>2932 Canton Rd<br />Marietta, GA 30066</p>
          <a href="mailto:dwaynesantiques@gmail.com">dwaynesantiques@gmail.com</a>
          <a href="tel:7702312019">(770) 231-2019</a>
          <SocialLinks />
        </div>
      </div>
      <div className={styles.finePrint}>
        <span>© Big Shanty Auction · Auctioneer ID #34044 · License AU003986</span>
        <span>Designed by <a href="https://satelliting.space/">Satelliting LLC</a></span>
      </div>
    </footer>
  );
}
