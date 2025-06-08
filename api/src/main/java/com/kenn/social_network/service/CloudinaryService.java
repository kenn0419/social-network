package com.kenn.social_network.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface CloudinaryService {

    Map uploadFile(MultipartFile file, String folderName) throws IOException;

    Map uploadVideo(MultipartFile file, String folderName) throws IOException;

    String getFileUrl(MultipartFile file);
}
