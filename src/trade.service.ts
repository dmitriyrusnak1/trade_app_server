
import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { map, firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { IMasterTradeResult, ISlaveTradeResult } from './dtos';
 
@Injectable()
export class TradeService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}
 
  async makeMasterTrade(): Promise<IMasterTradeResult> {
    const masterTradeUrl = this.configService.get<string>('MASTER_TRADE_URL');

    return await firstValueFrom(
      this.httpService.get(masterTradeUrl).pipe(
        map(res => res.data),
        catchError((error: AxiosError) => {
          throw error;
        })
      )
    );
  }

  async slaveAccoountLogin(): Promise<string> {
    const slaveLoginUrl = this.configService.get<string>('SLAVE_LOGIN_URL');

    return await firstValueFrom(
      this.httpService.get(slaveLoginUrl).pipe(
        map(res => res.data),
        catchError((error: AxiosError) => {
          throw error;
        })
      )
    );
  }

  async makeSlaveTrade(
    slaveId: string,
    masterTradeResult: IMasterTradeResult,
    userId: string,
  ): Promise<ISlaveTradeResult> {
    const slaveTradeUrl = this.configService.get<string>('SLAVE_TRADE_URL');

    const url = `${slaveTradeUrl}?id=${slaveId}&symbol=${masterTradeResult.symbol}&operation=${masterTradeResult.operation}&volume=${masterTradeResult.volume}&takeprofit=${masterTradeResult.takeprofit}&comment=${encodeURIComponent(masterTradeResult.comment)}`;

    return await firstValueFrom(
      this.httpService.get(url).pipe(
        map(res => res.data),
        catchError(async (error: AxiosError) => {
          if (error.status === 401) {
            const connectionId = await this.slaveAccoountLogin();

            await this.setConnectionId(userId, connectionId);

            await this.makeSlaveTrade(connectionId, masterTradeResult, userId);
          } else {
            throw error;
          }
        })
      )
    );
  }

  async getConnectionId(userId: string) {
    const value = await this.cacheManager.get<string>(userId);

    return value;
  }

  async setConnectionId(userId: string, connectionId: string) {
    await this.cacheManager.set(userId, connectionId);
  }
}
