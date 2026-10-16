# Converte cada página de um PDF em uma imagem PNG (usa o leitor de PDF do próprio Windows;
# não precisa instalar nada). Rode no Windows PowerShell:
#
#   powershell -ExecutionPolicy Bypass -File ferramentas\pdf-para-imagens.ps1 `
#       -Pdf revista.pdf -Saida paginas -Largura 1700
#
# Gera paginas\pagina-01.png, pagina-02.png, ... (a largura é em pixels).

param(
  [Parameter(Mandatory = $true)][string]$Pdf,
  [Parameter(Mandatory = $true)][string]$Saida,
  [int]$Largura = 1700
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]

# espera operações assíncronas do Windows (IAsyncOperation / IAsyncAction)
$metodosAsTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq "AsTask" }
$comResultado = $metodosAsTask | Where-Object {
  $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq "IAsyncOperation``1"
} | Select-Object -First 1
$semResultado = $metodosAsTask | Where-Object {
  $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq "IAsyncAction"
} | Select-Object -First 1

function Esperar($operacao, [Type]$tipo) {
  $tarefa = $comResultado.MakeGenericMethod($tipo).Invoke($null, @($operacao))
  $null = $tarefa.Wait(-1)
  return $tarefa.Result
}
function EsperarAcao($acao) {
  $tarefa = $semResultado.Invoke($null, @($acao))
  $null = $tarefa.Wait(-1)
}

$pdfCompleto = (Resolve-Path $Pdf).Path
New-Item -ItemType Directory -Force $Saida | Out-Null
$saidaCompleta = (Resolve-Path $Saida).Path

$arquivo = Esperar ([Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfCompleto)) ([Windows.Storage.StorageFile])
$doc = Esperar ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($arquivo)) ([Windows.Data.Pdf.PdfDocument])
"Páginas no PDF: " + $doc.PageCount

for ($i = 0; $i -lt $doc.PageCount; $i++) {
  $pagina = $doc.GetPage($i)
  $opcoes = New-Object Windows.Data.Pdf.PdfPageRenderOptions
  $opcoes.DestinationWidth = $Largura
  $fluxo = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
  EsperarAcao ($pagina.RenderToStreamAsync($fluxo, $opcoes))

  $nome = "pagina-{0:D2}.png" -f ($i + 1)
  $destino = Join-Path $saidaCompleta $nome
  $leitura = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($fluxo)
  $arquivoSaida = [System.IO.File]::Create($destino)
  try { $leitura.CopyTo($arquivoSaida) } finally { $arquivoSaida.Dispose(); $leitura.Dispose() }

  "{0}  {1:N1} x {2:N1} pt  ->  {3} KB" -f $nome, $pagina.Size.Width, $pagina.Size.Height, [math]::Round((Get-Item $destino).Length / 1KB)
  $pagina.Dispose()
}
