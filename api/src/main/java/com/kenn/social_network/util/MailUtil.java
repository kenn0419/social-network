package com.kenn.social_network.util;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class MailUtil {
    private final JavaMailSender javaMailSender;
    private final SpringTemplateEngine springTemplateEngine;

    public void sendMailSync(String to, String subject, String content, boolean isMultiPart, boolean isHtml) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();

        try {
            MimeMessageHelper mimeMessageHelper =new MimeMessageHelper(mimeMessage, isMultiPart, StandardCharsets.UTF_8.name());
            mimeMessageHelper.setTo(to);
            mimeMessageHelper.setSubject(subject);
            mimeMessageHelper.setText(content, isHtml);

            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            log.error("Error send email: {}", e.getMessage());
        }
    }

    @Async
    public void sendEmailFromTemplateSync(String to, String subject, String template, Map<String, String> value) {
        Context context = new Context();
        context.setVariable("title", value.get("title"));
        context.setVariable("verificationCode",
                "http://localhost:8080/api/v1/auth/verify-account/" + value.get("verificationCode"));

        String content = springTemplateEngine.process(template, context);

        sendMailSync(to, subject, content, false, true);
    }
}
