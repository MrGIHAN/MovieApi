import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Blog', href: '/blog' },
      ]
    },
    support: {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Account', href: '/profile' },
        { name: 'Redeem Gift Cards', href: '/gift-cards' },
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Preferences', href: '/cookies' },
        { name: 'Corporate Information', href: '/corporate' },
      ]
    },
    social: {
      title: 'Connect',
      links: [
        { name: 'Facebook', href: 'https://facebook.com', external: true },
        { name: 'Twitter', href: 'https://twitter.com', external: true },
        { name: 'Instagram', href: 'https://instagram.com', external: true },
        { name: 'YouTube', href: 'https://youtube.com', external: true },
      ]
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-netflix-black border-t border-netflix-gray mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-white font-semibold text-lg mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-netflix-lightGray hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-netflix-lightGray hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-netflix-gray my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-netflix-red text-xl font-bold">
              NETFLIX
            </Link>
            <span className="text-netflix-lightGray text-sm">
              © {currentYear} Netflix Clone. All rights reserved.
            </span>
          </div>

          {/* Language and Region Selector */}
          <div className="flex items-center space-x-4">
            <select className="bg-netflix-darkGray border border-netflix-gray text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
            
            <select className="bg-netflix-darkGray border border-netflix-gray text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red">
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
            </select>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-netflix-gray">
          <div className="text-center text-netflix-lightGray text-xs space-y-2">
            <p>
              Netflix Clone is a demonstration project created for educational purposes.
            </p>
            <p>
              This is not affiliated with Netflix, Inc. All movie content and trademarks
              belong to their respective owners.
            </p>
            <p>
              Built with React, Spring Boot, and lots of ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;