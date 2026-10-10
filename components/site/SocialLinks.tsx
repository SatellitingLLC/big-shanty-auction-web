import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faYelp } from "@fortawesome/free-brands-svg-icons";

import styles from "./SocialLinks.module.css";

const socials = [
  {
    name: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL,
    icon: faFacebookF,
  },
  {
    name: "Yelp",
    href: process.env.NEXT_PUBLIC_YELP_URL,
    icon: faYelp,
  },
  {
    name: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    icon: faInstagram,
  },
];

export function SocialLinks() {
  const links = socials.filter((social): social is (typeof social) & { href: string } =>
    Boolean(social.href),
  );

  if (links.length === 0) return null;

  return (
    <nav className={styles.links} aria-label="Social media">
      {links.map(({ name, href, icon }) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}>
          <FontAwesomeIcon icon={icon} aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
