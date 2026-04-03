/**
 * Arquivo: src/components/dashboard/ProductForm.jsx
 * Responsabilidade: centralizar o formulario de cadastro e edicao de produtos.
 * O que voce encontra aqui: estado local do formulario, validacao basica e envio para a pagina pai.
 * Quando mexer: altere este arquivo quando os campos do produto ou as regras de validacao mudarem.
 */

import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import './ProductForm.css';

const emptyForm = {
  nome: '',
  categoria: '',
  preco: '',
  quantidade: '',
};

function createFormState(initialValues) {
  // Preenche o formulario quando estamos editando um produto ja existente.
  if (!initialValues) {
    return emptyForm;
  }

  return {
    nome: initialValues.nome ?? '',
    categoria: initialValues.categoria ?? '',
    preco: Number(initialValues.preco || 0).toString(),
    quantidade: initialValues.quantidade?.toString() ?? '',
  };
}

export default function ProductForm({
  initialValues = null,
  onSubmit,
  submitLabel = 'Cadastrar produto',
  busy = false,
  onCancel,
}) {
  const [formState, setFormState] = useState(() => createFormState(initialValues));
  const [formError, setFormError] = useState('');

  useEffect(() => {
    // Sempre que o produto em edicao muda, o formulario precisa ser reidratado.
    setFormState(createFormState(initialValues));
    setFormError('');
  }, [initialValues]);

  const isEditing = Boolean(initialValues?.id);

  const handleChange = (fieldName, fieldValue) => {
    if (formError) {
      setFormError('');
    }

    setFormState((currentState) => ({
      ...currentState,
      [fieldName]: fieldValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nome = formState.nome.trim();
    const categoria = formState.categoria.trim();
    const preco = Number.parseFloat(formState.preco);
    const quantidade = Number.parseInt(formState.quantidade, 10);

    // Faz a validacao no frontend para evitar chamadas invalidas para a API.
    if (!nome) {
      setFormError('Informe o nome do produto antes de continuar.');
      return;
    }

    if (!categoria) {
      setFormError('Informe a categoria do produto para concluir o cadastro.');
      return;
    }

    if (!Number.isFinite(preco) || preco <= 0) {
      setFormError('Informe um preco valido maior que zero.');
      return;
    }

    if (!Number.isInteger(quantidade) || quantidade < 0) {
      setFormError('Informe uma quantidade inteira igual ou maior que zero.');
      return;
    }

    const result = await onSubmit?.({
      nome,
      categoria,
      preco,
      quantidade,
    });

    if (!result?.ok) {
      setFormError(result?.message || 'Nao foi possivel salvar o produto.');
      return;
    }

    setFormError('');

    if (!isEditing) {
      setFormState(emptyForm);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      {formError ? (
        <div className="form-feedback form-feedback-error">
          <strong>Revise os dados.</strong>
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="form-grid">
        <label className="form-field">
          <span>Nome</span>
          <input
            className="form-input"
            value={formState.nome}
            onChange={(event) => handleChange('nome', event.target.value)}
            placeholder="Ex.: Notebook Dell Inspiron"
            required
          />
        </label>

        <label className="form-field">
          <span>Categoria</span>
          <input
            className="form-input"
            value={formState.categoria}
            onChange={(event) => handleChange('categoria', event.target.value)}
            placeholder="Ex.: Perifericos"
            required
          />
        </label>

        <label className="form-field">
          <span>Preco</span>
          <input
            className="form-input"
            type="number"
            min="0.01"
            step="0.01"
            value={formState.preco}
            onChange={(event) => handleChange('preco', event.target.value)}
            placeholder="0.00"
            required
          />
        </label>

        <label className="form-field">
          <span>Quantidade</span>
          <input
            className="form-input"
            type="number"
            min="0"
            step="1"
            value={formState.quantidade}
            onChange={(event) => handleChange('quantidade', event.target.value)}
            placeholder="0"
            required
          />
        </label>
      </div>

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="secondary-button" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
        ) : null}

        <button type="submit" className="primary-button" disabled={busy}>
          {busy ? (
            <>
              <LoaderCircle size={16} className="button-spinner" />
              Salvando
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
