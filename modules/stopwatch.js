class Stopwatch {
    constructor() {
        this.startTime = null;
        this.stopTime = null;
    }

    start() {
        this.startTime = Date.now();
    }

    stop() {
        if(this.startTime !== null) {
            this.stopTime = Date.now();

            return this.stopTime - this.startTime;    
        }
    }
}

module.exports = Stopwatch;