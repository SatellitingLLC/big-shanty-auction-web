"use client";

import type { FormEvent } from "react";
import { submitContactForm } from "@/lib/contact-form";

import styles from "./page.module.css";

const topics = [
  { label: "Consignment", value: "Consignment" },
  { label: "Bidding", value: "Bidding" },
  { label: "Pickup", value: "Pickup" },
  { label: "Preview", value: "Preview" },
  { label: "Something else", value: "Something else" },
];

export function ContactForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    submitContactForm(event.currentTarget, event);
  }

  return (
    <form className={styles.form} data-contact-form onSubmit={handleSubmit}>
      <fieldset className={styles.formField}>
        <legend className={styles.fieldLabel}>I&apos;m reaching out about</legend>
        <div className={styles.topicOptions}>
          {topics.map((topic, index) => (
            <span className={styles.topic} key={topic.value}>
              <input
                id={`contact-topic-${index}`}
                type="radio"
                name="topic"
                value={topic.value}
                defaultChecked={index === 0}
              />
              <label htmlFor={`contact-topic-${index}`}>{topic.label}</label>
            </span>
          ))}
        </div>
      </fieldset>

      <div className={styles.fieldRow}>
        <div className={styles.formField}>
          <label className={styles.fieldLabel} htmlFor="contact-name">Your Name</label>
          <input id="contact-name" name="name" autoComplete="name" required />
        </div>
        <div className={styles.formField}>
          <label className={styles.fieldLabel} htmlFor="contact-phone">Phone</label>
          <input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>
      <div className={styles.formField}>
        <label className={styles.fieldLabel} htmlFor="contact-email">Email</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" />
      </div>
      <div className={styles.formField}>
        <label className={styles.fieldLabel} htmlFor="contact-message">Tell us about it</label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Describe the items, the estate, or your question..."
          required
        />
      </div>
      <p className={styles.formError} role="alert" aria-live="polite" />
      <p className={styles.formNote}>
        Your email app will open with a draft. Press Send there to send your message.
      </p>
      <button className={styles.submitButton} type="submit">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <g transform="translate(64 0) scale(-1 1)">
            <g transform="rotate(-30 32 24)">
              <rect x="18" y="12" width="28" height="14" rx="3" />
              <path d="M32 26v30" />
            </g>
          </g>
        </svg>
        Strike the Gavel
      </button>
    </form>
  );
}
