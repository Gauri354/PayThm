package com.paythm.paythm_api.dto;

import lombok.Data;

@Data
public class UserLoginRequest {
    private String email;
    private String password;
}
