<script>
  import { loadIcons, drawIcon } from './loadIcons.js';
  import { jsPDF } from 'jspdf';
  import _ from 'lodash';
  import { format, parseISO } from 'date-fns';
  import { setNoCols, getPageDimensions, setPageDimensions } from './pdfSetup';

  let p = getPageDimensions();
  setPageDimensions(210, 297, 10, 8, 5.65);
  setNoCols(1, 3, 10, true);
  let doc = new jsPDF('p', 'pt', 'A4');
  loadIcons(doc);

  doc.setLineWidth(0.75);

  const memSize = 12;
  const hPad = 3;
  const vPad = 2;

  const incRight = p.body.width + p.body.left;
  const incWidth = 75;
  const incLeft = incRight - incWidth;
  const expWidth = 200;
  const expLeft = p.body.left;
  const expRight = expLeft + expWidth;
  doc.setTextColor('#333333').setDrawColor(51);
  const drawDayBox = (x, y, width, sz, day) => {
    const height = sz * memSize;

    doc.setFillColor('#daf4f7').roundedRect(x, y + vPad, width, memSize + 1, 4, 4, 'F');
    doc.setFillColor('#ffffff').rect(x, y + memSize, width, vPad + 1, 'F');
    doc.roundedRect(x, y + vPad, width, height - vPad, 4, 4, 'S');
    doc.setFontSize(9);
    let ym = y + (memSize + vPad) / 2;
    doc.text(format(parseISO(day), `EEE dd MMM ''yy`), x + width / 2, ym, align.CM);
    horizonalLine(y + memSize, x, x + width);
    return height;
  };
  const horizonalLine = (y, x1, x2) => {
    doc.saveGraphicsState();
    doc.setDrawColor(128).line(x1, y, x2, y);
    doc.restoreGraphicsState();
  };
  let top = p.body.top;
  let lines = {};

  const yy = (y) => top + y * memSize;
  const align = {
    LM: { 'dominant-baseline': 'middle', 'text-anchor': 'start' },
    CM: { 'dominant-baseline': 'middle', 'text-anchor': 'middle' },
    RM: { 'dominant-baseline': 'middle', 'text-anchor': 'end' },
    LT: { 'dominant-baseline': 'hanging', 'text-anchor': 'start' },
    CT: { 'dominant-baseline': 'hanging', 'text-anchor': 'middle' },
    RT: { 'dominant-baseline': 'hanging', 'text-anchor': 'end' },
  };

  function showBookingHistory(doc, logs, right, y1) {
    if (logs.length === 1) return right;
    logs = logs.filter((l, i) => l.req !== (logs[i - 1] || {}).req);
    let x = right;
    doc.setFontSize(6);
    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      if (i + 1 < logs.length) drawIcon(doc, log.req, x, y1, 9);
      if (i > 0) {
        doc.text(format(parseISO(log.id), 'd/MM'), x - 5, y1, align.RM);
        x -= 25;
      }
    }
    doc.setFontSize(9);
    return x;
  }

  function fitBox(doc, text, width) {
    const fontSize = doc.getFontSize();
    let size = fontSize * doc.getStringUnitWidth(text);
    if (size <= width) return text;
    do {
      text = text.substr(0, text.length - 1);
      size = fontSize * doc.getStringUnitWidth(text + '…');
    } while (size > width);

    return text + '…';
  }
  const paymentType = (req) => (/^[+]/.test(req) ? 'Credit' : 'Paid');
</script>

