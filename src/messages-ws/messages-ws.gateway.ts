import { JwtService } from '@nestjs/jwt'
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { MessagesWsService } from './messages-ws.service';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtPayload } from 'src/auth/interfaces';


@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    //console.log(client);
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verify(token)
    }
    catch {
      client.disconnect();
      return;
    }

    await this.messagesWsService.registerClient(client, payload.id);

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    // console.log("Client disconnected: ", client.id);;
    this.messagesWsService.removeClient(client.id);
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    
    console.log("PAYLOAD ", payload);
    // Emitir únicamente al cliente
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'no-message'
    // });

    //Emitir a todos MENOS al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'no-message'
    // });

    //Emitir a todos
    const userFullName = this.messagesWsService.getFullNameUserBySocketId(client.id)
    this.wss.emit('messages-from-server', {
      fullName: userFullName,
      message: payload.message || 'no-message'
    });
  }

}
