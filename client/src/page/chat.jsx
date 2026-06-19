import React, { useEffect, useReducer, useRef, useState } from "react";
import { Reload, Rocket, Stop } from "../assets";
import { Chat, New } from "../components";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { insertNew, livePrompt } from "../redux/messages";
import "./style.scss";
import { fitLifeService } from "../services/api";


const reducer = (state, { type, status }) => {
  switch (type) {
    case "chat":
      return {
        chat: status,
        loading: status,
        resume: status,
        actionBtns: false,
      };
    case "error":
      return {
        chat: true,
        error: status,
        resume: state.resume,
        loading: state.loading,
        actionBtns: state.actionBtns,
      };
    case "resume":
      return {
        chat: true,
        resume: status,
        loading: status,
        actionBtns: true,
      };
    default:
      return state;
  }
};

const Main = () => {
  const chatRef = useRef();
  const [status, stateAction] = useReducer(reducer, {
    chat: false,
    error: false,
    actionBtns: false,
  });

  useEffect(() => {
    stateAction({ type: "chat", status: false });
  }, []);

  return (
    <div className="main">
      <div className="contentArea">
        {status.chat ? <Chat ref={chatRef} error={status.error} /> : <New />}
      </div>

      <InputArea status={status} chatRef={chatRef} stateAction={stateAction} />
    </div>
  );
};

export default Main;

// --- COMPONENTE DA ÁREA DE INPUT ATUALIZADO ---
const InputArea = ({ status, chatRef, stateAction }) => {
  let textAreaRef = useRef();
  let fileInputRef = useRef(); // Referência para o input oculto de arquivo
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { prompt, content } = useSelector((state) => state.messages);
  
  // Estado para guardar o arquivo de imagem selecionado
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const handleInput = () => {
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.height =
          textAreaRef.current.scrollHeight + "px";
      }
    };
    textAreaRef.current?.addEventListener("input", handleInput);
    return () => textAreaRef.current?.removeEventListener("input", handleInput);
  }, []);

  // Manipula a seleção da imagem pelo botão
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file)); // Gera uma URL para mostrar um preview na tela
    }
  };

  // Limpa a imagem selecionada
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const FormHandle = async () => {
    // Permite enviar se tiver texto OU se tiver uma imagem selecionada
    if (prompt?.length > 0 || selectedImage) {
      stateAction({ type: "chat", status: true });

      let chatsId = Date.now();
      const mensagemUsuario = prompt || "Analisando imagem enviada...";

      // 1. Injeta a ação do usuário no Redux
      dispatch(
        insertNew({
          id: chatsId,
          content: "",
          prompt: mensagemUsuario,
        }),
      );

      chatRef?.current?.clearResponse();

      try {
        let responseContent = "";

        // CASO 1: O usuário enviou uma imagem (com ou sem texto)
        if (selectedImage) {
          // Chama o microsserviço de OCR enviando o arquivo real
          const ocrResult = await fitLifeService.enviarImagemOCR(selectedImage, true);
          responseContent = ocrResult.text;
          
          // Se o usuário também digitou alguma pergunta junto com a imagem, podemos juntar as duas respostas ou tratar
          if (prompt?.length > 0) {
            responseContent = `[Resultado da Análise da Imagem]:\n${responseContent}\n\n[Sobre a sua pergunta]:\n` + 
              await fitLifeService.enviarMensagemChat(`Com base nesta análise: ${responseContent}. Responda: ${prompt}`);
          }
          
          // Limpa a imagem após o envio bem-sucedido
          clearSelectedImage();
        } 
        // CASO 2: Apenas texto normal
        else {
          responseContent = await fitLifeService.enviarMensagemChat(mensagemUsuario);
        }

        // 2. Injeta a resposta estruturada vinda do backend no Redux
        dispatch(
          insertNew({
            _id: Date.now(),
            fullContent: responseContent,
            chatsId,
          }),
        );

        // 3. Ativa o efeito máquina de escrever na tela
        chatRef?.current?.loadResponse(stateAction, responseContent, chatsId);

        stateAction({
          type: "error",
          status: false,
        });
      } catch (err) {
        console.error("Falha ao processar requisição:", err);
        stateAction({
          type: "error",
          status: true,
        });
      }
    }
  };

  return (
    <div className="chat-input-wrapper">
      {!status.error ? (
        <div className="chat-input-container">
          
          {/* Preview da imagem selecionada antes de enviar */}
          {imagePreview && (
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px', padding: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <img src={imagePreview} alt="Preview" style={{ maxHeight: '80px', borderRadius: '6px' }} />
              <button 
                onClick={clearSelectedImage}
                style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                X
              </button>
            </div>
          )}

          <div className="chatActionsLg">
            {status.chat && content?.length > 0 && status.actionBtns && (
              <>
                {!status?.resume ? (
                  <button onClick={() => chatRef.current.loadResponse(stateAction)}>
                    <Reload /> Regenerar resposta
                  </button>
                ) : (
                  <button onClick={() => chatRef.current.stopResponse(stateAction)}>
                    <Stop /> Parar geração
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flexBody">
             
             <div className="input-box" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
  
  {/* Input de arquivo invisível */}
  <input 
    type="file" 
    accept="image/*" 
    ref={fileInputRef} 
    onChange={handleImageChange} 
    style={{ display: 'none' }} 
  />

  {/* Botão de Clipe posicionado perfeitamente no início da barra */}
  <button 
    className="clip-button" 
    type="button" 
    style={{
      background: 'transparent',
      border: 'none',
      padding: '0 8px 0 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      transition: 'transform 0.2s'
    }}
    onClick={() => fileInputRef.current.click()}
    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
  >
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={{ width: '20px', height: '20px', color: '#ff6b4a' }} // Cor laranja combinando com seu tema
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
  </button>

  <textarea
    placeholder="Pergunte sobre nutrição ou envie foto de uma tabela/prato..."
    ref={textAreaRef}
    value={prompt || ""}
    rows={1}
    onChange={(e) => {
      dispatch(livePrompt(e.target.value));
    }}
    style={{ flex: 1, paddingLeft: '4px' }} // Garante que o texto ocupe o resto do espaço
  />

  {!status?.loading ? (
    <button className="send-button" onClick={FormHandle}>
      <Rocket />
    </button>
  ) : (
    <div className="loading">
      <div className="dot" />
      <div className="dot-2 dot" />
      <div className="dot-3 dot" />
    </div>
  )}
</div>
          </div>

          <p className="input-disclaimer">
            Nutrutio fornece orientações gerais e não substitui um nutricionista.
          </p>
        </div>
      ) : (
        <div className="error-container">
          <p>Houve um erro ao gerar a resposta.</p>
          <button onClick={FormHandle}>
            <Reload /> Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
};
