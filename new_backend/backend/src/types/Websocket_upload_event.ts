export type WebSocketMessageType = {
    event: "UPLOADING" | "SUCCESS" | "FAILED"
    data: any
}