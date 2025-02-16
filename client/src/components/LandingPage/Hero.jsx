// components/Hero.js
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "/images/image-2.jpg",
    "/images/image-2.jpg",
    "/images/image-2.jpg",
    "/images/image-2.jpg",
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative bg-gray-900 text-white overflow-hidden ">
      {/* Background Overlay */}
      <div className=" inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-75"></div>

        <div className="mt-24 text-center">
        <h1 className="text-6xl font-extrabold ">
            Question-Answering of Images with AI: Unlocking Visual Understanding
              <span className="block text-purple-500 mt-2 text-5xl mb-3">Faster and Smarter</span>
              <hr className="h-1 my-1 bg-gray-500 border-0 dark:bg-gray-700 max-w-screen-lg mx-auto" />
              <hr className="h-1 my-1 bg-gray-500 border-0 dark:bg-gray-700 max-w-screen-lg mx-auto" />
            </h1>
        </div>
      <div className="relative max-w-screen-xl px-4 mx-auto sm:px-6 lg:flex lg:items-center lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Text Content */}
          <div className="max-w-lg text-center lg:text-left">
            {/* <h1 className="text-3xl font-extrabold sm:text-5xl">
              Question-Answering of Images with AI: Unlocking Visual Understanding

              <span className="block text-purple-500">Faster and Smarter</span>
            </h1> */}
            <p className="text-lg sm:text-xl text-gray-300 font-semibold justify-center items-center text-justify">
            In an era dominated by visual data, the ability to extract meaningful insights from images has become a critical frontier in artificial intelligence. "Question-Answering of Images with AI: Unlocking Visual Understanding Faster and Smarter" explores how cutting-edge AI systems are transforming the way we interpret and interact with visual content. By leveraging advanced deep learning models and natural language processing, these systems enable seamless understanding of complex visual scenarios, bridging the gap between images and human-like comprehension. This revolution promises applications ranging from enhanced accessibility to intelligent automation, pushing the boundaries of what AI can achieve.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start space-x-4">
              <Link href="/get-started" legacyBehavior>
                <a className="px-8 py-3 font-semibold text-gray-900 bg-purple-500 rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition">
                  Get Started
                </a>
              </Link>
              <Link href="/learn-more" legacyBehavior>
                <a className="px-8 py-3 font-semibold text-white border border-purple-500 rounded-lg hover:bg-purple-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition">
                  Learn More
                </a>
              </Link>
            </div>
          </div>

          {/* Right Side: Carousel */}
          <div className="grid grid-cols-1 gap-4">
            <div className="relative">
              {/* Image Container */}
              <div className="overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={slides[currentSlide]} // Dynamically renders the current slide
                  alt={`Slide ${currentSlide + 1}`}
                  className="w-full h-96 object-cover rounded-lg object-center"
                  height={900}
                  width={700}
                />
              </div>

              {/* Carousel Buttons */}
              <div className="absolute inset-0 flex justify-between items-center px-4">
                <button
                  onClick={handlePrevSlide}
                  className="bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  &#10094;
                </button>
                <button
                  onClick={handleNextSlide}
                  className="bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  &#10095;
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slides.map((_, index) => (
                  <span
                    key={index}
                    className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-purple-500" : "bg-gray-500"
                      } transition duration-300`}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
