import AudioConverterPage from "@/components/pages/AudioConverterPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audio Converter - Convert Audio to MP3, WAV, AAC, FLAC | Trevnoctilla",
  description: "Convert audio between all formats with bitrate and quality control. MP3, WAV, AAC, FLAC, OGG, and more. Free online audio converter with high-quality output.",
  keywords: "audio converter, mp3 converter, wav converter, aac converter, flac converter, ogg converter, audio bitrate, audio quality, online audio converter",
  openGraph: {
    title: "Audio Converter - Convert Audio to MP3, WAV, AAC, FLAC",
    description: "Convert audio between all formats with bitrate and quality control. MP3, WAV, AAC, FLAC, OGG, and more.",
    type: "website",
  },
};

export default function AudioConverterRoute() {
  return <AudioConverterPage />;
}
