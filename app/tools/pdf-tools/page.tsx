import PDFTools from "@/components/pages/tools/pdf-tools/PDFTools";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Tools - Extract Text, Merge, Split, Sign PDFs | Trevnoctilla",
  description: "Comprehensive PDF processing: extract text/images, merge, split, sign, watermark, and compress PDFs. Free online PDF tools with advanced features.",
  keywords: "pdf tools, pdf extractor, pdf merger, pdf splitter, pdf signature, pdf watermark, pdf compressor, pdf editor, online pdf tools",
  openGraph: {
    title: "PDF Tools - Extract Text, Merge, Split, Sign PDFs",
    description: "Comprehensive PDF processing: extract text/images, merge, split, sign, watermark, and compress PDFs.",
    type: "website",
  },
};

export default function PDFToolsRoute() {
  return <PDFTools />;
}
