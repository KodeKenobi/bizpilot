import ImageConverterPage from "@/components/pages/ImageConverterPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter - Convert Images to JPG, PNG, WEBP, GIF | Trevnoctilla",
  description: "Convert images between all formats with resize and quality control. JPG, PNG, WEBP, GIF, and more. Free online image converter with high-quality output.",
  keywords: "image converter, jpg converter, png converter, webp converter, gif converter, image resize, image quality, online image converter",
  openGraph: {
    title: "Image Converter - Convert Images to JPG, PNG, WEBP, GIF",
    description: "Convert images between all formats with resize and quality control. JPG, PNG, WEBP, GIF, and more.",
    type: "website",
  },
};

export default function ImageConverterRoute() {
  return <ImageConverterPage />;
}
