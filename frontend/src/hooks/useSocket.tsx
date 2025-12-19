import { useEffect, useState } from "react"

const BACKEND_URL: string = (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8080";
function toWsUrl(baseUrl: string): string {
    try {
        const url = new URL(baseUrl);
        if (url.protocol === "https:") url.protocol = "wss:";
        else if (url.protocol === "http:") url.protocol = "ws:";
        return url.toString();
    } catch {
        // Fallback if an invalid URL is provided: assume host without protocol
        return `ws://${baseUrl.replace(/^\/+/, "")}`;
    }
}
const WS_URL = toWsUrl(BACKEND_URL);
export const useScoket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
     
    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        ws.onopen = () => {
            setSocket(ws);
        } 
        ws.onclose = () => {
             setSocket(null);
        }
        return () => {
            ws.close();
        };
    }, [])
    return socket;
}