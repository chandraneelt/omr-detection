# OMR Scanner Debug Guide

## 🔧 **Fixed the Blank Screen Issue**

The blank screen after clicking "Scan OMR Sheet" has been fixed with:

✅ **Better Error Handling**: Shows detailed error messages  
✅ **CORS Headers**: Proper cross-origin request handling  
✅ **Simplified Processing**: Optimized for serverless environment  
✅ **Debug Logging**: Console logs for troubleshooting  

## 🚀 **Test the Updated Scanner**

**URL**: https://omr-detection.vercel.app

## 🧪 **Step-by-Step Testing**

### **Step 1: Open Browser Console**
1. Press **F12** (or right-click → Inspect)
2. Go to **Console** tab
3. Keep it open while testing

### **Step 2: Test API Connection**
1. Visit: https://omr-detection.vercel.app
2. Check console for: `"API Health Check: {status: 'healthy'}"`
3. If you see this, the API is working

### **Step 3: Test OMR Scanning**
1. **Upload a test image** (any image file)
2. **Click "Scan OMR Sheet"**
3. **Watch the console** for debug messages:
   - `"Starting OMR scan..."`
   - `"Sending request to API..."`
   - `"API Response: {...}"`

### **Step 4: Check for Errors**
If you still see a blank screen, check console for:
- **Network errors**: Connection issues
- **API errors**: Server-side problems
- **File errors**: Image processing issues

## 🐛 **Common Issues & Solutions**

### **Issue 1: "No response from server"**
**Solution**: 
- Check internet connection
- Try refreshing the page
- Wait a moment and try again

### **Issue 2: "Server error: 500"**
**Solution**:
- Try a smaller image file (< 2MB)
- Use JPG or PNG format
- Check console for specific error details

### **Issue 3: "Could not decode image"**
**Solution**:
- Ensure image is valid JPG/PNG
- Try a different image
- Check file isn't corrupted

### **Issue 4: Still blank screen**
**Solution**:
- Clear browser cache (Ctrl+F5)
- Try incognito/private mode
- Try different browser (Chrome, Firefox, Safari)

## 📊 **Expected Console Output**

**Successful scan should show:**
```
API Health Check: {status: "healthy", timestamp: "..."}
Starting OMR scan... {file: "test.jpg", size: 123456, type: "image/jpeg"}
Sending request to API...
API Response: {success: true, answers: [...], score: 15, total_questions: 20}
```

**Error case might show:**
```
Scan error: Error: Request failed with status code 500
Response data: {error: "Processing error: ..."}
```

## 🔍 **Manual API Testing**

You can test the API directly:

### **Health Check**
Visit: https://omr-detection.vercel.app/api/health
Should return: `{"status": "healthy", "timestamp": "..."}`

### **Templates**
Visit: https://omr-detection.vercel.app/api/templates
Should return: `{"templates": [...]}`

## 📱 **Mobile Testing**

If testing on mobile:
1. **Enable developer tools** in mobile browser
2. **Check console** for errors
3. **Try smaller images** (mobile cameras create large files)
4. **Use good lighting** for camera capture

## 🎯 **Quick Test**

**Fastest way to test:**
1. Go to: https://omr-detection.vercel.app
2. Upload ANY image (doesn't have to be OMR sheet)
3. Click "Scan OMR Sheet"
4. Should see results (even if not accurate)

## 📞 **Still Having Issues?**

If you're still seeing a blank screen:

1. **Share console errors**: Copy any red error messages
2. **Try different browser**: Chrome, Firefox, Safari, Edge
3. **Check network**: Ensure stable internet connection
4. **Clear cache**: Hard refresh with Ctrl+F5

The scanner should now show either:
- ✅ **Results page** with detected answers
- ❌ **Error message** explaining what went wrong

No more blank screens! 🎉