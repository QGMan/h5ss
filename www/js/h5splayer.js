function H5sPlayerWS(e) {
    this.sourceBuffer, this.buffer = [], this.mediaSource, this.video, this.wsSocket, this.checkSourceBufferId, this.keepaliveTimerId, this.emptyBuffCnt = 0, this.lastBuffTime = 0, this.buffTimeSameCnt = 0, this.bNeedReconnect = !1, this.bDisConnected = !1, this._bGetCodec = !1, this._strCodec, this._conf = e, console.log("Websocket Conf:", e), this._videoId = e.videoid, this._token = e.token;
    var t = this._conf.protocol + "//" + this._conf.host + this._conf.rootpath + "api/v1/GetImage?token=" + this._token + "&session=" + this._conf.session;
    document.getElementById(this._videoId).setAttribute("poster", t)
}

function H5sPlayerHls(e) {
    this._conf = e, this._videoId = e.videoid, this._token = e.token, this._reConnectInterval, this._version = e.hlsver, this._video = document.getElementById(this._videoId), this._video.type = "application/x-mpegURL", this._lastTime = 0, this._sameCnt = 0;
    var t = this._conf.protocol + "//" + window.location.host + "/api/v1/GetImage?token=" + this._token + "&session=" + this._conf.session;
    document.getElementById(this._videoId).setAttribute("poster", t)
}

function H5sPlayerRTC(e) {
    this.wsSocket, this.checkSourceBufferId, this.keepaliveTimerId, this.emptyBuffCnt = 0, this.lastBuffTime = 0, this.buffTimeSameCnt = 0, this.bNeedReconnect = !1, this.bDisConnected = !1, this._conf = e, this._videoId = e.videoid, this._token = e.token, this.video = document.getElementById(this._videoId), this.pc = null, this.pcOptions = {
        optional: [{
            DtlsSrtpKeyAgreement: !0
        }]
    }, this.mediaConstraints = {
        mandatory: {
            offerToReceiveAudio: !0,
            offerToReceiveVideo: !0
        }
    }, this.pcConfig = {
        iceServers: []
    }, this.earlyCandidates = [];
    var t = this._conf.protocol + "//" + this._conf.host + this._conf.rootpath + "api/v1/GetImage?token=" + this._token + "&session=" + this._conf.session;
    document.getElementById(this._videoId).setAttribute("poster", t)
}

