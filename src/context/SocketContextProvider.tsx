import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

import { SocketContext } from "./SocketContext";

const socket = io("http://localhost:5000");
// const socket = io("https://warm-wildwood-81069.herokuapp.com");

type StreamStateType = MediaStream;

export interface ICall {
  isReceivingCall: boolean;
  from: string;
  name: string;
  signal: string;
}

export const ContextProvider: React.FC = ({ children }) => {
  const [stream, setStream] = useState<StreamStateType>();
  const [me, setMe] = useState("");
  const [call, setCall] = useState<ICall>({} as ICall);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");

  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);

      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

    socket.on("me", (id) => setMe(id));

    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, [callEnded]);

  const answerCall = () => {
    setCallAccepted(true);
    setCallEnded(false);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id: string) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", { userToCall: id, signalData: data, from: me, name });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    connectionRef.current?.destroy();

    socket.disconnect();
    setStream(undefined);
    setMe("");
    setCall({} as ICall);
    setCallAccepted(false);
    setCallEnded(true);
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
