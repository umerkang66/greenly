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
    onLeave: () => void;
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
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-lg font-medium">Joining meeting...</p>
            </div>
        );
    }

    return (
        <StreamVideo client={client}>
            <StreamTheme className="h-screen w-full bg-black">
                <StreamCall call={call}>
                    <MyUILayout onLeave={onLeave} />
                </StreamCall>
            </StreamTheme>
        </StreamVideo>
    );
}

function MyUILayout({ onLeave }: { onLeave: () => void }) {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();

    if (callingState !== CallingState.JOINED) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-lg font-medium">Connecting to room...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col">
            <div className="flex-1 relative">
                <SpeakerLayout participantsBarPosition="bottom" />
                <div className="absolute top-4 right-4">
                    <CallStatsButton />
                </div>
            </div>

            <CallControls onLeave={onLeave} />
        </div>
    );
}
