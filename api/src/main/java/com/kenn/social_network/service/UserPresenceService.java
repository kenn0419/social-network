package com.kenn.social_network.service;

import com.kenn.social_network.domain.UserPresence;
import com.kenn.social_network.enums.UserPresenceStatusEnum;

import java.util.List;
import java.util.Map;

public interface UserPresenceService {

    void updateUserPresence(long userId, UserPresenceStatusEnum userPresenceStatus);

    Map<Long, UserPresence> getUsersPresence(List<Long> userIds);
}
