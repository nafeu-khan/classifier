// components/Faq.js
import { useState } from 'react';

const faqData = [
  {
    question: "What is image processing?",
    answer:
      "Image processing involves the manipulation of an image to enhance, transform, or extract useful information from it using advanced algorithms or AI.",
  },
  {
    question: "How does AI-powered image processing work?",
    answer:
      "AI-powered image processing uses machine learning and deep learning algorithms to automatically enhance image quality, remove backgrounds, or perform other complex tasks with minimal user input.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take data security seriously. All images and data are processed with strict privacy protocols to ensure your information remains safe.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "We support a variety of formats, including JPEG, PNG, BMP, and TIFF. Our platform also processes RAW images from most popular camera brands.",
  },
  {
    question: "Can I try the service for free?",
    answer:
      "Yes, we offer a free trial for new users. You can process a limited number of images before deciding on a subscription plan.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-gray-100 py-16 px-4">
      <div className="max-w-screen-md mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Frequently Asked Questions</h2>
        <p className="mt-4 text-lg text-gray-700">
          Here are some common questions about our image processing services. If you have more questions, feel free to contact us!
        </p>
      </div>

      <div className="mt-12 max-w-screen-md mx-auto space-y-4">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer"
            onClick={() => toggleFaq(index)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
              <span className="text-purple-500 text-2xl">
                {openIndex === index ? '-' : '+'}
              </span>
            </div>
            {openIndex === index && (
              <p className="mt-4 text-gray-700">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Faq;
