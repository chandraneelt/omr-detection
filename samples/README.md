# Sample OMR Sheets

This directory contains sample OMR sheets for testing the application.

## Available Samples

### 1. sample_20_questions.png
- **Template**: default.json
- **Questions**: 20
- **Options**: A, B, C, D
- **Description**: Standard OMR sheet with 20 questions

### 2. sample_50_questions.png
- **Template**: extended.json
- **Questions**: 50
- **Options**: A, B, C, D, E
- **Description**: Extended OMR sheet with 50 questions

## Answer Keys

### Sample 20 Questions Answer Key
```json
["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D"]
```

### Sample 50 Questions Answer Key
```json
["A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E"]
```

## Testing Instructions

1. Start the OMR Scanner application
2. Upload one of the sample images
3. Select the corresponding template
4. Paste the answer key (optional)
5. Click "Scan OMR Sheet"
6. Review the results and export if needed

## Creating Custom OMR Sheets

To create your own OMR sheets:

1. Use a word processor or design tool
2. Create a grid of circles/bubbles
3. Ensure consistent spacing and alignment
4. Use high contrast (black bubbles on white background)
5. Save as high-resolution image (300 DPI recommended)
6. Create a corresponding template JSON file

## Image Requirements

- **Format**: JPG, PNG, or PDF
- **Resolution**: Minimum 300 DPI
- **Size**: Maximum 10MB
- **Quality**: Clear, well-lit, no shadows
- **Alignment**: Sheet should be straight and fully visible