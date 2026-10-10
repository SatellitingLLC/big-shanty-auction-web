export async function submitContactForm(form: HTMLFormElement, event: { preventDefault(): void }) {
  event.preventDefault();
  if (form.dataset.sent) return;
  const data = new FormData(form);
  const email = String(data.get("email") ?? "").trim();
  const phone = String(data.get("phone") ?? "").trim();
  const error = form.querySelector<HTMLElement>("[role='alert']");
  const button = form.querySelector<HTMLButtonElement>("button[type='submit']");
  const show = (text: string) => {
    if (error) error.textContent = text;
  };

  if (!email && !phone) {
    show("Please add an email address or phone number so we can reply.");
    form.querySelector<HTMLInputElement>("[name='email']")?.focus();
    return;
  }

  show("");
  if (button) button.disabled = true;
  try {
    const topic = String(data.get("topic") ?? "");
    const name = String(data.get("name") ?? "");
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        ...Object.fromEntries(data),
        access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
        subject: `Inquiry: ${topic} - ${name}`,
        from_name: "Big Shanty Auction Website",
        botcheck: data.get("website") ? "1" : "",
      }),
    });
    const result = await res.json();
    if (!res.ok || !result.success) throw new Error();
    show("Thanks! Your message was sent. We'll be in touch soon.");
    form.dataset.sent = "true";
    form.querySelectorAll<HTMLElement>("input, textarea, button").forEach((el) => {
      (el as HTMLInputElement).disabled = true;
    });
    return;
  } catch {
    show("Sorry, that didn't send. Please call us or try again.");
  }
  if (button) button.disabled = false;
}
