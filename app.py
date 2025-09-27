from flask import Flask, render_template, request, send_file, redirect, url_for, jsonify
from flask_cors import CORS
import os
import fitz
import base64
from io import BytesIO
import json
import weasyprint
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
UPLOAD_FOLDER = "uploads"
EDITED_FOLDER = "edited"
HTML_FOLDER = "saved_html"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EDITED_FOLDER, exist_ok=True)
os.makedirs(HTML_FOLDER, exist_ok=True)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        if "pdf" not in request.files:
            return "No file uploaded", 400
        file = request.files["pdf"]
        if file.filename == "":
            return "No selected file", 400

        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        return redirect(url_for("convert_pdf", filename=file.filename))
    return render_template("index.html")

@app.route("/convert/<filename>")
def convert_pdf(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    try:
        doc = fitz.open(filepath)
        pages_data = []
        image_counter = 0
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_dict = page.get_text("dict")
            
            page_html = f'<div class="pdf-page" data-page="{page_num + 1}">'
            
            for block in page_dict["blocks"]:
                if "lines" in block:
                    for line in block["lines"]:
                        line_html = '<div class="text-line">'
                        for span in line["spans"]:
                            text = span["text"]
                            if text.strip():
                                bbox = span["bbox"]
                                font = span["font"]
                                size = span["size"]
                                flags = span["flags"]
                                
                                style = f"position: absolute; left: {bbox[0]}px; top: {bbox[1]}px; font-size: {size}px; font-family: {font};"
                                if flags & 2**4:
                                    style += " font-weight: bold;"
                                if flags & 2**1:
                                    style += " font-style: italic;"
                                
                                line_html += f'<span class="text-span editable-text" data-text="{text}" style="{style}">{text}</span>'
                        line_html += '</div>'
                        page_html += line_html
                
                elif "image" in block:
                    image_counter += 1
                    bbox = block["bbox"]
                    image_data = block["image"]
                    image_base64 = base64.b64encode(image_data).decode()
                    
                    style = f"position: absolute; left: {bbox[0]}px; top: {bbox[1]}px; width: {bbox[2] - bbox[0]}px; height: {bbox[3] - bbox[1]}px;"
                    page_html += f'<img class="editable-image" data-image-id="{image_counter}" src="data:image/png;base64,{image_base64}" style="{style}">'
            
            page_html += '</div>'
            pages_data.append({
                'html': page_html,
                'width': page.rect.width,
                'height': page.rect.height
            })
        
        doc.close()
        
        return render_template("converted.html", 
                             filename=filename, 
                             pages=pages_data)
    
    except Exception as e:
        return f"Error converting PDF: {str(e)}", 500

@app.route("/save_edits/<filename>", methods=["POST"])
def save_edits(filename):
    try:
        edits = request.json
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        edited_path = os.path.join(EDITED_FOLDER, f"edited_{filename}")
        
        doc = fitz.open(filepath)
        
        for edit in edits:
            page_num = edit["page"] - 1
            if page_num < len(doc):
                page = doc[page_num]
                
                if edit["type"] == "text":
                    old_text = edit["old_text"]
                    new_text = edit["new_text"]
                    
                    text_instances = page.search_for(old_text)
                    for inst in text_instances:
                        rect = fitz.Rect(inst)
                        page.add_redact_annot(rect)
                        page.apply_redactions()
                        page.insert_text((inst.x0, inst.y1), new_text, fontsize=12)
                
                elif edit["type"] == "image":
                    image_id = edit["image_id"]
                    new_image_data = edit["image_data"]
                    
                    image_list = page.get_images()
                    if image_id <= len(image_list):
                        xref = image_list[image_id - 1][0]
                        image_data = base64.b64decode(new_image_data.split(',')[1])
                        doc.update_stream(xref, image_data)
        
        doc.save(edited_path)
        doc.close()
        
        return jsonify({"status": "success", "message": "Edits saved successfully"})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/save_html/<filename>", methods=["POST"])
def save_html(filename):
    try:
        data = request.json
        html_content = data.get("html_content")
        
        if not html_content:
            return jsonify({"status": "error", "message": "No HTML content provided"}), 400
        
        # Create a clean filename
        base_name = os.path.splitext(filename)[0]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        html_filename = f"{base_name}_{timestamp}.html"
        html_path = os.path.join(HTML_FOLDER, html_filename)
        
        # Save the HTML file
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return jsonify({
            "status": "success", 
            "message": "HTML saved successfully",
            "html_filename": html_filename
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/view_html/<html_filename>")
def view_html(html_filename):
    try:
        html_path = os.path.join(HTML_FOLDER, html_filename)
        if not os.path.exists(html_path):
            return "HTML file not found", 404
        
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        return html_content
    
    except Exception as e:
        return f"Error loading HTML: {str(e)}", 500

@app.route("/download_pdf/<html_filename>")
def download_pdf(html_filename):
    try:
        html_path = os.path.join(HTML_FOLDER, html_filename)
        if not os.path.exists(html_path):
            return "HTML file not found", 404
        
        # Convert HTML to PDF
        pdf_filename = html_filename.replace('.html', '.pdf')
        pdf_path = os.path.join(HTML_FOLDER, pdf_filename)
        
        # Use weasyprint to convert HTML to PDF
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Convert HTML to PDF
        pdf_bytes = weasyprint.HTML(string=html_content).write_pdf()
        
        # Save PDF file
        with open(pdf_path, 'wb') as f:
            f.write(pdf_bytes)
        
        # Send PDF file for download
        return send_file(pdf_path, as_attachment=True, download_name=pdf_filename)
    
    except Exception as e:
        return f"Error converting to PDF: {str(e)}", 500

if __name__ == "__main__":
    app.run(debug=True)
