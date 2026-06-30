package SmarTech.SmarTech.service;

import SmarTech.SmarTech.model.DetallePedido;
import SmarTech.SmarTech.model.Pedido;

import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Phrase;

import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import java.awt.Color;

import java.io.ByteArrayOutputStream;
import java.util.Date;
import java.util.List;
import org.springframework.stereotype.Service;
@Service
public class ComprobantePdfGenerator {


    public static byte[] generar(Pedido pedido, List<DetallePedido> detalles) throws Exception {

        ByteArrayOutputStream bos = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4, 36, 36, 30, 30);
        PdfWriter.getInstance(document, bos);

        document.open();


        Font tituloFont      = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
        Font subTituloFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(60,60,60));
        Font normalFont      = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
        Font smallMutedFont  = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(100,100,100));
        Font totalFont       = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(0,100,0));

        Paragraph titulo = new Paragraph("SMARTTECH - COMPROBANTE ELECTRÓNICO\n\n", tituloFont);
        titulo.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(titulo);

        document.add(new Paragraph("Fecha de emisión: " + new Date(), smallMutedFont));
        document.add(new Paragraph("N° Pedido: " + pedido.getIdPedido(), normalFont));
        document.add(new Paragraph("\n"));

        document.add(new Paragraph("Datos de la venta", subTituloFont));
        document.add(new Paragraph("Tipo de venta: " + 
                (pedido.getTipoVenta() != null ? pedido.getTipoVenta().name() : "TIENDA"),
                normalFont));
        document.add(new Paragraph("Estado: " +
                (pedido.getEstado() != null ? pedido.getEstado().name() : "-"),
                normalFont));
        document.add(new Paragraph("\n"));

        PdfPTable tabla = new PdfPTable(4);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{45, 15, 20, 20});

        agregarHeader(tabla, "Producto");
        agregarHeader(tabla, "Cant.");
        agregarHeader(tabla, "P. Unit.");
        agregarHeader(tabla, "Subtotal");

        for (DetallePedido d : detalles) {
            tabla.addCell(new Phrase(
                    d.getProducto() != null ? d.getProducto().getNombreProducto() : "Producto",
                    normalFont
            ));
            tabla.addCell(new Phrase(String.valueOf(d.getCantidad()), normalFont));
            tabla.addCell(new Phrase("S/ " + d.getPrecioUnitario(), normalFont));
            tabla.addCell(new Phrase("S/ " + d.getSubtotal(), normalFont));
        }

        document.add(tabla);
        document.add(new Paragraph("\n"));

        PdfPTable totales = new PdfPTable(2);
        totales.setWidthPercentage(40);
        totales.setHorizontalAlignment(Paragraph.ALIGN_RIGHT);
        totales.setWidths(new float[]{50, 50});

        agregarFilaTotal(totales, "Subtotal:", "S/ " + pedido.getSubtotal(), normalFont);
        agregarFilaTotal(totales, "IGV (18%):", "S/ " + pedido.getIgvTotal(), normalFont);
        agregarFilaTotal(totales, "Total bruto:", "S/ " + pedido.getTotalBruto(), normalFont);
        agregarFilaTotalDestacado(totales, "TOTAL A PAGAR:", "S/ " + pedido.getTotal(), totalFont);

        document.add(totales);

        document.add(new Paragraph("\n\nGracias por su compra.", smallMutedFont));

        document.close();
        return bos.toByteArray();
    }

    private static void agregarHeader(PdfPTable tabla, String texto) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(texto, headerFont));
        cell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
        cell.setBackgroundColor(new Color(0, 102, 204));
        cell.setPadding(6);
        tabla.addCell(cell);
    }

    private static void agregarFilaTotal(PdfPTable tabla, String label, String value, Font font) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, font));
        PdfPCell c2 = new PdfPCell(new Phrase(value, font));

        c1.setBorder(PdfPCell.NO_BORDER);
        c2.setBorder(PdfPCell.NO_BORDER);
        c2.setHorizontalAlignment(PdfPCell.ALIGN_RIGHT);

        tabla.addCell(c1);
        tabla.addCell(c2);
    }

    private static void agregarFilaTotalDestacado(PdfPTable tabla, String label, String value, Font font) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, font));
        PdfPCell c2 = new PdfPCell(new Phrase(value, font));

        c1.setBorder(PdfPCell.TOP);
        c2.setBorder(PdfPCell.TOP);
        c2.setHorizontalAlignment(PdfPCell.ALIGN_RIGHT);

        tabla.addCell(c1);
        tabla.addCell(c2);
    }
}
