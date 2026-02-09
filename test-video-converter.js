const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const BASE_URL = process.env.BASE_URL || "https://www.trevnoctilla.com";
const TEST_VIDEO_PATH = path.join(__dirname, "test-files", "test-video.mp4");

// Check if test video exists
if (!fs.existsSync(TEST_VIDEO_PATH)) {
  console.error(`❌ Test video not found at: ${TEST_VIDEO_PATH}`);
  process.exit(1);
}

async function testVideoConverter() {
  console.log("🧪 Starting Video Converter Test\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Video: ${TEST_VIDEO_PATH}\n`);

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1280, height: 720 },
  });

  try {
    const page = await browser.newPage();
    let uniqueFilename = null; // Declare early for use in response handler

    // Enable console logging
    page.on("console", (msg) => {
      const type = msg.type();
      if (type === "error") {
        console.log(`[Browser Console Error] ${msg.text()}`);
      }
    });

    // Navigate to video converter page
    console.log("📄 Navigating to video converter page...");
    await page.goto(`${BASE_URL}/tools/video-converter`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Take screenshot of initial state
    await page.screenshot({ path: "video-converter-initial.png" });
    console.log("📸 Screenshot saved: video-converter-initial.png");

    // Check if upload area is visible
    console.log("🔍 Checking for upload area...");
    const uploadArea = await page.$(
      'input[type="file"], [class*="dropzone"], [class*="upload"]'
    );
    if (!uploadArea) {
      // Try to find the "Choose File" button
      const chooseFileButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        return buttons.find((btn) => btn.textContent?.includes("Choose File"));
      });
      if (chooseFileButton && (await chooseFileButton.jsonValue()) !== null) {
        console.log("✅ Found 'Choose File' button");
      } else {
        throw new Error("Upload area not found");
      }
    } else {
      console.log("✅ Upload area found");
    }

    // Upload the video file
    console.log("📤 Uploading test video...");
    let fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      // Try clicking the Choose File button first
      const chooseFileBtn = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        return buttons.find((btn) => btn.textContent?.includes("Choose File"));
      });
      if (chooseFileBtn && (await chooseFileBtn.jsonValue()) !== null) {
        const btnElement = await chooseFileBtn.asElement();
        if (btnElement) {
          await btnElement.click();
          await page.waitForTimeout(500);
        }
      }
      // Try again to find file input
      fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(TEST_VIDEO_PATH);
      } else {
        throw new Error("File input not found after clicking Choose File");
      }
    } else {
      await fileInput.uploadFile(TEST_VIDEO_PATH);
    }

    console.log("✅ File uploaded");

    // Wait for file to be processed and displayed
    await page.waitForTimeout(2000);

    // Take screenshot after upload
    await page.screenshot({ path: "video-converter-after-upload.png" });
    console.log("📸 Screenshot saved: video-converter-after-upload.png");

    // Verify file is selected
    const fileInfo = await page.$('text="Selected file:"');
    if (fileInfo) {
      const fileText = await page.evaluate((el) => el.textContent, fileInfo);
      console.log(`✅ File selected: ${fileText}`);
    }

    // Check conversion options are visible
    console.log("🔍 Checking conversion options...");
    const outputFormat = await page.$(
      'select, [name*="format"], [id*="format"]'
    );
    if (outputFormat) {
      console.log("✅ Output format selector found");
    }

    // Select output format (optional - test with different format)
    try {
      const formatSelect = await page.$("select");
      if (formatSelect) {
        await formatSelect.select("webm");
        console.log("✅ Selected output format: WebM");
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log("⚠️ Could not change format (using default)");
    }

    // Click convert button
    console.log("🚀 Starting conversion...");
    const convertButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.find((btn) => {
        const text = btn.textContent || "";
        return (
          text.includes("Convert") ||
          text.includes("Extract") ||
          text.includes("to MP4") ||
          text.includes("to WebM")
        );
      });
    });

    if (!convertButton || (await convertButton.jsonValue()) === null) {
      throw new Error("Convert button not found");
    }

    const buttonElement = await convertButton.asElement();
    if (!buttonElement) {
      throw new Error("Convert button element not found");
    }

    // Intercept network requests to capture the backend response
    let backendResponse = null;
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/convert-video")) {
        try {
          backendResponse = await response.json();
          console.log(
            `📡 Backend response: ${JSON.stringify(backendResponse)}`
          );
          if (backendResponse.unique_filename) {
            uniqueFilename = backendResponse.unique_filename;
            console.log(
              `📝 Captured unique filename from response: ${uniqueFilename}`
            );
          }
        } catch (e) {
          console.log(`⚠️ Could not parse backend response: ${e.message}`);
        }
      }
    });

    await buttonElement.click();
    console.log("✅ Convert button clicked");

    // Wait for backend response
    await page.waitForTimeout(5000);

    // Also try to extract from page state as fallback
    if (!uniqueFilename) {
      try {
        const extractedFilename = await page.evaluate(() => {
          // Check React state or component props
          if (window.currentConversionId) return window.currentConversionId;
          // Check for any global variables
          const reactFiber =
            document.querySelector("[data-reactroot]")?._reactInternalFiber;
          return null;
        });
        if (extractedFilename) {
          uniqueFilename = extractedFilename;
          console.log(
            `📝 Extracted filename from page state: ${uniqueFilename}`
          );
        }
      } catch (e) {
        // Ignore
      }
    }

    // Wait for upload progress
    console.log("⏳ Waiting for upload progress...");
    try {
      await page.waitForSelector(
        'text="Uploading", text="Uploading video", [class*="upload"]',
        { timeout: 10000 }
      );
      console.log("✅ Upload progress detected");

      // Wait for upload to complete (check for progress percentage or completion)
      let uploadComplete = false;
      let attempts = 0;
      while (!uploadComplete && attempts < 30) {
        await page.waitForTimeout(1000);
        const uploadText = await page.evaluate(() => {
          const text = document.body.textContent || "";
          return text.includes("Uploading") || text.includes("Processing");
        });
        if (!uploadText || attempts > 20) {
          uploadComplete = true;
        }
        attempts++;
      }
    } catch (e) {
      console.log(
        "⚠️ Upload progress indicator not found (may have completed quickly)"
      );
    }

    // Wait for conversion progress
    console.log("⏳ Waiting for conversion progress...");
    let conversionComplete = false;
    let progressValue = 0;
    let maxWaitTime = 300000; // 5 minutes max
    const startTime = Date.now();
    let stuckInInit = false;
    let lastStatusMessage = "";
    let sameStatusCount = 0;

    // Get the unique filename from the page after upload
    try {
      uniqueFilename = await page.evaluate(() => {
        // Try to find the conversion ID or filename from the page state
        // This might be in a hidden input, data attribute, or global variable
        const scripts = Array.from(document.querySelectorAll("script"));
        for (const script of scripts) {
          const content = script.textContent || "";
          if (
            content.includes("unique_filename") ||
            content.includes("conversionId")
          ) {
            // Try to extract it
            const match = content.match(
              /unique_filename["\']?\s*[:=]\s*["\']([^"\']+)["\']/
            );
            if (match) return match[1];
          }
        }
        return null;
      });
      if (uniqueFilename) {
        console.log(`📝 Found unique filename: ${uniqueFilename}`);
      }
    } catch (e) {
      console.log("⚠️ Could not extract unique filename from page");
    }

    while (!conversionComplete && Date.now() - startTime < maxWaitTime) {
      await page.waitForTimeout(2000);

      // Check backend progress directly if we have the filename
      if (
        uniqueFilename !== null &&
        uniqueFilename &&
        sameStatusCount % 5 === 0
      ) {
        try {
          const progressUrl = `${BASE_URL}/conversion_progress/${encodeURIComponent(
            uniqueFilename
          )}`;
          const progressResponse = await page.evaluate(async (url) => {
            try {
              const res = await fetch(url);
              return await res.json();
            } catch (e) {
              return { error: e.message };
            }
          }, progressUrl);

          if (progressResponse && !progressResponse.error) {
            console.log(
              `📊 Backend progress: ${JSON.stringify(progressResponse)}`
            );
            if (progressResponse.progress !== undefined) {
              console.log(`   Progress: ${progressResponse.progress}%`);
              console.log(`   Status: ${progressResponse.status}`);
              console.log(`   Message: ${progressResponse.message || "N/A"}`);
            }
          }
        } catch (e) {
          // Ignore errors in progress check
        }
      }

      // Check actual progress percentage from the progress bar
      const actualProgress = await page.evaluate(() => {
        const progressBar = document.querySelector('[class*="progress"]');
        if (progressBar) {
          const style = window.getComputedStyle(progressBar);
          const width = style.width;
          const match = width.match(/(\d+)%/);
          return match ? parseInt(match[1]) : 0;
        }
        return 0;
      });

      // Check current status message (but ignore file size displays)
      const currentStatus = await page.evaluate(() => {
        const statusEl = document.querySelector(
          '[class*="animate-pulse"], [class*="text-yellow"], [class*="text-blue"]'
        );
        if (statusEl) {
          const text = statusEl.textContent || "";
          // Ignore file size displays (contains "MB" and is just a number)
          if (text.match(/^\d+\.?\d*\s*MB$/)) {
            return "";
          }
          return text;
        }
        return "";
      });

      // Track progress changes
      if (actualProgress > progressValue) {
        progressValue = actualProgress;
        console.log(`📊 Progress: ${progressValue}%`);
        sameStatusCount = 0; // Reset stuck counter when progress changes
        stuckInInit = false;
      }

      // Only detect as stuck if:
      // 1. Progress hasn't changed for a long time (60+ seconds)
      // 2. AND we have a valid status message (not file size)
      // 3. AND progress is still 0% or very low
      if (currentStatus && currentStatus !== lastStatusMessage) {
        console.log(`📝 Status: ${currentStatus}`);
        lastStatusMessage = currentStatus;
        sameStatusCount = 0;
      } else if (
        currentStatus === lastStatusMessage &&
        currentStatus &&
        actualProgress === 0
      ) {
        sameStatusCount++;
        if (sameStatusCount > 30) {
          // 60 seconds of no progress
          stuckInInit = true;
          console.log(
            `⚠️ Stuck on status: "${currentStatus}" with 0% progress for ${
              sameStatusCount * 2
            } seconds`
          );
        }
      } else if (!currentStatus && actualProgress === 0) {
        // No status message and no progress - might be stuck
        sameStatusCount++;
        if (sameStatusCount > 30) {
          stuckInInit = true;
          console.log(
            `⚠️ No progress and no status message for ${
              sameStatusCount * 2
            } seconds`
          );
        }
      } else {
        sameStatusCount = 0;
      }

      // Progress is already checked above, this is redundant but kept for compatibility

      // Check for completion message
      const completionText = await page.evaluate(() => {
        const text = document.body.textContent || "";
        return (
          text.includes("completed successfully") ||
          text.includes("Conversion completed") ||
          text.includes("Download Converted") ||
          text.includes("Download Video")
        );
      });

      if (completionText) {
        console.log("✅ Conversion completed!");
        conversionComplete = true;
        break;
      }

      // Don't auto-cancel - just wait for conversion to complete
      // Only log warnings if truly stuck for a very long time (4+ minutes)
      if (stuckInInit && sameStatusCount > 120 && actualProgress === 0) {
        console.log("⚠️ Conversion appears stuck - but continuing to wait...");
        console.log(`   No progress for ${sameStatusCount * 2} seconds`);
      }

      // Check for error (only check actual error/warning elements, not all text)
      const hasError = await page.evaluate(() => {
        // Look for error/warning elements with specific classes
        const errorEl = document.querySelector(
          '[class*="error"]:not(button), [class*="warning"]:not(button), [class*="red-"]:not(button), [class*="bg-red"]'
        );
        if (errorEl) {
          const text = errorEl.textContent || "";
          // Only consider it an error if it contains actual error keywords
          return (
            text.includes("failed") ||
            text.includes("error") ||
            text.includes("Error")
          );
        }
        return false;
      });

      if (hasError) {
        const errorMsg = await page.evaluate(() => {
          const errorEl = document.querySelector(
            '[class*="error"]:not(button), [class*="warning"]:not(button), [class*="bg-red"]'
          );
          return errorEl ? errorEl.textContent : "Unknown error";
        });
        throw new Error(`Conversion failed: ${errorMsg}`);
      }
    }

    if (!conversionComplete) {
      if (stuckInInit) {
        throw new Error(
          "Conversion stuck in initialization phase and timed out after 5 minutes"
        );
      } else {
        throw new Error("Conversion timed out after 5 minutes");
      }
    }

    // Check if we cancelled (don't expect completion screenshots if cancelled)
    const wasCancelled = await page.evaluate(() => {
      const text = document.body.textContent || "";
      return text.includes("cancelled") || text.includes("Cancelled");
    });

    if (wasCancelled) {
      console.log("✅ Test completed - conversion was successfully cancelled");
      return { success: true, cancelled: true };
    }

    // Take screenshot of completion only if not cancelled
    await page.screenshot({ path: "video-converter-complete.png" });
    console.log("📸 Screenshot saved: video-converter-complete.png");

    // Verify download button is present
    console.log("🔍 Checking for download button...");
    const downloadButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll("button, a"));
      return buttons.find((btn) => {
        const text = btn.textContent || "";
        return text.includes("Download");
      });
    });

    if (downloadButton && (await downloadButton.jsonValue()) !== null) {
      console.log("✅ Download button found");
      const downloadBtnElement = await downloadButton.asElement();
      if (downloadBtnElement) {
        const buttonText = await page.evaluate(
          (el) => el.textContent,
          downloadBtnElement
        );
        console.log(`   Button text: ${buttonText}`);
      }
    } else {
      console.log("⚠️ Download button not found (may be in modal)");
    }

    // Check for file size comparison
    const sizeComparison = await page.evaluate(() => {
      const text = document.body.textContent || "";
      return text.includes("Original size") || text.includes("Converted size");
    });
    if (sizeComparison) {
      console.log("✅ File size comparison displayed");
    }

    // Test download (optional - comment out if you don't want to actually download)
    /*
    if (downloadButton) {
      console.log("📥 Testing download...");
      const client = await page.target().createCDPSession();
      await client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: path.join(__dirname, "test-output-files"),
      });
      await downloadButton.click();
      await page.waitForTimeout(3000);
      console.log("✅ Download initiated");
    }
    */

    // Final check if we cancelled
    const finalCheck = await page.evaluate(() => {
      const text = document.body.textContent || "";
      return text.includes("cancelled") || text.includes("Cancelled");
    });

    if (finalCheck) {
      console.log(
        "\n✨ Video converter test completed - cancellation verified!"
      );
      return { success: true, cancelled: true };
    }

    console.log("\n✨ Video converter test completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    try {
      const page = await browser.pages().then((pages) => pages[0]);
      if (page) {
        await page.screenshot({ path: "video-converter-error.png" });
        console.log("📸 Error screenshot saved: video-converter-error.png");
      }
    } catch (screenshotError) {
      console.log("⚠️ Could not take error screenshot");
    }
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the test
testVideoConverter()
  .then((result) => {
    if (result.success) {
      console.log("\n✅ All tests passed!");
      process.exit(0);
    } else {
      console.log("\n❌ Tests failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
