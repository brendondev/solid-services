$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$planningDir = Join-Path $root "docs\planning"
$exportsDir = Join-Path $root "docs\exports"
$sourceMd = Join-Path $planningDir "ERP_SaaS_Multi_Planejamento_Completo.md"
$summaryMd = Join-Path $planningDir "ERP_SaaS_Multi_Versao_Final_Consolidada.md"
$docxPath = Join-Path $exportsDir "ERP_SaaS_Multi_Planejamento_Completo.docx"
$pdfPath = Join-Path $exportsDir "ERP_SaaS_Multi_Planejamento_Completo.pdf"
$summaryDocxPath = Join-Path $exportsDir "ERP_SaaS_Multi_Versao_Final_Consolidada.docx"
$summaryPdfPath = Join-Path $exportsDir "ERP_SaaS_Multi_Versao_Final_Consolidada.pdf"
$xlsxPath = Join-Path $exportsDir "ERP_SaaS_Multi_Planejamento_Completo.xlsx"
$csvPath = Join-Path $exportsDir "ERP_SaaS_Multi_Backlog.csv"

New-Item -ItemType Directory -Force -Path $exportsDir | Out-Null

if (-not (Test-Path $sourceMd)) {
    throw "Arquivo fonte nao encontrado: $sourceMd"
}

if (-not (Test-Path $summaryMd)) {
    throw "Arquivo resumo nao encontrado: $summaryMd"
}

function Escape-Xml {
    param([string]$Text)

    if ($null -eq $Text) { return "" }
    return [System.Security.SecurityElement]::Escape($Text)
}

function Normalize-Line {
    param([string]$Line)

    if ($null -eq $Line) { return "" }
    $normalized = $Line -replace "\*\*", ""
    $normalized = $normalized -replace '`', ""
    return $normalized.TrimEnd()
}

function Convert-MarkdownToPlainLines {
    param([string[]]$Lines)

    $result = New-Object System.Collections.Generic.List[string]
    foreach ($line in $Lines) {
        $value = Normalize-Line $line
        if ($value -match '^### ') {
            $result.Add($value.Substring(4).ToUpper())
        } elseif ($value -match '^## ') {
            $result.Add("")
            $result.Add($value.Substring(3).ToUpper())
        } elseif ($value -match '^# ') {
            $result.Add($value.Substring(2).ToUpper())
        } elseif ($value -match '^- ') {
            $result.Add("* " + $value.Substring(2))
        } else {
            $result.Add($value)
        }
    }
    return $result
}

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Content
    )

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function New-TempDir {
    $path = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $path | Out-Null
    return $path
}

