<script context="module">
  // import Jimp from 'jimp';
  // import PDFDocument from 'pdfkit';
  // import blobStream from 'blob-stream';
  // import SVGtoPDF from 'svg-to-pdfkit';

  import { postTransRpt } from '@utils/use-data-api';
  import Logit from '@utils/logit';
  var logit = Logit('pages/bookings/TransactionsStatusLog');
  let pageEnds;
  let unit = 18;
  export const printTransactionReport = async (accountId, name) => {
    const svgElt = document.querySelector('#svg');
    let xml = new XMLSerializer().serializeToString(svgElt);
    const { fileName } = await postTransRpt({ xml, name, accountId, pageEnds, unit });
    window.open(
      `http://${window.location.host}/bookingsServer/bookings/account/transRpt/${fileName}`,
      '_blank',
    );
  };
</script>

<script>
  // import { svgMap } from '@utils/iconMap.js';
  // import Marquee from './StatusTable/Marquee.svelte';
  import DayHeader from './dayHeader.svelte';
  import Icons from './TransactionLog/TransactionIcons.svelte';
  import Icon from './TransactionLog/Icon.svelte';
  import { format, addDays, parseISO } from 'date-fns';

  import { dispDate } from '@utils/dateFns';
  import {
    activityLogDataByWalkId,
    testActive,
    applyBookingChange,
    deletePayment,
    deleteRefund,
    // isLoading,
  } from '@store/accountStatus';
  import { latestBanking } from '@store/banking';
  import _ from 'lodash';

  const recent = format(addDays(new Date(), -7), 'yyyy-MM-dd');

  $: data = $activityLogDataByWalkId || {};
  $: entries = data.entries || [];
  $: bot = data.bot;
  $: breaks = data.breaks;
  $: lines = data.lines;
  $: pageEnds = data.pageEnds;
  $: totalOwing = data.totalOwing;
  $: totalAvailable = data.totalAvailable;
  $: unit = data.unit;

  // $: shortNames = $index.get($accountId)?.shortNames ?? {};
  // $: highlight = $accountId ? null : null;
  $: lastBanking = $latestBanking?.bankingId.substr(2);
  $: logit('Transaction Data Raw', data, $activityLogDataByWalkId);
  $: logit('Transaction Data', { entries, bot, breaks, lines });
  $: logit('Transaction monitor', $testActive);
  // $: logit('isLoading', $isLoading);
  // $: balance = $fundsManager.balance;
  // $: credits = $fundsManager.paymentsStack.map((p) => $fundsManager.payments[p]);
  // // $: refunds = prepareRefunds($fundsManager);
  // $: console.log('credits', credits, balance);
  // $: logit('TheTable', { logs: bookings, props: $$props, lastBanking, shortNames });
  const showDate = (day) => format(parseISO(day), `E dd MMM`);
  // const showDate = (day) => day;
  const windowWidthInPixels = 528;

  const bodyW = windowWidthInPixels / unit;
  $: bodyH = bot + 1;
  const margin = 0.2;
  // const width = unit * bodyW;
  const width = windowWidthInPixels;
  $: height = unit * bodyH;
  const hPad = 0.25;
  const incRight = bodyW - margin;
  const incWidth = bodyW * 0.25;
  const incLeft = incRight - incWidth;
  const expWidth = bodyW * 0.62;
  const expLeft = margin;
  const expRight = expLeft + expWidth;
  const expCenter = expLeft + expWidth / 2;

  const LM = { 'dominant-baseline': 'middle', 'text-anchor': 'start' };
  const RM = { 'dominant-baseline': 'middle', 'text-anchor': 'end' };
  const CM = { 'dominant-baseline': 'middle', 'text-anchor': 'middle' };
  // const LT = { 'dominant-baseline': 'hanging', 'text-anchor': 'start' };
  // const CT = { 'dominant-baseline': 'hanging', 'text-anchor': 'middle' };
  // const RT = { 'dominant-baseline': 'hanging', 'text-anchor': 'end' };

  const paymentType = (req) => (/^[+]/.test(req) ? 'Credit' : 'Paid');
  const resetLate = (booking) => {
    const { memberId, walkId } = booking;
    applyBookingChange({ walkId, memberId, req: 'BX' });
  };
  const onDeletePayment = (pay) => {
    if (
      window.confirm(
        `Do really want to remove the payment of £${pay.amount} \n entered at ${dispDate(
          pay.paymentId,
        )}`,
      )
    ) {
      deletePayment(pay.paymentId);
    }
  };
  const onDeleteRefund = (refund) => {
    if (
      window.confirm(
        `Do really want to remove the refund of £${
          refund.amount
        } \n entered at ${dispDate(refund.refundId)}`,
      )
    ) {
      deleteRefund(refund.refundId);
    }
  };
  const isClickable = (walkId, status, refundId, req) => {
    if (refundId) {
      if (refundId < recent) return false;
      if (req) return true;
    }
    if (walkId) {
      if (walkId > 'W' + recent && status === 'BL') return true;
    }
    return false;
  };
