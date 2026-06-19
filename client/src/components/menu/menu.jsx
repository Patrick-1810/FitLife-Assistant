import React, { Fragment, useRef, useState } from "react";
import { Bar, Plus, Message, Xicon } from "../../assets/";

import logo from "../../assets/logo.png";
import "./style.scss";

const Menu = ({ changeColorMode }) => {
  let path = window.location.pathname;

  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Exemplo de histórico simulando o comportamento da imagem (duas conversas)
  const history = [{ chatId: "1", prompt: "Nova conversa", active: true }];

  const showMenuMd = () => {
    menuRef.current.classList.add("showMd");
    document.body.style.overflowY = "hidden";
  };

  return (
    <Fragment>
      <header>
        <div className="start">
          <button onClick={showMenuMd} ref={btnRef}>
            <Bar />
          </button>
        </div>

        <div className="title">New Chat</div>

        <div className="end">
          <button
            onClick={() => {
              if (path.includes("/chat")) {
                window.location.href = "/";
              } else {
                window.location.href = "/chat";
              }
            }}
          >
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
            onClick={() => {
              if (path.includes("/chat")) {
                window.location.href = "/";
              } else {
                window.location.href = "/chat";
              }
            }}
          >
            <Plus />
            Nova conversa
          </button>
        </div>

        {/* Histórico de Conversas */}
        <div className="history-section">
          <div className="history-title">HISTÓRICO</div>
          <div className="history-list">
            {history?.map((obj, key) => (
              <button
                key={key}
                className={`history-item ${obj?.active ? "active" : ""}`}
                onClick={() => {
                  // Insira sua lógica de navegação aqui se necessário
                  window.location.href = `/chat/${obj?.chatId}`;
                }}
              >
                {obj?.prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Rodapé Fixo com a Dica */}
        <div className="menu-footer">
          <div className="dica-box">
            <div className="dica-header">
              {/* Se tiver um ícone de folha na folha de assets, adicione aqui */}
              <span>🍃 Dica</span>
            </div>
            <p className="dica-text">
              As respostas são informativas e não substituem um nutricionista.
            </p>
          </div>
        </div>
      </div>

      <div className="exitMenu">
        <button>
          <Xicon />
        </button>
      </div>
    </Fragment>
  );
};

export default Menu;
