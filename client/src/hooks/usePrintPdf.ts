import jsPDF from "jspdf";
import { BoardWinningSequenceConfirmedResponse } from "../Api";
import "jspdf-autotable";

export function usePrintPdf() {

    const printWinningPdf = (data: BoardWinningSequenceConfirmedResponse | undefined) => {
        if (!data) {
            console.error("Ingen data tilgængelig.");
            return;
        }

        const doc = new jsPDF();

        // titlen
        doc.setFontSize(16);
        doc.text(`Jerne IF - Døde Duer uge: ${data.gameWeek}`, 15, 10);

        doc.setFontSize(10);
        doc.text(`${data.totalWinners} vindere fundet`, 15, 16);
    

        // headers
        const tableColumnHeaders = ["Navn", "Konfiguration", "Pris"];

        //indhold rows
        const tableRows = data.boards.map((board) => {
            const { firstName, lastName } = board.user;
            const boardConfiguration = board.configuration.join("-");
            const totalPrice = `${board.price},-`;
            return [`${firstName} ${lastName}`, boardConfiguration, totalPrice];
        });

        // auto table, andet table drillede med allignment
        (doc as any).autoTable({
            startY: 25,
            head: [tableColumnHeaders],
            body: tableRows,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
        });

        // gem som pdf
        doc.save(`JerneIF Døde Duer Uge ${data.gameWeek}.pdf`);
    };

    return { 
        printWinningPdf 
    };
}