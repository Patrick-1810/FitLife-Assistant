import React, { memo } from "react";
import { useDispatch } from "react-redux";
import logo from "../../assets/logo.png";
import { livePrompt } from "../../redux/messages";
import "./style.scss";

const New = memo(() => {
  const dispatch = useDispatch();

  const suggestions = [
    {
      text: "Monte um café da manhã rico em proteína",
      prompt: "Monte um café da manhã rico em proteína",
    },
    {
      text: "Como reduzir açúcar sem perder o sabor?",
      prompt: "Como reduzir açúcar sem perder o sabor?",
    },
    {
      text: "Ideias de lanches saudáveis para o trabalho",
      prompt: "Ideias de lanches saudáveis para o trabalho",
    },
    {
      text: "Quanta água devo beber por dia?",
      prompt: "Quanta água devo beber por dia?",
    },
  ];

  return (
    <div className="New">
      {/* Cabeçalho de Boas-Vindas */}
      <div className="welcome-container">
        <img className="logo" src={logo} alt="Logo do Nutrutio" />
        <h1 className="title">
          Olá, eu sou o <span>Nutrutio</span>
        </h1>
        <p className="subtitle">
          Pergunte sobre cardápios, substituições, hidratação ou hábitos. Estou
          aqui para te ajudar a comer melhor — sem dietas mágicas.
        </p>
      </div>

      {/* Grid de Sugestões / Cards */}
      <div className="suggestions-grid">
        {suggestions.map((item, index) => (
          <button
            key={index}
            className="suggestion-card"
            onClick={() => dispatch(livePrompt(item.prompt))}
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  );
});

export default New;
