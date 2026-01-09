"use client";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
    Call,
    CallControls,
    CallParticipantsList,
    CallStatsButton,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    StreamVideo,
    StreamVideoClient,
    useCallStateHooks,
    CallingState,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Loader2, AlertCircle } from "lucide-react";

interface MeetingRoomProps {
    meetingId: string;
    token: string;
    apiKey: string;
    onLeave: (endForAll?: boolean) => void;
}

export function MeetingRoom({ meetingId, token, apiKey, onLeave }: MeetingRoomProps) {
    const { data: session } = useSession();
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);

    useEffect(() => {
        if (!session?.user || !token || !apiKey) return;

        const userUser = {
            id: session.user.id,
            name: session.user.name || "User",
            image: session.user.image || undefined,
        };

        const _client = new StreamVideoClient({ apiKey, user: userUser, token });
        const _call = _client.call("default", meetingId);

        _call.join({ create: true })
            .then(() => {
                setClient(_client);
                setCall(_call);
            })
            .catch((err) => {
                console.error("Failed to join call", err);
            });

        return () => {
            _call.leave().catch(() => { });
            _client.disconnectUser().catch(() => { });
            setClient(null);
            setCall(null);
        };
    }, [session, token, apiKey, meetingId]);

    if (!client || !call) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-lg font-medium">Joining meeting...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black">
            <StreamVideo client={client}>
                <StreamTheme className="h-full w-full">
                    <StreamCall call={call}>
                        <MyUILayout onLeave={onLeave} />
                    </StreamCall>
                </StreamTheme>
            </StreamVideo>
        </div>
    );
}

function MyUILayout({ onLeave }: { onLeave: (endForAll?: boolean) => void }) {
    const { useCallCallingState, useCallCreatedBy } = useCallStateHooks();
    const callingState = useCallCallingState();
    const createdBy = useCallCreatedBy();
    const { data: session } = useSession();
    const isHost = createdBy?.id === session?.user?.id;

    if (callingState !== CallingState.JOINED) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-black text-white gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-lg font-medium">Connecting to room...</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col relative">
            <div className="flex-1 relative">
                <SpeakerLayout participantsBarPosition="bottom" />
                <div className="absolute top-4 right-4 flex gap-2">
                    <CallStatsButton />
                    {isHost && (
                        <button
                            onClick={() => onLeave(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-colors flex items-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4" />
                            End Meeting for All
                        </button>
                    )}
                </div>
            </div>

            <CallControls onLeave={() => onLeave(false)} />
        </div>
    );
}
