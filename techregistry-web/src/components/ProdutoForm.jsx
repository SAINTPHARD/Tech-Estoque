/**
 * Arquivo: src/components/ProdutoForm.jsx
 * Responsabilidade: concentrar o formulario reutilizavel de criacao e edicao de produtos.
 * O que voce encontra aqui: estado local do formulario, validacao basica, parse de preco e envio para o componente pai.
 * Dica de manutencao: altere este arquivo quando campos, validacoes ou comportamento de submit mudarem.
 */

import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import './ProdutoForm.css';

const emptyForm = {
  nome: '',
  categoria: '',
  preco: '',
  quantidade: '',
};

function createFormState(initialValues) {
  if (!initialValues) {
    return emptyForm;
  }

  return {
    nome: initialValues.nome ?? '',
    categoria: initialValues.categoria ?? '',
    preco: formatCurrencyInputFromValue(initialValues.preco),
    quantidade: initialValues.quantidade?.toString() ?? '',
  };
}

function extractCurrencyDigits(value = '') {
  return value.replace(/\D/g, '');
}

function formatCurrencyInputFromValue(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return '';
  }

  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatCurrencyInput(value) {
  const digitsOnly = extractCurrencyDigits(value);

  if (!digitsOnly) {
    return '';
  }

  const numericValue = Number(digitsOnly) / 100;

  return formatCurrencyInputFromValue(numericValue);
}

function parseCurrencyInput(value) {
  const digitsOnly = extractCurrencyDigits(value);

  if (!digitsOnly) {
    return Number.NaN;
  }

  return Number(digitsOnly) / 100;
}

export default function ProdutoForm({
  initialValues = null,
  onSubmit,
  submitLabel = 'Cadastrar produto',
  busy = false,
}) {
  const [formState, setFormState] = useState(createFormState(initialValues));
  const [submitFeedback, setSubmitFeedback] = useState(null);

  useEffect(() => {
    setFormState(createFormState(initialValues));
    setSubmitFeedback(null);
  }, [initialValues]);

  const isEditing = Boolean(initialValues?.id);

  const handleChange = (fieldName, fieldValue) => {
    if (submitFeedback) {
      setSubmitFeedback(null);
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
    const preco = parseCurrencyInput(formState.preco);
    const quantidade = Number.parseInt(formState.quantidade, 10);

    if (!nome) {
      setSubmitFeedback({
        type: 'error',
        text: 'Informe o nome do produto antes de continuar.',
      });
      return;
    }

    if (!categoria) {
      setSubmitFeedback({
        type: 'error',
        text: 'Informe a categoria do produto para concluir o cadastro.',
      });
      return;
    }

    if (!Number.isFinite(preco) || preco <= 0) {
      setSubmitFeedback({
        type: 'error',
        text: 'Informe um preco valido maior que zero.',
      });
      return;
    }

    if (!Number.isInteger(quantidade) || quantidade < 0) {
      setSubmitFeedback({
        type: 'error',
        text: 'Informe uma quantidade inteira igual ou maior que zero.',
      });
      return;
    }

    const result = await onSubmit({
      nome,
      categoria,
      preco,
      quantidade,
    });

    if (!result?.ok) {
      setSubmitFeedback({
        type: 'error',
        text: result?.message || 'Nao foi possivel salvar o produto.',
        hint: result?.hint || '',
      });
      return;
    }

    setSubmitFeedback({
      type: 'success',
      text:
        result.message ||
        (isEditing
          ? 'Produto atualizado com sucesso.'
          : 'Produto cadastrado com sucesso e enviado para a lista atual.'),
      hint: result?.hint || '',
    });

    if (!isEditing) {
      setFormState(emptyForm);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`produto-form${isEditing ? ' is-editing' : ''}`}>
      {submitFeedback ? (
        <div className={`produto-form-feedback ${submitFeedback.type}`}>
          <strong>
            {submitFeedback.type === 'success'
              ? isEditing
                ? 'Atualizacao concluida.'
                : 'Cadastro concluido.'
              : 'Revise os dados.'}
          </strong>
          <span>{submitFeedback.text}</span>
          {submitFeedback.hint ? (
            <small className="produto-form-feedback-hint">{submitFeedback.hint}</small>
          ) : null}
        </div>
      ) : null}

      <fieldset
        className={`produto-form-fields${isEditing ? ' is-editing' : ''}`}
        disabled={busy}
      >
        <div className="produto-field produto-field-wide">
          <label htmlFor="produto-nome">Nome do produto</label>
          <input
            id="produto-nome"
            className="produto-input"
            value={formState.nome}
            onChange={(event) => handleChange('nome', event.target.value)}
            placeholder="Ex.: Notebook Dell Inspiron"
            required
          />
        </div>

        <div className="produto-field produto-field-category">
          <label htmlFor="produto-categoria">Categoria</label>
          <input
            id="produto-categoria"
            className="produto-input"
            value={formState.categoria}
            onChange={(event) => handleChange('categoria', event.target.value)}
            placeholder="Ex.: Perifericos"
            required
          />
        </div>

        <div className="produto-field produto-field-price">
          <label htmlFor="produto-preco">Preco</label>
          <input
            id="produto-preco"
            className="produto-input"
            value={formState.preco}
            onChange={(event) => handleChange('preco', formatCurrencyInput(event.target.value))}
            inputMode="numeric"
            placeholder="R$ 0,00"
            required
          />
        </div>

        <div className="produto-field produto-field-small">
          <label htmlFor="produto-quantidade">Quantidade</label>
          <input
            id="produto-quantidade"
            className="produto-input"
            value={formState.quantidade}
            onChange={(event) => handleChange('quantidade', event.target.value)}
            type="number"
            min="0"
            placeholder="0"
            required
          />
        </div>

        <div className="produto-form-actions">
          <button type="submit" className="produto-submit">
            {busy ? (
              <>
                <LoaderCircle size={16} className="produto-submit-spinner" />
                Salvando...
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