function createRTCSessionDescription(e) {
    return console.log("createRTCSessionDescription "), new RTCSessionDescription(e)
}
H5sPlayerWS.prototype.ReconnectFunction = function () {
    console.log("Try Reconnect...", this.bNeedReconnect), !0 === this.bNeedReconnect && (console.log("Reconnect..."), this.setupWebSocket(this._token), this.bNeedReconnect = !1), console.log("Try Reconnect...", this.bNeedReconnect)
}, H5sPlayerWS.prototype.H5SWebSocketClient = function (e) {
    var t;
    console.log("H5SWebSocketClient");
    try {
        "http:" == this._conf.protocol && (t = "undefined" != typeof MozWebSocket ? new MozWebSocket("ws://" + this._conf.host + e) : new WebSocket("ws://" + this._conf.host + e)), "https:" == this._conf.protocol && (console.log(this._conf.host), t = "undefined" != typeof MozWebSocket ? new MozWebSocket("wss://" + this._conf.host + e) : new WebSocket("wss://" + this._conf.host + e)), console.log(this._conf.host)
    } catch (e) {
        return void alert("error")
    }
    return t
}, H5sPlayerWS.prototype.readFromBuffer = function () {
    if (0 !== this.buffer.length && !this.sourceBuffer.updating) try {
        var e = this.buffer.shift(),
            t = new Uint8Array(e);
        this.sourceBuffer.appendBuffer(t)
    } catch (e) {
        console.log(e)
    }
}, H5sPlayerWS.prototype.keepaliveTimer = function () {
    try {
        this.wsSocket.send("keepalive")
    } catch (e) {
        console.log(e)
    }
}, H5sPlayerWS.prototype.onWebSocketData = function (e) {
    if (!0 !== this.bDisConnected) return !1 === this._bGetCodec ? (this._strCodec = String.fromCharCode.apply(null, new Uint8Array(e.data)), this.setupSourceBuffer(this), void(this._bGetCodec = !0)) : (this.buffer.push(e.data), void this.readFromBuffer())
}, H5sPlayerWS.prototype.setupSourceBuffer = function (e) {
    try {
        window.MediaSource = window.MediaSource || window.WebKitMediaSource, window.MediaSource || console.log("MediaSource API is not available");
        var t = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
        "MediaSource" in window && MediaSource.isTypeSupported(t) ? console.log("MIME type or codec: ", t) : console.log("Unsupported MIME type or codec: ", t), e.mediaSource = new window.MediaSource, e.video = document.getElementById(e._videoId), e.video.autoplay = !0, console.log(e._videoId);
        e.video.src = window.URL.createObjectURL(e.mediaSource), e.video.play(), e.mediaSource.addEventListener("sourceopen", e.mediaSourceOpen.bind(e), !1)
    } catch (e) {
        console.log(e)
    }
}, H5sPlayerWS.prototype.mediaSourceOpen = function () {
    console.log("Add SourceBuffer"), this.sourceBuffer = this.mediaSource.addSourceBuffer(this._strCodec), this.mediaSource.duration = 1 / 0, this.mediaSource.removeEventListener("sourceopen", this.mediaSourceOpen, !1), this.sourceBuffer.addEventListener("updateend", this.readFromBuffer.bind(this), !1)
}, H5sPlayerWS.prototype.setupWebSocket = function (e) {
    this.video = document.getElementById(this._videoId), this.video.autoplay = !0;
    var t = "api/v1/h5swsapi";
    t = this._conf.rootpath + t + "?token=" + e + "&session=" + this._conf.session, console.log(t), this.wsSocket = this.H5SWebSocketClient(t), console.log("setupWebSocket", this.wsSocket), this.wsSocket.binaryType = "arraybuffer", (this.wsSocket.h5 = this).wsSocket.onmessage = this.onWebSocketData.bind(this), this.wsSocket.onopen = function () {
        console.log("wsSocket.onopen", this.h5), this.h5.checkSourceBufferId = setInterval(this.h5.CheckSourceBuffer.bind(this.h5), 1e4), this.h5.keepaliveTimerId = setInterval(this.h5.keepaliveTimer.bind(this.h5), 1e3)
    }, this.wsSocket.onclose = function () {
        console.log("wsSocket.onclose", this.h5), !0 === this.h5.bDisConnected ? console.log("wsSocket.onclose disconnect") : this.h5.bNeedReconnect = !0, this.h5.CleanupSourceBuffer(this.h5), this.h5.CleanupWebSocket(this.h5), this.h5._strCodec = "", this.h5._bGetCodec = !1
    }
}, H5sPlayerWS.prototype.CleanupSourceBuffer = function (e) {
    console.log("Cleanup Source Buffer", e);
    try {
        e.sourceBuffer.removeEventListener("updateend", e.readFromBuffer, !1), e.sourceBuffer.abort(), document.documentMode || /Edge/.test(navigator.userAgent) ? console.log("IE or EDGE!") : e.mediaSource.removeSourceBuffer(e.sourceBuffer), e.sourceBuffer = null, e.mediaSource = null, e.buffer = []
    } catch (e) {
        console.log(e)
    }
}, H5sPlayerWS.prototype.CleanupWebSocket = function (e) {
    console.log("CleanupWebSocket", e), clearInterval(e.keepaliveTimerId), clearInterval(e.checkSourceBufferId), e.emptyBuffCnt = 0, e.lastBuffTime = 0, e.buffTimeSameCnt = 0
}, H5sPlayerWS.prototype.CheckSourceBuffer = function () {
    !0 === this.bDisConnected && (console.log("CheckSourceBuffer has been disconnect", this), clearInterval(this.keepaliveTimerId), clearInterval(this.checkSourceBufferId), clearInterval(this.reconnectTimerId));
    try {
        if (console.log("CheckSourceBuffer", this), this.sourceBuffer.buffered.length <= 0) {
            if (this.emptyBuffCnt++, 8 < this.emptyBuffCnt) return console.log("CheckSourceBuffer Close 1"), void this.wsSocket.close()
        } else {
            this.emptyBuffCnt = 0;
            this.sourceBuffer.buffered.start(0);
            var e = this.sourceBuffer.buffered.end(0),
                t = e - this.video.currentTime;
            if (5 < t || t < 0) return console.log("CheckSourceBuffer Close 2", t), void this.wsSocket.close();
            if (e == this.lastBuffTime) {
                if (this.buffTimeSameCnt++, 3 < this.buffTimeSameCnt) return console.log("CheckSourceBuffer Close 3"), void this.wsSocket.close()
            } else this.buffTimeSameCnt = 0;
            this.lastBuffTime = e
        }
    } catch (e) {
        console.log(e)
    }
}, H5sPlayerWS.prototype.connect = function () {
    this.setupWebSocket(this._token), this.reconnectTimerId = setInterval(this.ReconnectFunction.bind(this), 3e3)
}, H5sPlayerWS.prototype.disconnect = function () {
    console.log("disconnect", this), this.bDisConnected = !0, clearInterval(this.reconnectTimerId), null != this.wsSocket && (this.wsSocket.close(), this.wsSocket = null), console.log("disconnect", this)
}, H5sPlayerHls.prototype.CheckPlaying = function () {
    console.log("HLS video.ended", this._video.ended), console.log("HLS video.currentTime", this._video.currentTime);
    var e = this._video.currentTime,
        t = e - this._lastTime;
    console.log("HLS diff", t), 0 === t && this._sameCnt++, this._lastTime = e, 3 < this._sameCnt && (console.log("HLS reconnect"), this._video.src = "", this._lastTime = 0, this._sameCnt = 0, this._video.src = this._conf.protocol + "//" + this._conf.host + this._conf.rootpath + "hls/" + this._version + "/" + this._token + "/hls.m3u8", this._video.play())
}, H5sPlayerHls.prototype.connect = function () {
    this._video = document.getElementById(this._videoId), this._lastTime = 0, this._sameCnt = 0, this._video.src = this._conf.protocol + "//" + this._conf.host + this._conf.rootpath + "hls/" + this._version + "/" + this._token + "/hls.m3u8", this._video.onended = function (e) {
        console.log("The End")
    }, this._video.onpause = function (e) {
        console.log("Pause")
    }, this._video.onplaying = function (e) {
        console.log("Playing")
    }, this._video.onseeking = function (e) {
        console.log("seeking")
    }, this._video.onvolumechange = function (e) {
        console.log("volumechange")
    }, this._video.play(), this._reConnectInterval = setInterval(this.CheckPlaying.bind(this), 3e3)
}, H5sPlayerHls.prototype.disconnect = function () {
    clearInterval(this._reConnectInterval), this._video.src = "", this._lastTime = 0, this._sameCnt = 0
}, H5sPlayerRTC.prototype.ReconnectFunction = function () {
    console.log("Try Reconnect...", this.bNeedReconnect), !0 === this.bNeedReconnect && (console.log("Reconnect..."), this.setupWebSocket(this._token), this.bNeedReconnect = !1), console.log("Try Reconnect...", this.bNeedReconnect)
}, H5sPlayerRTC.prototype.H5SWebSocketClient = function (e) {
    var t;
    console.log("H5SWebSocketClient");
    try {
        "http:" == this._conf.protocol && (t = "undefined" != typeof MozWebSocket ? new MozWebSocket("ws://" + this._conf.host + e) : new WebSocket("ws://" + this._conf.host + e)), "https:" == this._conf.protocol && (console.log(this._conf.host), t = "undefined" != typeof MozWebSocket ? new MozWebSocket("wss://" + this._conf.host + e) : new WebSocket("wss://" + this._conf.host + e)), console.log(this._conf.host)
    } catch (e) {
        return void alert("error")
    }
    return t
}, H5sPlayerRTC.prototype.keepaliveTimer = function () {
    try {
        var e = {
            type: "keepalive"
        };
        this.wsSocket.send(JSON.stringify(e))
    } catch (e) {
        console.log(e)
    }
}, H5sPlayerRTC.prototype.onIceCandidate = function (e) {
    var t;
    e.candidate ? (console.log("onIceCandidate currentice", e.candidate), (t = e.candidate).type = "remoteice", console.log("onIceCandidate currentice", t), this.wsSocket.send(JSON.stringify(t))) : console.log("End of candidates.")
}, H5sPlayerRTC.prototype.onTrack = function (e) {
    var t;
    console.log("Remote track added:" + JSON.stringify(e)), t = e.streams ? e.streams[0] : e.stream;
    var o = document.getElementById(this._videoId);
    o.src = URL.createObjectURL(t), o.play()
}, H5sPlayerRTC.prototype.createPeerConnection = function () {
    console.log("createPeerConnection  config: " + JSON.stringify(this.pcConfig) + " option:" + JSON.stringify(this.pcOptions));
    var o = new RTCPeerConnection(this.pcConfig, this.pcOptions),
        n = this;
    return o.onicecandidate = function (e) {
        n.onIceCandidate.call(n, e)
    }, void 0 !== o.ontrack ? o.ontrack = function (e) {
        n.onTrack.call(n, e)
    } : o.onaddstream = function (e) {
        n.onTrack.call(n, e)
    }, o.oniceconnectionstatechange = function (e) {
        console.log("oniceconnectionstatechange  state: " + o.iceConnectionState);
        var t = document.getElementById(n._videoId);
        t && ("connected" === o.iceConnectionState ? t.style.opacity = "1.0" : "disconnected" === o.iceConnectionState ? t.style.opacity = "0.25" : "failed" !== o.iceConnectionState && "closed" !== o.iceConnectionState || (t.style.opacity = "0.5"))
    }, console.log("Created RTCPeerConnnection with config: " + JSON.stringify(this.pcConfig) + "option:" + JSON.stringify(this.pcOptions)), o
}, H5sPlayerRTC.prototype.ProcessRTCOffer = function (e) {
    console.log("ProcessRTCOffer", e);
    try {
        this.pc = this.createPeerConnection(), this.earlyCandidates.length = 0;
        var t = this;
        this.pc.setRemoteDescription(createRTCSessionDescription(e)), this.pc.createAnswer(this.mediaConstraints).then(function (e) {
            console.log("Create answer:" + JSON.stringify(e)), t.pc.setLocalDescription(e, function () {
                console.log("ProcessRTCOffer createAnswer", e), t.wsSocket.send(JSON.stringify(e))
            }, function () {})
        }, function (e) {
            alert("Create awnser error:" + JSON.stringify(e))
        })
    } catch (e) {
        this.disconnect(), alert("connect error: " + e)
    }
}, H5sPlayerRTC.prototype.ProcessRemoteIce = function (e) {
    console.log("ProcessRemoteIce", e);
    try {
        var t = new RTCIceCandidate({
            sdpMLineIndex: e.sdpMLineIndex,
            candidate: e.candidate
        });
        console.log("ProcessRemoteIce", t), console.log("Adding ICE candidate :" + JSON.stringify(t)), this.pc.addIceCandidate(t, function () {
            console.log("addIceCandidate OK")
        }, function (e) {
            console.log("addIceCandidate error:" + JSON.stringify(e))
        })
    } catch (e) {
        alert("connect ProcessRemoteIce error: " + e)
    }
}, H5sPlayerRTC.prototype.onWebSocketData = function (e) {
    console.log("RTC received ", e.data);
    var t = JSON.parse(e.data);
    console.log("Get Message type ", t.type), "offer" === t.type && (console.log("Process Message type ", t.type), this.ProcessRTCOffer(t)), "remoteice" === t.type && (console.log("Process Message type ", t.type), this.ProcessRemoteIce(t))
}, H5sPlayerRTC.prototype.setupWebSocket = function (e) {
    this.video = document.getElementById(this._videoId), this.video.autoplay = !0;
    var t = "h5srtcapi";
    t = this._conf.rootpath + t + "?token=" + e, console.log(t), this.wsSocket = this.H5SWebSocketClient(t), console.log("setupWebSocket", this.wsSocket), this.wsSocket.binaryType = "arraybuffer", (this.wsSocket.h5 = this).wsSocket.onmessage = this.onWebSocketData.bind(this), this.wsSocket.onopen = function () {
        console.log("wsSocket.onopen", this.h5);
        var e = {
            type: "open"
        };
        this.h5.wsSocket.send(JSON.stringify(e)), this.h5.keepaliveTimerId = setInterval(this.h5.keepaliveTimer.bind(this.h5), 1e3)
    }, this.wsSocket.onclose = function () {
        console.log("wsSocket.onclose", this.h5), !0 === this.h5.bDisConnected ? console.log("wsSocket.onclose disconnect") : this.h5.bNeedReconnect = !0, this.h5.CleanupWebSocket(this.h5)
    }
}, H5sPlayerRTC.prototype.CleanupWebSocket = function (e) {
    console.log("CleanupWebSocket", e), clearInterval(e.keepaliveTimerId), e.emptyBuffCnt = 0, e.lastBuffTime = 0, e.buffTimeSameCnt = 0
}, H5sPlayerRTC.prototype.connect = function () {
    this.setupWebSocket(this._token), this.reconnectTimerId = setInterval(this.ReconnectFunction.bind(this), 3e3)
}, H5sPlayerRTC.prototype.disconnect = function () {
    console.log("disconnect", this), this.bDisConnected = !0, clearInterval(this.reconnectTimerId), null != this.wsSocket && (this.wsSocket.close(), this.wsSocket = null), console.log("disconnect", this)
};