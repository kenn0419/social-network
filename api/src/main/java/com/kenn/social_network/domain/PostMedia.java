package com.kenn.social_network.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kenn.social_network.enums.MediaType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_media")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostMedia extends BaseEntity{

    @Column(name = "url")
    private String url;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private MediaType type;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;
}
