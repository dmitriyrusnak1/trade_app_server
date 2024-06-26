
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TradeService } from './trade.service';
 

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
 
  constructor(
    private readonly tradeService: TradeService
  ) {
  }
 
  async handleConnection(socket: Socket) {
    console.log(`Connected ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Disconnected: ${socket.id}`);
  }

  @SubscribeMessage('trade_request')
  async listenForMessages() {
    this.server.sockets.emit('trading', 'Get Master Trade...');

    const masterTradeResult = await this.tradeService.makeMasterTrade();

    this.server.sockets.emit('trading', 'Replicating Master Trade');

    const userId = '44712225';

    let slaveId = await this.tradeService.getConnectionId(userId);

    if (!slaveId) {
      slaveId = await this.tradeService.slaveAccoountLogin();

      await this.tradeService.setConnectionId(userId, slaveId);
    }

    this.server.sockets.emit('trading', 'Successfully Replicated Master Trade');

    const result = await this.tradeService.makeSlaveTrade(slaveId, masterTradeResult, userId);

    this.server.sockets.emit('trade_result', result);
 
    return result;
  }
}
