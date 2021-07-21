import React, { createContext } from "react";
import { ICall } from "./SocketContextProvider";

interface ISocketContext {
  call: ICall;
  callAccepted: boolean;
  myVideo: React.MutableRefObject<HTMLVideoElement | null>;
  userVideo: React.MutableRefObject<HTMLVideoElement | null>;
  stream: MediaStream | undefined;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  callEnded: boolean;
  me: string;
  // eslint-disable-next-line no-unused-vars
  callUser: (id: string) => void;
  leaveCall: () => void;
  answerCall: () => void;
}

export const SocketContext = createContext<ISocketContext>({} as ISocketContext);
