import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPalette, faForwardStep, faPlay, faPause,
  faFilm, faBars, faVolumeHigh, faTrash,
  faPaperPlane, faRightFromBracket, faPlus,
  faPlug, faGear, faLanguage, faRepeat, faVolumeXmark,
  faXmark, faAnglesLeft, faAnglesRight, faMusic,
  faExpand, faCompress, faCheck, faChevronRight, faLock
} from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"

import {
  protected_, logout, createSection, getSection,
  getHistory, deleteSection, chatbot, chatbotV2, chatbotNonUser,
  getUser, deleteSectionNonUser, testConnect
} from "./api/api"

import THEMES from "./Themes.json"
import THEMESDATA from "./ThemesData.json"
import LANGUAGES from "./Languages.json"
import Toast from './components/Toast';
import { useErrorToast } from "./hooks/useErrorToast"
import { formatBold, formatNumber } from "./utils/format"

import "./AppNew.css"

import music_1 from "/music/piano-solo-334668.mp3"
import music_2 from "/music/piano-solo-337597.mp3"
import music_3 from "/music/sad-piano-song-335357.mp3"
import music_4 from "/music/melancholic-piano-music-337918.mp3"
import music_5 from "/music/piano-solo-334664.mp3"
import music_6 from "/music/meditation-music-334817.mp3"

