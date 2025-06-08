package com.kenn.social_network.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.kenn.social_network.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public Map uploadFile(MultipartFile file, String folderName) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folderName
                ));
    }

    @Override
    public Map uploadVideo(MultipartFile file, String folderName) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "video",
                        "folder", folderName
                ));
    }

    @Override
    public String getFileUrl(MultipartFile file) {
        if (file != null) {
            String contentType = file.getContentType();

            if (contentType != null) {
                if (contentType.startsWith("image/")) {
                    Map avatarResult = null;
                    try {
                        avatarResult = uploadFile(file, "social-network/image");
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    return (String) avatarResult.get("secure_url");
                } else if (contentType.startsWith("video/")) {
                    Map avatarResult = null;
                    try {
                        avatarResult = uploadFile(file, "social-network/video");
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    return (String) avatarResult.get("secure_url");
                } else {
                    System.out.println("Không phải hình ảnh hay video");
                }
            }
        }
        return null;
    }
}
