\# Document Summary Assistant



\## Project Overview



Document Summary Assistant is a web application that allows users to upload PDF and image documents and generate smart AI-powered summaries.



The application is designed to simplify the process of understanding lengthy documents by extracting their content, generating summaries, and highlighting important points and main ideas.



\## Features



\### 1. Document Upload

\- Upload PDF files.

\- Upload image files such as JPG and PNG.

\- Drag-and-drop file upload.

\- File picker support.



\### 2. Text Extraction

\- Extract text from PDF documents.

\- Use OCR (Optical Character Recognition) for image/scanned documents.

\- Process the extracted text for summarization.



\### 3. Summary Generation

\- Automatically generate smart summaries.

\- Choose from three summary lengths:

&#x20; - Short

&#x20; - Medium

&#x20; - Long

\- Highlight important points and main ideas.



\### 4. User Interface

\- Simple and intuitive document upload interface.

\- Clear summary display.

\- Loading states during document processing.

\- Basic error handling.

\- Responsive design for desktop and mobile devices.



\## Technology Stack



\### Frontend

\- React

\- Vite

\- Tailwind CSS



\### Backend

\- Node.js

\- Express.js



\### Document Processing

\- PDF text extraction

\- Tesseract OCR



\### AI

\- Gemini API



\## Application Workflow



```text

User Uploads Document

&#x20;       ↓

Check File Type

&#x20;       ↓

Extract Text

&#x20;       ↓

PDF Parsing / OCR

&#x20;       ↓

Send Extracted Text to AI

&#x20;       ↓

Generate Summary

&#x20;       ↓

Display Summary + Key Points

