package com.example.springexpenses.controller.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import com.example.springexpenses.model.User;
import com.example.springexpenses.repository.UserRepository;

@RestController
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserRepository ur, PasswordEncoder pe, AuthenticationManager am) {
        this.userRepository = ur;
        this.passwordEncoder = pe;
        this.authenticationManager = am;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        // Criptografar password antes de salvar
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok("User criado");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        user.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Guarda o contexto NA sessão — isto é o que faltava
        HttpSession session = request.getSession(true);
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());

        return ResponseEntity.ok("Login com sucesso");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<String> getDashboardData(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Não autorizado");
        }
        return ResponseEntity.ok("Bem-vindo, " + authentication.getName() + "! Estes são os teus dados privados.");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {

        // Invalidar sessão
        request.getSession().invalidate();

        // Limpar contexto
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok("Logout feito");
    }
}