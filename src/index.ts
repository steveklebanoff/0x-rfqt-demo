const SELL_TOKEN = "ETH";
const SELL_TOKEN_DECIMALS = 18;
const SELL_UNIT_AMOUNT = 0.25;
const BUY_TOKEN = "DAI";
const SLIPPAGE_PERCENT = 0.03;
const API_URL = "https://api.0x.org";

const getUrlForRequest = (quoteType: string, takerAddress: string) => {
  const sellAmount = SELL_UNIT_AMOUNT * (10 ** SELL_TOKEN_DECIMALS);
  const baseParams = `buyToken=${BUY_TOKEN}&sellToken=${SELL_TOKEN}&sellAmount=${sellAmount}&takerAddress=${takerAddress}&slippagePercentage=${SLIPPAGE_PERCENT}`;
  if (quoteType === 'indicative') {
    return `${API_URL}/swap/v0/price?${baseParams}`;
  } else if (quoteType === 'firm') {
    return `${API_URL}/swap/v0/quote?${baseParams}&intentOnFilling=true&skipValidation=true`;
  } else {
    throw new Error('Unexpected quote type');
  }
}

(window as any).submitApiRequest = async () => {
  const submitEl = document.getElementById("submit-request") as HTMLInputElement;
  const apiKeyEl = document.getElementById('api-key') as HTMLInputElement;
  const takerAddressEl = document.getElementById('taker-address') as HTMLInputElement;
  const quoteTypeEl = document.getElementById('quote-type') as HTMLInputElement;
  const resultsEl = document.getElementById("results")!;
  const fillEl = document.getElementById("fill")!;
  fillEl.style.display = 'none';

  const apiKey = apiKeyEl.value;
  const takerAddress = takerAddressEl.value;
  if (!apiKey || !takerAddress) {
    alert('Please provide an API key and a taker address');
    return;
  }

  submitEl.disabled = true;
  resultsEl.innerText = "Submitting...";

  const apiRequestUrl = getUrlForRequest(quoteTypeEl.value, takerAddress);
  const zeroExApiResponse = await window.fetch(apiRequestUrl, { headers: { "0x-api-key": apiKey } });
  if (zeroExApiResponse.status === 200) {
    resultsEl.innerText = JSON.stringify(await zeroExApiResponse.json(), null, 2);
    if (quoteTypeEl.value === 'firm') {
      fillEl.style.display = 'block';
    }
  } else {
    resultsEl.innerText = `Error: ${zeroExApiResponse.status} ${zeroExApiResponse.body}`;
  }

  submitEl.disabled = false;
};

(window as any).fill = async () => {
  const fillEl = document.getElementById("fill")!;
  fillEl.style.display = 'none';
  const resp = JSON.parse(document.getElementById("results")!.innerText);
  await (window as any).ethereum.enable();
  (window as any).web3.eth.sendTransaction(resp, console.log);
}