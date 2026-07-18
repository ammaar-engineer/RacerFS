import { Logger, UseFilters } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { WebSocketMessageType } from "src/types/Websocket_upload_event";
import { FileRouteService } from "./service";
import { static_output_types } from "src/types/static_output_types";
import { WebSocketException } from "src/GlobalException";
import { WebSocketValidation } from "./web_socket_validation";
import { FileRouteWebSocketServices } from "./web_socket_services";

@WebSocketGateway()
@UseFilters(WebSocketException)
export class SignalUploadControlCenter implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
    @WebSocketServer() server!: Server;

    constructor(
        private readonly webSocketFileService: FileRouteWebSocketServices,
        private readonly wsValidation: WebSocketValidation
    ) {}

    @SubscribeMessage("server_upload_controller")
    async handleMessage(@MessageBody() message: string) {
        // Validate message using validation service
        const parsedMessage = await this.wsValidation.validateMessage(message);
        const {event, data} = parsedMessage;
        const EventAction = {
            "UPLOADING": this.webSocketFileService.WsEvent_UPLOADING,
            "SUCCESS": this.webSocketFileService.WsEvent_SUCCESS,
            "FAILED": this.webSocketFileService.WsEvent_FAILED
        }
        // Bind context dan gunakan await untuk async service methods
        const serviceReturns = await EventAction[event].call(this.webSocketFileService, data)
        if (serviceReturns) {
            this.server.emit(JSON.stringify(serviceReturns))
        }
    }

    handleConnection(client: any, ...args: any[]) {
        
    }

    handleDisconnect(client: any) {
        
    }

    afterInit(server: any) {
        
    }

}