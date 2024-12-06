class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.pendingSubscriptions = [];
    this.isConnecting = false;
  }

  connect(symbols) {
    if (this.isConnecting) {
      this.pendingSubscriptions = symbols;
      return;
    }

    this.isConnecting = true;
    this.ws = new WebSocket('wss://stream.binance.com:9443/ws');

    this.ws.onopen = () => {
      console.log('WebSocket Connected');
      this.isConnecting = false;
      
      const subscribeMessage = {
        method: 'SUBSCRIBE',
        params: symbols.map(symbol => `${symbol.toLowerCase()}usdt@trade`),
        id: 1
      };

      try {
        this.ws.send(JSON.stringify(subscribeMessage));
      } catch (error) {
        console.error('Error sending subscription:', error);
        this.handleReconnection(symbols);
      }
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === 'trade') {
        this.notifySubscribers(data.s, {
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          timestamp: data.T
        });
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket Disconnected');
      this.isConnecting = false;
      this.handleReconnection(symbols);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      this.isConnecting = false;
    };
  }

  handleReconnection(symbols) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(symbols);
      }, 5000 * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
    } else {
      this.reconnectAttempts = 0;
      console.error('Max reconnection attempts reached');
    }
  }

  subscribe(symbol, callback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol).add(callback);

    // If WebSocket is not connected, connect it
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect([symbol]);
    }
  }

  unsubscribe(symbol, callback) {
    if (this.subscribers.has(symbol)) {
      this.subscribers.get(symbol).delete(callback);
      
      // If no more subscribers for this symbol, unsubscribe from WebSocket
      if (this.subscribers.get(symbol).size === 0) {
        this.subscribers.delete(symbol);
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const unsubscribeMessage = {
            method: 'UNSUBSCRIBE',
            params: [`${symbol.toLowerCase()}usdt@trade`],
            id: 1
          };
          this.ws.send(JSON.stringify(unsubscribeMessage));
        }
      }
    }
  }

  notifySubscribers(symbol, data) {
    if (this.subscribers.has(symbol)) {
      this.subscribers.get(symbol).forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.subscribers.clear();
      this.pendingSubscriptions = [];
    }
  }
}

export default new WebSocketService();