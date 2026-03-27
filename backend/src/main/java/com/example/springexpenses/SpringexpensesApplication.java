package com.example.springexpenses;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing // habilita auditoria global
public class SpringexpensesApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringexpensesApplication.class, args);
	}

}
