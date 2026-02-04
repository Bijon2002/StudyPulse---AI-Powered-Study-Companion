# PDF Upload Test Guide

## ✅ **HOW TO TEST PDF UPLOAD:**

### **Option 1: Use Text File (Easiest)**

1. Create a text file called `test.txt`
2. Add this content:

```
Photosynthesis

Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts, which contain chlorophyll that captures sunlight. The process has two main stages: light-dependent reactions and the Calvin cycle.

The overall equation is:
6CO2 + 6H2O + light energy → C6H12O6 + 6O2

This means plants take in carbon dioxide and water, and produce glucose and oxygen. Photosynthesis is crucial for life on Earth as it produces the oxygen we breathe and forms the base of most food chains.

Key Components:
- Chloroplasts: Organelles where photosynthesis occurs
- Chlorophyll: Green pigment that absorbs light
- Stomata: Pores for gas exchange
- Light energy: Drives the process

Importance:
1. Produces oxygen for respiration
2. Creates food for plants
3. Removes CO2 from atmosphere
4. Foundation of food chains
```

3. Save as `test.txt`
4. Upload to Notebook
5. **Text extracts perfectly!** ✅

---

### **Option 2: Create Simple PDF**

**Using Google Docs:**

1. Go to docs.google.com
2. Create new document
3. Paste the text above
4. File → Download → PDF
5. Upload to StudyPulse
6. **Should extract!** ✅

**Using Word:**

1. Open Microsoft Word
2. Paste the text above
3. File → Save As → PDF
4. Upload to StudyPulse
5. **Should extract!** ✅

---

### **Option 3: Check Browser Console**

If PDF still doesn't work:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Upload PDF
4. Look for messages:

```
Starting PDF extraction for: filename.pdf
Loading PDF document...
PDF loaded successfully. Pages: 1
Extracting page 1/1...
PDF extraction complete. Length: 450
```

**If you see errors:**

- Check if PDF is text-based (not scanned image)
- Try a different PDF
- Use TXT file instead

---

## 🔧 **TROUBLESHOOTING:**

### **Error: "Unable to extract text"**

**Possible Causes:**

1. **Scanned PDF** - PDF is an image, not text
   - Solution: Use OCR or copy-paste manually
2. **Password Protected** - PDF is locked
   - Solution: Unlock PDF first
3. **Corrupted PDF** - File is damaged
   - Solution: Try different PDF
4. **Worker Error** - pdf.js worker not loading
   - Solution: Check browser console for errors

---

### **How to Check if PDF is Text-Based:**

1. Open PDF in browser
2. Try to select text with mouse
3. If you can select and copy → **Text-based** ✅
4. If you can't select → **Scanned image** ❌

**Text-based PDFs work!**
**Scanned PDFs don't work (need OCR)**

---

## ✅ **WHAT WORKS:**

### **File Types:**

- ✅ TXT files - Always work perfectly
- ✅ Text-based PDFs - Work with pdf.js
- ✅ DOCX files - Basic extraction
- ❌ Scanned PDFs - Need OCR (not supported yet)
- ❌ Image files - Not supported

---

## 💡 **RECOMMENDED WORKFLOW:**

### **For Now:**

1. **Best Option**: Use TXT files
   - 100% reliable
   - No extraction issues
   - Fast processing

2. **Good Option**: Text-based PDFs
   - Most PDFs work
   - Check if text is selectable first

3. **Backup**: Copy-paste manually
   - Always works
   - Takes more time

---

## 🚀 **QUICK TEST:**

1. Create `test.txt` with sample text
2. Go to Notebook
3. Click "New Notebook"
4. Click "Upload Sources"
5. Select `test.txt`
6. **See instant extraction!** ✅

```
✅ Extracted 150 words from "test.txt"

Content auto-filled:
"Photosynthesis is the process by which plants..."
```

---

## 📊 **CONSOLE LOGS:**

**Successful Extraction:**

```
Starting PDF extraction for: biology.pdf
Loading PDF document...
PDF loaded successfully. Pages: 5
Extracting page 1/5...
Extracting page 2/5...
Extracting page 3/5...
Extracting page 4/5...
Extracting page 5/5...
PDF extraction complete. Length: 2450
✅ Extracted 450 words from "biology.pdf"
```

**Failed Extraction:**

```
Starting PDF extraction for: scanned.pdf
Loading PDF document...
PDF loaded successfully. Pages: 1
Extracting page 1/1...
PDF extraction complete. Length: 5
Error: Extracted text is too short. PDF may be image-based.
Trying fallback extraction method...
Fallback extraction also failed
⚠️ Unable to extract text from this PDF
```

---

**Try with TXT files first to test the feature!** 📄✅
