export interface IMasterTradeResult {
  symbol: string,  
  operation: string,  
  volume: number,  
  takeprofit: number,  
  comment: string, 
}

export interface ISlaveTradeResult extends IMasterTradeResult {
  id: string,
}
