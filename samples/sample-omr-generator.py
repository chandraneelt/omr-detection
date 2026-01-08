#!/usr/bin/env python3
"""
Generate sample OMR sheets for testing
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

def create_sample_omr_sheet(questions=20, options=['A', 'B', 'C', 'D'], filename='sample_omr.png'):
    """Create a sample OMR sheet image"""
    
    # Image dimensions
    width = 800
    height = 1000
    
    # Create white background
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 16)
        title_font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
        title_font = ImageFont.load_default()
    
    # Draw title
    draw.text((width//2 - 100, 30), "OMR ANSWER SHEET", fill='black', font=title_font)
    
    # Draw instructions
    draw.text((50, 80), "Fill the bubbles completely with a dark pen or pencil", fill='black', font=font)
    
    # Starting positions
    start_x = 80
    start_y = 120
    bubble_radius = 12
    option_spacing = 60
    question_spacing = 35
    
    # Draw questions and bubbles
    for q in range(questions):
        y_pos = start_y + q * question_spacing
        
        # Draw question number
        draw.text((30, y_pos - 8), f"{q+1}.", fill='black', font=font)
        
        # Draw option bubbles
        for i, option in enumerate(options):
            x_pos = start_x + i * option_spacing
            
            # Draw bubble (circle)
            draw.ellipse([x_pos - bubble_radius, y_pos - bubble_radius, 
                         x_pos + bubble_radius, y_pos + bubble_radius], 
                        outline='black', width=2)
            
            # Draw option label
            draw.text((x_pos - 5, y_pos + bubble_radius + 5), option, fill='black', font=font)
    
    # Save the image
    img.save(filename)
    print(f"Sample OMR sheet created: {filename}")
    return filename

def create_filled_omr_sheet(questions=20, options=['A', 'B', 'C', 'D'], 
                           answers=None, filename='filled_omr.png'):
    """Create a sample OMR sheet with some bubbles filled"""
    
    if answers is None:
        # Default answers for testing
        answers = ['A', 'B', 'C', 'D'] * (questions // 4) + ['A'] * (questions % 4)
        answers = answers[:questions]
    
    # Image dimensions
    width = 800
    height = 1000
    
    # Create white background
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 16)
        title_font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
        title_font = ImageFont.load_default()
    
    # Draw title
    draw.text((width//2 - 100, 30), "OMR ANSWER SHEET", fill='black', font=title_font)
    
    # Draw instructions
    draw.text((50, 80), "Fill the bubbles completely with a dark pen or pencil", fill='black', font=font)
    
    # Starting positions
    start_x = 80
    start_y = 120
    bubble_radius = 12
    option_spacing = 60
    question_spacing = 35
    
    # Draw questions and bubbles
    for q in range(questions):
        y_pos = start_y + q * question_spacing
        
        # Draw question number
        draw.text((30, y_pos - 8), f"{q+1}.", fill='black', font=font)
        
        # Draw option bubbles
        for i, option in enumerate(options):
            x_pos = start_x + i * option_spacing
            
            # Check if this option should be filled
            is_filled = q < len(answers) and answers[q] == option
            
            if is_filled:
                # Draw filled bubble
                draw.ellipse([x_pos - bubble_radius, y_pos - bubble_radius, 
                             x_pos + bubble_radius, y_pos + bubble_radius], 
                            outline='black', fill='black', width=2)
            else:
                # Draw empty bubble
                draw.ellipse([x_pos - bubble_radius, y_pos - bubble_radius, 
                             x_pos + bubble_radius, y_pos + bubble_radius], 
                            outline='black', width=2)
            
            # Draw option label
            draw.text((x_pos - 5, y_pos + bubble_radius + 5), option, fill='black', font=font)
    
    # Save the image
    img.save(filename)
    print(f"Filled OMR sheet created: {filename}")
    print(f"Answers: {answers[:10]}..." if len(answers) > 10 else f"Answers: {answers}")
    return filename, answers

if __name__ == "__main__":
    # Create samples directory if it doesn't exist
    os.makedirs('samples', exist_ok=True)
    
    # Create blank OMR sheet
    create_sample_omr_sheet(20, ['A', 'B', 'C', 'D'], 'samples/blank_omr_20.png')
    
    # Create filled OMR sheet with known answers
    test_answers = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 
                   'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D']
    create_filled_omr_sheet(20, ['A', 'B', 'C', 'D'], test_answers, 'samples/filled_omr_20.png')
    
    # Create extended version
    create_sample_omr_sheet(50, ['A', 'B', 'C', 'D', 'E'], 'samples/blank_omr_50.png')
    
    print("\nSample OMR sheets created successfully!")
    print("Use these files to test your OMR scanner:")
    print("- samples/blank_omr_20.png (blank 20-question sheet)")
    print("- samples/filled_omr_20.png (filled 20-question sheet)")
    print("- samples/blank_omr_50.png (blank 50-question sheet)")
    print(f"\nTest answers for filled sheet: {test_answers}")