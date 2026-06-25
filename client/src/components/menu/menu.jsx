import React, { Fragment, useRef } from "react";
import { Bar, Plus, Xicon, Trash } from "../../assets/";
import { useDispatch, useSelector } from "react-redux";
import { addList, emptyAllRes } from "../../redux/messages";
import { activePage, removeChat } from "../../redux/history";
import { fitLifeService } from "../../services/api";

import logo from "../../assets/logo.png";
import "./style.scss";

const Menu = ({ changeColorMode }) => {
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const dispatch = useDispatch();

  const history = useSelector((state) => state.history) || [];
  const activeChatId = useSelector((state) => state.messages._id);

  const showMenuMd = () => {
    menuRef.current.classList.add("showMd");
    document.body.style.overflowY = "hidden";
  };

  const closeMenuMd = () => {
    menuRef.current.classList.remove("showMd");
    document.body.style.overflowY = "auto";
  };

  //  FUNÇÃO PARA CARREGAR UM CHAT ANTIGO
  const handleSelectChat = async (chatId) => {
    try {
      const numChatId = Number(chatId);
      const dadosChat = await fitLifeService.carregarMensagensChat(numChatId);
      
      // Envia as mensagens recuperadas para o Redux messages
      dispatch(addList(dadosChat));

      // Ativa a ordenação e marcação visual no historySlice
      dispatch(activePage(numChatId));
      
      // Fecha o menu caso esteja no mobile
      closeMenuMd();
    } catch (err) {
      console.error("Erro ao carregar chat selecionado:", err);
    }
  };

  const handleNewChat = () => {
    dispatch(emptyAllRes());
    closeMenuMd();
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir esta conversa?")) return;
    try {
      await fitLifeService.excluirChat(chatId);
      dispatch(removeChat(Number(chatId)));
      if (Number(activeChatId) === Number(chatId)) {
        dispatch(emptyAllRes());
      }
    } catch (err) {
      console.error("Erro ao excluir chat:", err);
    }
  };

  return (
    <Fragment>
      <header>
        <div className="start">
          <button onClick={showMenuMd} ref={btnRef}>
            <Bar />
          </button>
        </div>

        <div className="title">Nova conversa</div>

        <div className="end">
          <button onClick={handleNewChat}>
            <Plus />
          </button>
        </div>
      </header>

      <div className="menu" ref={menuRef}>
        {/* Topo do Menu: Logo e Título */}
        <div className="name-nutrutio">
          <img src={logo} alt="Logo nutritivo" />
          <div className="text-wrapper">
            <div className="title-nut">Nutrutio</div>
            <div className="text-nut">Chat nutricional</div>
          </div>
        </div>

        {/* Botão de Nova Conversa */}
        <div className="new-chat-container">
          <button
            className="button-menu"
            type="button"
            aria-label="new"
            onClick={handleNewChat}
          >
            <Plus />
            Nova conversa
          </button>
        </div>

        {/* Histórico de Conversas Dinâmico */}
        <div className="history-section">
          <div className="history-title">HISTÓRICO</div>
          <div className="history-list">
            {history.map((obj, key) => (
              <div
                key={key}
                className={`history-item ${Number(obj?.chatId) === Number(activeChatId) ? "active" : ""}`}
                onClick={() => handleSelectChat(obj?.chatId)}
              >
                <span className="history-item-title">{obj?.title || "Conversa antiga"}</span>
                <button
                  className="delete-btn"
                  title="Excluir conversa"
                  onClick={(e) => handleDeleteChat(e, obj?.chatId)}
                >
                  <Trash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé Fixo com a Dica */}
        <div className="menu-footer">
          <div className="dica-box">
            <div className="dica-header">
              <span>🍃 Dica</span>
            </div>
            <p className="dica-text">
              As respostas são informativas e não substituem um nutricionista.
            </p>
          </div>
        </div>
      </div>

      <div className="exitMenu">
        <button onClick={closeMenuMd}>
          <Xicon />
        </button>
      </div>
    </Fragment>
  );
};

export default Menu;