function App() {
  const [data, setData] = useState({})
  const [index, setIndex] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [statePlay, setStatePlay] = useState(false)
  const [warn, setWarn] = useState(false)
  const [limit, setLimit] = useState(10);
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageMode, setMessageMode] = useState([]);
  const [question, setQuestion] = useState("");
  const [section, setSection] = useState([])
  const [currentSection, setCurrentSection] = useState("")
  const [settingFull, setSettingFull] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const [themeData] = useState(THEMESDATA)

  // UI state (แทนการแก้ style ผ่าน DOM แบบเดิม)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [chatFocus, setChatFocus] = useState(false)
  const [currentSetting, setCurrentSetting] = useState("theme")

  const [toast, setToast] = useState({
    show: false,
    text: "",
    duration: 1000,
    status: "",
    showIcon: false,
    icon: null,
    flag: false,
    report: {}
  })

  const language_ls = localStorage.getItem("language")
  const theme_ls = localStorage.getItem("theme")
  const intoAnimetion_ls = localStorage.getItem("intoAnimetion")
  const status_ls = localStorage.getItem("status")
  const mode_ls = localStorage.getItem("mode")
  const status_mode_ls = localStorage.getItem("status_mode")
  const current_section_ls = localStorage.getItem("current_section")
  const first_reload_ls = localStorage.getItem("first_reload")
  const warn_mode_ls = localStorage.getItem("warn_mode")
  const current_uuid_ls = localStorage.getItem("current_uuid")
  const limit_ls = localStorage.getItem("limit")

  const [firstMode, setFirstMode] = useState(status_mode_ls ? status_mode_ls : false)
  const [stateMode, setStateMode] = useState(mode_ls ? mode_ls : "advice")
  const [language, setLanguage] = useState(language_ls ? language_ls : "th")
  const [theme, setTheme] = useState(theme_ls ? theme_ls : "default")
  const [intoAnimetion, setIntoAnimetion] = useState(intoAnimetion_ls ? intoAnimetion_ls : false)
  const [warnMode, setWarnMode] = useState(warn_mode_ls ? warn_mode_ls : false)

  const audioRef = useRef(null);
  const messageEndRef = useRef(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate()
  const reportError = useErrorToast(setToast, language)

  const T = LANGUAGES.messages[language]
  const FONT = LANGUAGES.fontFamily[language]
  const isLogin = status_ls == "login"

  const message_title = [
    T.messgaesInto["1"],
    T.messgaesInto["2"],
    T.messgaesInto["3"],
    T.messgaesInto["4"]
  ];

  const songs = [music_1, music_2, music_3, music_4, music_5, music_6];

  /* ---------------------------------- boot --------------------------------- */

  useEffect(() => {
    if (!first_reload_ls) {
      localStorage.setItem("first_reload", true)
      localStorage.setItem("current_uuid", uuidv4())
      window.location.reload()
    }
    testConnect()
      .then(_ => {
        deleteSectionNonUser(current_uuid_ls)
          .then(_ => { return; })
          .catch(err => { reportError(err, data.user_id); return; })

        if (status_ls == "login") {
          getUser()
            .then(res => {
              setData(res.data)
              get_section(res.data.user_id)
              get_history(current_section_ls)
              return;
            })
            .catch(err => { reportError(err, data.user_id); return; })

          const checkToken = () => {
            protected_()
              .then(_ => { localStorage.setItem("status", "login"); return; })
              .catch(err => {
                console.log(err)
                localStorage.setItem("status", "view")
                localStorage.removeItem("status_mode")
                localStorage.removeItem("mode")
                localStorage.removeItem("current_section")
                navigate("/authentication")
                window.location.reload()
                return;
              })
          }
          checkToken()
          const interval = setInterval(checkToken, 30 * 60 * 1000)
          return () => clearInterval(interval)
        } else {
          localStorage.setItem("status", "view")
          localStorage.removeItem("status_mode")
          localStorage.removeItem("mode")
          return;
        }
      })
      .catch(err => {
        localStorage.setItem("status", "view")
        console.log(err);
        setToast({
          show: true,
          text: T.error.connecterror,
          duration: 5000,
          status: "error",
          showIcon: true,
          icon: faPlug
        })
        return;
      })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, messageMode])

  useEffect(() => {
    let timer;
    if (isRunning) timer = setInterval(() => setCount(prev => prev + 1), 100);
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      localStorage.setItem("platform", mobile ? "phone" : "window")
      if (!mobile) setDrawerOpen(false)
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    if (index < message_title.length) {
      const timeout = setTimeout(() => setIndex(prev => prev + 1), 5000)
      return () => clearTimeout(timeout)
    } else {
      setIntoAnimetion(true)
      localStorage.setItem("intoAnimetion", true)
      return;
    }
  }, [index])

  // ปิด drawer / setting ด้วยปุ่ม Esc
  useEffect(() => {
    const onKey = e => {
      if (e.key !== "Escape") return
      setDrawerOpen(false)
      setSettingFull(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const scrollToBottom = () => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }

  /* -------------------------------- actions -------------------------------- */

  const startAnime = () => {
    localStorage.setItem("intoAnimetion", false)
    setIntoAnimetion(false)
    setIndex(0)
    return;
  }

  const playOnOff = () => {
    setStatePlay(prev => {
      const newState = !prev
      if (newState) {
        audioRef.current.volume = volume
        audioRef.current.play()
      } else {
        audioRef.current.pause()
        return false
      }
      return newState
    })
  }

  const changeMusic = () => {
    setCurrentSongIndex(prev => (prev + 1) % songs.length)
    setStatePlay(false)
  }

  const applyTheme = name => {
    setTheme(name)
    localStorage.setItem("theme", name)
  }

  const applyLanguage = lang => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const toggleLanguage = () => applyLanguage(language == "th" ? "en" : "th")

  const restore = () => {
    setTheme("default")
    setLanguage("th")
    localStorage.removeItem("theme")
    localStorage.removeItem("language")
    window.location.reload()
    return;
  }

  const nextPage = page => {
    if (!isLogin) {
      localStorage.setItem("form", page == "setting" ? "register" : "login")
      navigate("/authentication")
      return;
    }
    if (page == "setting") { setSettingFull(true); return; }
    if (page == "exit") { logOut(); return; }
  }

  const selectMode = mode => {
    if (mode == stateMode && firstMode) return;
    if (mode == "just_venting" && !isLogin) { setWarn(true); return; }
    if (mode == "advice" && isLogin && section.length == 0) {
      create_section(data.user_id)
      window.location.reload()
    }
    localStorage.setItem("status_mode", true)
    localStorage.setItem("mode", mode)
    setStateMode(mode)
    setFirstMode(true)
    setDrawerOpen(false)
    return;
  }

  const create_section = id => {
    setIsActive(true)
    createSection(id)
      .then(_ => {
        setIsActive(false)
        get_section(data.user_id)
        get_history(current_section_ls)
        setDrawerOpen(false)
        return;
      })
      .catch(err => { reportError(err, data.user_id); return; })
  }

  const get_history = id => {
    getHistory(id)
      .then(res => { setMessages(res.data); return; })
      .catch(err => { reportError(err, data.user_id); return; })
  }

  const get_section = id => {
    getSection(id)
      .then(res => {
        setSection(res.data)
        if (res.data.length == 0) {
          localStorage.setItem("status_mode", false)
          setFirstMode(false)
          return
        } else {
          if (current_section_ls == null || undefined) {
            setCurrentSection(res.data[0]._id)
            localStorage.setItem("current_section", res.data[0]._id)
            get_history(res.data[0]._id)
          }
          localStorage.setItem("status_mode", true)
          setFirstMode(true)
          return
        }
      })
      .catch(err => { reportError(err, data.user_id); return; })
  }

  const delete_section = (id, e) => {
    if (e) e.stopPropagation()
    setIsActive(true)
    deleteSection(id)
      .then(_ => {
        localStorage.removeItem("current_section")
        window.location.reload()
        setIsActive(false)
        return;
      })
      .catch(err => { reportError(err, data.user_id); return; })
  }

  const selectSection = id => {
    setCurrentSection(id)
    get_history(id)
    localStorage.setItem("current_section", id)
    setDrawerOpen(false)
    return;
  }

  const handleChatbot = e => {
    e.preventDefault()
    if (!question.trim()) return;
    setIsActive(true)
    setIsRunning(true)
    const text = document.getElementById("question")
    if (text) text.value = "";
    setMessages([...messages, { question, answer: T.typeing }])

    if (status_ls == "login") {
      chatbot(current_section_ls, { human: question })
        .then(res => {
          setMessages([...messages, { question, answer: res.data.answer }])
          get_history(current_section_ls)
          setIsActive(false); setIsRunning(false); setCount(0)
          return;
        })
        .catch(err => {
          console.log(err)
          setMessages([...messages, { question, answer: T.warnchat }])
          setIsActive(false); setIsRunning(false); setCount(0)
          reportError(err, data.user_id)
          return;
        })
    } else {
      if (limit == 0) localStorage.setItem("limit", 0)
      if (localStorage.getItem("limit")) {
        deleteSectionNonUser(current_uuid_ls)
          .then(_ => {
            setMessages([...messages, { question, answer: T.countlimit }])
            setIsActive(false); setIsRunning(false); setCount(0)
            return;
          })
          .catch(err => { reportError(err, data.user_id) })
        return;
      } else {
        chatbotNonUser(current_uuid_ls, { human: question })
          .then(res => {
            setMessages([...messages, { question, answer: res.data.answer }])
            setLimit(prev => prev - 1)
            setIsActive(false); setIsRunning(false); setCount(0)
            return;
          })
          .catch(err => {
            console.log(err)
            setMessages([...messages, { question, answer: T.warnchat }])
            setIsActive(false); setIsRunning(false); setCount(0)
            reportError(err, data.user_id)
            return;
          })
      }
    }
  }

  const handleChatbotV2 = e => {
    e.preventDefault()
    if (!question.trim()) return;
    const text = document.getElementById("questionv2")
    if (text) text.value = "";
    setMessageMode([...messageMode, { question, answer: "" }])
    chatbotV2(current_uuid_ls, { human: question })
      .then(res => {
        setMessageMode([...messageMode, { question, answer: res.data.answer }])
        return;
      })
      .catch(err => {
        console.log(err)
        setMessageMode([...messageMode, { question, answer: T.warnchat }])
        reportError(err, data.user_id)
        return;
      })
  }

  const delete_section_just_venting = () => {
    deleteSectionNonUser(current_uuid_ls)
      .then(_ => {
        if (data.user_id != undefined | null) { window.location.reload(); return; }
        localStorage.removeItem("status_mode")
        localStorage.removeItem("mode")
        window.location.reload()
        return;
      })
      .catch(err => { reportError(err, data.user_id); return; })
  }

  const logOut = () => {
    setFirstMode(false)
    logout()
      .then(_ => {
        deleteSectionNonUser(current_uuid_ls)
          .then(_ => {
            localStorage.removeItem("status_mode")
            localStorage.removeItem("mode")
            localStorage.removeItem("first_reload")
            localStorage.removeItem("current_section")
            localStorage.setItem("status", "view")
            window.location.reload()
            return;
          })
          .catch(err => { reportError(err, data.user_id); return; })
      })
      .catch(err => { reportError(err, data.user_id); return; })
  }

  /* -------------------------------- fragments ------------------------------- */

  const activeSectionId = currentSection || current_section_ls
  const activeSection = section.find(s => s._id == activeSectionId)
  const modeLabel = stateMode == "advice" ? `🌱 ${T.advice}` : `🤍 ${T.justventing}`
  const modeHint = stateMode == "advice" ? T.hintadvice : T.hintventing

  const Sidebar = (
    <aside className={`dpu-sidebar${sidebarCollapsed && !isMobile ? " is-collapsed" : ""}`} style={FONT}>
      <div className="dpu-brand">
        <div className="dpu-brand-name">
          <span className="dpu-logo"><img src="/logo-icon/dpucare.ico" alt="" /></span>
          <strong>DPUCARE</strong>
        </div>
        {isMobile ? (
          <button className="dpu-iconbtn" aria-label={T.exit} onClick={() => setDrawerOpen(false)}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        ) : (
          <button
            className="dpu-iconbtn"
            aria-label={sidebarCollapsed ? "Expand" : "Collapse"}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
            onClick={() => setSidebarCollapsed(v => !v)}
          >
            <FontAwesomeIcon icon={sidebarCollapsed ? faAnglesRight : faAnglesLeft} />
          </button>
        )}
      </div>

      <button
        className="dpu-btn dpu-btn-primary dpu-newchat"
        disabled={isActive || !isLogin}
        title={isLogin ? T.newchat : T.plaseauth}
        onClick={() => isLogin ? create_section(data.user_id) : nextPage("exit")}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span className="dpu-label">{T.newchat}</span>
      </button>

      <div className="dpu-block">
        <div className="dpu-block-title dpu-label">{T.selectmode}</div>
        <div className="dpu-segmented">
          <button
            className={stateMode == "advice" ? "is-on" : ""}
            onClick={() => selectMode("advice")}
          >🌱 <span className="dpu-label">{T.advice}</span></button>
          <button
            className={stateMode == "just_venting" ? "is-on" : ""}
            onClick={() => selectMode("just_venting")}
          >🤍 <span className="dpu-label">{T.justventing}</span></button>
        </div>
        <p className="dpu-hint dpu-label">{modeHint}</p>
        {warn ? (
          <p className="dpu-hint dpu-warn dpu-label" onClick={() => navigate("/authentication")}>
            <FontAwesomeIcon icon={faLock} /> {T.plaseauth}
          </p>
        ) : null}
      </div>

      <div className="dpu-divider"></div>

      <div className="dpu-block dpu-history">
        <div className="dpu-block-head dpu-label">
          <span>{T.chathistory}</span>
          <span>{section.length}</span>
        </div>
        <div className="dpu-history-list">
          {section.length <= 0 ? (
            <p className="dpu-empty dpu-label">{T.nochat}</p>
          ) : section.map((item, idx) => (
            <div
              key={idx}
              className={`dpu-history-item${activeSectionId == item._id ? " is-on" : ""}`}
              onClick={() => selectSection(item._id)}
              title={item.time}
            >
              <div className="dpu-history-text">
                <span className="dpu-history-title">{item.time}</span>
              </div>
              <button
                className="dpu-iconbtn dpu-iconbtn-sm"
                aria-label={T.exit}
                onClick={e => delete_section(item._id, e)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="dpu-divider"></div>

      <div className="dpu-block dpu-foot">
        <div className="dpu-music">
          <FontAwesomeIcon icon={faMusic} className="dpu-music-ico" />
          <div className="dpu-music-text dpu-label">
            <span>{T.audio}</span>
            <small>{currentSongIndex + 1}/{songs.length}</small>
          </div>
          <audio style={{ display: "none" }} src={songs[currentSongIndex]} ref={audioRef} controls loop></audio>
          <button className="dpu-iconbtn dpu-iconbtn-sm" aria-label="Play" title="Play" onClick={playOnOff}>
            <FontAwesomeIcon icon={statePlay ? faPause : faPlay} />
          </button>
          <button className="dpu-iconbtn dpu-iconbtn-sm" aria-label="Next" title="Next" onClick={changeMusic}>
            <FontAwesomeIcon icon={faForwardStep} />
          </button>
        </div>

        <div className="dpu-foot-row">
          <button className="dpu-btn dpu-btn-ghost" onClick={() => nextPage("setting")}>
            <FontAwesomeIcon icon={faGear} />
            <span className="dpu-label">{isLogin ? T.setting : T.signup}</span>
          </button>
          <button className="dpu-btn dpu-btn-ghost dpu-btn-fixed" onClick={toggleLanguage} title={T.language}>
            {language == "th" ? "EN" : "TH"}
          </button>
        </div>

        <div className="dpu-user">
          <span className="dpu-avatar">{isLogin && data.username ? data.username.charAt(0).toUpperCase() : "?"}</span>
          <span className="dpu-user-name dpu-label">{isLogin ? (data.username || "DPU") : T.limit}</span>
          <button
            className="dpu-iconbtn dpu-iconbtn-sm"
            aria-label={isLogin ? T.logout : T.signin}
            title={isLogin ? T.logout : T.signin}
            onClick={() => nextPage("exit")}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      </div>
    </aside>
  )

  const Composer = (submit, id, placeholder) => (
    <div className="dpu-composer">
      <form onSubmit={submit} className={isActive ? "is-busy" : ""}>
        <input
          type="text"
          name="question"
          id={id}
          placeholder={placeholder}
          onChange={e => setQuestion(e.target.value)}
          required
          disabled={isActive}
        />
        <button type="submit" className="dpu-btn dpu-btn-primary dpu-send" disabled={isActive}>
          {isRunning ? <span className="dpu-timer">{formatNumber(count)}</span> : <FontAwesomeIcon icon={faPaperPlane} />}
          <span className="dpu-send-label">{T.send}</span>
        </button>
      </form>
      <p className="dpu-disclaimer">{T.warndpu}</p>
    </div>
  )

  /* ---------------------------------- view ---------------------------------- */

  return (
    <div className="dpu-app" style={THEMES[theme].background}>
      <div className="dpu-veil"></div>

      <div className="dpu-intro" style={intoAnimetion ? { display: "none" } : THEMES[theme].background}>
        <h1 style={FONT} key={index}>{message_title[index]}</h1>
        <button
          className="dpu-btn dpu-btn-ghost dpu-skip"
          style={FONT}
          onClick={() => { setIntoAnimetion(true); localStorage.setItem("intoAnimetion", true) }}
        >{T.skip}</button>
      </div>

      <div className="dpu-shell" style={FONT}>
        {isMobile ? null : Sidebar}

        <main className={`dpu-main${chatFocus ? " is-focus" : ""}`}>
          {firstMode ? (
            <>
              <header className="dpu-topbar">
                {isMobile ? (
                  <button className="dpu-iconbtn" aria-label={T.chathistory} onClick={() => setDrawerOpen(true)}>
                    <FontAwesomeIcon icon={faBars} />
                  </button>
                ) : null}

                <div className="dpu-topbar-text">
                  <h2>{modeLabel}</h2>
                  <p>{isLogin
                    ? (stateMode == "advice" ? (activeSection ? activeSection.time : modeHint) : modeHint)
                    : `${T.limit} · ${limit_ls == 0 ? limit_ls : limit}`}</p>
                </div>

                <div className="dpu-topbar-actions">
                  {stateMode == "just_venting" ? (
                    <button className="dpu-btn dpu-btn-ghost" onClick={delete_section_just_venting}>
                      <FontAwesomeIcon icon={faTrash} />
                      <span className="dpu-label">{T.endchat}</span>
                    </button>
                  ) : null}
                  {stateMode == "advice" && isLogin && activeSectionId ? (
                    <button className="dpu-btn dpu-btn-ghost" onClick={() => delete_section(activeSectionId)}>
                      <FontAwesomeIcon icon={faTrash} />
                      <span className="dpu-label">{T.deletechat}</span>
                    </button>
                  ) : null}
                  {isMobile ? (
                    <button className="dpu-iconbtn" aria-label={T.newchat} onClick={() => isLogin ? create_section(data.user_id) : nextPage("exit")}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  ) : (
                    <button className="dpu-btn dpu-btn-ghost" onClick={() => setChatFocus(v => !v)}>
                      <FontAwesomeIcon icon={chatFocus ? faCompress : faExpand} />
                      <span className="dpu-label">{T.fullscreen}</span>
                    </button>
                  )}
                </div>
              </header>

              {stateMode == "just_venting" && !warnMode ? (
                <div className="dpu-notice">
                  <FontAwesomeIcon icon={faLock} className="dpu-notice-ico" />
                  <p>{T.warnmode}</p>
                  <button
                    className="dpu-btn dpu-btn-light"
                    onClick={() => { localStorage.setItem("warn_mode", true); setWarnMode(true) }}
                  >{T.accept}</button>
                </div>
              ) : null}

              {stateMode == "advice" ? (
                <>
                  <div className="dpu-scroll" ref={scrollRef}>
                    <div className="dpu-thread">
                      <div className="dpu-msg dpu-msg-ai">
                        <span className="dpu-msg-avatar"><img src="/logo-icon/dpucare.ico" alt="" /></span>
                        <div className="dpu-msg-body">
                          <span className="dpu-msg-who">DPUCARE</span>
                          <div className="dpu-bubble"><pre>{T.firstchat}</pre></div>
                        </div>
                      </div>
                      {messages.map((item, idx) => (
                        <div key={idx} className="dpu-turn">
                          {item.question == "" ? null : (
                            <div className="dpu-msg dpu-msg-me">
                              <div className="dpu-bubble">{item.question}</div>
                            </div>
                          )}
                          <div className="dpu-msg dpu-msg-ai">
                            <span className="dpu-msg-avatar"><img src="/logo-icon/dpucare.ico" alt="" /></span>
                            <div className="dpu-msg-body">
                              <span className="dpu-msg-who">DPUCARE</span>
                              <div className="dpu-bubble"><pre>{formatBold(item.answer)}</pre></div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messageEndRef} />
                    </div>
                  </div>
                  {Composer(handleChatbot, "question", T.maininput)}
                </>
              ) : (
                <>
                  <div className="dpu-scroll" ref={scrollRef}>
                    <div className="dpu-thread">
                      {messageMode.map((item, idx) => (
                        <div key={idx} className="dpu-turn">
                          {item.question == "" ? null : (
                            <div className="dpu-msg dpu-msg-me">
                              <div className="dpu-bubble">{item.question}</div>
                            </div>
                          )}
                          {item.answer ? (
                            <div className="dpu-msg dpu-msg-ai">
                              <span className="dpu-msg-avatar"><img src="/logo-icon/dpucare.ico" alt="" /></span>
                              <div className="dpu-msg-body">
                                <span className="dpu-msg-who">DPUCARE</span>
                                <div className="dpu-bubble"><pre>{formatBold(item.answer)}</pre></div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                      <div ref={messageEndRef} />
                    </div>
                  </div>
                  {Composer(handleChatbotV2, "questionv2", T.secondinput)}
                </>
              )}
            </>
          ) : (
            <div className="dpu-onboard">
              {isMobile ? (
                <button className="dpu-iconbtn dpu-onboard-menu" aria-label={T.setting} onClick={() => setDrawerOpen(true)}>
                  <FontAwesomeIcon icon={faBars} />
                </button>
              ) : null}
              <div className="dpu-onboard-card">
                <h1>{T.selectmode}</h1>
                <p className="dpu-onboard-sub">{T.selectmodesub}</p>

                <button className="dpu-choice" disabled={isActive} onClick={() => selectMode("advice")}>
                  <span className="dpu-choice-ico">🌱</span>
                  <span className="dpu-choice-text">
                    <strong>{T.advice}</strong>
                    <small>{T.hintadvice}</small>
                  </span>
                  <FontAwesomeIcon icon={faChevronRight} className="dpu-choice-arrow" />
                </button>

                <button className="dpu-choice" onClick={() => selectMode("just_venting")}>
                  <span className="dpu-choice-ico">🤍</span>
                  <span className="dpu-choice-text">
                    <strong>{T.justventing}</strong>
                    <small>{T.hintventing}</small>
                    {!isLogin ? <em className="dpu-tag"><FontAwesomeIcon icon={faLock} /> {T.plaseauth}</em> : null}
                  </span>
                  <FontAwesomeIcon icon={faChevronRight} className="dpu-choice-arrow" />
                </button>

                {warn ? (
                  <p className="dpu-onboard-warn" onClick={() => navigate("/authentication")}>{T.plaseauth}</p>
                ) : null}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ------------------------------ mobile drawer ----------------------------- */}
      {isMobile ? (
        <div className={`dpu-drawer${drawerOpen ? " is-open" : ""}`}>
          <div className="dpu-drawer-scrim" onClick={() => setDrawerOpen(false)}></div>
          <div className="dpu-drawer-panel">{Sidebar}</div>
        </div>
      ) : null}

      {/* -------------------------------- settings -------------------------------- */}
      <div className={`dpu-modal${settingFull ? " is-open" : ""}`}>
        <div className="dpu-modal-scrim" onClick={() => setSettingFull(false)}></div>
        <div className="dpu-modal-panel" style={FONT}>
          <nav className="dpu-modal-nav">
            <h2>{T.setting}</h2>
            <button className={currentSetting == "theme" ? "is-on" : ""} onClick={() => setCurrentSetting("theme")}>
              <FontAwesomeIcon icon={faPalette} /> {T.theme}
            </button>
            <button className={currentSetting == "language" ? "is-on" : ""} onClick={() => setCurrentSetting("language")}>
              <FontAwesomeIcon icon={faLanguage} /> {T.language}
            </button>
            <button className={currentSetting == "audio" ? "is-on" : ""} onClick={() => setCurrentSetting("audio")}>
              <FontAwesomeIcon icon={volume == 0 ? faVolumeXmark : faVolumeHigh} /> {T.audio}
            </button>
            <span className="dpu-modal-spacer"></span>
            <button className="dpu-modal-quiet" onClick={restore}>
              <FontAwesomeIcon icon={faRepeat} /> {T.restore}
            </button>
            <button className="dpu-modal-quiet" onClick={startAnime}>
              <FontAwesomeIcon icon={faFilm} /> {T.replayintro}
            </button>
          </nav>

          <section className="dpu-modal-body">
            <header className="dpu-modal-head">
              <div>
                <h3>{currentSetting == "theme" ? T.theme : currentSetting == "language" ? T.language : T.audio}</h3>
                <p>{currentSetting == "theme" ? T.themesub : currentSetting == "language" ? T.languagesub : T.audiosub}</p>
              </div>
              <button className="dpu-btn dpu-btn-light" onClick={() => setSettingFull(false)}>{T.done}</button>
            </header>

            <div className="dpu-modal-scroll">
              {currentSetting == "theme" ? (
                <div className="dpu-theme-grid">
                  {themeData.map((item, idx) => (
                    <button
                      key={idx}
                      className={`dpu-theme-card${theme == item.name ? " is-on" : ""}`}
                      onClick={() => applyTheme(item.name)}
                    >
                      <span className="dpu-theme-swatch" style={item.background}>
                        {theme == item.name ? <i className="dpu-theme-check"><FontAwesomeIcon icon={faCheck} /></i> : null}
                      </span>
                      <span className="dpu-theme-name">{item.name}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              {currentSetting == "language" ? (
                <div className="dpu-option-list">
                  <button className={`dpu-option${language == "th" ? " is-on" : ""}`} onClick={() => applyLanguage("th")}>
                    <span>ไทย</span>{language == "th" ? <FontAwesomeIcon icon={faCheck} /> : null}
                  </button>
                  <button className={`dpu-option${language == "en" ? " is-on" : ""}`} onClick={() => applyLanguage("en")}>
                    <span>English</span>{language == "en" ? <FontAwesomeIcon icon={faCheck} /> : null}
                  </button>
                </div>
              ) : null}

              {currentSetting == "audio" ? (
                <div className="dpu-audio">
                  <div className="dpu-audio-row">
                    <FontAwesomeIcon icon={volume == 0 ? faVolumeXmark : faVolumeHigh} />
                    <input
                      type="range"
                      defaultValue={volume * 100}
                      min={0}
                      max={100}
                      onChange={e => {
                        const v = e.target.value / 100
                        setVolume(v)
                        if (audioRef.current) audioRef.current.volume = v
                      }}
                    />
                    <span className="dpu-audio-val">{Math.round(volume * 100)}%</span>
                  </div>
                  <div className="dpu-audio-row">
                    <button className="dpu-btn dpu-btn-ghost" onClick={playOnOff}>
                      <FontAwesomeIcon icon={statePlay ? faPause : faPlay} />
                      {statePlay ? "Pause" : "Play"}
                    </button>
                    <button className="dpu-btn dpu-btn-ghost" onClick={changeMusic}>
                      <FontAwesomeIcon icon={faForwardStep} />
                      {currentSongIndex + 1}/{songs.length}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      <Toast data={toast} />
    </div>
  )
}

export default App