function Build-Docx {
    param(
        [string[]]$Lines,
        [string]$Destination
    )

    $tempDir = New-TempDir
    try {
        $wordDir = Join-Path $tempDir "word"
        $relsDir = Join-Path $tempDir "_rels"
        $docRelsDir = Join-Path $wordDir "_rels"
        New-Item -ItemType Directory -Force -Path $wordDir, $relsDir, $docRelsDir | Out-Null

        $paragraphs = foreach ($line in $Lines) {
            $safe = Escape-Xml $line
            if ([string]::IsNullOrWhiteSpace($safe)) {
                "<w:p/>"
            } else {
                "<w:p><w:r><w:t xml:space=`"preserve`">$safe</w:t></w:r></w:p>"
            }
        }

        $documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 wp14">
  <w:body>
    $($paragraphs -join "`n    ")
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

        $contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
"@

        $packageRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"@

        $docRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
"@

        Write-Utf8NoBom (Join-Path $tempDir "[Content_Types].xml") $contentTypes
        Write-Utf8NoBom (Join-Path $relsDir ".rels") $packageRels
        Write-Utf8NoBom (Join-Path $wordDir "document.xml") $documentXml
        Write-Utf8NoBom (Join-Path $docRelsDir "document.xml.rels") $docRels

        $zipPath = [System.IO.Path]::ChangeExtension($Destination, ".zip")
        if (Test-Path $Destination) { Remove-Item $Destination -Force }
        if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
        Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $zipPath
        Move-Item -Force $zipPath $Destination
    }
    finally {
        Remove-Item $tempDir -Recurse -Force
    }
}

function Convert-ColumnIndexToName {
    param([int]$Index)

    $name = ""
    $value = $Index
    while ($value -gt 0) {
        $mod = ($value - 1) % 26
        $name = [char](65 + $mod) + $name
        $value = [math]::Floor(($value - 1) / 26)
    }
    return $name
}

function Build-SheetXml {
    param([object[][]]$Rows)

    $builder = New-Object System.Text.StringBuilder
    [void]$builder.AppendLine('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
    [void]$builder.AppendLine('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">')
    [void]$builder.AppendLine('  <sheetData>')

    for ($r = 0; $r -lt $Rows.Count; $r++) {
        $rowNumber = $r + 1
        [void]$builder.AppendLine("    <row r=`"$rowNumber`">")
        $row = $Rows[$r]
        for ($c = 0; $c -lt $row.Count; $c++) {
            $cellRef = "$(Convert-ColumnIndexToName ($c + 1))$rowNumber"
            $value = $row[$c]
            if ($value -is [int] -or $value -is [double] -or $value -is [decimal]) {
                [void]$builder.AppendLine("      <c r=`"$cellRef`"><v>$value</v></c>")
            } else {
                $text = Escape-Xml ([string]$value)
                [void]$builder.AppendLine("      <c r=`"$cellRef`" t=`"inlineStr`"><is><t xml:space=`"preserve`">$text</t></is></c>")
            }
        }
        [void]$builder.AppendLine('    </row>')
    }

    [void]$builder.AppendLine('  </sheetData>')
    [void]$builder.AppendLine('</worksheet>')
    return $builder.ToString()
}

function Build-Xlsx {
    param(
        [hashtable[]]$Sheets,
        [string]$Destination
    )

    $tempDir = New-TempDir
    try {
        $xlDir = Join-Path $tempDir "xl"
        $worksheetsDir = Join-Path $xlDir "worksheets"
        $relsDir = Join-Path $tempDir "_rels"
        $xlRelsDir = Join-Path $xlDir "_rels"
        New-Item -ItemType Directory -Force -Path $xlDir, $worksheetsDir, $relsDir, $xlRelsDir | Out-Null

        $contentTypeOverrides = @()
        $workbookSheets = @()
        $workbookRels = @()

        for ($i = 0; $i -lt $Sheets.Count; $i++) {
            $sheetIndex = $i + 1
            $sheet = $Sheets[$i]
            $sheetFile = "sheet$sheetIndex.xml"
            $sheetPath = Join-Path $worksheetsDir $sheetFile
            Write-Utf8NoBom $sheetPath (Build-SheetXml -Rows $sheet.Rows)
            $contentTypeOverrides += "  <Override PartName=`"/xl/worksheets/$sheetFile`" ContentType=`"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml`"/>"
            $workbookSheets += "    <sheet name=`"$($sheet.Name)`" sheetId=`"$sheetIndex`" r:id=`"rId$sheetIndex`"/>"
            $workbookRels += "  <Relationship Id=`"rId$sheetIndex`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet`" Target=`"worksheets/$sheetFile`"/>"
        }

        $contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
$($contentTypeOverrides -join "`n")
</Types>
"@

        $packageRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
"@

        $workbookXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
$($workbookSheets -join "`n")
  </sheets>
</workbook>
"@

        $workbookRelationships = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
$($workbookRels -join "`n")
</Relationships>
"@

        Write-Utf8NoBom (Join-Path $tempDir "[Content_Types].xml") $contentTypes
        Write-Utf8NoBom (Join-Path $relsDir ".rels") $packageRels
        Write-Utf8NoBom (Join-Path $xlDir "workbook.xml") $workbookXml
        Write-Utf8NoBom (Join-Path $xlRelsDir "workbook.xml.rels") $workbookRelationships

        $zipPath = [System.IO.Path]::ChangeExtension($Destination, ".zip")
        if (Test-Path $Destination) { Remove-Item $Destination -Force }
        if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
        Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $zipPath
        Move-Item -Force $zipPath $Destination
    }
    finally {
        Remove-Item $tempDir -Recurse -Force
    }
}

function Escape-PdfText {
    param([string]$Text)

    $value = $Text -replace '\\', '\\'
    $value = $value -replace '\(', '\('
    $value = $value -replace '\)', '\)'
    return $value
}

function Wrap-PlainTextLines {
    param(
        [string[]]$Lines,
        [int]$MaxChars = 90
    )

    $wrapped = New-Object System.Collections.Generic.List[string]

    foreach ($line in $Lines) {
        if ([string]::IsNullOrWhiteSpace($line)) {
            $wrapped.Add("")
            continue
        }

        $indentMatch = [regex]::Match($line, '^\s*')
        $indent = $indentMatch.Value
        $content = $line.Trim()
        $words = $content -split '\s+'
        $current = $indent

        foreach ($word in $words) {
            if ([string]::IsNullOrWhiteSpace($current.Trim())) {
                $candidate = $indent + $word
            } else {
                $candidate = $current + " " + $word
            }

            if ($candidate.Length -le $MaxChars) {
                $current = $candidate
            } else {
                if (-not [string]::IsNullOrWhiteSpace($current)) {
                    $wrapped.Add($current.TrimEnd())
                }
                $current = $indent + $word
            }
        }

        if (-not [string]::IsNullOrWhiteSpace($current)) {
            $wrapped.Add($current.TrimEnd())
        }
    }

    return $wrapped
}

function Build-Pdf {
    param(
        [string[]]$Lines,
        [string]$Destination
    )

    $pageHeight = 792
    $left = 50
    $top = 760
    $lineHeight = 12
    $linesPerPage = 58
    $pages = @()
    $wrappedLines = Wrap-PlainTextLines -Lines $Lines -MaxChars 92

    for ($i = 0; $i -lt $wrappedLines.Count; $i += $linesPerPage) {
        $pages += ,($wrappedLines[$i..([Math]::Min($i + $linesPerPage - 1, $wrappedLines.Count - 1))])
    }

    $objects = New-Object System.Collections.Generic.List[string]
    $fontObjectNumber = 3 + ($pages.Count * 2)

    $objects.Add("<< /Type /Catalog /Pages 2 0 R >>")

    $kids = for ($pageIndex = 0; $pageIndex -lt $pages.Count; $pageIndex++) {
        "$((3 + ($pageIndex * 2))) 0 R"
    }
    $objects.Add("<< /Type /Pages /Count $($pages.Count) /Kids [ $($kids -join ' ') ] >>")

    for ($pageIndex = 0; $pageIndex -lt $pages.Count; $pageIndex++) {
        $pageNumber = 3 + ($pageIndex * 2)
        $contentNumber = $pageNumber + 1
        $objects.Add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 $pageHeight] /Resources << /Font << /F1 $fontObjectNumber 0 R >> >> /Contents $contentNumber 0 R >>")

        $contentLines = New-Object System.Collections.Generic.List[string]
        $contentLines.Add("BT")
        $contentLines.Add("/F1 10 Tf")
        for ($lineIndex = 0; $lineIndex -lt $pages[$pageIndex].Count; $lineIndex++) {
            $text = Escape-PdfText $pages[$pageIndex][$lineIndex]
            if ($lineIndex -eq 0) {
                $y = $top
                $contentLines.Add("$left $y Td ($text) Tj")
            } else {
                $contentLines.Add("0 -$lineHeight Td ($text) Tj")
            }
        }
        $contentLines.Add("ET")
        $stream = [string]::Join("`n", $contentLines)
        $objects.Add("<< /Length $($stream.Length) >>`nstream`n$stream`nendstream")
    }

    $objects.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    $builder = New-Object System.Text.StringBuilder
    [void]$builder.Append("%PDF-1.4`n")
    $offsets = New-Object System.Collections.Generic.List[int]
    $offsets.Add(0)

    for ($i = 0; $i -lt $objects.Count; $i++) {
        $offsets.Add($builder.Length)
        [void]$builder.AppendFormat("{0} 0 obj`n{1}`nendobj`n", ($i + 1), $objects[$i])
    }

    $xrefPosition = $builder.Length
    [void]$builder.Append("xref`n")
    [void]$builder.AppendFormat("0 {0}`n", ($objects.Count + 1))
    [void]$builder.Append("0000000000 65535 f `n")
    for ($i = 1; $i -lt $offsets.Count; $i++) {
        [void]$builder.AppendFormat("{0:0000000000} 00000 n `n", $offsets[$i])
    }
    [void]$builder.Append("trailer`n")
    [void]$builder.AppendFormat("<< /Size {0} /Root 1 0 R >>`n", ($objects.Count + 1))
    [void]$builder.Append("startxref`n")
    [void]$builder.AppendFormat("{0}`n", $xrefPosition)
    [void]$builder.Append("%%EOF")

    Write-Utf8NoBom $Destination $builder.ToString()
}

$rawLines = Get-Content $sourceMd
$plainLines = Convert-MarkdownToPlainLines -Lines $rawLines
$summaryLines = Convert-MarkdownToPlainLines -Lines (Get-Content $summaryMd)

$backlogRows = @(
    @("ID","Epic","Feature","Priority","Phase","Description","Dependencies","Owner"),
    @("A01","Plataforma SaaS","Onboarding de tenant","Alta","Fase 0","Criar tenant, plano, branding basico e configuracoes iniciais","Auth, billing","Produto/Back-end"),
    @("A02","Plataforma SaaS","Usuarios, perfis e auditoria","Alta","Fase 1","Perfis basicos, permissoes por modulo e logs criticos","Tenant base","Back-end"),
    @("B01","Operacao Core","Cadastro de clientes e contatos","Alta","Fase 1","Base CRM para prestadores de servico","Tenant base","Full-stack"),
    @("B02","Operacao Core","Catalogo de servicos e templates","Alta","Fase 1","Tipos de servico, duracao, preco base e checklist sugerido","Clientes","Full-stack"),
    @("B03","Operacao Core","Orcamentos e propostas","Alta","Fase 1","Criacao, envio por link, validade e conversao em OS","Clientes, servicos","Full-stack"),
    @("B04","Operacao Core","Ordens de servico","Alta","Fase 1","Abertura, status, timeline, responsavel e conclusao","Orcamentos, clientes","Full-stack"),
    @("B05","Operacao Core","Agenda e execucao","Alta","Fase 1","Agenda simples, reagendamento, check-in e check-out","OS, usuarios","Front/Back"),
    @("B06","Operacao Core","Checklist e anexos","Media","Fase 1","Fotos, comprovantes e formularios por servico","OS","Front/Back"),
    @("C01","Experiencia Cliente","Portal do cliente","Alta","Fase 2","Status, historico, documentos e acompanhamento","OS, auth","Front-end"),
    @("C02","Experiencia Cliente","Aceite digital","Alta","Fase 2","Aprovacao de orcamentos e conclusoes por link","Orcamento, portal","Full-stack"),
    @("C03","Experiencia Cliente","Automacoes de mensagem","Media","Fase 2","Lembretes, mudancas de status e cobranca","Eventos de agenda e OS","Back-end"),
    @("D01","Financeiro","Contas a receber","Alta","Fase 2","Titulos por OS, vencimento e baixa","OS, orcamento","Back-end"),
    @("D02","Financeiro","Pagamentos e links","Alta","Fase 2","PIX, cartao, boleto e registro de recebimento","Gateway","Back-end"),
    @("D03","Financeiro","Contas a pagar e fluxo de caixa","Media","Fase 3","Despesas, previsao e realizado","Receber/pagar","Back-end"),
    @("D04","Financeiro","Cobranca automatizada","Media","Fase 3","Lembretes de vencimento e inadimplencia","Recebiveis, notificacoes","Back-end"),
    @("E01","Escala","Contratos e recorrencia","Media","Fase 4","Servicos recorrentes e geracao automatica","Clientes, agenda","Back-end"),
    @("E02","Escala","Pacotes verticais","Media","Fase 4","Campos, templates e fluxos por nicho","Core consolidado","Produto/Full-stack"),
    @("E03","Escala","Estoque opcional","Baixa","Fase 4","Pecas e insumos para nichos que precisam","OS, itens","Back-end"),
    @("E04","Escala","Dashboards avancados","Media","Fase 4","Produtividade, SLA, margem e uso por tenant","Eventos e financeiro","Dados/BI")
)

$roadmapRows = @(
    @("Fase","Duracao","Objetivo","Principais entregas","Criterio de saida"),
    @("Fase 0","2-3 semanas","Fundacao","Pesquisa com prestadores, ICP, arquitetura base, auth e tenant core","Fluxo principal validado e backlog priorizado"),
    @("Fase 1","8-10 semanas","MVP operacional","Clientes, servicos, orcamentos, OS, agenda, checklist e anexos","Piloto interno faz orcamento ate cobranca simples"),
    @("Fase 2","4-6 semanas","Validacao comercial","Portal, aceite digital, recebiveis, pagamentos e automacoes","Clientes piloto ativos e usando semanalmente"),
    @("Fase 3","6-8 semanas","Financeiro e monetizacao","Contas a pagar, fluxo de caixa, cobranca e billing SaaS","Receita recorrente e operacao financeira mais madura"),
    @("Fase 4","8-12 semanas","Escala e nichos","Recorrencia, pacotes verticais, analytics e estoque opcional","Base pronta para expandir por segmento")
)

$modulesRows = @(
    @("Modulo","Valor para o cliente","Complexidade","Quando entra"),
    @("Clientes e CRM","Centraliza relacionamento e historico","Baixa","MVP"),
    @("Catalogo de servicos","Padroniza precos, duracao e execucao","Baixa","MVP"),
    @("OS","Nucleo operacional do servico","Alta","MVP"),
    @("Orcamentos","Aumenta aprovacao e profissionaliza a venda","Media","MVP"),
    @("Agenda","Organiza compromissos e execucao","Media","MVP"),
    @("Portal do cliente","Melhora experiencia e reduz retrabalho","Media","Pos-MVP"),
    @("Financeiro","Da visibilidade de caixa e cobranca","Alta","Pos-MVP"),
    @("Pagamentos","Acelera recebimento e sinal","Media","Pos-MVP"),
    @("Recorrencia","Cria previsibilidade de receita","Media","Escala"),
    @("Pacotes verticais","Aumenta aderencia por nicho","Media","Escala")
)

$kpiRows = @(
    @("KPI","Descricao","Meta inicial"),
    @("MRR","Receita recorrente mensal","Crescimento continuo apos pilotos"),
    @("Taxa de aprovacao","Percentual de orcamentos aprovados","Aumentar frente ao processo atual"),
    @("Tempo medio de servico","Tempo da abertura ao fechamento","Reducao mensuravel"),
    @("Inadimplencia","Titulos vencidos/abertos","Controle abaixo do limite definido"),
    @("Produtividade por agenda","Servicos por profissional por periodo","Melhora apos agenda + checklist"),
    @("Uso semanal","Tenants ativos na semana","Alta recorrencia de uso"),
    @("Churn","Cancelamento mensal","Baixo no grupo piloto")
)

$riskRows = @(
    @("Risco","Impacto","Mitigacao"),
    @("Produto generico demais","Alto","Core horizontal claro + pacotes verticais"),
    @("Escopo excessivo","Alto","Faseamento e gates de produto"),
    @("Financeiro/fiscal complexo","Alto","Modulo simples primeiro e apoio especialista"),
    @("Baixa adesao do autonomo","Alto","Fluxo simples, onboarding guiado e mobile first"),
    @("Falha no isolamento multi-tenant","Critico","Testes automatizados e auditoria"),
    @("Dependencia de customizacoes","Medio","Configuracao padrao e limite comercial")
)

$icpRows = @(
    @("Tema","Definicao"),
    @("ICP principal","MEIs, autonomos e pequenas empresas de servico com agenda, execucao e cobranca recorrentes"),
    @("Nicho 1","Instalacao e servicos tecnicos leves"),
    @("Nicho 2","Manutencao residencial e pequenos reparos"),
    @("Nicho 3","Limpeza profissional"),
    @("Faixa ideal","1 a 10 usuarios e operacao local/regional"),
    @("Dor principal","Desorganizacao entre cliente, orcamento, agenda, execucao e cobranca")
)

$csvLines = foreach ($row in $backlogRows) {
    ($row | ForEach-Object {
        '"' + (($_.ToString()) -replace '"', '""') + '"'
    }) -join ","
}
Write-Utf8NoBom $csvPath ($csvLines -join "`r`n")

$sheets = @(
    @{ Name = "Roadmap"; Rows = $roadmapRows },
    @{ Name = "Backlog"; Rows = $backlogRows },
    @{ Name = "Modulos"; Rows = $modulesRows },
    @{ Name = "KPIs"; Rows = $kpiRows },
    @{ Name = "Riscos"; Rows = $riskRows },
    @{ Name = "ICP"; Rows = $icpRows }
)

Build-Docx -Lines $plainLines -Destination $docxPath
Build-Pdf -Lines $plainLines -Destination $pdfPath
Build-Docx -Lines $summaryLines -Destination $summaryDocxPath
Build-Pdf -Lines $summaryLines -Destination $summaryPdfPath
Build-Xlsx -Sheets $sheets -Destination $xlsxPath

Write-Host "Arquivos gerados:"
Write-Host " - $docxPath"
Write-Host " - $pdfPath"
Write-Host " - $summaryDocxPath"
Write-Host " - $summaryPdfPath"
Write-Host " - $xlsxPath"
Write-Host " - $csvPath"
