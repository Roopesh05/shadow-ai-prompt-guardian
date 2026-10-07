$docxPath = "C:\Users\thero\Downloads\Technical_Architecture_and_Project_Explanation.docx"
$pdfPath = "C:\Users\thero\Downloads\Technical_Architecture_and_Project_Explanation.pdf"
$wsPdf = "c:\Users\thero\shadow-ai-prompt-guardian\Technical_Architecture_and_Project_Explanation.pdf"

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open($docxPath)
    $pages = $doc.ComputeStatistics(2)
    Write-Host "DOCX_PAGES: $pages"
    $doc.SaveAs([ref]$pdfPath, [ref]17) # 17 = wdFormatPDF
    $doc.SaveAs([ref]$wsPdf, [ref]17)
    $doc.Close([ref]0)
    $word.Quit()
    Write-Host "PDF_EXPORTED: $pdfPath"
    Write-Host "WORKSPACE_PDF: $wsPdf"
} catch {
    Write-Host "WORD_ERROR: $($_.Exception.Message)"
}
