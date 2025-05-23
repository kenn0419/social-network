package com.kenn.social_network.webrtc;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SdpMessage {

    private String type;

    private String sdp;

    private String callId;

    private String targetUserId;
}
