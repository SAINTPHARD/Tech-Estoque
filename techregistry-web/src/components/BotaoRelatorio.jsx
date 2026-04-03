/**
 * Arquivo: src/components/BotaoRelatorio.jsx
 * Responsabilidade: reunir as opcoes de exportacao do dashboard em um unico ponto de acao.
 * O que voce encontra aqui: exportacao em PDF, CSV e Excel, alem do menu popover que organiza esses formatos.
 * Dica de manutencao: novas exportacoes ou ajustes de formato devem ser adicionados aqui.
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import { formatCurrency, getStockStatus } from '../utils/produtos';

function downloadBlob(blob, fileName) {
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.click();

  window.URL.revokeObjectURL(blobUrl);
}

function escapeCsvValue(value) {
  const normalizedValue = String(value ?? '').replace(/"/g, '""');
  return `"${normalizedValue}"`;
}

function buildExportRows(dados) {
  return dados.map((produto) => {
    const patrimonio = produto.preco * produto.quantidade;
    const stockStatus = getStockStatus(produto.quantidade);

    return {
      id: produto.id,
      nome: produto.nome,
      preco: formatCurrency(produto.preco),
      quantidade: produto.quantidade,
      patrimonio: formatCurrency(patrimonio),
      status: stockStatus.label,
    };
  });
}

export default function BotaoRelatorio({ dados, disabled = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const shellRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!shellRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const exportRows = buildExportRows(dados ?? []);

  const gerarPDF = async () => {
    if (!dados || dados.length === 0) {
      return;
    }

    try {
      const [{ jsPDF }, { autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const doc = new jsPDF();
      const patrimonioTotal = dados.reduce(
        (accumulator, produto) => accumulator + produto.preco * produto.quantidade,
        0
      );

      doc.setFontSize(18);
      doc.text('Relatorio de Produtos - TechRegistry', 14, 20);

      doc.setFontSize(11);
      doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 28);
      doc.text(`Produtos listados: ${dados.length}`, 14, 34);
      doc.text(`Patrimonio total: ${formatCurrency(patrimonioTotal)}`, 14, 40);

      const colunas = ['ID', 'Produto', 'Preco (R$)', 'Quantidade', 'Patrimonio', 'Status'];
      const linhas = exportRows.map((produto) => [
        produto.id,
        produto.nome,
        produto.preco,
        produto.quantidade,
        produto.patrimonio,
        produto.status,
      ]);

      autoTable(doc, {
        startY: 48,
        head: [colunas],
        body: linhas,
        headStyles: { fillColor: [52, 152, 219] },
        theme: 'grid',
      });

      doc.save('relatorio_techregistry.pdf');
    } catch (error) {
      console.error('Erro ao gerar o PDF:', error);
      window.alert('Erro ao gerar o PDF. Consulte o console para mais detalhes.');
    } finally {
      setMenuOpen(false);
    }
  };

  const gerarCSV = () => {
    if (!exportRows.length) {
      return;
    }

    const headers = ['ID', 'Produto', 'Preco', 'Quantidade', 'Patrimonio', 'Status'];
    const lines = [
      headers.map(escapeCsvValue).join(';'),
      ...exportRows.map((produto) =>
        [
          produto.id,
          produto.nome,
          produto.preco,
          produto.quantidade,
          produto.patrimonio,
          produto.status,
        ]
          .map(escapeCsvValue)
          .join(';')
      ),
    ];

    const blob = new Blob([`\uFEFF${lines.join('\n')}`], {
      type: 'text/csv;charset=utf-8;',
    });

    downloadBlob(blob, 'relatorio_techregistry.csv');
    setMenuOpen(false);
  };

  const gerarExcel = () => {
    if (!exportRows.length) {
      return;
    }

    const tableRows = exportRows
      .map(
        (produto) => `
          <tr>
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.preco}</td>
            <td>${produto.quantidade}</td>
            <td>${produto.patrimonio}</td>
            <td>${produto.status}</td>
          </tr>
        `
      )
      .join('');

    const excelHtml = `
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Produto</th>
                <th>Preco</th>
                <th>Quantidade</th>
                <th>Patrimonio</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([`\uFEFF${excelHtml}`], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });

    downloadBlob(blob, 'relatorio_techregistry.xls');
    setMenuOpen(false);
  };

  return (
    <div ref={shellRef} className="export-action-shell">
      <button
        type="button"
        onClick={() => setMenuOpen((currentState) => !currentState)}
        className="btn-relatorio-top"
        disabled={disabled}
        aria-expanded={menuOpen}
      >
        <FileDown size={18} /> Exportar <ChevronDown size={16} />
      </button>

      {menuOpen ? (
        <div className="exportacao-popover">
          <button type="button" className="exportacao-item" onClick={gerarPDF}>
            <FileDown size={16} />
            <span>Exportar PDF</span>
          </button>

          <button type="button" className="exportacao-item" onClick={gerarCSV}>
            <FileText size={16} />
            <span>Exportar CSV</span>
          </button>

          <button type="button" className="exportacao-item" onClick={gerarExcel}>
            <FileSpreadsheet size={16} />
            <span>Exportar Excel</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
