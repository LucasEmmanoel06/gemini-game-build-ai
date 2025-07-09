const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const promptInput = document.getElementById('promptInput')
const askButton = document.getElementById('askButton')
const aiOutput = document.getElementById('aiOutput')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

const perguntarAI = async (prompt, game, apiKey) => {
  const model = "gemini-2.5-flash"
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const pergunta = `
  ## Especialidade
  Você é um assistente especialista no jogo ${game}.

  ## Tarefa
  Com seu vasto conhecimento do jogo, responda o usuário de acordo com o pedido dele.

  ## Regras
  1. Se você não sabe a resposta, responda com "Não sei". Não invente informações/respostas.
  2. Se o usuário fizer uma pergunta/pedir build de um jogo que você não é especialista, responda que não tem conhecimento do jogo.
  3. Sempre elabore suas respostas de acordo com o idioma que o usuario te perguntou, por exemplo: Se ele te perguntou em português, use apenas termos em nome de itens/perks em português, para ele não vai importar o nome original dos itens/perks
  4. Você tem o recurso de pesquisar builds na internet para melhorar sua resposta.
  5. **O Limite de caracteres para a resposta é 550, não passe disso!**
  6. Sem saudações ou despedidas

  ## Resposta
  Sua resposta deve conter APENAS os seguintes tópicos:
  ### Build:
  - Armas
  - Perks
  - etc...

  ### Estrátégia:
  A jogabilidade para ser efetivo com a build montada.

  ### Dicas:
  Alguns conhecimentos que podem ser úteis para a gameplay (no maximo 3 dicas)

  ---
  Finalmente, seguindo todas as instruções especificadas, responda o pedido do usuário: ${prompt}
  `
  // Regra para jogos online:
  // 4. Considere a data atual ${new Date().toLocaleDateString()}, com base na data, faça pesquisas atualizadas sobre o patch atual.

  const contents = [{
    parts: [{
      text: pergunta
    }]
  }]

  const tools = [{
    google_search: {}
  }]

  //chamada API
  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })
  const data = await response.json()
  console.log({data})
  return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const game = gameSelect.value
  const prompt = promptInput.value

  if(apiKey == '' || game == '' || prompt == '' ) {
    alert('Por favor, preencha todos os campos')
    return
  }

  askButton.disabled = true
  askButton.textContent = 'Thinking...'
  askButton.classList.add('loading')

  try {
    const text = await perguntarAI(prompt, game, apiKey)
    aiOutput.querySelector('.response-content').innerHTML = markdownToHTML(text)
    aiOutput.classList.remove('hidden')
  } catch(error) {
    console.log('Erro:', error)
  } finally {
    askButton.disabled = false
    askButton.textContent = "Submit"
    askButton.classList.remove('loading')
  }

}
form.addEventListener('submit', enviarFormulario)