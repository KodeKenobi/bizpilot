from flask import Flask, render_template, request, send_file, redirect, url_for, jsonify
from flask_cors import CORS
import os
import fitz
import base64
from io import BytesIO
import json
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
        # Get the request data
        data = request.get_json()
        edits = data.get("edits", []) if data else []
        
        print(f"Received edits for {filename}: {len(edits)} edits")
        
        if not edits:
            return jsonify({"status": "success", "message": "No edits to save"})
            
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(filepath):
            return jsonify({"status": "error", "message": f"Original file {filename} not found"}), 404
            
        edited_path = os.path.join(EDITED_FOLDER, f"edited_{filename}")

        doc = fitz.open(filepath)
        
        for edit in edits:
            try:
                if not isinstance(edit, dict):
                    print(f"Skipping invalid edit: {edit}")
                    continue
                    
                page_num = edit.get("page", 1) - 1
                edit_type = edit.get("type", "")
                
                if page_num < 0 or page_num >= len(doc):
                    print(f"Skipping edit for invalid page: {page_num}")
                    continue
                    
                page = doc[page_num]
                
                if edit_type == "text":
                    old_text = edit.get("old_text", "")
                    new_text = edit.get("new_text", "")
                    
                    if old_text and new_text:
                        text_instances = page.search_for(old_text)
                        for inst in text_instances:
                            rect = fitz.Rect(inst)
                            page.add_redact_annot(rect)
                            page.apply_redactions()
                            page.insert_text((inst.x0, inst.y1), new_text, fontsize=12)
                
                elif edit_type == "image":
                    image_id = edit.get("image_id")
                    new_image_data = edit.get("image_data")
                    
                    if image_id and new_image_data:
                        image_list = page.get_images()
                        if 1 <= image_id <= len(image_list):
                            xref = image_list[image_id - 1][0]
                            if ',' in new_image_data:
                                image_data = base64.b64decode(new_image_data.split(',')[1])
                                doc.update_stream(xref, image_data)
                        
            except Exception as edit_error:
                print(f"Error processing individual edit: {edit_error}")
                continue
        
        doc.save(edited_path)
        doc.close()
        
        return jsonify({"status": "success", "message": "Edits saved successfully"})
    
    except Exception as e:
        print(f"Error in save_edits: {str(e)}")  # Debug logging
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
            return jsonify({"status": "error", "message": "HTML file not found"}), 404
        
        # Convert HTML to PDF
        pdf_filename = html_filename.replace('.html', '.pdf')
        pdf_path = os.path.join(HTML_FOLDER, pdf_filename)
        
        # Read HTML content
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Parse HTML to extract page content using regex
        import re
        
        # Extract page divs with their content
        page_pattern = r'<div[^>]*class="[^"]*pdf-page[^"]*"[^>]*data-page="(\d+)"[^>]*>(.*?)</div>'
        pages = re.findall(page_pattern, html_content, re.IGNORECASE | re.DOTALL)
        
        # Create PDF with proper formatting
        doc = fitz.open()
        
        for page_num, page_content in pages:
            # Create a new page for each PDF page
            page = doc.new_page(width=595, height=842)  # A4 size
            y_position = 50
            
            # Extract text spans from this page
            text_span_pattern = r'<span[^>]*class="[^"]*editable-text[^"]*"[^>]*style="[^"]*left: ([^;]+)px; top: ([^;]+)px;[^"]*"[^>]*>([^<]*)</span>'
            text_spans = re.findall(text_span_pattern, page_content, re.IGNORECASE)
            
            # Extract images from this page
            image_pattern = r'<img[^>]*class="[^"]*editable-image[^"]*"[^>]*style="[^"]*left: ([^;]+)px; top: ([^;]+)px; width: ([^;]+)px; height: ([^;]+)px;[^"]*"[^>]*src="data:image/png;base64,([^"]*)"[^>]*>'
            images = re.findall(image_pattern, page_content, re.IGNORECASE)
            
            # Add text content to PDF page
            for left, top, text_content in text_spans:
                if text_content and text_content.strip():
                    try:
                        x_pos = float(left)
                        y_pos = float(top)
                        clean_text = text_content.strip()
                        # Decode HTML entities
                        clean_text = clean_text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"')
                        
                        # Convert PDF coordinates (top-left origin) to PyMuPDF coordinates
                        # Scale positions to fit A4 page
                        scale_x = 595 / 800  # Adjust based on your PDF page width
                        scale_y = 842 / 1000  # Adjust based on your PDF page height
                        
                        pdf_x = x_pos * scale_x
                        pdf_y = y_pos * scale_y
                        
                        # Ensure text fits within page bounds
                        if pdf_x < 0:
                            pdf_x = 50
                        if pdf_y < 0:
                            pdf_y = 50
                        if pdf_x > 545:
                            pdf_x = 545
                        if pdf_y > 792:
                            pdf_y = 792
                        
                        page.insert_text((pdf_x, pdf_y), clean_text, fontsize=10)
                    except (ValueError, TypeError):
                        # If position parsing fails, just add text sequentially
                        page.insert_text((50, y_position), clean_text, fontsize=10)
                        y_position += 15
            
            # Add images to PDF page
            for left, top, width, height, image_data in images:
                try:
                    x_pos = float(left)
                    y_pos = float(top)
                    img_width = float(width)
                    img_height = float(height)
                    
                    # Scale positions to fit A4 page
                    scale_x = 595 / 800
                    scale_y = 842 / 1000
                    
                    pdf_x = x_pos * scale_x
                    pdf_y = y_pos * scale_y
                    pdf_width = img_width * scale_x
                    pdf_height = img_height * scale_y
                    
                    # Ensure image fits within page bounds
                    if pdf_x < 0:
                        pdf_x = 50
                    if pdf_y < 0:
                        pdf_y = 50
                    if pdf_x + pdf_width > 545:
                        pdf_width = 545 - pdf_x
                    if pdf_y + pdf_height > 792:
                        pdf_height = 792 - pdf_y
                    
                    if pdf_width > 0 and pdf_height > 0:
                        # Decode base64 image and insert
                        import base64
                        image_bytes = base64.b64decode(image_data)
                        rect = fitz.Rect(pdf_x, pdf_y, pdf_x + pdf_width, pdf_y + pdf_height)
                        page.insert_image(rect, pixmap=fitz.Pixmap(fitz.csRGB, image_bytes))
                except (ValueError, TypeError, Exception):
                    # Skip problematic images
                    continue
        
        doc.save(pdf_path)
        doc.close()
        
        # Send PDF file for download
        return send_file(pdf_path, as_attachment=True, download_name=pdf_filename)
    
    except Exception as e:
        print(f"Error in download_pdf: {str(e)}")  # Debug logging
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/extract_text/<filename>")
def extract_text(filename):
    try:
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(filepath):
            return jsonify({"status": "error", "message": "File not found"}), 404
        
        doc = fitz.open(filepath)
        extracted_text = ""
        page_count = len(doc)
        
        for page_num in range(page_count):
            page = doc[page_num]
            page_text = page.get_text()
            if page_text.strip():
                extracted_text += f"--- Page {page_num + 1} ---\n"
                extracted_text += page_text + "\n\n"
        
        doc.close()
        
        return jsonify({
            "status": "success",
            "filename": filename,
            "text": extracted_text,
            "page_count": page_count
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/extract_images/<filename>")
def extract_images(filename):
    try:
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(filepath):
            return jsonify({"status": "error", "message": "File not found"}), 404
        
        doc = fitz.open(filepath)
        images_data = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images()
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                
                if pix.n - pix.alpha < 4:  # GRAY or RGB
                    img_data = pix.tobytes("png")
                    img_base64 = base64.b64encode(img_data).decode()
                    
                    images_data.append({
                        "page": page_num + 1,
                        "image_index": img_index + 1,
                        "width": pix.width,
                        "height": pix.height,
                        "data": img_base64
                    })
                
                pix = None
        
        doc.close()
        
        return jsonify({
            "status": "success",
            "filename": filename,
            "images": images_data,
            "total_images": len(images_data)
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/merge_pdfs", methods=["POST"])
def merge_pdfs():
    try:
        files = request.files.getlist('pdfs')
        
        if len(files) < 2:
            return jsonify({"status": "error", "message": "At least 2 PDF files are required for merging"}), 400
        
        # Create merged document
        merged_doc = fitz.open()
        
        for file in files:
            if file.filename.endswith('.pdf'):
                # Save temporary file
                temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{file.filename}")
                file.save(temp_path)
                
                # Open and add pages to merged document
                temp_doc = fitz.open(temp_path)
                merged_doc.insert_pdf(temp_doc)
                temp_doc.close()
                
                # Remove temporary file
                os.remove(temp_path)
        
        # Generate merged filename
        merged_filename = f"merged_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        merged_path = os.path.join(HTML_FOLDER, merged_filename)
        
        # Get page count before closing
        page_count = len(merged_doc)
        
        # Save merged document
        merged_doc.save(merged_path)
        merged_doc.close()
        
        return jsonify({
            "status": "success",
            "message": f"Successfully merged {len(files)} PDF files",
            "merged_filename": merged_filename,
            "download_url": f"/download_merged/{merged_filename}",
            "file_count": len(files),
            "page_count": page_count
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/download_merged/<merged_filename>")
def download_merged(merged_filename):
    try:
        merged_path = os.path.join(HTML_FOLDER, merged_filename)
        if not os.path.exists(merged_path):
            return "Merged PDF file not found", 404
        
        # Check if it's a download request (has download parameter)
        download = request.args.get('download', 'false').lower() == 'true'
        
        if download:
            return send_file(merged_path, as_attachment=True, download_name=merged_filename)
        else:
            return send_file(merged_path, as_attachment=False)
    
    except Exception as e:
        return f"Error downloading merged PDF: {str(e)}", 500


@app.route('/split_pdf', methods=['POST'])
def split_pdf():
    try:
        if 'pdf' not in request.files:
            return jsonify({"status": "error", "message": "No PDF file provided"}), 400
        
        pdf_file = request.files['pdf']
        if pdf_file.filename == '':
            return jsonify({"status": "error", "message": "No file selected"}), 400
        
        # Save uploaded PDF
        original_filename = pdf_file.filename
        # Create a safe filename by replacing problematic characters
        safe_filename = "".join(c for c in original_filename if c.isalnum() or c in '._-')
        if not safe_filename.endswith('.pdf'):
            safe_filename += '.pdf'
        pdf_path = os.path.join(UPLOAD_FOLDER, safe_filename)
        pdf_file.save(pdf_path)
        
        # Open PDF document
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        
        if total_pages <= 1:
            doc.close()
            os.remove(pdf_path)
            return jsonify({"status": "error", "message": "PDF must have more than 1 page to split"}), 400
        
        # Create split folder
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        split_folder = os.path.join(HTML_FOLDER, f"split_{timestamp}")
        os.makedirs(split_folder, exist_ok=True)
        
        split_files = []
        
        # Split PDF into individual pages
        for page_num in range(total_pages):
            # Create new document with single page
            new_doc = fitz.open()
            new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
            
            # Generate filename for split page
            base_name = os.path.splitext(safe_filename)[0]
            split_filename = f"{base_name}_page_{page_num + 1}.pdf"
            split_path = os.path.join(split_folder, split_filename)
            
            # Save split page
            new_doc.save(split_path)
            new_doc.close()
            
            split_files.append({
                "filename": split_filename,
                "page_number": page_num + 1,
                "download_url": f"/download_split/split_{timestamp}/{split_filename}"
            })
        
        doc.close()
        os.remove(pdf_path)  # Clean up original uploaded file
        
        return jsonify({
            "status": "success",
            "message": f"PDF split successfully into {total_pages} pages",
            "total_pages": total_pages,
            "split_files": split_files,
            "split_folder": timestamp
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": f"Error splitting PDF: {str(e)}"}), 500


@app.route('/download_split/<split_folder>/<split_filename>')
def download_split(split_folder, split_filename):
    try:
        split_path = os.path.join(HTML_FOLDER, split_folder, split_filename)
        if not os.path.exists(split_path):
            return "Split PDF file not found", 404
        
        # Check if it's a download request (has download parameter)
        download = request.args.get('download', 'false').lower() == 'true'
        
        if download:
            return send_file(split_path, as_attachment=True, download_name=split_filename)
        else:
            return send_file(split_path, as_attachment=False)
    
    except Exception as e:
        return f"Error downloading split PDF: {str(e)}", 500


if __name__ == "__main__":
    app.run(debug=True)
