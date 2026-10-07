import docx
import os

DOCX_PATH = "SENTINEL_Project_Report.docx"

def audit_document():
    if not os.path.exists(DOCX_PATH):
        print(f"Error: {DOCX_PATH} does not exist!")
        return
        
    doc = docx.Document(DOCX_PATH)
    
    print(f"File: {DOCX_PATH}")
    print(f"File Size: {os.path.getsize(DOCX_PATH):,} bytes ({os.path.getsize(DOCX_PATH)/(1024*1024):.2f} MB)")
    print(f"Total Paragraphs: {len(doc.paragraphs)}")
    print(f"Total Tables: {len(doc.tables)}")
    print(f"Total Sections: {len(doc.sections)}")
    
    # Check student names
    names = [
        ("Ram Sakthi Sharumathi M", "713324SB041"),
        ("Roopesh S N", "713324SB044"),
        ("Sanjeevkumar P", "713324SB046"),
        ("Saravana Kumar M", "713324SB048")
    ]
    
    doc_text = "\n".join([p.text for p in doc.paragraphs])
    for t in doc.tables:
        for r in t.rows:
            for c in r.cells:
                doc_text += "\n" + c.text
                
    doc_text_upper = doc_text.upper()
    
    print("\n--- Student Verification ---")
    for name, reg in names:
        found_name = name.upper() in doc_text_upper
        found_reg = reg.upper() in doc_text_upper
        print(f"Student: {name:25s} | Reg: {reg:12s} | Name Found: {found_name} | Reg Found: {found_reg}")
        assert found_name, f"Missing name: {name}"
        assert found_reg, f"Missing reg: {reg}"
        
    print("\n--- Chapter Headings Verification ---")
    chapters = [
        "CHAPTER 1", "CHAPTER 2", "CHAPTER 3", "CHAPTER 4",
        "CHAPTER 5", "CHAPTER 6", "CHAPTER 7", "CHAPTER 8",
        "CHAPTER 9", "CHAPTER 10", "CHAPTER 11", "CHAPTER 12",
        "CHAPTER 13", "CHAPTER 14", "APPENDIX I", "APPENDIX II", "REFERENCES"
    ]
    for ch in chapters:
        found = ch in doc_text_upper
        print(f"Heading: {ch:15s} | Found: {found}")
        assert found, f"Missing chapter: {ch}"
        
    # Check image elements in document XML
    images_count = len(doc._part.related_parts)
    print(f"\nEmbedded Parts (Images, Media): {images_count}")
    
    print("\n--- Table Verification ---")
    print(f"Total Tables Verified: {len(doc.tables)}")
    for i, t in enumerate(doc.tables[:10]):
        print(f"Table {i+1}: {len(t.rows)} rows x {len(t.columns)} cols")
        
    print("\n" + "="*50)
    print("ALL AUDIT CHECKS PASSED WITH ZERO ERRORS!")
    print("="*50)

if __name__ == "__main__":
    audit_document()
