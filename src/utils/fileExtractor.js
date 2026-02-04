// PDF and Image text extraction with OCR support
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';

// Set up PDF.js worker - matching versions is critical
import packageJson from '../../package.json';
const pdfjsVersion = packageJson.dependencies['pdfjs-dist'].replace('^', '');
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

// Extract text from images using OCR
export const extractTextFromImage = async (file) => {
  try {
    console.log('Starting OCR extraction for:', file.name);
    
    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    const extractedText = result.data.text.trim();
    console.log('OCR extraction complete. Length:', extractedText.length);
    
    if (extractedText.length < 10) {
      return '⚠️ No text found in image. The image may be too blurry or contain no readable text.';
    }
    
    return extractedText;
  } catch (error) {
    console.error('OCR extraction error:', error);
    return '⚠️ Failed to extract text from image. Please try a clearer image.';
  }
};

// Extract text from PDF using pdf.js
export const extractTextFromPDF = async (file) => {
  try {
    console.log('Starting PDF extraction for:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    
    console.log('Loading PDF document...');
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });
    
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully. Pages:', pdf.numPages);
    
    let fullText = '';
    let hasText = false;
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Extracting page ${i}/${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      
      let pageText = '';
      try {
        const textContent = await page.getTextContent();
        pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      } catch (textError) {
        console.warn(`Page ${i} text extraction failed, will try OCR`);
      }
      
      if (pageText.length > 10) {
        hasText = true;
        fullText += pageText + '\n\n';
      } else {
        // No text found (less than 10 chars) - might be scanned/image-based
        console.log(`Page ${i} has no readable text, trying OCR...`);
        
        try {
          // Render page as image for OCR
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          // Convert canvas to blob
          const blob = await new Promise(resolve => canvas.toBlob(resolve));
          
          // Run OCR on the page
          const ocrResult = await Tesseract.recognize(
            blob,
            'eng',
            {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                  console.log(`OCR Page ${i}: ${Math.round(m.progress * 100)}%`);
                }
              }
            }
          );
          
          const ocrText = ocrResult.data.text.trim();
          if (ocrText.length > 10) {
            fullText += ocrText + '\n\n';
            hasText = true;
            console.log(`OCR extracted ${ocrText.length} characters from page ${i}`);
          }
        } catch (ocrError) {
          console.error(`OCR failed for page ${i}:`, ocrError);
        }
      }
    }
    
    const cleanedText = fullText
      .trim()
      .replace(/\n{3,}/g, '\n\n');
    
    console.log('PDF extraction complete. Length:', cleanedText.length);
    
    if (cleanedText.length < 10) {
      if (pdf.numPages > 0) {
        throw new Error('This PDF appears to be protected or contains unreadable image content.');
      }
      throw new Error('The PDF file is empty.');
    }
    
    return cleanedText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    
    // Check for common error types
    if (error.name === 'PasswordException') {
      return '⚠️ This PDF is password-protected and cannot be read. Please use an unprotected version.';
    }
    
    if (error.message.includes('worker')) {
      return '⚠️ System error: PDF worker failed to load. Please refresh the page and try again.';
    }

    return `⚠️ Extraction Failed: ${error.message}\n\n💡 Solution: This usually happens with encrypted or non-standard PDFs. Please try copying the text manually into the notebook, or convert the file to a standard PDF format.`;
  }
};

// Extract text from DOCX files
export const extractTextFromDOCX = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value.trim();
    
    if (text.length < 10) {
      return '⚠️ No readable text found in this Word document.';
    }
    
    return text;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return `⚠️ Failed to extract text from Word document: ${error.message}`;
  }
};

// Extract text from TXT files
export const extractTextFromTXT = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Main file processor
export const processUploadedFile = async (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  try {
    let extractedText = '';
    
    // PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      extractedText = await extractTextFromPDF(file);
    } 
    // Image files (OCR)
    else if (
      fileType.startsWith('image/') || 
      fileName.endsWith('.png') || 
      fileName.endsWith('.jpg') || 
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.gif') ||
      fileName.endsWith('.bmp') ||
      fileName.endsWith('.webp')
    ) {
      extractedText = await extractTextFromImage(file);
    }
    // DOCX files
    else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      extractedText = await extractTextFromDOCX(file);
    } 
    // TXT files
    else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      extractedText = await extractTextFromTXT(file);
    } 
    // Unsupported
    else {
      throw new Error('Unsupported file type. Please upload PDF, Image (PNG/JPG), DOCX, or TXT files.');
    }
    
    return {
      success: true,
      text: extractedText,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fileName: file.name
    };
  }
};
