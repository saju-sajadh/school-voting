/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jixqkoauccnrfqahgkph.supabase.co",
        pathname: "/storage/v1/object/public/election/**", 
      },
    ],
  },
};

export default nextConfig;