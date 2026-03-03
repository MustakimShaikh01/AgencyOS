/**
 * Manages WebSocket connection bridging server action logs to the dashboard UI
 */
class WsManager {
    constructor(path = '/ws/activity') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.url = `${protocol}//${window.location.host}${path}`;

        this.socket = null;
        this.listeners = [];
        this.reconnectAttempts = 0;
        this.maxReconnects = 5;
    }

    connect() {
        if (this.reconnectAttempts > this.maxReconnects) {
            console.error("Max WS reconnect attempts reached.");
            return;
        }

        console.log(`Connecting to WS: ${this.url}`);
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log("WebSocket Connected!");
            this.reconnectAttempts = 0;
            // dispatch status event
            this._notify({ type: 'WS_STATUS', status: 'connected' });
        };

        this.socket.onmessage = (event) => {
            try {
                // If it's a JSON string, notify listeners
                if (event.data === "pong") return;

                const parsed = JSON.parse(event.data);
                this._notify(parsed);

            } catch (error) {
                console.error("WS Parse error", error, event.data);
            }
        };

        this.socket.onclose = () => {
            console.log("WebSocket closed. Attempting reconnect...");
            this._notify({ type: 'WS_STATUS', status: 'disconnected' });

            this.reconnectAttempts++;
            setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        };

        // Ping loop to keep connection alive
        setInterval(() => this.ping(), 30000);
    }

    ping() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send("ping");
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    _notify(data) {
        this.listeners.forEach(cb => cb(data));
    }
}

const wsClient = new WsManager();
