import { Logger } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { WebSocketUploadEvent } from "src/types/Websocket_upload_event";

@WebSocketGateway()
export class SignalUploadControlCenter implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
    @WebSocketServer() server!: Server;

    constructor(
        
    ) {}

    @SubscribeMessage("server_upload_controller")
    handleMessage(@MessageBody() message: string) {
        const {event} = JSON.parse(message) as {event: WebSocketUploadEvent}

        
    }

    handleConnection(client: any, ...args: any[]) {
        
    }

    handleDisconnect(client: any) {
        
    }

    afterInit(server: any) {
        
    }

}