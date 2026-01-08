# OMR Scanner Testing Guide

## 🎯 **Your Live OMR Scanner**
**URL**: https://omr-detection.vercel.app

## ✅ **Fixed Issues**

The OMR scanner now includes:
- ✅ **Real Image Processing**: Uses OpenCV for actual bubble detection
- ✅ **Perspective Correction**: Automatically straightens skewed sheets
- ✅ **Adaptive Thresholding**: Handles different lighting conditions
- ✅ **Bubble Detection**: Analyzes pixel density to detect filled bubbles
- ✅ **Template Support**: Configurable for different question formats

## 🧪 **Test Your Scanner**

### **Step 1: Use Sample OMR Sheets**
I've created test OMR sheets for you:

1. **Download test sheets**: 
   - `samples/filled_omr_20.png` - Pre-filled sheet with known answers
   - `samples/blank_omr_20.png` - Blank sheet for manual testing

2. **Test Answers for filled sheet**:
   ```json
   ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D"]
   ```

### **Step 2: Test the Scanner**

1. **Go to**: https://omr-detection.vercel.app

2. **Upload the filled OMR sheet**:
   - Click "Browse Files" or drag & drop `samples/filled_omr_20.png`
   - Select "Standard 20 Questions (A-D)" template
   - Paste the test answers in the Answer Key field
   - Click "Scan OMR Sheet"

3. **Expected Results**:
   - Should detect the filled bubbles correctly
   - Score should be 20/20 (100%) if detection works perfectly
   - Each question should show the detected answer

### **Step 3: Test Camera Capture**

1. **Click "Use Camera"**
2. **Allow camera permissions**
3. **Point camera at a printed OMR sheet**
4. **Align within the guide frame**
5. **Click "Capture"**
6. **Process the captured image**

## 🔧 **Troubleshooting**

### **If scanning doesn't work properly:**

1. **Image Quality Issues**:
   - Ensure good lighting (no shadows)
   - Keep the sheet flat and straight
   - Use high contrast (dark marks on white paper)
   - Avoid reflections or glare

2. **Detection Issues**:
   - Make sure bubbles are completely filled
   - Use dark pen/pencil (not light gray)
   - Ensure bubbles are circular and clear
   - Check that the sheet fits the template format

3. **API Issues**:
   - Check browser console for errors
   - Verify the image file size (should be < 4.5MB)
   - Try refreshing the page
   - Test with the sample images first

### **Browser Console Debugging**:
Press F12 and check the Console tab for any error messages.

## 📊 **Testing Scenarios**

### **Scenario 1: Perfect Conditions**
- Use `samples/filled_omr_20.png`
- Expected: 100% accuracy, all bubbles detected correctly

### **Scenario 2: Real Photo**
- Print a blank OMR sheet
- Fill some bubbles manually
- Take photo with camera
- Expected: Good detection with minor variations

### **Scenario 3: Challenging Conditions**
- Slightly skewed image
- Varying lighting
- Partially filled bubbles
- Expected: Reasonable detection with confidence scores

## 🎯 **Expected Performance**

- **Sample Images**: 90-100% accuracy
- **Camera Photos**: 70-90% accuracy (depends on conditions)
- **Processing Time**: 2-5 seconds per image
- **Confidence Score**: 0.7-1.0 for good images

## 🐛 **Known Limitations**

1. **Serverless Constraints**: Limited processing time (30 seconds max)
2. **Memory Limits**: Large images may cause timeouts
3. **Template Assumptions**: Fixed bubble positions based on percentages
4. **No Persistent Storage**: History resets on deployment

## 🚀 **Optimization Tips**

### **For Better Results**:
1. **Image Size**: 800x1000 pixels optimal
2. **File Format**: PNG or high-quality JPG
3. **Contrast**: High contrast between bubbles and background
4. **Alignment**: Keep sheet as straight as possible
5. **Lighting**: Even, bright lighting without shadows

### **Camera Tips**:
1. **Distance**: Hold camera 12-18 inches from sheet
2. **Angle**: Keep camera parallel to sheet
3. **Focus**: Ensure image is sharp and clear
4. **Stability**: Hold steady or use tripod

## 📱 **Mobile Testing**

The scanner is optimized for mobile devices:
1. **Responsive Design**: Works on all screen sizes
2. **Touch Interface**: Touch-friendly buttons and controls
3. **Camera Access**: Uses rear camera by default
4. **File Upload**: Supports mobile photo gallery

## 🔄 **Continuous Improvement**

The OMR processing can be enhanced by:
1. **Machine Learning**: Train models on your specific OMR formats
2. **Template Customization**: Create templates for your exact layouts
3. **Advanced CV**: Implement more sophisticated image processing
4. **Database Integration**: Add persistent storage for production use

## 📞 **Support**

If you encounter issues:
1. **Test with sample images first**
2. **Check browser compatibility** (Chrome, Firefox, Safari, Edge)
3. **Verify camera permissions** for mobile testing
4. **Review console errors** for debugging

Your OMR Scanner is now ready for real-world testing! 🎉