<svg>
  {#each entries as { day, expenditure, income, y, expSz, incSz }}
    {#if expSz > 0}
      {#each expenditure as { walkId, status, name, venue, Allocations: allocs, owing, y, sz, BookingLogs: bLogs, refundId, req, amount }, i}
        <line x1={expLeft} y1={y} x2={expRight} y2={y} class="blackStroke" />
        {#if walkId && status}
          <!-- let y1 = y + sz / 2;
          drawIcon(doc, status, expRight - 24, yy(y1), 9);
          const x = showBookingHistory(doc, bLogs, expRight - 24, yy(y1));
          const descr = fitBox(
            doc,
            `${walkId.substr(1)} ${name} ${venue}`,
            x - expLeft - 3 - hPad,
          );
          doc.text(descr, expLeft + hPad, yy(y1), align.LM);
          totalOwing += owing; -->
        {/if}
        {#if refundId && req}
          <text x={expLeft + hPad} y={y + expSz / 2} {...align.LM}
            >{`Refund £${amount}`}</text
          >
          <!-- drawIcon(doc, req, expLeft + hPad + 64, yy(y1), 9); -->
        {/if}

        y += 0.5;
        {#each allocs as { id, amount, paymentId }, j}
          <text x={expRight - 0.24} y={y + j + 0.5} {...align.RM} class:owing={!paymentId}
            >{amount ? `£${amount}` : '—'}</text
          >
        {/each}
      {/each}
    {/if}
    {#if incSz}
      <rect
        x={incLeft}
        y={y + vPad}
        width={incWidth}
        height={1.06}
        rx={0.24}
        style="fill:#daf4f7"
      />
      <rect
        x={incLeft}
        y={y + 1}
        width={incWidth}
        height={vPad + 0.06}
        style="fill:#ffffff"
      />
      <rect
        x={incLeft}
        y={y + vPad}
        width={incWidth}
        height={incSz - 0.06}
        rx={0.24}
        class="blackStroke"
      />
      <text
        x={incLeft + incWidth / 2}
        y={y + (1 + vPad) / 2}
        class="dayHeader"
        {...align.CM}>{format(parseISO(day), `EEE dd MMM ''yy`)}</text
      >
      <line x1={incLeft} y1={y} x2={incRight} y2={y} class="blackStroke" />

      {#each income as { Allocations: allocs, req, available, amount, y, sz }}
        <line x1={incLeft} y1={y} x2={incRight} y2={y} class="blackStroke" />

        <text x={incRight - 1.4} y={y + incSz / 2} {...align.RM}>{paymentType(req)}</text>
        <!-- drawIcon(doc, req, incRight - 17, yy(yp), 9); -->
        <text x={incRight - hPad} y={y + incSz / 2} {...align.RM}>{amount}</text>

        {#each allocs as { id, amount, bookingId }, j}
          <!-- if (!bookingId) doc.setFont('helvetica', 'bold').setTextColor('#33cc33');
  else lines[id] = { ...(lines[id] || {}), start: y, amount }; -->
          <text x={incLeft + hPad} y={y + j + 0.5} class:avail={!bookingId} {...align.LM}
            >{amount ? `£${amount}` : '—'}</text
          >
        {/each}

        <!-- totalAvailable += available; -->
      {/each}
    {/if}
  {/each}

  <!-- for (const line of _.values(lines)) {
    const { start, end, amount } = line;
    if (amount === 0) {
      doc.setLineDashPattern([4, 8]);
    } else {
      doc.setLineDashPattern();
    }
    start && end && doc.line(incLeft, yy(start), expRight, yy(end));
  }
  doc.setLineDashPattern().setDrawColor('#ffcccc').setLineWidth(vPad);
  for (const brk of breaks) {
    const [y1, y2] = brk;
    doc.line(expLeft, yy(y1), expRight, yy(y1));
    doc.line(expRight, yy(y1), incLeft, yy(y2));
    doc.line(incLeft, yy(y2), incRight, yy(y2));
  }

  doc.setFont('helvetica', 'bold').setTextColor(51);
  doc.setFontSize(13.5);

  if (totalAvailable) {
    doc.text(`£${totalAvailable}`, incLeft, yy(bot), align.LT);
    doc.text(`Credit`, incLeft + 25, yy(bot), align.LT);
  }
  if (totalOwing) {
    doc.text(`£${totalOwing}`, expRight - hPad, yy(bot), align.RM);
    doc.text(`Owing`, expRight - 28, yy(bot), align.RM);
  }
  if (!totalOwing && !totalAvailable) {
    doc.text(`Account in Balance`, (expLeft + incRight) / 2, yy(bot), align.CM);
  }
  doc.setFont('helvetica', 'normal');
  doc.deletePage(1);
  let pdf = `userTransactionReport-${accountId}.pdf`;
  doc.save(`documents/${pdf}`); // will save the file in the current working directory
  return pdf; -->
</svg>
