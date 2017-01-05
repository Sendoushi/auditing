'use strict';
/* global Promise */

//-------------------------------------
// Functions

/**
 * Checks if has google analytics
 *
 * @param {object} req
 * @returns promise
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
var hasGoogleAnalytics = function hasGoogleAnalytics(req) {
    return new Promise(function (resolve, reject) {
        var markup = req.domReq.window.document.documentElement.innerHTML;
        var firstVersion = /[<script>][^_]+(https:\/\/www\.google-analytics\.com\/analytics\.js+)[^_]+<\/script>/g.exec(markup);
        var secondVersion = /[<script>][^_]+(https:\/\/www\.googletagmanager\.com\/gtm\.js\?id=+)[^_]+<\/script>/g.exec(markup);
        var rejected = !firstVersion && !secondVersion;

        // Everything must've went fine
        !rejected ? resolve(true) : reject(false);
    });
};

//-------------------------------------
// Export

exports.default = {
    name: 'analytics',
    rules: [{ name: 'hasGoogleAnalytics', fn: hasGoogleAnalytics }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2R1bGVzL2FuYWx5dGljcy5qcyJdLCJuYW1lcyI6WyJoYXNHb29nbGVBbmFseXRpY3MiLCJyZXEiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm1hcmt1cCIsImRvbVJlcSIsIndpbmRvdyIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiaW5uZXJIVE1MIiwiZmlyc3RWZXJzaW9uIiwiZXhlYyIsInNlY29uZFZlcnNpb24iLCJyZWplY3RlZCIsIm5hbWUiLCJydWxlcyIsImZuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7QUFNQSxJQUFNQSxxQkFBcUIsU0FBckJBLGtCQUFxQixDQUFDQyxHQUFEO0FBQUEsV0FBUyxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ2pFLFlBQU1DLFNBQVNKLElBQUlLLE1BQUosQ0FBV0MsTUFBWCxDQUFrQkMsUUFBbEIsQ0FBMkJDLGVBQTNCLENBQTJDQyxTQUExRDtBQUNBLFlBQU1DLGVBQWUsd0ZBQXdGQyxJQUF4RixDQUE2RlAsTUFBN0YsQ0FBckI7QUFDQSxZQUFNUSxnQkFBZ0IsdUZBQXVGRCxJQUF2RixDQUE0RlAsTUFBNUYsQ0FBdEI7QUFDQSxZQUFNUyxXQUFXLENBQUNILFlBQUQsSUFBaUIsQ0FBQ0UsYUFBbkM7O0FBRUE7QUFDQSxTQUFDQyxRQUFELEdBQVlYLFFBQVEsSUFBUixDQUFaLEdBQTRCQyxPQUFPLEtBQVAsQ0FBNUI7QUFDSCxLQVJtQyxDQUFUO0FBQUEsQ0FBM0I7O0FBVUE7QUFDQTs7a0JBRWU7QUFDWFcsVUFBTSxXQURLO0FBRVhDLFdBQU8sQ0FDSCxFQUFFRCxNQUFNLG9CQUFSLEVBQThCRSxJQUFJakIsa0JBQWxDLEVBREc7QUFGSSxDIiwiZmlsZSI6ImFuYWx5dGljcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogQ2hlY2tzIGlmIGhhcyBnb29nbGUgYW5hbHl0aWNzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICogQHJldHVybnMgcHJvbWlzZVxuICovXG5jb25zdCBoYXNHb29nbGVBbmFseXRpY3MgPSAocmVxKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgbWFya3VwID0gcmVxLmRvbVJlcS53aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmlubmVySFRNTDtcbiAgICBjb25zdCBmaXJzdFZlcnNpb24gPSAvWzxzY3JpcHQ+XVteX10rKGh0dHBzOlxcL1xcL3d3d1xcLmdvb2dsZS1hbmFseXRpY3NcXC5jb21cXC9hbmFseXRpY3NcXC5qcyspW15fXSs8XFwvc2NyaXB0Pi9nLmV4ZWMobWFya3VwKTtcbiAgICBjb25zdCBzZWNvbmRWZXJzaW9uID0gL1s8c2NyaXB0Pl1bXl9dKyhodHRwczpcXC9cXC93d3dcXC5nb29nbGV0YWdtYW5hZ2VyXFwuY29tXFwvZ3RtXFwuanNcXD9pZD0rKVteX10rPFxcL3NjcmlwdD4vZy5leGVjKG1hcmt1cCk7XG4gICAgY29uc3QgcmVqZWN0ZWQgPSAhZmlyc3RWZXJzaW9uICYmICFzZWNvbmRWZXJzaW9uO1xuXG4gICAgLy8gRXZlcnl0aGluZyBtdXN0J3ZlIHdlbnQgZmluZVxuICAgICFyZWplY3RlZCA/IHJlc29sdmUodHJ1ZSkgOiByZWplY3QoZmFsc2UpO1xufSk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRXhwb3J0XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBuYW1lOiAnYW5hbHl0aWNzJyxcbiAgICBydWxlczogW1xuICAgICAgICB7IG5hbWU6ICdoYXNHb29nbGVBbmFseXRpY3MnLCBmbjogaGFzR29vZ2xlQW5hbHl0aWNzIH1cbiAgICBdXG59O1xuIl19