</script>

<div class="scrollBox" />
<svg id="svg" {width} {height} viewBox={`0 0 ${bodyW} ${bodyH}`}>
  <style>
    .newPage {
      page-break-before: always;
    }
    .historic {
      opacity: 0.6;
    }
    text {
      font-size: 0.8px;
    }
    .hideMe {
      display: none;
    }
    .clickable:hover .hideMe {
      display: block;
      cursor: pointer;
      font-size: 1px;
      font-weight: bold;
    }
    .hideMe rect {
      fill: #ffcccc;
      stroke: black;
      stroke-width: 0.1;
    }
    .expenditure .hideMe rect {
      fill: rgb(142, 241, 241);
    }
    .bg {
      fill: white;
    }
    .total {
      font-size: 0.82px;
      font-weight: bold;
    }
    .small {
      font-size: 0.5px;
    }
    .avail {
      fill: #008000;
      font-weight: bold;
    }
    .owing {
      font-weight: bold;
    }
    .allocs {
      font-weight: normal;
    }
    .allocs .owing {
      fill: #ff0000;
      font-weight: bold;
    }
    .dash {
      stroke-dasharray: 0.5 0.4;
    }
    .line {
      stroke: black;
      stroke-width: 0.1;
      fill: none;
    }
    .area {
      fill: none;
      stroke-width: 0.2;
      stroke: green;
    }
  </style>

  <Icons />

  <!-- <rect x="0" y="0" width={bodyW} height={bodyH} class="area" /> -->

  {#each entries as { walkId, createdAt, expenditure, income, venue, y, expSz, incSz, newPage }}
    <g class:newPage>
      {#if expSz > 0}
        <g class:historic={_.every(expenditure, 'historic')}>
          <DayHeader
            x={expLeft}
            {y}
            width={expWidth}
            height={expSz}
            title={`${walkId} ${venue}`}
          />
          {#each expenditure as { walkId, status, name, createdAt, Allocations: allocs, owing, memberId, y, sz, log2, maxX, refundId, req, amount }, i}
            <g
              class="expenditure"
              class:clickable={isClickable(walkId, status, refundId, req)}
              class:owing
            >
              {#if walkId && status}
                <text x={expLeft + hPad} y={y + sz / 2} {...LM}
                  >{`${showDate(createdAt)} ${name} `}</text
                >
                <rect
                  x={expRight - maxX - 0.3}
                  y={y + 0.1}
                  width={maxX}
                  height={0.8}
                  class="bg"
                />
                <!-- <Icon req={status} x={expRight - 2.6} y={y + sz / 2 - 0.49} /> -->
                {#each log2 as { dX, txt, req }, i}
                  <Icon x={expRight - dX} y={y + sz / 2 - 0.47} {req} />
                  <text
                    on:click={() => logit('clicked', txt)}
                    x={expRight - dX - 0.05}
                    y={y + sz / 2}
                    {...RM}
                    class="small">{txt}</text
                  >
                {/each}
              {/if}
              <line x1={expLeft} y1={y} x2={expRight} y2={y} class="line" />
              {#if refundId && req}
                <text x={expLeft + hPad} y={y + sz / 2} {...LM}
                  >{showDate(createdAt)} Refund    £{amount}</text
                >
                <Icon {req} x={expLeft + hPad + 9} y={y + sz / 2 - 0.49} />
              {/if}

              y += 0.5;
              {#each allocs as { id, amount, paymentId, historic }, j}
                <g class="allocs" class:historic>
                  <text
                    x={expRight - 0.24}
                    y={y + j + 0.5}
                    {...RM}
                    class:owing={!paymentId}>{amount ? `£${amount}` : '—'}</text
                  >
                </g>
              {/each}
              {#if status === 'BL'}
                <g class="hideMe" on:click={() => resetLate({ walkId, memberId })}>
                  <rect x={expLeft} {y} width={expWidth} height={sz} rx="0.3" />
                  <text x={expCenter} y={y + sz / 2} {...CM}>change    to    ? </text>
                  <Icon req="BL" x={expCenter - 0.7} y={y + sz / 2 - 0.49} />
                  <Icon req="BX" x={expCenter + 2.8} y={y + sz / 2 - 0.49} />
                </g>
              {/if}
              {#if refundId && req}
                <g class="hideMe" on:click={() => onDeleteRefund({ refundId, amount })}>
                  <rect x={expLeft} {y} width={expWidth} height={sz} rx="0.3" />
                  <text x={expRight - 2.1} y={y + sz / 2} {...RM}>Delete? </text>
                  <Icon req="trash" x={expRight - 2.0} y={y + sz / 2 - 0.49} />
                </g>
              {/if}
            </g>
          {/each}
        </g>
      {/if}
      {#if incSz}
        <g class:historic={_.every(income, 'historic')}>
          <DayHeader x={incLeft} {y} width={incWidth} height={incSz} title={createdAt} />

          {#each income as { Allocations: allocs, req, paymentId, amount, y, sz, bankingId }}
            <g class="payment" class:clickable={!bankingId}>
              <text x={incRight - 2.1} y={y + sz / 2} {...RM}>{paymentType(req)}</text>
              <Icon {req} x={incRight - 2.0} y={y + sz / 2 - 0.49} />
              <text x={incRight - hPad} y={y + sz / 2} {...RM}>{amount}</text>

              {#each allocs as { id, amount, bookingId, refundId, historic }, j}
                <g class:historic class:avail={!bookingId && !refundId}>
                  <text x={incLeft + hPad} y={y + j + 0.5} {...LM}
                    >{amount ? `£${amount}` : '—'}</text
                  >
                </g>
              {/each}
              {#if !bankingId}
                <g class="hideMe" on:click={() => onDeletePayment({ paymentId, amount })}>
                  <rect x={incLeft} {y} width={incWidth} height={sz} rx="0.3" />
                  <text x={incRight - 2.1} y={y + sz / 2} {...RM}>Delete? </text>
                  <Icon req="trash" x={incRight - 2.0} y={y + sz / 2 - 0.49} />
                </g>
              {/if}
            </g>
            <line x1={incLeft} y1={y} x2={incRight} y2={y} class="line" />
          {/each}
        </g>
      {/if}
    </g>
  {/each}
  {#if totalAvailable > 0}
    <text x={incLeft} y={bot + 0.5} {...LM} class="total"
      ><tspan class="avail">{`£${totalAvailable}`}</tspan> Credit</text
    >
  {/if}
  {#if totalOwing > 0}
    <text x={expRight} y={bot + 0.5} {...RM} class="total"
      >Owing <tspan class="owing">{`£${totalOwing}`}</tspan></text
    >
  {/if}
  {#each _.values(lines) as { start, end, amount, historic }}
    {#if start && end}
      <line
        x1={incLeft}
        y1={start}
        x2={expRight}
        y2={end}
        class="line"
        class:dash={amount === 0}
        class:historic
      />
    {/if}
  {/each}
  <!-- <use xlink:href="#Sym-B" x="19" y="4.1" width="0.8" height="0.8" /> -->
</svg>

<style>
  .newPage {
    page-break-before: always;
  }
  .historic {
    opacity: 0.5;
  }
  text {
    font-size: 0.8px;
  }
  .hideMe {
    display: none;
  }
  .clickable:hover .hideMe {
    display: block;
    cursor: pointer;
    font-size: 1px;
    font-weight: bold;
  }
  .hideMe rect {
    fill: #ffcccc;
    stroke: black;
    stroke-width: 0.1;
  }
  .expenditure .hideMe rect {
    fill: rgb(142, 241, 241);
  }
  .bg {
    fill: white;
  }
  .total {
    font-size: 0.82px;
    font-weight: bold;
  }
  .small {
    font-size: 0.5px;
  }
  .avail {
    fill: #008000;
    font-weight: bold;
  }
  .owing {
    font-weight: bold;
  }
  .allocs {
    font-weight: normal;
  }
  .allocs .owing {
    fill: #ff0000;
    font-weight: bold;
  }
  .dash {
    stroke-dasharray: 0.5 0.4;
  }
  .line {
    stroke: black;
    stroke-width: 0.1;
    fill: none;
  }
  .area {
    fill: none;
    stroke-width: 0.2;
    stroke: green;
  }
</style>
