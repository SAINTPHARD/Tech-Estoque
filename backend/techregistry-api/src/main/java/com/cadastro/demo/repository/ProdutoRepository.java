package com.cadastro.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cadastro.demo.entity.Produto;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
//
	/**
	 * Não é necessario implementar nenhum código aqui
	 * 
	 * @Repository: Esta anotação indica que a classe é um componente de acesso a
	 *              dados, permitindo que o Spring a gerencie e a injete em outras
	 *              partes do sistema (como no Controller)
	 * 
	 *              JpaRepository<Produto, Long>: Estamos dizendo ao Spring que este
	 *              repositório gerencia a entidade Produto e que a chave primária
	 *              dela (o ID) é do tipo Long.
	 */

	/*
	 * Spring gera automaticamente : 
	 * save(), 
	 * findAll(), 
	 * findById(), 
	 * deleteById()
	 */
}
