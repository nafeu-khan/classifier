import Link from "next/link";
import { useEffect, useState } from "react";
import { isLoggedIn as checkLoginStatus } from "../../../utils/auth";
import DropdownUser from "../Header/DropdownUser";
import toast from "react-hot-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    // Check login status
    setLoggedIn(checkLoginStatus());

    // Scroll handler to determine the active section
    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      let currentActive = "";
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
          currentActive = section.id;
        }
      });
      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md dark:bg-gray-900">
      <nav className="container sm:mx-auto flex items-center justify-between px-4 py-4 justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-primary dark:text-white">
          <Link href="/">{process.env.NEXT_PUBLIC_APP_NAME || "AppName"}</Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <ul className="flex items-center space-x-6 text-gray-700 dark:text-gray-300">
            <li>
              <Link
                href="/"
                className={`hover:text-primary ${
                  activeSection === "" ? "text-primary font-semibold" : ""
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="#aboutus"
                className={`hover:text-primary ${
                  activeSection === "aboutus" ? "text-primary font-semibold" : ""
                }`}
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="#team"
                className={`hover:text-primary ${
                  activeSection === "team" ? "text-primary font-semibold" : ""
                }`}
              >
                Team
              </Link>
            </li>
            <li>
              <Link
                href="#faq"
                className={`hover:text-primary ${
                  activeSection === "faq" ? "text-primary font-semibold" : ""
                }`}
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="#contactus"
                className={`hover:text-primary ${
                  activeSection === "contactus"
                    ? "text-primary font-semibold"
                    : ""
                }`}
              >
                Contact Us
              </Link>
            </li>
            <li className="py-2" onClick={() => toast.error("Under Development")}>
                GitHub
              </li>
          </ul>
          {/* Login/Signup Button */}

          {
            isLoggedIn ? (
              <DropdownUser />
            ) : (
              <a
                href="/signin"
                className="text-white bg-primary hover:bg-opacity-90 px-4 py-2 rounded-lg"
              >
                Sign In / Sign Up
              </a>
            )
          }
         
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={handleMenuToggle}
          className="lg:hidden text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          {isMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white dark:bg-gray-800 lg:hidden pb-4">
            <ul className="flex flex-col items-center py-4 text-gray-700 dark:text-gray-300">
              <li className="py-2">
                <Link
                  href="/"
                  className={`hover:text-primary ${
                    activeSection === "" ? "text-primary font-semibold" : ""
                  }`}
                  onClick={handleMenuToggle}
                >
                  Home
                </Link>
              </li>
              <li className="py-2">
                <Link
                  href="#aboutus"
                  className={`hover:text-primary ${
                    activeSection === "aboutus"
                      ? "text-primary font-semibold"
                      : ""
                  }`}
                  onClick={handleMenuToggle}
                >
                  Features
                </Link>
              </li>
              <li className="py-2">
                <Link
                  href="#team"
                  className={`hover:text-primary ${
                    activeSection === "team" ? "text-primary font-semibold" : ""
                  }`}
                  onClick={handleMenuToggle}
                >
                  Team
                </Link>
              </li>
              <li className="py-2">
                <Link
                  href="#faq"
                  className={`hover:text-primary ${
                    activeSection === "faq" ? "text-primary font-semibold" : ""
                  }`}
                  onClick={handleMenuToggle}
                >
                  FAQ
                </Link>
              </li>
              <li className="py-2">
                <Link
                  href="#contactus"
                  className={`hover:text-primary ${
                    activeSection === "contactus"
                      ? "text-primary font-semibold"
                      : ""
                  }`}
                  onClick={handleMenuToggle}
                >
                  Contact Us
                </Link>
              </li>
              <li className="py-2" onClick={() => toast("Under Development")}>
                GitHub
              </li>
            </ul>
            <a
              href={isLoggedIn ? "/dashboard" : "/signin"}
              className="block w-full text-center text-white bg-primary hover:bg-opacity-90 px-4 py-2 rounded-lg"
            >
              {isLoggedIn ? "Dashboard" : "Sign In / Sign Up"}
            </a>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
