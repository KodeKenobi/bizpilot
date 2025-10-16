import VideoConverterPage from "@/components/pages/VideoConverterPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Converter - Convert Videos to MP4, AVI, MOV, MKV | Trevnoctilla",
  description: "Convert videos between all formats with compression and quality control. MP4, AVI, MOV, MKV, WEBM, and more. Free online video converter with high-quality output.",
  keywords: "video converter, mp4 converter, avi converter, mov converter, mkv converter, webm converter, video compression, video quality, online video converter",
  openGraph: {
    title: "Video Converter - Convert Videos to MP4, AVI, MOV, MKV",
    description: "Convert videos between all formats with compression and quality control. MP4, AVI, MOV, MKV, WEBM, and more.",
    type: "website",
  },
};

export default function VideoConverterRoute() {
  return <VideoConverterPage />;
}
