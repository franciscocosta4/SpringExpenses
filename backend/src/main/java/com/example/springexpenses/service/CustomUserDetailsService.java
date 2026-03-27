package com.example.springexpenses.service;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import com.example.springexpenses.model.User;
import com.example.springexpenses.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        //alinhamento: username = email
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new UsernameNotFoundException("User não encontrado");
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail()) // email como username
                .password(user.getPassword())
                .roles("USER") // simplificado
                .build();
    }
}