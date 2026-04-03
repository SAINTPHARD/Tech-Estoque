package com.cadastro.demo;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Locale;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.cadastro.demo.repository.ProdutoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class TechregistryfullStackApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private ProdutoRepository produtoRepository;

	@BeforeEach
	void cleanDatabase() {
		produtoRepository.deleteAll();
	}

	@Test
	void contextLoads() {
	}

	@Test
	void shouldCreateUpdateAdjustListAndDeleteProduct() throws Exception {
		Long produtoId = criarProduto("Monitor Gamer", "Monitores", 1299.90, 5);

		mockMvc.perform(get("/api/produtos"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].nome").value("Monitor Gamer"))
				.andExpect(jsonPath("$[0].categoria").value("Monitores"))
				.andExpect(jsonPath("$[0].quantidade").value(5));

		mockMvc.perform(put("/api/produtos/{id}", produtoId)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "nome": "Monitor Gamer UltraWide",
						  "categoria": "Monitores Premium",
						  "preco": 1499.90,
						  "quantidade": 7
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.nome").value("Monitor Gamer UltraWide"))
				.andExpect(jsonPath("$.categoria").value("Monitores Premium"))
				.andExpect(jsonPath("$.preco").value(1499.90))
				.andExpect(jsonPath("$.quantidade").value(7));

		mockMvc.perform(patch("/api/produtos/{id}/estoque", produtoId)
				.param("delta", "-2"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.quantidade").value(5));

		mockMvc.perform(delete("/api/produtos/{id}", produtoId))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/produtos"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	void shouldReturnValidationErrorWhenPayloadIsInvalid() throws Exception {
		mockMvc.perform(post("/api/produtos")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "nome": " ",
						  "categoria": " ",
						  "preco": -10,
						  "quantidade": -1
						}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.details", hasItem("nome: O nome do produto e obrigatorio.")))
				.andExpect(jsonPath("$.details", hasItem("categoria: A categoria do produto e obrigatoria.")))
				.andExpect(jsonPath("$.details", hasItem("preco: O preco do produto deve ser um valor positivo.")))
				.andExpect(jsonPath("$.details", hasItem("quantidade: A quantidade do produto nao pode ser negativa.")));
	}

	@Test
	void shouldReturnNotFoundWhenProductDoesNotExist() throws Exception {
		mockMvc.perform(get("/api/produtos/{id}", 999))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("Produto com ID 999 nao encontrado."));
	}

	private Long criarProduto(String nome, String categoria, double preco, int quantidade) throws Exception {
		String payload = String.format(Locale.US, """
				{
				  "nome": "%s",
				  "categoria": "%s",
				  "preco": %.2f,
				  "quantidade": %d
				}
				""", nome, categoria, preco, quantidade);

		MvcResult result = mockMvc.perform(post("/api/produtos")
				.contentType(MediaType.APPLICATION_JSON)
				.content(payload))
				.andExpect(status().isCreated())
				.andReturn();

		JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
		return node.get("id").asLong();
	}
}
