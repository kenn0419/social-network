package com.kenn.social_network.service.impl;

import com.kenn.social_network.domain.Friendship;
import com.kenn.social_network.domain.Notification;
import com.kenn.social_network.domain.User;
import com.kenn.social_network.domain.UserPresence;
import com.kenn.social_network.dto.request.friend_ship.FriendShipRequest;
import com.kenn.social_network.dto.response.friend_ship.FriendShipResponse;
import com.kenn.social_network.dto.response.user.FriendWithStatusResponse;
import com.kenn.social_network.dto.response.user.UserResponse;
import com.kenn.social_network.enums.FriendShipActionStatus;
import com.kenn.social_network.enums.FriendshipStatus;
import com.kenn.social_network.enums.NotificationType;
import com.kenn.social_network.exception.FriendShipNotFoundException;
import com.kenn.social_network.exception.UserNotFoundException;
import com.kenn.social_network.repository.FriendShipRepository;
import com.kenn.social_network.repository.NotificationRepository;
import com.kenn.social_network.repository.UserRepository;
import com.kenn.social_network.service.FriendShipService;
import com.kenn.social_network.service.NotificationService;
import com.kenn.social_network.service.UserPresenceService;
import com.kenn.social_network.util.ConvertUtil;
import com.kenn.social_network.util.MessageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FriendShipServiceImpl implements FriendShipService {

    private final MessageUtil messageUtil;
    private final ConvertUtil convertUtil;
    private final NotificationService notificationService;
    private final UserPresenceService userPresenceService;
    private final UserRepository userRepository;
    private final FriendShipRepository friendShipRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public List<FriendShipResponse> fetchAllFriendShipRequest() {
        return fetchAllFriendShips(FriendshipStatus.PENDING);
    }

    @Override
    public List<UserResponse> fetchAllFriends() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<Friendship> friendships = friendShipRepository.findAllFriendships(currentUser.getId());
        return friendships.stream().map(item -> {
            User user = item.getRequester().getId().equals(currentUser.getId()) ? item.getAddressee() : item.getRequester();
            return convertUtil.toUserResponse(user);
        }).toList();
    }

    @Override
    public void respondFriendRequest(FriendShipRequest friendShipRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        User requester = userRepository.findById(friendShipRequest.getRequesterId())
                .orElseThrow(() -> new UserNotFoundException(messageUtil.get("user.id.not-found")));

        Friendship friendShip = friendShipRepository.findByRequesterAndAddressee(requester, currentUser)
                .orElseThrow(() -> new FriendShipNotFoundException("Friendship not found"));

        if (friendShip.getStatus() != FriendshipStatus.PENDING) {
            throw new IllegalStateException("Friendship is not in pending state");
        }

        if (friendShipRequest.getFriendShipActionStatus() == FriendShipActionStatus.ACCEPT) {
            friendShip.setStatus(FriendshipStatus.ACCEPTED);
            friendShipRepository.save(friendShip);
            notificationService.respondFriendRequestNotification(currentUser, requester, NotificationType.FRIEND_ACCEPT);
            notificationRepository.deleteBySenderAndReceiver(requester.getId(), currentUser.getId());
        }else if (friendShipRequest.getFriendShipActionStatus() == FriendShipActionStatus.REJECT) {
            friendShipRepository.delete(friendShip);
        }
    }

    @Override
    public List<FriendWithStatusResponse> fetchAllFriendsWithStatus() {
        List<UserResponse> friends = fetchAllFriends();
        List<Long> friendIds = friends.stream().map(UserResponse::getId).toList();
        Map<Long, UserPresence> presenceMap = userPresenceService.getUsersPresence(friendIds);

        return friends.stream().map(friend -> {
            FriendWithStatusResponse friendWithStatusResponse = FriendWithStatusResponse.builder()
                    .userResponse(friend)
                    .build();
            UserPresence presence = presenceMap.get(friend.getId());
            if (presence != null) {
                friendWithStatusResponse.setUserPresenceStatus(presence.getUserPresenceStatus());
                friendWithStatusResponse.setLastActiveAt(presence.getLastActiveAt());
            }

            return friendWithStatusResponse;
        }).toList();
    }

    @Override
    public void changeFriendShipStatus(long userId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        User addressee = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(messageUtil.get("user.id.not-found")));

        Optional<Friendship> friendshipOptional = friendShipRepository.findByRequesterAndAddressee(currentUser, addressee);
        if (friendshipOptional.isPresent()) {
            Friendship existFriendship = friendshipOptional.get();
            friendShipRepository.delete(existFriendship);
        } else {
            Friendship newFriendship = Friendship.builder()
                    .requester(currentUser)
                    .addressee(addressee)
                    .status(FriendshipStatus.PENDING)
                    .build();
            friendShipRepository.save(newFriendship);
            notificationService.respondFriendRequestNotification(currentUser, addressee, NotificationType.FRIEND_REQUEST);
        }
    }

    private List<FriendShipResponse> fetchAllFriendShips(FriendshipStatus status) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Friendship> friendships = friendShipRepository.findAllByAddresseeAndStatus(
                currentUser,
                status,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
        return friendships.stream().map(friendship -> {
            UserResponse requesterResponse = convertUtil.toUserResponse(friendship.getRequester());
            UserResponse addresseeResponse = convertUtil.toUserResponse(currentUser);

            return FriendShipResponse.builder()
                    .requester(requesterResponse)
                    .addressee(addresseeResponse)
                    .friendshipStatus(friendship.getStatus())
                    .build();
        }).toList();
    }
}
