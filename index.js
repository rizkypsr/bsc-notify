const ethers = require("ethers");
const { Telegraf } = require("telegraf");
const { getBnbPosition } = require("./utils");

const bot = new Telegraf("5853927774:AAEQ93fKOQhUD-l6I6Ji1glF8zXnSF-lsX0");

bot.command("id", (ctx) => ctx.reply({ text: ctx.chat.id.toString() }));

const addresses = {
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
  me: "0x6DB74aD2DdFCc797941BD68FF74330C693e64ebF",
};

const mnemonic =
  "ivory finger video census thank inherit dignity annual sentence position step dance";

const provider = new ethers.WebSocketProvider(
  "wss://quick-rough-panorama.bsc.discover.quiknode.pro/d157ddf62766fee0a832abcfe256d07d27b7eda8/"
);

const wallet = ethers.Wallet.fromPhrase(mnemonic);
const account = wallet.connect(provider);

const PairContractAbi = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
];

const factory = new ethers.Contract(
  addresses.factory,
  [
    "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
  ],
  account
);

factory.on("PairCreated", async (token0, token1, addressPair) => {
  const pairContract = new ethers.Contract(
    addressPair,
    PairContractAbi,
    account
  );

  const bnbPosition = getBnbPosition(token0, token1);

  if (bnbPosition === -1) {
    return;
  }

  // Retrieve the reserves and liquidity
  const reserves = await pairContract.getReserves();
  const liquidity = reserves[bnbPosition];

  const liquidityAmount = parseFloat(liquidity) / 1e18; // Assuming liquidity is in Wei

  if (liquidityAmount === 0 || Number(liquidityAmount) < 20) {
    return;
  }

  const formattedLiquidity = `${liquidityAmount} WBNB`;

  const regex = /(?<=\d)\.(?=\d)/g;
  const replacement = "\\."; // Replace dot with "\."
  const replacedMessage = formattedLiquidity.replace(regex, replacement);

  bot.telegram.sendMessage(
    "728868500",
    `
\`${addressPair}\`
\`${token0}\`
\`${token1}\`

Liquidity: ${replacedMessage}
`,
    {
      disable_web_page_preview: true,
      parse_mode: "MarkdownV2",
    }
  );

  console.log(`
    ~~~~~~~~~~~~~~~~~~
    New pair detected
    ~~~~~~~~~~~~~~~~~~
    token0: ${token0}
    token1: ${token1}
    addressPair: ${addressPair}

    Liquidity: ${formattedLiquidity}
    `);
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
