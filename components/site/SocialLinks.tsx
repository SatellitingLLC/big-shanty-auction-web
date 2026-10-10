import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faYelp } from "@fortawesome/free-brands-svg-icons";

import styles from "./SocialLinks.module.css";

const socials = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/Bigshantyauction21/",
    icon: faFacebookF,
  },
  {
    name: "Yelp",
    href: "https://www.yelp.com/biz/big-shanty-antiques-marietta-4",
    icon: faYelp,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/bigshantyauction/",
    icon: faInstagram,
  },
];

export function SocialLinks() {
  return (
    <nav className={styles.links} aria-label="Social media">
      {socials.map(({ name, href, icon }) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}>
          <FontAwesomeIcon icon={icon} aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
