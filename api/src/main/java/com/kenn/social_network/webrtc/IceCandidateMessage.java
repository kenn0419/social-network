package com.kenn.social_network.webrtc;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IceCandidateMessage {

    private String sdpMid;

    private Integer sdpMLineIndex;

    private String candidate;

    private String callId;

    private String targetUserId;
}
