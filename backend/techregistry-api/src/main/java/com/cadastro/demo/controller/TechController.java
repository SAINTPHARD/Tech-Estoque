
/**	
 * Controller 
 

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cadastro.demo.entity.Tech;
import com.cadastro.demo.repository.TechRepository;

// Indica que essa classe é um controlador REST
@RestController 

// Define a URL base da API
@RequestMapping("/techs")
public class TechController {

    // Repository que acessa o banco
    private final TechRepository repo;

    // Injeção de dependência pelo construtor
    public TechController(TechRepository repo) {
        this.repo = repo;
    }

    // Endpoint GET para listar tecnologias
    @GetMapping
    public List<Tech> list(){

        // Busca todas as tecnologias no banco
        return repo.findAll();
    }
}
*/