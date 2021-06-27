<script>
  import _ from 'lodash';
  import { onMount } from 'svelte';
  import { fetchData } from '@utils/use-data-api';
  import PageHeader from './PageHeader.svelte';
  import { nameIndex as index } from '@store/nameIndex.js';
  import { status as openWalks } from '@store/walkBookingStatus';
  import Icon from '@utils/Icon2.svelte';

  import Logit from '@utils/logit';
  import { totalCredit } from '../store/payments';
  var logit = Logit('Reports/WalkDayBookingSheet');

  function gatherData(accounts, WLindex, openWalks, index) {
    logit('stores accounts', accounts);
    let walkCodes = openWalks.map((w, i) => {
      const code = index.get(w.walkId).shortCode;
      return [w.walkId, code, i === 0 ? 0.4 : 1];
    });

    const nextWalkId = openWalks[0].walkId;
    logit('walkCodes', nextWalkId, walkCodes);
    accounts.forEach((account) => {
      // logit('account @start', account);
      account.codes = [];
      account.debt = 0;
      account.credit = account.Payments.reduce((tot, p) => tot + p.available, 0);
      account.Members.forEach((member) => {
        member.icons = {};
        member.Bookings.forEach((bkng) => {
          let icon;
          account.debt += bkng.owing;
          if (bkng.walkId < nextWalkId && bkng.owing > 0) {
            const code = index.get(bkng.walkId).shortCode;
            account.codes.push([bkng.walkId, code, 0.4]);
          }
          if (!bkng || bkng.status[1] === 'X') icon = 'square';
          else if (bkng.status === 'W') {
            icon = ['W', WLindex[bkng.bookingId]];
          } else if (bkng.owing > 0) icon = 'P';
          else icon = bkng.status;
          member.icons[bkng.walkId] = icon;
        });
      });
      account.codes = _.sortBy(
        _.uniqBy([...account.codes, ...walkCodes], (c) => c[0]),
        (c) => c[0],
      );
      account.balance = account.credit - account.debt;
    });
    return _.sortBy(accounts, (a) => a.sortName);
  }

  let accounts = [];
  onMount(async () => {
    const res = await fetchData(`walk/walkdayData`);
    const WL = await fetchData(`walk/WLindex`);
    logit('walkData fetchData returned', res);
    logit('WLindex fetchData returned', WL);
    accounts = gatherData(res, WL[0], $openWalks, $index);
    logit('gatherData', accounts);
  });
  // const opacity = (pos = 1) => (pos <= 0.4 ? { opacity: 0.4 } : {});
  const balClass = (balance) => (balance > 0 ? 'pos' : balance === 0 ? 'zero' : 'neg');
</script>

{#if accounts?.length}
  <div class="page">
    <PageHeader title="Walk Day List" />

    <div class="columns">
      {#each accounts as account}
        <div class="accountBox">
          <div class="accountHeader spread">
            <div class="accountName">
              {account.sortName}
            </div>
            <div class="codes">
              {#each account.codes as [, code, opacity]}
                <div class="icon code" style={`opacity:${opacity}`}>
                  {code}
                </div>
              {/each}
            </div>
          </div>
          <div class="accountData">
            <div class={balClass(account.balance) + ' moneyBox'}>
              £{Math.abs(account.balance)}
            </div>

            <span> Paid </span>
            <span class="paidBox" />
            <div class="membersBox">
              {#each account.Members as { shortName, icons }, n}
                <div class="bkngBoxes">
                  <span class="name">
                    {shortName}
                  </span>
                  <div class="codes">
                    {#each account.codes as [walkId, , opacity]}
                      <span class="icon">
                        {#if _.isArray(icons?.[walkId])}
                          <Icon
                            name={icons?.[walkId][0] ?? 'square'}
                            style={`opacity:0.5`}
                          />
                          <span class="overlay">{icons?.[walkId][1]}</span>
                        {:else}
                          <Icon
                            name={icons?.[walkId] ?? 'square'}
                            style={`opacity:${opacity}`}
                          />
                        {/if}
                      </span>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .page {
    flex-direction: column;
    background-color: #ffffff;
    justify-content: flex-start;
    font-size: 13px;
    break-before: page;
    width: 210mm;
    height: 297mm;
    box-sizing: border-box;
    padding-right: 10px;
    /* border: thin solid green; */
    box-sizing: border-box;
    /* background-color: yellow; */
  }
  .columns {
    column-count: 2;
    column-gap: 10px;
  }

  .accountBox {
    border: 1px solid rgb(136, 136, 136);
    margin-bottom: 3px;
    width: 100%;
    border-radius: 5px;
    break-inside: avoid;
  }
  .accountHeader {
    border-bottom: 1px solid rgb(136, 136, 136);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    background-color: rgb(232, 232, 232);
    max-height: 14px;
  }
  .accountHeader.spread {
    padding: 0px 0px 0px 5px;
  }
  .accountName {
    font-size: 13px;
    position: relative;
    top: -3px;
  }
  .codes {
    display: flex;
    flex-direction: row;
  }
  .code {
    font-size: 12px;
  }
  .accountData {
    display: grid;
    grid-template-columns: minmax(65px, 70px) minmax(25px, 25px) minmax(23px, 23px) 1fr;
    align-items: center;
    font-size: 12px;
    padding: 2px;
  }
  .moneyBox {
    height: 14px;
    border: 1px solid #888;
    margin-right: 5px;
    font-size: 12px;
    border-radius: 3px;
  }
  span {
    display: inline-block;
  }
  .pos {
    background-color: #cfe;
    color: #484;
    border-color: green;
  }
  .pos:after {
    content: ' Credit';
  }
  .zero {
    background-color: #fff;
    color: #fff;
    border: none;
  }
  .neg {
    background-color: #f88;
    color: #800;
    border-color: red;
  }
  .neg:after {
    content: ' Owed';
  }
  .paidBox {
    background-color: #fff;
    border: 2px solid #888;
    height: 12px;
    padding-left: 5px;
  }
  .membersBox {
    justify-self: flex-end;
  }
  .name {
    font-size: 10px;
    font-style: italic;
  }

  .spread {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 1px 0px 1px 3px;
  }
  .bkngBoxes {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    position: relative;
    font-size: 12;
    font-style: italic;
  }
  .bkngBox {
    width: 30px;
    max-width: 30px;
    text-align: center;
    position: relative;
  }
  .icon {
    position: relative;
    text-align: center;
    width: 30px;
    height: 14px;
  }
  .icon .overlay {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    color: red;
    font-weight: bold;
    font-size: 1.2em;
  }
</style>
