import React, {
  forwardRef,
  Fragment,
  useImperativeHandle,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { insertNew } from "../../redux/messages";
import ReactMarkdown from "react-markdown";
import "./style.scss";
import logo from "../../assets/logo.png";

const Chat = forwardRef(({ error, resume }, ref) => {
  const dispatch = useDispatch();
  const contentRef = useRef();
  const { messages } = useSelector((state) => state);
  const { latest, content, all } = messages;

  const loadResponse = (
    stateAction,
    response = content,
    chatsId = latest?.id,
  ) => {
    clearInterval(window.interval);
    stateAction({ type: "resume", status: true });
    contentRef?.current?.classList?.add("blink");

    let index = 0;

    window.interval = setInterval(() => {
      if (index < response.length && contentRef?.current) {
        if (index === 0) {
          dispatch(insertNew({ chatsId, content: response.charAt(index) }));
          contentRef.current.innerHTML = response.charAt(index);
        } else {
          dispatch(
            insertNew({
              chatsId,
              content: response.charAt(index),
              resume: true,
            }),
          );
          contentRef.current.innerHTML += response.charAt(index);
        }
        index++;
      } else {
        stopResponse(stateAction);
      }
    }, 20);
  };

  const stopResponse = (stateAction) => {
    if (contentRef?.current) {
      contentRef.current.classList.remove("blink");
    }
    stateAction({ type: "resume", status: false });
    clearInterval(window.interval);
  };

  useImperativeHandle(ref, () => ({
    stopResponse,
    loadResponse,
    clearResponse: () => {
      if (contentRef?.current) {
        contentRef.current.innerHTML = "";
        contentRef?.current?.classList.add("blink");
      }
    },
  }));

  return (
    <div className="Chat">
      {all
        ?.filter((obj) => {
          return !obj.id ? true : obj?.id !== latest?.id;
        })
        ?.map((obj, key) => {
          return (
            <Fragment key={key}>
              <div className="qs">
                <div className="acc">U</div>
                <div className="txt">
                  {obj?.image && (
                    <div className="chat-img-preview">
                      <img
                        src={obj.image}
                        alt="Upload do usuário"
                        style={{ maxWidth: "200px", borderRadius: "8px", marginBottom: "8px" }}
                      />
                    </div>
                  )}
                  {obj?.prompt}
                </div>
              </div>

              <div className="res">
                <div className="icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={logo} alt="Nutrutio" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div className="txt">
                  <div className="markdown-body">
                    <ReactMarkdown>{obj?.content || ""}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}

      {latest?.prompt?.length > 0 && (
        <Fragment>
          <div className="qs">
            <div className="acc">U</div>
            <div className="txt">
              {latest?.image && (
                <div className="chat-img-preview">
                  <img
                    src={latest.image}
                    alt="Enviando..."
                    style={{ maxWidth: "200px", borderRadius: "8px", marginBottom: "8px", opacity: 0.8 }}
                  />
                </div>
              )}
              {latest?.prompt}
            </div>
          </div>

          <div className="res">
            <div className="icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={logo} alt="Nutrutio" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              {error && <span>!</span>}
            </div>
            <div className="txt">
              {error ? (
                <div className="error">
                  Algo deu errado. Se o problema persistir, por favor tente novamente mais tarde.
                </div>
              ) : (
                <>
                  <span ref={contentRef} style={{ display: "none" }} />
                  {latest?.content && (
                    <div className="markdown-body">
                      <ReactMarkdown>{latest.content}</ReactMarkdown>
                    </div>
                  )}
                  {resume && !latest?.content && (
                    <span className="blink" />
                  )}
                </>
              )}
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
});

export default Chat;
