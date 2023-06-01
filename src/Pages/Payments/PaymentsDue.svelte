<script>
  import Panel from '@utils/AJNPanel.svelte';
  import TooltipButton from '@utils/TooltipButton.svelte';
  import Icon from '@utils/Icon2.svelte';

  import { debts as accounts } from '@store/payments';
  import { page } from '@store/router';
  import { currentMemberId } from '@store/memberCurrent';

  import Logit from '@utils/logit';
  var logit = Logit('pages/payments/PaymentsDue');

  export let toggleDisplay;

  $: logit('accounts', $accounts);

  const showMemberBookings = (memberId) => {
    currentMemberId.set(memberId);
    page.set('bookings');
  };
</script>

<Panel class={'paymentsDue '} style="max-height: 100%;" header="Payments Due">
  {#if $accounts}
    <div class="all-payments">
      <div class="buttons">
        <TooltipButton
          label="Show Payments Made"
          onClick={toggleDisplay}
          tiptext="Show Payments Made"
          visible />
      </div>
      {#each $accounts as account}
        {#if account.balance > 0}
          <div class=" member-rcpt">
            <div class="overview">
              <span class="who" onClick={() => showMemberBookings(account.accountId)}>
                {' '}
                {account.sortName}
              </span>
              <span class="owed">{`£${account.balance}`}</span>
            </div>
            {#each account.bookings as bkng}
              {#if bkng.owing > 0}
                <div class="Detail" class:newBkng={!bkng.owing}>
                  <span>{bkng.displayDate}</span>

                  <Icon name={bkng.status} width="16" />
                  <span>
                    <span class="name">{bkng.name}</span>
                    {bkng.venue}
                  </span>
                  <span>£{bkng.owing}</span>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</Panel>

<style lang="postcss">
  .all-payments {
    border: #bce8f1 solid thin;
    border-collapse: collapse;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    width: auto;
    justify-content: flex-start;
    height: 100%;
    flex: 0 0 300px;
    min-width: 0;
    overflow: scroll;
  }
  .all-payments .buttons {
    display: flex;
    flex-direction: row;
    padding-bottom: 4px;
    /*max-width: 280px;*/
  }

  .member-rcpt {
    color: #31708f;
    margin-bottom: 3px;
    margin-right: 3px;
    padding-bottom: 4px;
    border: #bce8f1 thin solid;
    border-radius: 5px;
    width: 245px;
    flex: 0 0 auto;
  }
  .member-rcpt span {
    display: inline-block;
  }

  .member-rcpt .overview {
    background-color: #d9edf7;
    border-radius: 5px;
    border-bottom: #bce8f1 thin solid;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 1px 3px;
    display: flex;
    justify-content: space-between;
  }
  .member-rcpt .overview .who {
    width: 190px;
    font-size: 1.1em;
    font-weight: bold;
    padding-right: 5px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .member-rcpt .overview .owed {
    width: 40px;
    text-align: center;
    font-size: 0.85em;
    padding: 2px;
    color: #333;
    background-color: #e6e6e6;
    border: 1px solid #adadad;
    border-radius: 4px;
  }

  .Detail {
    position: relative;
    padding-left: 3px;
    font-size: 13px;
    display: grid;
    grid-template-columns: 85px 16px minmax(0, 1fr) auto;
    align-items: center;
    /*padding-left: 3px;*/
  }
  .Detail span {
    display: inline-block;
    padding-left: 0;
  }

  .Detail .name {
    font-size: 0.9em;
    font-style: italic;
  }
</style>
