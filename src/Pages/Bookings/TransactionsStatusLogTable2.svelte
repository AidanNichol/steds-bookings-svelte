<script context="module">
  import Logit from '@utils/logit';
  import { postTransRpt } from '@utils/use-data-api';
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
  import { svgMap } from '@utils/iconMap';
  import { addDays, format, parseISO } from 'date-fns';
  import DayHeader from './dayHeader.svelte';
  import Marquee from './StatusTable/MarqueeSvg.svelte';
  import Icon from './TransactionLog/Icon.svelte';
  import Icons from './TransactionLog/TransactionIcons.svelte';

  import {
    accountId,
    activityLogDataByWalkId,
    applyBookingChange,
    deletePayment,
    deleteRefund,
    isLoading,
  } from '@store/accountStatus';
  import { dispDate } from '@utils/dateFns';
  // import { latestBanking } from '@store/banking';
  import _ from 'lodash';

  const recent = format(addDays(new Date(), -7), 'yyyy-MM-dd');

  $: data = $activityLogDataByWalkId || {};
  $: entries = data.entries || [];
  $: bot = data.bot;
  $: lines = data.lines;
  $: totalOwing = data.totalOwing;
  $: totalAvailable = data.totalAvailable;
  $: unit = data.unit;
  $: pageEnds = data.pageEnds;
  $: footnotes = data.footnotes;

  $: logit('Transaction Data Raw', data, $activityLogDataByWalkId);
  $: logit('Transaction Data', { entries, bot, lines, pageEnds });

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
  const expRight = expWidth;
  const expCenter = expWidth / 2;

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
  var c = document.createElement('canvas');
  var ctx = c.getContext('2d');
  ctx.font = `${unit * 0.8}px Roboto`;
  var txt = 'Hello World';
  ctx.fillText('width:' + ctx.measureText(txt).width, 10, 50);

  function truncateText(text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let good = 0,
      bad = text.length;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let t = Math.floor((good + bad) / 2);
      // let testText = text.substr(0, t) + '…';
      let over = ctx.measureText(text.substr(0, t) + '…').width - maxWidth;
      if (over <= 0) {
        good = t;
      } else {
        bad = t;
      }
      if (bad - good <= 1) {
        return text.substr(0, good) + '…';
      }
    }
  }
</script>

