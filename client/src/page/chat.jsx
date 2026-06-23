import React, { useEffect, useReducer, useRef, useState } from "react";
import { Reload, Rocket, Stop } from "../assets";
import { Chat, New } from "../components";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { insertNew, livePrompt } from "../redux/messages";
import { addHistory } from "../redux/history"; 
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
  const dispatch = useDispatch();
  
  const { _id, all } = useSelector((state) => state.messages);

  const [status, stateAction] = useReducer(reducer, {
    chat: false,
    error: false,
    actionBtns: false,
  });

  useEffect(() => {
    const buscarDadosIniciais = async () => {
      try {
        const historico = await fitLifeService.buscarHistorico();
        dispatch(addHistory(historico));
      } catch (err) {
        console.error("Erro ao carregar histórico lateral:", err);
      }
    };
    buscarDadosIniciais();
  }, [dispatch]);

  useEffect(() => {
    if (!all || all.length === 0) {
      stateAction({ type: "chat", status: false });
    } else {
      stateAction({ type: "chat", status: true });
    }
  }, [all]);

  return (
    <div className="main">
      <div className="contentArea">
        {status.chat ? <Chat ref={chatRef} error={status.error} /> : <New />}
      </div>

      <InputArea status={status} chatRef={chatRef} stateAction={stateAction} currentChatId={_id} />
    </div>
  );
};

export default Main;

const InputArea = ({ status, chatRef, stateAction, currentChatId }) => {
  let textAreaRef = useRef();
  let fileInputRef = useRef(); 
  const dispatch = useDispatch();

  const { prompt, content } = useSelector((state) => state.messages);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const handleInput = () => {
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
      }
    };
    textAreaRef.current?.addEventListener("input", handleInput);
    return () => textAreaRef.current?.removeEventListener("input", handleInput);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const FormHandle = async () => {
    if (prompt?.length > 0 || selectedImage) {
      stateAction({ type: "chat", status: true });

      let backendEnvioId = currentChatId ? Number(currentChatId) : null;
      let chatsIdProvisorio = currentChatId ? Number(currentChatId) : Date.now();
      
      const mensagemUsuario = prompt || "Analisando imagem enviada...";
      
      // Armazena o link do preview local para limpar o estado de input sem sumir da tela de chat
      const localImageBlob = imagePreview; 

      // 1. Injeta localmente os dados imediatamente (Texto + Imagem Blob)
      dispatch(
        insertNew({
          chatsId: chatsIdProvisorio,
          content: "",
          prompt: mensagemUsuario,
          image: localImageBlob, // Enviando o link temporário para o Redux Chat renderizar!
        }),
      );

      chatRef?.current?.clearResponse();
      
      // Limpa imediatamente o container de upload do input para dar o feedback visual de envio
      clearSelectedImage(); 

      try {
        let responseContent = "";
        let backendChatId = currentChatId;

        if (selectedImage) {
          // Passa o arquivo "selectedImage" original que guardamos no escopo da função
          const ocrResult = await fitLifeService.enviarImagemOCR(selectedImage, true);
          responseContent = ocrResult.text;
          
          if (prompt?.length > 0) {
            const chatResult = await fitLifeService.enviarMensagemChat(
              `Com base nesta análise: ${responseContent}. Responda: ${prompt}`,
              backendEnvioId
            );
            responseContent = `[Resultado da Análise da Imagem]:\n${responseContent}\n\n[Sobre a sua pergunta]:\n` + chatResult.response;
            backendChatId = chatResult.chat_id;
          }
        } 
        else {
          const chatResult = await fitLifeService.enviarMensagemChat(mensagemUsuario, backendEnvioId);
          responseContent = chatResult.response;
          backendChatId = chatResult.chat_id; 
        }

        // 2. Sincroniza a resposta mantendo a imagem vinculada
        dispatch(
          insertNew({
            _id: Number(backendChatId),
            fullContent: responseContent,
            chatsId: chatsIdProvisorio,
            image: localImageBlob
          }),
        );

        chatRef?.current?.loadResponse(stateAction, responseContent, chatsIdProvisorio);

        const historicoAtualizado = await fitLifeService.buscarHistorico();
        dispatch(addHistory(historicoAtualizado));

        stateAction({ type: "error", status: false });
      } catch (err) {
        console.error("Falha ao processar requisição:", err);
        stateAction({ type: "error", status: true });
      }
    }
  };
  
  return (
    <div className="chat-input-wrapper">
      {!status.error ? (
        <div className="chat-input-container">
          
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
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />

              <button 
                className="clip-button" 
                type="button" 
                style={{ background: 'transparent', border: 'none', padding: '0 8px 0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', transition: 'transform 0.2s' }}
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
                  style={{ width: '20px', height: '20px', color: '#ff6b4a' }}
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
                style={{ flex: 1, paddingLeft: '4px' }} 
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