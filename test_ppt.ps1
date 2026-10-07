try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $pres = $ppt.Presentations.Open("C:\Users\thero\Downloads\Mini_Project.pptx", 1, 0, 0)
    Write-Host "POWERPOINT_SUCCESS: Slide Count = $($pres.Slides.Count)"
    $pres.Close()
    $ppt.Quit()
} catch {
    Write-Host "POWERPOINT_COM_RESULT: $($_.Exception.Message)"
}
