import axios from "axios";

// Instância do Axios apontando para o seu backend FastAPI
const api = axios.create({
  baseURL: "http://localhost:8000", // Porta padrão da sua FastAPI externa
});

export const fitLifeService = {
  // Envia a mensagem do chat para o backend passando o chatId opcional
  enviarMensagemChat: async (message, chatId = null) => {
    try {
      const response = await api.post("/chat", { 
        message, 
        chat_id: chatId // Passa o ID para o backend salvar na mesma conversa
      });
      return response.data; // Retorna o objeto completo: { response: "...", source: "...", chat_id: 123 }
    } catch (error) {
      console.error("Erro na requisição de chat:", error);
      throw error;
    }
  },

  // Envia a imagem para o endpoint OCR
  enviarImagemOCR: async (fileObject, nutritionMode = true) => {
    try {
      const formData = new FormData();
      formData.append("file", fileObject);

      const response = await api.post(`/ocr?nutrition_mode=${nutritionMode}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data; // Retorna { text: "...", mode: "..." }
    } catch (error) {
      console.error("Erro na requisição de OCR:", error);
      throw error;
    }
  },

  // BUSCA O HISTÓRICO COMPLETO (Para alimentar a barra lateral / historySlice)
  buscarHistorico: async () => {
    try {
      const response = await api.get("/history");
      return response.data; // Retorna a lista de chats: [{ chatId: 123, title: "...", active: false }]
    } catch (error) {
      console.error("Erro ao buscar histórico de conversas:", error);
      throw error;
    }
  },

  // CARREGA AS MENSAGENS DE UM CHAT ESPECÍFICO (Para alimentar o messagesSlice)
  carregarMensagensChat: async (chatId) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao carregar mensagens do chat ${chatId}:`, error);
      throw error;
    }
  },

  // EXCLUI UM CHAT E SUAS MENSAGENS
  excluirChat: async (chatId) => {
    try {
      const response = await api.delete(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir chat ${chatId}:`, error);
      throw error;
    }
  }
};