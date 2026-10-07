export function submitContactForm(form: HTMLFormElement, event: { preventDefault(): void }) {
  event.preventDefault();
  const data = new FormData(form);
  const email = String(data.get("email") ?? "").trim();
  const phone = String(data.get("phone") ?? "").trim();
  const error = form.querySelector<HTMLElement>("[role='alert']");

  if (!email && !phone) {
    if (error) error.textContent = "Please add an email address or phone number so we can reply.";
    form.querySelector<HTMLInputElement>("[name='email']")?.focus();
    return;
  }

  if (error) error.textContent = "";
  const body = [
    `Name: ${data.get("name")}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Interested in: ${data.get("topic")}`,
    "",
    String(data.get("message")),
  ].join("\n");
  const subject = `Inquiry: ${data.get("topic")} - ${data.get("name")}`;

  window.location.href =
    `mailto:dwaynesantiques@gmail.com?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;
}
