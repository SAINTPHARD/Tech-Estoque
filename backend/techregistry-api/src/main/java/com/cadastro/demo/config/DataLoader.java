/**
package com.cadastro.demo.config;

import java.util.List;

// Executa código quando o Spring Boot inicia
import org.springframework.boot.CommandLineRunner;
// Marca classe de configuração do Spring
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// Permite acessar arquivos da pasta resources
import org.springframework.core.io.ClassPathResource;

import com.cadastro.demo.entity.Tech;
import com.cadastro.demo.repository.TechRepository;
// Biblioteca que converte JSON em objetos Java
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration // Diz ao Spring que esta classe possui configurações
public class DataLoader {
//  esta classe serve para carregar/executar código quando a aplicação inicia
    // Bean executado automaticamente quando o projeto inicia
    @Bean
    CommandLineRunner loadData(TechRepository repo) {

        // Lambda executada na inicialização
        return args -> {

            // Objeto que transforma JSON em objetos Java
            ObjectMapper mapper = new ObjectMapper();

            // Lê o arquivo JSON e converte para uma lista de Tech
            List<Tech> techs = mapper.readValue(
                    new ClassPathResource("data.json").getInputStream(),
                    new TypeReference<List<Tech>>() {}
            );

            // Salva todos os objetos no banco
            repo.saveAll(techs);

            // Apenas para mostrar no console que funcionou
            System.out.println("Dados carregados no banco!");
        };
    }
}
*/