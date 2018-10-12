import Axios from "axios";
import { logger } from "../logger";
import * as sleep from 'sleep-promise';

const API_URL = 'https://utas.external.s2.fut.ea.com/ut/game/fifa19';

export namespace fut {
  export interface ItemData {
    assetId: number
    cardsubtypeid: number
    discardValue: number
    id: number
    itemState: "free" | undefined
    itemType: "player" | undefined
    lastSalePrice: number
    leagueId: number
    marketDataMaxPrice: number
    marketDataMinPrice: number
    pile: number
    rareflag: number
    rating: number
    resourceId: number
    timestamp: number
    untradeable: boolean
  }
  
  export type Platform = 'pc' | 'ps' | 'xbox'

  export async function getClubPlayers(page = 0): Promise<ItemData[]> {
    const response = await Axios.get(`${API_URL}/club?sort=desc&type=player&start=${page * 100}&count=100`);
    return response.data.itemData;
  }
  
  export interface AuctionInfo {
    tradeId: number
    bidState: string
    buyNowPrice: number
    currentBit: number
    expires: number
    itemData: ItemData
    startingBid: 5400
    tradeState: string
    watched: boolean
  }
  export async function getPlayerTransferData(assetId, batch): Promise<AuctionInfo[]> {
    const response = await Axios.get(`${API_URL}/transfermarket?start=${batch * 20}&num=21&type=player&definitionId=${assetId}`);
    return response.data.auctionInfo;
  }
  
  export async function getSquadPlayerIds(): Promise<number[]> {
    const response = await Axios.get(`${API_URL}/squad/active`);
    const players: ItemData[] = response.data.players;
    return players.map(p => p.id);
  }
  
  interface AuctionRequest {
    buyNowPrice: number;
    duration: number;
    itemData: { id: number | string };
    startingBid: number;
  }
  export async function sellPlayer(req: AuctionRequest) {
    logger.info(`selling player ${JSON.stringify(req)}`);
    const pileResponse = await Axios.put(`${API_URL}/item`, { 
      itemData: [ { id: req.itemData.id, pile: 'trade'} ] 
    });
    if (pileResponse) {
      await sleep(300);
      logger.info(`\t\titem pushed to trade pile ${pileResponse}`);
      const response = await Axios.post(`${API_URL}/auctionhouse`, req);
      return response.data;
    } else {
      throw new Error('couldnt move to trade pile')
    }
  }
  
  export async function sendToClub(id: number): Promise<boolean> {
    const pileResponse = await Axios.put(`${API_URL}/item`, { 
      itemData: [ { id, pile: 'club'} ] 
    });
    return !!pileResponse
  }
  
  export async function getTradePile(): Promise<AuctionInfo[]> {
    const resp = await Axios.get(`${API_URL}/tradepile`);
    return resp.data.auctionInfo
  }
}