{#if $accountId && $isLoading}
  <div class="loading">{@html svgMap.userWait}loading</div>
{:else}
  <svg id="svg" {width} {height} viewBox={`0 0 ${bodyW} ${bodyH}`}>
    <style>
      .shorten {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        background-color: yellow;
        width: 100%;
        height: 100%;
        font-size: 0.75px;
        min-height: 100%;
        display: table-cell;
        vertical-align: middle;
      }
      .newPage {
        page-break-before: always;
      }
      .historic {
        opacity: 0.6;
      }
      text {
        font-size: 0.8px;
        font-family: 'Open-sans', Roboto, sans-serif;
      }
      text.refunded {
        text-decoration: line-through;
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

    {#each entries as { incTitle, expTitle, expenditure, income, y, expSz, incSz, newPage }}
      <g class:newPage>
        {#if expSz > 0}
          <g class:historic={_.every(expenditure, 'historic')}>
            <DayHeader x={expLeft} {y} width={expWidth} height={expSz} title={expTitle} />
            {#each expenditure as { walkId, status, text, createdAt, Allocations2: allocs, owing, memberId, y, adjust, y1, y2, y3, sz, log2, maxX, refundId, req, amount }, i}
              {@const textWidth = (expWidth - (adjust ? 0 : maxX + 1)) * unit}
              <!-- {@const textWidth = 200} -->
              <svg
                {y}
                x={margin}
                width={expWidth}
                height={expSz}
                class="expenditure"
                class:clickable={isClickable(walkId, status, refundId, req)}
                class:owing>
                {#if walkId && status}
                  <!-- <foreignObject x={0} y={y1 - 0.5} width={textWidth} height="1">
                    <div xmlns="http://www.w3.org/1999/xhtml" class="shorten">
                      <div>{text}</div>
                    </div>
                  </foreignObject> -->
                  <text x={hPad} y={y1} {...LM}>{truncateText(text, textWidth)}</text>
                  <rect
                    x={expRight - maxX - 0.3}
                    y={y2 - 0.5}
                    width={maxX}
                    height={0.8}
                    class="bg" />
                  <!-- <Icon req={status} x={expRight - 2.6} y={y + sz / 2 - 0.49} /> -->
                  {#each log2 as { dX, txt, req }, i}
                    <Icon x={expRight - dX} y={y2 - 0.47} {req} />
                    <text
                      on:click={() => logit('clicked', txt)}
                      x={expRight - dX - 0.05}
                      y={y2}
                      {...RM}
                      class="small">{txt}</text>
                  {/each}
                {/if}
                <line x1={0} y1={0} x2={expRight} y2={0} class="line" />
                {#if refundId && req}
                  <text x={hPad} y={sz / 2} {...LM}
                    >{showDate(createdAt)} Refund    £{amount}</text>
                  <Icon {req} x={0 + hPad + 9} y={sz / 2 - 0.49} />
                {/if}

                y += 0.5;
                {#each allocs ?? [] as { id, amount, refunded, paymentId, historic }, j}
                  <g class="allocs" class:historic>
                    <text
                      x={expRight - 0.24}
                      y={y3 + j + 0.5}
                      {...RM}
                      class:refunded
                      class:owing={!paymentId}>{`£${amount || refunded}`}</text>
                  </g>
                {/each}
                {#if status === 'BL'}
                  <g class="hideMe" on:click={() => resetLate({ walkId, memberId })}>
                    <rect x={0} y={0} width={expWidth} height={sz} rx="0.3" />
                    <text x={expCenter} y={y2} {...CM}>change    to    ? </text>
                    <Icon req="BL" x={expCenter - 0.7} y={y2 - 0.49} />
                    <Icon req="BX" x={expCenter + 2.8} y={y2 - 0.49} />
                  </g>
                {/if}
                {#if refundId && req}
                  <g class="hideMe" on:click={() => onDeleteRefund({ refundId, amount })}>
                    <rect x={0} y={0} width={expWidth} height={sz} rx="0.3" />
                    <text x={expRight - 2.1} y={sz / 2} {...RM}>Delete? </text>
                    <Icon req="trash" x={expRight - 2.0} y={sz / 2 - 0.49} />
                  </g>
                {/if}
              </svg>
            {/each}
          </g>
        {/if}
        {#if incSz}
          <g class:historic={_.every(income, 'historic')}>
            <DayHeader x={incLeft} {y} width={incWidth} height={incSz} title={incTitle} />

            {#each income as { Allocations: allocs, req, paymentId, amount, y, sz, bankingId, note }}
              {@const y1 = (sz - (note ? 1 : 0)) / 2}
              <svg
                class="payment"
                class:clickable={!bankingId}
                {y}
                x={incLeft}
                width={incWidth}
                height={sz}>
                <text x={incWidth - 2.6} y={y1} {...RM}>{paymentType(req)}</text>
                <Icon {req} x={incWidth - 2.5} y={y1 - 0.49} />
                <text x={incWidth - hPad} y={y1} {...RM}>{amount}</text>

                {#each allocs as { id, amount, refunded, bookingId, refundId, historic }, j}
                  <g class:historic class:avail={!bookingId && !refundId}>
                    <text x={hPad} class:refunded y={j + 0.5} {...LM}>
                      {`£${amount || refunded}`}</text>
                  </g>
                {/each}
                {#if note}
                  <Marquee x={hPad + 0.7} y={sz - 1} width={incWidth - 1.3} text={note} />
                {/if}
                {#if !bankingId}
                  <g
                    class="hideMe"
                    on:click={() => onDeletePayment({ paymentId, amount })}>
                    <rect x={0} y={0} width={incWidth} height={sz} rx="0.3" />
                    <text x={incWidth - 2.1} y={sz / 2} {...RM}>Delete? </text>
                    <Icon req="trash" x={incWidth - 2.0} y={sz / 2 - 0.49} />
                  </g>
                {/if}
                <line x1={0} y1={0} x2={incWidth} y2={0} class="line" />
              </svg>
            {/each}
          </g>
        {/if}
      </g>
    {/each}
    {#if totalAvailable > 0}
      <text x={incLeft} y={bot + 0.5} {...LM} class="total"
        ><tspan class="avail">{`£${totalAvailable}`}</tspan> Credit</text>
    {/if}
    {#if totalOwing > 0}
      <text x={expLeft + expWidth} y={bot + 0.5} {...RM} class="total"
        >Owing <tspan class="owing">{`£${totalOwing}`}</tspan></text>
    {/if}
    {#each _.values(lines) as { start, end, amount, historic }}
      {#if start && end}
        <line
          x1={incLeft}
          y1={start}
          x2={expLeft + expWidth}
          y2={end}
          class="line"
          class:dash={amount === 0}
          class:historic />
      {/if}
    {/each}
  </svg>
{/if}

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
    background-color: white;
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
