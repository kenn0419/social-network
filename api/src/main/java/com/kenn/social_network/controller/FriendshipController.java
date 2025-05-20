package com.kenn.social_network.controller;

import com.kenn.social_network.dto.request.friend_ship.FriendShipRequest;
import com.kenn.social_network.dto.response.success.SuccessResponse;
import com.kenn.social_network.service.FriendShipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/friend_ship")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendShipService friendShipService;

    @PutMapping("/respond")
    SuccessResponse<Void> respondFriendRequest(@Valid @RequestBody FriendShipRequest friendShipRequest) {
        friendShipService.respondFriendRequest(friendShipRequest);

        return SuccessResponse.<Void>builder()
                .statusCode(HttpStatus.ACCEPTED.value())
                .message("Respond friend ship request successfully!!!")
                .data(null)
                .build();
    }
}
