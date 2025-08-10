import React from 'react';

const Footer: React.FC = () => (
  <footer className="!mt-70 sm:!mt-50 flex w-full flex-col items-center justify-center !py-6 shadow-inner">
    <hr className="!mx-auto !mb-6 w-[80%] bg-gradient-to-r from-emerald-400 to-cyan-500" />
    <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 !px-6">
      <div className="!mb-2 text-sm md:mb-0">
        &copy; {new Date().getFullYear()} Gift Egbonyi. All rights reserved.
      </div>
      <div className="sm:text-md flex gap-4 text-sm">
        <a
          href="https://github.com/GiftinTech"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pink hover:font-bold"
        >
          GitHub
        </a>
        <a
          href="mailto:egbonyigiftvicky@email.com"
          className="hover:text-pink-dark hover:font-bold"
        >
          Email
        </a>
        <a
          href="https://www.linkedin.com/in/gift-egbonyi"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pink-dark hover:font-bold"
        >
          LinkedIn
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
