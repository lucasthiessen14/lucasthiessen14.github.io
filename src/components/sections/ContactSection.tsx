import { useCallback, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { SectionTitle } from './SectionTitle';

type ContactSectionProps = {
  variant?: 'page' | 'modal';
};

const DIRECT_CONTACT = [
  { type: 'Personal', value: 'lucasthiessen14@gmail.com', href: 'mailto:lucasthiessen14@gmail.com' },
  {
    type: 'School',
    value: 'lucas.thiessen@uwaterloo.ca',
    href: 'mailto:lucas.thiessen@uwaterloo.ca',
  },
  { type: 'Phone', value: '226-970-2402', href: 'tel:+12269702402', solo: true },
] as const;

export function ContactSection({ variant = 'page' }: ContactSectionProps) {
  const { showToast } = useToast();

  const copyText = useCallback(
    (text: string) => {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(
          () => showToast('Copied to clipboard'),
          () => fallbackCopy(text, showToast),
        );
      } else {
        fallbackCopy(text, showToast);
      }
    },
    [showToast],
  );

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const honeypot = form.querySelector<HTMLInputElement>('[name="botcheck"]');
    if (honeypot?.checked) return;

    const submitBtn = form.querySelector<HTMLButtonElement>('[type="submit"]');
    if (!submitBtn) return;
    const defaultLabel = submitBtn.textContent ?? 'Send message';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        showToast('Message sent — thanks for reaching out!');
        form.reset();
      } else {
        showToast(data.message || 'Could not send message. Please try again.');
      }
    } catch {
      showToast('Could not send message. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = defaultLabel;
    }
  };

  const form = (
    <form
      className="contact__form reveal"
      action="https://api.web3forms.com/submit"
      method="POST"
      noValidate
      onSubmit={onSubmit}
    >
      <input type="hidden" name="access_key" value="9d1538be-3bd3-4898-a882-61e33f6448ae" />
      <input type="hidden" name="subject" value="New message from lucasthiessen.com" />
      <input type="hidden" name="from_name" value="Portfolio — lucasthiessen.com" />
      <input
        type="checkbox"
        name="botcheck"
        className="contact__honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="contact__row-fields">
        <div className="contact__field">
          <label className="contact__label" htmlFor="contact-name">
            Name
          </label>
          <input
            className="contact__input"
            type="text"
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
          />
        </div>
        <div className="contact__field">
          <label className="contact__label" htmlFor="contact-email">
            Email
          </label>
          <input
            className="contact__input"
            type="email"
            id="contact-email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div className="contact__field">
        <label className="contact__label" htmlFor="contact-message">
          Message
        </label>
        <textarea
          className="contact__textarea"
          id="contact-message"
          name="message"
          rows={5}
          required
          placeholder="What would you like to discuss?"
        />
      </div>
      <button type="submit" className="btn btn--primary contact__submit">
        Send message
      </button>
      <div className="contact__direct" aria-label="Direct contact options">
        <span className="contact__direct-label">Or reach me directly</span>
        <ul className="contact__direct-list">
          {DIRECT_CONTACT.map((item) => (
            <li
              key={item.type}
              className={`contact__direct-item${'solo' in item && item.solo ? ' contact__direct-item--solo' : ''}`}
            >
              <span className="contact__direct-type">{item.type}</span>
              <div className="contact__direct-row">
                <a href={item.href} className="contact__direct-link">
                  {item.value}
                </a>
                <button
                  type="button"
                  className="contact__copy"
                  aria-label={`Copy ${item.type.toLowerCase()}`}
                  onClick={() => copyText(item.value)}
                >
                  Copy
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );

  const inner = (
    <>
      {variant === 'page' ? (
        <SectionTitle number="06">Get in Touch</SectionTitle>
      ) : (
        <h2 className="section__title contact__title" style={{ display: 'none' }}>
          <span className="section__number">06</span>
          <span className="section__title-text">Get in Touch</span>
        </h2>
      )}
      <p className="contact__subtitle">Open to opportunities and collaborations.</p>
      {form}
    </>
  );

  if (variant === 'modal') {
    return <div className="contact__inner reveal">{inner}</div>;
  }

  return (
    <section className="section contact" id="contact">
      <div className="container contact__inner reveal">{inner}</div>
    </section>
  );
}

function fallbackCopy(text: string, showToast: (msg: string) => void) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('Copied to clipboard');
  } catch {
    showToast('Copy failed');
  }
  document.body.removeChild(ta);
}
