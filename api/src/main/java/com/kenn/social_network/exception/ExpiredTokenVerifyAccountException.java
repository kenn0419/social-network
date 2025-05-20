package com.kenn.social_network.exception;

public class ExpiredTokenVerifyAccountException extends RuntimeException{
    public ExpiredTokenVerifyAccountException(String message) {
        super(message);
    }
}
