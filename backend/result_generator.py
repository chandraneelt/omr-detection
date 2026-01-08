import json
import os
import pandas as pd
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

class ResultGenerator:
    """Generate export files for OMR scan results"""
    
    def __init__(self):
        self.results_folder = 'results'
        os.makedirs(self.results_folder, exist_ok=True)
    
    def generate_export(self, scan_data, format_type):
        """Generate export file in specified format"""
        try:
            scan_id, filename, template_name, answers_json, score, total_questions, timestamp = scan_data
            answers = json.loads(answers_json)
            
            base_filename = f"omr_results_{scan_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            if format_type.lower() == 'pdf':
                return self._generate_pdf(base_filename, scan_data, answers)
            elif format_type.lower() == 'excel':
                return self._generate_excel(base_filename, scan_data, answers)
            elif format_type.lower() == 'csv':
                return self._generate_csv(base_filename, scan_data, answers)
            else:
                raise ValueError(f"Unsupported format: {format_type}")
                
        except Exception as e:
            print(f"Error generating export: {str(e)}")
            return None
    
    def _generate_pdf(self, base_filename, scan_data, answers):
        """Generate PDF report"""
        scan_id, filename, template_name, answers_json, score, total_questions, timestamp = scan_data
        
        pdf_path = os.path.join(self.results_folder, f"{base_filename}.pdf")
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        
        story = []
        
        # Title
        story.append(Paragraph("OMR Scan Results", title_style))
        story.append(Spacer(1, 20))
        
        # Summary information
        summary_data = [
            ['Scan ID:', str(scan_id)],
            ['File:', filename],
            ['Template:', template_name],
            ['Date:', timestamp],
            ['Score:', f"{score}/{total_questions}"],
            ['Percentage:', f"{round((score/total_questions*100) if total_questions > 0 else 0, 2)}%"]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 4*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 30))
        
        # Detailed answers
        story.append(Paragraph("Detailed Answers", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        # Create answers table
        answer_data = [['Question', 'Answer']]
        for i, answer in enumerate(answers, 1):
            display_answer = answer if answer else 'No Answer'
            if answer == 'MULTIPLE':
                display_answer = 'Multiple Answers'
            answer_data.append([f"Q{i}", display_answer])
        
        answer_table = Table(answer_data, colWidths=[1*inch, 1*inch])
        answer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(answer_table)
        
        # Build PDF
        doc.build(story)
        return pdf_path
    
    def _generate_excel(self, base_filename, scan_data, answers):
        """Generate Excel report"""
        scan_id, filename, template_name, answers_json, score, total_questions, timestamp = scan_data
        
        excel_path = os.path.join(self.results_folder, f"{base_filename}.xlsx")
        
        # Create summary data
        summary_df = pd.DataFrame({
            'Metric': ['Scan ID', 'File', 'Template', 'Date', 'Score', 'Total Questions', 'Percentage'],
            'Value': [
                scan_id, filename, template_name, timestamp, score, total_questions,
                f"{round((score/total_questions*100) if total_questions > 0 else 0, 2)}%"
            ]
        })
        
        # Create detailed answers data
        answers_df = pd.DataFrame({
            'Question': [f"Q{i+1}" for i in range(len(answers))],
            'Answer': [answer if answer else 'No Answer' for answer in answers]
        })
        
        # Write to Excel with multiple sheets
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            answers_df.to_excel(writer, sheet_name='Answers', index=False)
        
        return excel_path
    
    def _generate_csv(self, base_filename, scan_data, answers):
        """Generate CSV report"""
        scan_id, filename, template_name, answers_json, score, total_questions, timestamp = scan_data
        
        csv_path = os.path.join(self.results_folder, f"{base_filename}.csv")
        
        # Create comprehensive data
        data = []
        data.append(['Scan ID', scan_id])
        data.append(['File', filename])
        data.append(['Template', template_name])
        data.append(['Date', timestamp])
        data.append(['Score', f"{score}/{total_questions}"])
        data.append(['Percentage', f"{round((score/total_questions*100) if total_questions > 0 else 0, 2)}%"])
        data.append(['', ''])  # Empty row
        data.append(['Question', 'Answer'])
        
        for i, answer in enumerate(answers, 1):
            display_answer = answer if answer else 'No Answer'
            if answer == 'MULTIPLE':
                display_answer = 'Multiple Answers'
            data.append([f"Q{i}", display_answer])
        
        # Write to CSV
        df = pd.DataFrame(data)
        df.to_csv(csv_path, index=False, header=False)
        
        return csv_path