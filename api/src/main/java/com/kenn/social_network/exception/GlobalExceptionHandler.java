package com.kenn.social_network.exception;

import com.kenn.social_network.dto.response.error.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({
            MethodArgumentNotValidException.class
    })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse<?> handleArgumentException(Exception e, HttpServletRequest request) {
        if (e instanceof MethodArgumentNotValidException ex) {
            List<String> errors = new ArrayList<>();
            BindingResult bindingResult = ex.getBindingResult();
            List<FieldError> fieldErrors = bindingResult.getFieldErrors();
            fieldErrors.forEach(error -> errors.add(error.getDefaultMessage()));

            return ErrorResponse.<List<String>>builder()
                    .statusCode(HttpStatus.BAD_REQUEST.value())
                    .path(request.getRequestURI())
                    .timestamp(LocalDateTime.now())
                    .errors(errors)
                    .build();
        }
        return null;
    }

    @ExceptionHandler({
            UsernameNotFoundException.class,
            ExpiredTokenVerifyAccountException.class,
            EmailAlreadyExistsException.class,
            IdNotFoundException.class,
            AuthorizationException.class,
            PostNotFoundException.class,
            CommentNotFoundException.class,
            RefreshTokenInvalidException.class,
            GroupNotFoundException.class
    })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse<String> handleExpiredTokenVerifyAccount(Exception e, HttpServletRequest request) {
        return ErrorResponse.<String>builder()
                .statusCode(HttpStatus.BAD_REQUEST.value())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .errors(e.getMessage())
                .build();
    }
}
