/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "your-production-domain.com"], // Replace with actual domains
  },
  async redirects() {
    return [
      {
        source: "/", // Match the root route
        destination: "/sh0wup", // Redirect to this page
        permanent: true, // Use true for permanent (301) or false for temporary (302)
      },
    ];
  },
};

export default nextConfig;
