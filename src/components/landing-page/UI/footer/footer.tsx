import React from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import "./footer.scss";

const Footer: React.FC = () => {
  const footerLinks = [
    { text: "Contact", href: "/contact" },
    { text: "Privacy Policy", href: "/privacy-policy/privacy-policy.pdf" },
    { text: "Terms of Service", href: "#" },
  ];

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__social-links">
            {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
              >
                <Icon size={24} />
              </a>
            ))}
          </div>

          <div className="footer__nav-links">
            {footerLinks.map(({ text, href }, index) => (
              <Link
                key={index}
                href={href}
                target={text === "Privacy Policy" ? "_blank" : undefined}
                rel={text === "Privacy Policy" ? "noopener noreferrer" : undefined}
              >
                {text}
              </Link>
            ))}
          </div>

          <p className="footer__copyright">
            © {new Date().getFullYear()} Limonata Project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;