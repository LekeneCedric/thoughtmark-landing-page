/**
 * Thoughtmark Donation & Crypto Wallet Configuration
 *
 * Simply paste your wallet addresses or payment links below.
 * The website UI and 1-click copy modals will automatically update!
 */

export interface CryptoWallet {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  icon: string;
  explorerUrlPrefix?: string;
  badge?: string;
  note?: string;
}

export const DONATION_CONFIG = {
  // Official Crypto Wallets (BTC & ETH only)
  wallets: [
    {
      id: "btc",
      name: "Bitcoin",
      symbol: "BTC",
      network: "Bitcoin Network",
      address: "bc1q7nl6sf9e5g8ujxl9tpr8xwjg8zw623q3ga37at",
      icon: "/assets/bitcoin.png",
      badge: "Native BTC",
      note: "Send only BTC to this Bitcoin address.",
    },
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      network: "Ethereum (ERC-20)",
      address: "0x48035FFA7119166b7ce6b38Fd91618D8e0fa5aAB",
      icon: "/assets/etherium.png",
      badge: "ERC-20",
      note: "Send ETH or any ERC-20 token to this address.",
    },
  ] as CryptoWallet[],

  // Share reminder
  shareText: "I use Thoughtmark to bookmark exact sentences, formulas, and code snippets in Claude, ChatGPT & Gemini! It's 100% free and private: https://thoughtmark.app",
  shareUrl: "https://thoughtmark.app",
};
