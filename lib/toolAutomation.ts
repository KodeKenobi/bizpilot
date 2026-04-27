
export interface AutomationResults {
  tests: {
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
    message: string;
  }[];
}

export interface AutomationCallbacks {
  setStep: (step: string) => void;
  setProgress: (progress: number) => void;
  onUpdate?: (results: AutomationResults) => void;
}

/**
 * Shared utility for automating image converter interactions in an iframe.
 */
export const automateImageConverter = async (
  iframe: HTMLIFrameElement,
  callbacks: AutomationCallbacks
): Promise<AutomationResults> => {
  const results: AutomationResults = { tests: [] };
  const { setStep, setProgress, onUpdate } = callbacks;

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Cannot access iframe document');

    // Wait for iframe to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 3000));

    // STEP 1: Handle Cookie Consent
    setStep('Checking for cookie consent modal...');
    setProgress(5);
    
    let cookieConsentHandled = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const allButtons = Array.from(iframeDoc.querySelectorAll('button'));
      const rejectAllButton = allButtons.find(btn => {
        const text = btn.textContent?.trim().toLowerCase() || '';
        return text.includes('reject all') || text === 'reject' || text.includes('accept'); // Accept is fine for test
      });

      if (rejectAllButton) {
        setStep('Handling cookie consent...');
        rejectAllButton.click();
        cookieConsentHandled = true;
        await new Promise(resolve => setTimeout(resolve, 2000));
        break;
      }
    }

    // STEP 2: Upload File
    setStep('Loading test image...');
    setProgress(20);
    
    let testImageFile = await fetch('/test-files/main-files/test-video.jpeg').catch(() => null);
    if (!testImageFile || !testImageFile.ok) {
      testImageFile = await fetch('/test-files/test-image.jpeg').catch(() => null);
    }
    if (!testImageFile || !testImageFile.ok) throw new Error('Test image file not found');

    const blob = await testImageFile.blob();
    const file = new File([blob], 'test-image.jpeg', { type: 'image/jpeg' });
    
    setStep('Uploading file...');
    setProgress(40);
    
    let fileInput: HTMLInputElement | null = null;
    for (let i = 0; i < 20; i++) {
        fileInput = iframeDoc.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) break;
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (fileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      throw new Error('File input not found');
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    // STEP 3: Convert
    setStep('Starting conversion...');
    setProgress(60);
    
    const convertButton = Array.from(iframeDoc.querySelectorAll('button')).find(
      btn => btn.textContent?.includes('Convert')
    );
    
    if (convertButton) {
      convertButton.click();
    } else {
      throw new Error('Convert button not found');
    }

    // Wait for conversion
    let conversionComplete = false;
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const downloadButton = Array.from(iframeDoc.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('Download')
      );
      if (downloadButton) {
        conversionComplete = true;
        break;
      }
    }

    if (!conversionComplete) throw new Error('Conversion timeout');

    // STEP 4: Trigger Monetization Modal
    setStep('Triggering monetization modal...');
    setProgress(90);
    
    const downloadBtn = Array.from(iframeDoc.querySelectorAll('button')).find(
      btn => btn.textContent?.includes('Download')
    );
    
    if (downloadBtn) {
      downloadBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      const viewAdBtn = Array.from(iframeDoc.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'View Ad');
      
      if (viewAdBtn) {
        setStep('Clicking View Ad...');
        viewAdBtn.click();
        results.tests.push({
          name: 'Ad Click',
          status: 'PASS',
          message: 'Successfully triggered real ad interaction'
        });
      }
    }

    results.tests.push({
      name: 'Full Flow',
      status: 'PASS',
      message: 'Background automation completed successfully'
    });

  } catch (error) {
    results.tests.push({
      name: 'Automation Error',
      status: 'FAIL',
      message: error instanceof Error ? error.message : String(error)
    });
  }

  if (onUpdate) onUpdate(results);
  return results;
};
