$docxPath = "C:\Users\thero\Downloads\Project_Highlights.docx"
$pdfPath = "C:\Users\thero\Downloads\Project_Highlights.pdf"
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open($docxPath)
    $pages = $doc.ComputeStatistics(2)
    Write-Host "DOCX_PAGES: $pages"
    $doc.SaveAs([ref]$pdfPath, [ref]17)
    $doc.Close([ref]0)
    $word.Quit()
    Write-Host "PDF_EXPORTED: $pdfPath"
} catch {
    Write-Host "WORD_ERROR: $($_.Exception.Message)"
}
