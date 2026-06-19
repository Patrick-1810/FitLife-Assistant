import axios from "axios";

// Instância do Axios apontando para o seu backend FastAPI
const api = axios.create({
  baseURL: "http://localhost:8000", // Porta padrão da sua FastAPI externa
});

export const fitLifeService = {
  // Envia a mensagem do chat para o Llama 3.2
  enviarMensagemChat: async (message) => {
    try {
      const response = await api.post("/chat", { message });
      return response.data.response; // Retorna o texto puro vindo do Llama
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
  }
};