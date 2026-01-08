import cv2
import numpy as np
import json
from typing import Dict, List, Tuple, Optional

class OMRProcessor:
    """Core OMR processing engine using OpenCV"""
    
    def __init__(self):
        self.debug_mode = False
        
    def process_image(self, image_path: str, template: Dict) -> Dict:
        """
        Process OMR sheet image and extract answers
        
        Args:
            image_path: Path to the image file
            template: OMR template configuration
            
        Returns:
            Dictionary with processing results
        """
        try:
            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                return {'success': False, 'error': 'Could not load image'}
            
            # Preprocess image
            processed_image = self._preprocess_image(image)
            
            # Detect OMR sheet boundaries
            sheet_contour = self._detect_sheet_boundaries(processed_image)
            if sheet_contour is None:
                return {'success': False, 'error': 'Could not detect OMR sheet boundaries'}
            
            # Apply perspective correction
            corrected_image = self._apply_perspective_correction(processed_image, sheet_contour)
            
            # Extract answer regions based on template
            answers = self._extract_answers(corrected_image, template)
            
            # Save processed image for debugging
            processed_image_path = image_path.replace('.', '_processed.')
            cv2.imwrite(processed_image_path, corrected_image)
            
            return {
                'success': True,
                'answers': answers,
                'processed_image_path': processed_image_path,
                'confidence': self._calculate_confidence(answers)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for better OMR detection"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 11, 2
        )
        
        # Apply morphological operations to clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        return cleaned
    
    def _detect_sheet_boundaries(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Detect the boundaries of the OMR sheet"""
        # Find contours
        contours, _ = cv2.findContours(image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        # Find the largest rectangular contour
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Approximate contour to get rectangle
        epsilon = 0.02 * cv2.arcLength(largest_contour, True)
        approx = cv2.approxPolyDP(largest_contour, epsilon, True)
        
        # If we have 4 points, we found a rectangle
        if len(approx) == 4:
            return approx
        
        # Fallback: use bounding rectangle
        x, y, w, h = cv2.boundingRect(largest_contour)
        return np.array([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], dtype=np.int32)
    
    def _apply_perspective_correction(self, image: np.ndarray, contour: np.ndarray) -> np.ndarray:
        """Apply perspective correction to straighten the OMR sheet"""
        # Order points: top-left, top-right, bottom-right, bottom-left
        points = self._order_points(contour.reshape(4, 2))
        
        # Calculate dimensions of the corrected image
        width = max(
            np.linalg.norm(points[1] - points[0]),
            np.linalg.norm(points[2] - points[3])
        )
        height = max(
            np.linalg.norm(points[3] - points[0]),
            np.linalg.norm(points[2] - points[1])
        )
        
        # Define destination points
        dst_points = np.array([
            [0, 0],
            [width - 1, 0],
            [width - 1, height - 1],
            [0, height - 1]
        ], dtype=np.float32)
        
        # Calculate perspective transform matrix
        matrix = cv2.getPerspectiveTransform(points.astype(np.float32), dst_points)
        
        # Apply perspective correction
        corrected = cv2.warpPerspective(image, matrix, (int(width), int(height)))
        
        return corrected
    
    def _order_points(self, points: np.ndarray) -> np.ndarray:
        """Order points in clockwise order starting from top-left"""
        # Sort by y-coordinate
        sorted_points = points[np.argsort(points[:, 1])]
        
        # Top two points
        top_points = sorted_points[:2]
        top_points = top_points[np.argsort(top_points[:, 0])]
        
        # Bottom two points
        bottom_points = sorted_points[2:]
        bottom_points = bottom_points[np.argsort(bottom_points[:, 0])]
        
        return np.array([
            top_points[0],      # top-left
            top_points[1],      # top-right
            bottom_points[1],   # bottom-right
            bottom_points[0]    # bottom-left
        ])
    
    def _extract_answers(self, image: np.ndarray, template: Dict) -> List[str]:
        """Extract answers from the corrected OMR sheet"""
        answers = []
        
        # Get template configuration
        num_questions = template.get('questions', 20)
        options = template.get('options', ['A', 'B', 'C', 'D'])
        
        # Calculate bubble positions based on template
        bubble_regions = self._calculate_bubble_positions(image, template)
        
        for question_idx in range(num_questions):
            question_answers = []
            
            for option_idx, option in enumerate(options):
                if question_idx < len(bubble_regions) and option_idx < len(bubble_regions[question_idx]):
                    region = bubble_regions[question_idx][option_idx]
                    
                    # Extract bubble region
                    x, y, w, h = region
                    bubble = image[y:y+h, x:x+w]
                    
                    # Check if bubble is filled
                    if self._is_bubble_filled(bubble):
                        question_answers.append(option)
            
            # Determine final answer for this question
            if len(question_answers) == 1:
                answers.append(question_answers[0])
            elif len(question_answers) == 0:
                answers.append('')  # No answer
            else:
                answers.append('MULTIPLE')  # Multiple answers marked
        
        return answers
    
    def _calculate_bubble_positions(self, image: np.ndarray, template: Dict) -> List[List[Tuple[int, int, int, int]]]:
        """Calculate bubble positions based on template configuration"""
        height, width = image.shape
        
        num_questions = template.get('questions', 20)
        options = template.get('options', ['A', 'B', 'C', 'D'])
        
        # Default layout assumptions (can be made configurable)
        start_y = int(height * 0.15)  # Start 15% from top
        end_y = int(height * 0.85)    # End 85% from top
        
        start_x = int(width * 0.1)    # Start 10% from left
        bubble_width = int(width * 0.03)  # Bubble width 3% of image width
        bubble_height = int(height * 0.02)  # Bubble height 2% of image height
        
        option_spacing = int(width * 0.08)  # Space between options
        question_spacing = (end_y - start_y) // num_questions
        
        bubble_regions = []
        
        for q in range(num_questions):
            question_regions = []
            question_y = start_y + q * question_spacing
            
            for opt_idx, option in enumerate(options):
                bubble_x = start_x + opt_idx * option_spacing
                bubble_y = question_y
                
                question_regions.append((bubble_x, bubble_y, bubble_width, bubble_height))
            
            bubble_regions.append(question_regions)
        
        return bubble_regions
    
    def _is_bubble_filled(self, bubble: np.ndarray, threshold: float = 0.3) -> bool:
        """Determine if a bubble is filled based on pixel density"""
        if bubble.size == 0:
            return False
        
        # Calculate the ratio of filled pixels
        filled_pixels = np.sum(bubble > 0)
        total_pixels = bubble.size
        fill_ratio = filled_pixels / total_pixels
        
        return fill_ratio > threshold
    
    def _calculate_confidence(self, answers: List[str]) -> float:
        """Calculate confidence score based on answer quality"""
        if not answers:
            return 0.0
        
        # Simple confidence calculation
        valid_answers = sum(1 for ans in answers if ans and ans != 'MULTIPLE')
        confidence = valid_answers / len(answers)
        
        return round(confidence, 2)