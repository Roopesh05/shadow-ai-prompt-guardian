$word = New-Object -ComObject Word.Application
$word.Visible = $false
$files = @(
    "C:\Users\thero\Downloads\Author_Statement.docx",
    "C:\Users\thero\Downloads\Cover_Letter.docx",
    "C:\Users\thero\Downloads\Declaration_of_Interest_Statement.docx"
)
foreach ($f in $files) {
    try {
        $doc = $word.Documents.Open($f)
        $pages = $doc.ComputeStatistics(2)
        $name = [System.IO.Path]::GetFileName($f)
        Write-Host "$name - Total Pages: $pages"
        $pdf = $f.Substring(0, $f.Length - 5) + ".pdf"
        $doc.SaveAs([ref]$pdf, [ref]17)
        $doc.Close([ref]0)
    } catch {
        Write-Host "Error with $f : $($_.Exception.Message)"
    }
}
$word.Quit()
