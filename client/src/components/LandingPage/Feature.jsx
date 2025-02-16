// components/AboutUs.js

const Feature = () => {
  return (
    <section id="aboutus" className="bg-gray-100 py-16 px-4">
      <div className="max-w-screen-xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Feature
        </h2>
        <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
          We’re a team of passionate developers and designers dedicated to providing advanced image processing tools powered by AI. Our goal is to help you transform your images effortlessly and with precision, saving you time and boosting your creativity.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-screen-lg mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-xl font-semibold text-gray-900">AI-Powered Enhancements</h3>
          <p className="mt-2 text-gray-600">
            Leverage our AI tools to enhance image quality, add details, and adjust colors, making every photo stand out.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-xl font-semibold text-gray-900">Background Removal</h3>
          <p className="mt-2 text-gray-600">
            Remove backgrounds instantly with our smart algorithms, giving you clean and professional images in seconds.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-xl font-semibold text-gray-900">User-Friendly Interface</h3>
          <p className="mt-2 text-gray-600">
            Our intuitive platform is designed to be accessible to everyone, from beginners to professionals.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-xl font-semibold text-gray-900">Fast & Secure Processing</h3>
          <p className="mt-2 text-gray-600">
            Experience lightning-fast processing speeds with data privacy ensured for all users.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-xl font-semibold text-gray-900">High-Resolution Output</h3>
          <p className="mt-2 text-gray-600">
            Get high-resolution output images that maintain the quality and clarity you need for any project.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-xl font-semibold text-gray-900">Dedicated Support</h3>
          <p className="mt-2 text-gray-600">
            Our support team is always ready to help with any questions or issues you may encounter.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Feature;
