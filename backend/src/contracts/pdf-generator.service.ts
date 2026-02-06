import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

@Injectable()
export class PdfGeneratorService {
  generateContractPDF(contract: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('CONTRATO DE LOCAÇÃO', { align: 'center' });
      doc.fontSize(16).text('HOLDING ISM', { align: 'center' });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(2);

      // Contract details section
      doc.fontSize(14).font('Helvetica-Bold').text('DADOS DO CONTRATO');
      doc.moveDown(0.5);
      
      doc.fontSize(11).font('Helvetica');
      doc.text(`Imóvel: ${contract.property?.name || 'N/A'}`);
      if (contract.unit) {
        doc.text(`Unidade: ${contract.unit.identifier}`);
      }
      doc.text(`Tipo: ${this.translatePropertyType(contract.property?.type)}`);
      doc.text(`Endereço: ${contract.property?.address || 'N/A'}`);
      doc.text(`Cidade/UF: ${contract.property?.city || 'N/A'}/${contract.property?.state || 'N/A'}`);
      doc.moveDown();

      // Tenant info section
      doc.fontSize(14).font('Helvetica-Bold').text('DADOS DO LOCATÁRIO');
      doc.moveDown(0.5);
      
      doc.fontSize(11).font('Helvetica');
      doc.text(`Nome: ${contract.tenant?.name || 'N/A'}`);
      doc.text(`CPF: ${this.formatCPF(contract.tenant?.cpf) || 'N/A'}`);
      doc.text(`Email: ${contract.tenant?.email || 'N/A'}`);
      doc.text(`Telefone: ${contract.tenant?.phone || 'N/A'}`);
      if (contract.tenant?.address) {
        doc.text(`Endereço: ${contract.tenant.address}`);
      }
      doc.moveDown();

      // Financial terms section
      doc.fontSize(14).font('Helvetica-Bold').text('CONDIÇÕES FINANCEIRAS');
      doc.moveDown(0.5);
      
      doc.fontSize(11).font('Helvetica');
      doc.text(`Valor do Aluguel: R$ ${this.formatCurrency(contract.rentAmount)}`);
      doc.text(`Dia de Vencimento: ${contract.dueDay}`);
      doc.text(`Tipo de Garantia: ${this.translateGuarantee(contract.guaranteeType)}`);
      doc.text(`Índice de Reajuste: ${this.translateIndex(contract.indexType)}`);
      doc.moveDown();

      // Contract period section
      doc.fontSize(14).font('Helvetica-Bold').text('VIGÊNCIA DO CONTRATO');
      doc.moveDown(0.5);
      
      doc.fontSize(11).font('Helvetica');
      doc.text(`Data de Início: ${this.formatDate(contract.startDate)}`);
      if (contract.endDate) {
        doc.text(`Data de Término: ${this.formatDate(contract.endDate)}`);
      } else {
        doc.text('Data de Término: Por prazo indeterminado');
      }
      doc.text(`Status: ${contract.status}`);
      doc.moveDown();

      if (contract.observations) {
        doc.fontSize(14).font('Helvetica-Bold').text('OBSERVAÇÕES');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(contract.observations);
        doc.moveDown();
      }

      // Terms and conditions
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('CLÁUSULAS CONTRATUAIS');
      doc.moveDown();
      
      doc.fontSize(10).font('Helvetica');
      
      const clauses = [
        '1. O LOCATÁRIO se obriga a pagar pontualmente o aluguel no dia estipulado.',
        '2. O LOCATÁRIO é responsável por todas as despesas de consumo (água, luz, gás, internet) durante o período de locação.',
        '3. O imóvel deverá ser devolvido nas mesmas condições em que foi recebido, salvo desgaste natural.',
        '4. Quaisquer benfeitorias ou modificações no imóvel deverão ser previamente autorizadas pela LOCADORA.',
        '5. O contrato poderá ser rescindido mediante aviso prévio de 30 dias por qualquer das partes.',
        '6. O LOCATÁRIO não poderá sublocar ou emprestar o imóvel sem autorização prévia e por escrito da LOCADORA.',
        '7. A LOCADORA não se responsabiliza por objetos deixados no imóvel após o término do contrato.',
        '8. O não pagamento do aluguel na data prevista acarretará multa de 2% sobre o valor devido, mais juros de mora de 1% ao mês.',
      ];

      clauses.forEach(clause => {
        doc.text(clause, { align: 'justify' });
        doc.moveDown(0.5);
      });

      doc.moveDown(2);

      // Signatures section
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
      doc.moveDown(3);

      doc.text('_'.repeat(50), { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica-Bold').text('HOLDING ISM - LOCADORA', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('CNPJ: XX.XXX.XXX/XXXX-XX', { align: 'center' });
      
      doc.moveDown(3);
      
      doc.text('_'.repeat(50), { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica-Bold').text(contract.tenant?.name || 'LOCATÁRIO', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`CPF: ${this.formatCPF(contract.tenant?.cpf) || '_______________'}`, { align: 'center' });

      doc.end();
    });
  }
  
  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  private formatCPF(cpf: string): string {
    if (!cpf) return '';
    // Format: XXX.XXX.XXX-XX
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private translatePropertyType(type: string): string {
    const map: Record<string, string> = {
      CASA: 'Casa',
      APARTAMENTO: 'Apartamento',
      COMERCIAL: 'Comercial',
      TERRENO: 'Terreno',
      PREDIO: 'Prédio',
    };
    return map[type] || type;
  }
  
  private translateGuarantee(type: string): string {
    const map: Record<string, string> = {
      NENHUMA: 'Nenhuma',
      FIADOR: 'Fiador',
      SEGURO_FIANCA: 'Seguro Fiança',
      CAUCAO: 'Caução',
    };
    return map[type] || type;
  }
  
  private translateIndex(type: string): string {
    const map: Record<string, string> = {
      NENHUM: 'Sem reajuste',
      IPCA: 'IPCA',
      IGP_M: 'IGP-M',
      FIXO: 'Valor fixo',
    };
    return map[type] || type;
  }
}
