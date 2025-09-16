export type OctavPortfolioBalance = {
  address: string;
  networth: string;
  assetByProtocols: AssetByProtocols;
  chains: {
    [chainKey: string]: Chain;
  };
};

type Chain = {
  name: string;
  key: string;
  value: string;
  totalCostBasis: string;
  totalClosedPnl: string;
  totalOpenPnl: string;
};

type AssetByProtocols = {
  [protocolKey: string]: {
    name: string;
    key: string;
    value: string;
    totalCostBasis: string;
    totalClosedPnl: string;
    totalOpenPnl: string;
    chains: {
      [chainKey: string]: Chain;
    };
  };
};
