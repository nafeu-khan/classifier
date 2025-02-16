// components/Footer.js
import { FaGithub, FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="relative overflow-hidden z-1">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap -mx-4 gap-8">
            {/* Brand Logo and Newsletter */}
            <div className="w-full md:w-1/2 lg:w-1/4 px-4 mb-8">
              <div className="flex items-center space-x-2 mb-4">            
                <span className="text-2xl font-bold">
                  WindMill
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Stay in the Loop: Subscribe Now to Receive the Latest Updates
                Straight to Your Inbox!
              </p>
              {/* Newsletter Component Placeholder */}
              {/* <Newsletter /> */}
            </div>

            {/* Quick Links */}
            <div className="w-full sm:w-1/2 lg:w-1/6 px-4">
              <h6 className="text-lg font-semibold text-white mb-4">
                Main Pages
              </h6>
              <ul className="space-y-2">
                <li>
                  <a href="#landingAboutUs" className="hover:underline">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#landingFeatures" className="hover:underline">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Help Links */}
            <div className="w-full sm:w-1/2 lg:w-1/6 px-4">
              <h6 className="text-lg font-semibold text-white mb-4">Pages</h6>
              <ul className="space-y-2">
                <li>
                  <a href="#landingFAQ" className="hover:underline">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/signin" target="_blank" className="hover:underline">
                    Signin/Register
                  </a>
                </li>
              </ul>
            </div>

            {/* Download App */}
            <div className="w-full md:w-1/2 lg:w-1/4 px-4">
              <h6 className="text-lg font-semibold text-white mb-4">
                Download our app
              </h6>
              <a href="#" className="block mb-2">
                <img
                  src="../../../public/images/landingPage/apple-icon.png"
                  alt="Download on Apple"
                  className="w-32"
                />
              </a>
              <a href="#" className="block">
                <img
                  src="../../../public/images/landingPage/google-play-icon.png"
                  alt="Download on Google Play"
                  className="w-32"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-700 py-4">
        <div className="container mx-auto px-6 flex flex-wrap justify-between items-center">
          <div className="text-sm text-gray-400">
            &copy; 2024-2025 SmartTech LLC. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white">
              <FaGithub size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <FaFacebookF size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
