# Document Summary Assistant

## Project Overview

Document Summary Assistant is a web application that allows users to upload PDF and image documents and generate smart AI-powered summaries.

The application is designed to simplify the process of understanding lengthy documents by extracting their content, generating summaries, and highlighting important points and main ideas.

## Features

### 1. Document Upload

- Upload PDF files.
- Upload image files such as JPG and PNG.
- Drag-and-drop file upload.
- File picker support.

### 2. Text Extraction

- Extract text from PDF documents.
- Use OCR (Optical Character Recognition) for image/scanned documents.
- Process the extracted text for summarization.

### 3. Summary Generation

- Automatically generate smart summaries.
- Choose from three summary lengths:
  - Short
  - Medium
  - Long
- Highlight important points and main ideas.

### 4. User Interface

- Simple and intuitive document upload interface.
- Clear summary display.
- Loading states during document processing.
- Basic error handling.
- Responsive design for desktop and mobile devices.

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Document Processing

- PDF text extraction
- Tesseract OCR

### AI

- Gemini API

## Application Workflow

```text
User Uploads Document
        ↓
Check File Type
        ↓
Extract Text
        ↓
PDF Parsing / OCR
        ↓
Send Extracted Text to AI
        ↓
Generate Summary
        ↓
Display Summary + Key Points



Live Application

https://document-summary-nine.vercel.app

GitHub Repository

https://github.com/keerthanakanumuri/Document_Summary

Approach

The application was developed as a full-stack document summarization system. The React frontend provides a simple interface for uploading PDF and image documents and selecting the required summary length. The Node.js and Express.js backend handles document uploads and processing. PDF documents are processed through text extraction, while image and scanned documents use Tesseract OCR to extract readable text. The extracted content is then sent to the AI service to generate a summary based on the selected length. The application also displays important points and main ideas from the document. Loading states and error handling provide clear feedback during processing. The frontend is deployed on Vercel and the backend is deployed on Render, with API credentials stored securely using environment variables.