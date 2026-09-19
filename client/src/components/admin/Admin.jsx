import React, { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlay, faPause, faVolumeHigh, faTrash,
  faPaperPlane, faRightFromBracket, faPlug, faXmark,
  faGear, faLanguage, faRepeat, faVolumeXmark, faFlag,
  faPenToSquare, faPlus, faCheck, faPalette, faBars,
  faChartSimple, faComments, faForwardStep, faMusic,
  faArrowLeft, faCircleCheck
} from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"

import {
  protected_, logout, testChatbot, getUser,
  getChatbotConfig, getCountAllUser, getReport, deleteReport,
  deleteSectionNonUser, getSectionTemplate, getVersion,
  updateTemplate, createHistoryTemplate, createSectionTemplate,
  updateSelectMain, updateSelectSecondery, deleteHistoryTemplate,
  deleteSectionTemplate, testConnect
} from "../../api/api"

import LANGUAGES from "../../Languages.json"
import THEMES from "../../Themes.json"
import THEMESDATA from "../../ThemesData.json"
import Toast from '../Toast';
import { useErrorToast } from "../../hooks/useErrorToast"
import { formatBold, formatNumber } from "../../utils/format"

import "./AdminNew.css"

import music_1 from "/music/piano-solo-334668.mp3"
import music_2 from "/music/piano-solo-337597.mp3"
import music_3 from "/music/sad-piano-song-335357.mp3"
import music_4 from "/music/melancholic-piano-music-337918.mp3"
import music_5 from "/music/piano-solo-334664.mp3"
import music_6 from "/music/meditation-music-334817.mp3"

const Admin = () => {
  const [data, setData] = useState({})
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [statePlay, setStatePlay] = useState(false)
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageMode, setMessageMode] = useState([]);
  const [question, setQuestion] = useState("");
  const [settingFull, setSettingFull] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const [currentCountAllUser, setCurrntCountAllUser] = useState({})
  const [report, setReport] = useState([])
  const [viewOneReport, setViewOneReport] = useState(null)
  const [themeData] = useState(THEMESDATA)
  const [sectionTemplatem, setSectionTemplate] = useState([])
  const [versionTemplate, setVersionTemplate] = useState([])
  const [newVersion, setNewVersion] = useState(false)
  const [template, setTemplate] = useState({})
  const [viewTemplate, setViewTemplate] = useState({})
  const [viewVersion, setViewVersion] = useState({})
  const [stateNewSec, setStateNewSec] = useState(false)
  const [nameSec, setNameSec] = useState("")
  const [stateSelc, setStateSelc] = useState(false)
  const [chatbotConfig, setChatbotConfig] = useState({
    total_tokens: 0,
    select_main: "",
    select_secondery: ""
  })

  // UI state
  const [page, setPage] = useState("overview")   // overview | reports | template | chat
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [drawerOpen, setDrawerOpen] = useState(false)
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
  const status_ls = localStorage.getItem("status")
  const mode_ls = localStorage.getItem("mode")
  const first_reload_ls = localStorage.getItem("first_reload")
  const current_uuid_ls = localStorage.getItem("current_uuid")
  const cureent_section_tem_ls = localStorage.getItem("current_sec_tem")
  const current_sec_tem_name_ls = localStorage.getItem("current_sec_tem_name")
  const current_version_ls = localStorage.getItem("current_version")
  const current_name_tem_ls = localStorage.getItem("current_name_tem")
  const current_history_tem_ls = localStorage.getItem("current_history_tem")
  const current_history_ls = localStorage.getItem("current_history_id")

  const [stateMode, setStateMode] = useState(mode_ls ? mode_ls : "advice")
  const [language, setLanguage] = useState(language_ls ? language_ls : "th")
  const [theme, setTheme] = useState(theme_ls ? theme_ls : "default")
  const [currentHisTem, setCurrentHisTem] = useState(current_history_tem_ls != undefined ? current_history_tem_ls : "")

  const audioRef = useRef(null);
  const messageEndRef = useRef(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate()
  const reportError = useErrorToast(setToast, language)

  const T = LANGUAGES.messages[language]
  const FONT = LANGUAGES.fontFamily[language]
  const isTH = language != "en"

  const songs = [music_1, music_2, music_3, music_4, music_5, music_6];

  /* ---------------------------------- boot --------------------------------- */

  useEffect(() => {
    if (status_ls == null | undefined | "view") { navigate("/authentication"); return; }
    testConnect()
      .then(_ => {
        deleteSectionNonUser(current_uuid_ls)
          .then(_ => { return; })
          .catch(err => { reportError(err, data.user_id); return; })

        if (status_ls == "login") {
          getUser()
            .then(res => {
              setData(res.data)
              get_chatbot_config(res.data.user_id)
              get_report(res.data.user_id)
              get_count_user(res.data.user_id)
              get_section_template()
              get_version(cureent_section_tem_ls)
              if (!first_reload_ls) {
                localStorage.setItem("first_reload", true)
                localStorage.setItem("current_uuid", uuidv4())
                window.location.reload()
              }
              return;
            })
            .catch(err => { reportError(err, "admin"); return; })

          const checkToken = () => {
            protected_()
              .then(_ => { localStorage.setItem("status", "login"); return; })
              .catch(err => {
                console.log(err)
                localStorage.setItem("status", "view")
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
          navigate("/authentication")
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
    const onKey = e => {
      if (e.key !== "Escape") return
      setDrawerOpen(false); setSettingFull(false)
      setNewVersion(false); setStateNewSec(false)
      setStateSelc(false); setViewOneReport(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const scrollToBottom = () => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }

  /* -------------------------------- actions -------------------------------- */

  const handleChangeTemplate = e => setTemplate({ ...template, [e.target.name]: e.target.value })
  const handleTime = second => setTimeout(() => setToast({ show: false }), second)

  const playOnOff = () => {
    setStatePlay(prev => {
      const newState = !prev
      if (newState) { audioRef.current.volume = volume; audioRef.current.play() }
      else { audioRef.current.pause(); return false }
      return newState
    })
  }

  const changeMusic = () => {
    setCurrentSongIndex(prev => (prev + 1) % songs.length)
    setStatePlay(false)
  }

  const applyTheme = name => { setTheme(name); localStorage.setItem("theme", name) }
  const applyLanguage = lang => { setLanguage(lang); localStorage.setItem("language", lang) }
  const toggleLanguage = () => applyLanguage(language == "th" ? "en" : "th")

  const restore = () => {
    setTheme("default"); setLanguage("th")
    localStorage.removeItem("theme"); localStorage.removeItem("language")
    window.location.reload()
    return;
  }

  const select_section = (id, idx) => {
    localStorage.setItem("current_sec_tem", id)
    localStorage.setItem("current_sec_tem_name", viewTemplate[idx].name)
    get_version(id)
    return
  }

  const select_version = (id, idx) => {
    setCurrentHisTem(viewVersion[idx].template)
    localStorage.setItem("current_version", id)
    localStorage.setItem("current_name_tem", viewVersion[idx].name)
    localStorage.setItem("current_history_tem", viewVersion[idx].template)
    localStorage.setItem("current_history_id", idx)
    get_version(id)
    window.location.reload()
    return
  }

  const selectMode = mode => {
    localStorage.setItem("status_mode", true)
    localStorage.setItem("mode", mode)
    setStateMode(mode)
    return;
  }

  const get_section_template = () => {
    getSectionTemplate()
      .then(res => {
        setSectionTemplate(res.data)
        setViewTemplate(res.data)
        if (cureent_section_tem_ls != undefined) return
        if (res.data.length > 0) {
          localStorage.setItem("current_sec_tem", res.data[0]._id)
          localStorage.setItem("current_sec_tem_name", res.data[0].name)
        }
        return;
      })
      .catch(err => console.log(err))
  }

  const get_version = id => {
    getVersion(id)
      .then(res => {
        setVersionTemplate(res.data)
        setViewVersion(res.data)
        if (!res.data || res.data.length == 0) return
        const i = current_version_ls != undefined && res.data[current_history_ls] ? current_history_ls : 0
        localStorage.setItem("current_version", res.data[i]._id)
        localStorage.setItem("current_name_tem", res.data[i].name)
        localStorage.setItem("current_history_tem", res.data[i].template)
        setCurrentHisTem(res.data[i].template)
        return
      })
      .catch(err => console.log(err))
  }

  const notAllowed = err => {
    if (err.response?.data?.detail == "not allowed delete") {
      setToast({
        show: true,
        text: isTH ? "เทมเพลตนี้ถูกใช้งานอยู่" : "This template is in use",
        duration: 5000,
        status: "error",
        icon: faXmark
      })
      handleTime(5500)
    }
  }

  const delete_history_template = () => {
    deleteHistoryTemplate(current_version_ls)
      .then(_ => {
        localStorage.removeItem("current_version")
        localStorage.removeItem("current_name_tem")
        localStorage.removeItem("current_history_tem")
        window.location.reload()
        return;
      })
      .catch(err => { console.log(err); notAllowed(err); return; })
  }

  const delete_section_template = (id, e) => {
    if (e) e.stopPropagation()
    deleteSectionTemplate(id)
      .then(_ => {
        localStorage.removeItem("current_sec_tem")
        localStorage.removeItem("current_sec_tem_name")
        localStorage.removeItem("current_version")
        localStorage.removeItem("current_name_tem")
        localStorage.removeItem("current_history_tem")
        window.location.reload()
        return;
      })
      .catch(err => { console.log(err); notAllowed(err); return; })
  }

  const create_section_template = e => {
    e.preventDefault()
    createSectionTemplate({ "name": nameSec })
      .then(_ => { window.location.reload(); return; })
      .catch(err => console.log(err))
  }

  const create_history_template = e => {
    e.preventDefault()
    createHistoryTemplate(cureent_section_tem_ls, template)
      .then(_ => {
        get_version(cureent_section_tem_ls)
        window.location.reload()
        return;
      })
      .catch(err => console.log(err))
  }

  const get_report = id => {
    getReport(id)
      .then(res => { setReport(res.data); return; })
      .catch(err => { reportError(err, "admin"); return; })
  }

  const view_one_report = idx => {
    setViewOneReport({
      _id: report[idx]._id,
      index: idx,
      user_id: report[idx].user_id,
      title: report[idx].title,
      status: report[idx].status,
      timestamp: report[idx].timestamp,
      description: report[idx].description
    })
    return;
  }

  const get_count_user = id => {
    getCountAllUser(id)
      .then(res => { setCurrntCountAllUser(res.data); return; })
      .catch(err => { reportError(err, "admin"); return; })
  }

  const get_chatbot_config = id => {
    getChatbotConfig(id)
      .then(res => { setChatbotConfig(res.data); return; })
      .catch(err => { reportError(err, "admin"); return; })
  }

  const delete_report = id => {
    deleteReport(data.user_id, id)
      .then(_ => { window.location.reload(); return; })
      .catch(err => { reportError(err, "admin"); return; })
  }

  const delete_section = () => {
    deleteSectionNonUser(current_uuid_ls)
      .then(_ => {
        localStorage.removeItem("status_mode")
        localStorage.removeItem("mode")
        window.location.reload()
        return;
      })
      .catch(err => console.log(err))
  }

  const handleChatbot = e => {
    e.preventDefault()
    if (!question.trim()) return;
    setIsActive(true)
    setIsRunning(true)

    if (stateMode == "advice") {
      const text = document.getElementById("question")
      if (text) text.value = "";
      setMessages([...messages, { question, answer: T.typeing }])
      testChatbot(data.user_id, current_uuid_ls, { human: question, mode: "advice" })
        .then(res => {
          setMessages([...messages, { question, answer: res.data.answer }])
          setIsActive(false); setIsRunning(false); setCount(0)
          get_chatbot_config(data.user_id)
          return;
        })
        .catch(err => {
          console.log(err)
          setMessages([...messages, { question, answer: T.warnchat }])
          setIsActive(false); setIsRunning(false); setCount(0)
          reportError(err, "admin")
          return;
        })
    } else {
      const text = document.getElementById("questionv2")
      if (text) text.value = "";
      setMessageMode([...messageMode, { question, answer: "" }])
      testChatbot(data.user_id, current_uuid_ls, { human: question, mode: "just_venting" })
        .then(res => {
          setMessageMode([...messageMode, { question, answer: res.data.answer }])
          get_chatbot_config(data.user_id)
          setIsActive(false); setIsRunning(false); setCount(0)
          return;
        })
        .catch(err => {
          setMessageMode([...messageMode, { question, answer: T.warnchat }])
          console.log(err);
          setIsActive(false); setIsRunning(false); setCount(0)
          reportError(err, "admin")
          return;
        })
    }
  }

  const handleUpdateTemplate = e => {
    e.preventDefault()
    updateTemplate(current_version_ls, { "template": template.template })
      .then(_ => {
        setCurrentHisTem(template.template)
        localStorage.setItem("current_history_tem", template.template)
        window.location.reload()
        return
      })
      .catch(err => console.log(err))
  }

  const handleUpdateSelect = mode => {
    if (mode == "Intelligent_Advisor") {
      updateSelectMain(data.user_id, { "select_main": current_version_ls })
        .then(_ => { window.location.reload(); return; })
        .catch(err => console.log(err))
    }
    if (mode == "Just_Venting") {
      updateSelectSecondery(data.user_id, { "select_secondery": current_version_ls })
        .then(_ => { window.location.reload(); return; })
        .catch(err => console.log(err))
    }
  }

  const logOut = () => {
    logout()
      .then(_ => {
        deleteSectionNonUser(current_uuid_ls)
          .then(_ => {
            localStorage.removeItem("first_reload")
            localStorage.removeItem("current_template")
            localStorage.removeItem("current_section")
            localStorage.removeItem("current_sec_tem")
            localStorage.removeItem("current_sec_tem_name")
            localStorage.removeItem("current_version")
            localStorage.removeItem("current_name_tem")
            localStorage.removeItem("current_history_tem")
            localStorage.setItem("status", "view")
            navigate("/authentication")
            return;
          })
          .catch(err => { reportError(err, "admin"); return; })
        return;
      })
      .catch(err => { reportError(err, "admin"); return; })
    return;
  }

  /* -------------------------------- fragments ------------------------------- */

  const go = p => { setPage(p); setDrawerOpen(false) }

  const NAV = [
    { id: "overview", icon: faChartSimple, label: isTH ? "ภาพรวม" : "Overview" },
    { id: "reports", icon: faFlag, label: T.report, badge: report.length },
    { id: "template", icon: faPenToSquare, label: "Prompt template" },
    { id: "chat", icon: faComments, label: isTH ? "ทดสอบแชท" : "Test chat" }
  ]

  const Sidebar = (
    <aside className="dpu-adm-side" style={FONT}>
      <div className="dpu-adm-brand">
        <span className="dpu-logo"><img src="/logo-icon/dpucare.ico" alt="" /></span>
        <strong>DPUCARE · Admin</strong>
        {isMobile ? (
          <button className="dpu-iconbtn dpu-adm-close" onClick={() => setDrawerOpen(false)} aria-label={T.exit}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        ) : null}
      </div>

      <nav className="dpu-adm-nav">
        {NAV.map(item => (
          <button key={item.id} className={page == item.id ? "is-on" : ""} onClick={() => go(item.id)}>
            <FontAwesomeIcon icon={item.icon} className="dpu-adm-nav-ico" />
            <span>{item.label}</span>
            {item.badge ? <em className="dpu-adm-badge">{item.badge}</em> : null}
          </button>
        ))}
      </nav>

      <span className="dpu-adm-spacer"></span>

      <div className="dpu-adm-music">
        <FontAwesomeIcon icon={faMusic} className="dpu-adm-music-ico" />
        <span>{T.audio}</span>
        <audio style={{ display: "none" }} src={songs[currentSongIndex]} ref={audioRef} controls loop></audio>
        <button className="dpu-iconbtn dpu-iconbtn-sm" onClick={playOnOff} aria-label="Play">
          <FontAwesomeIcon icon={statePlay ? faPause : faPlay} />
        </button>
        <button className="dpu-iconbtn dpu-iconbtn-sm" onClick={changeMusic} aria-label="Next">
          <FontAwesomeIcon icon={faForwardStep} />
        </button>
      </div>

      <div className="dpu-adm-foot">
        <button className="dpu-btn dpu-btn-ghost" onClick={() => setSettingFull(true)}>
          <FontAwesomeIcon icon={faGear} />{T.setting}
        </button>
        <button className="dpu-btn dpu-btn-ghost dpu-btn-fixed" onClick={toggleLanguage} title={T.language}>
          {language == "th" ? "EN" : "TH"}
        </button>
      </div>
      <button className="dpu-btn dpu-btn-ghost dpu-adm-logout" onClick={logOut}>
        <FontAwesomeIcon icon={faRightFromBracket} />{T.logout}
      </button>
    </aside>
  )

  const StatCards = (
    <div className="dpu-adm-stats">
      <div className="dpu-adm-stat">
        <span>{T.member}</span>
        <strong>{currentCountAllUser.total_user != undefined ? formatNumber(currentCountAllUser.total_user) : "—"}</strong>
      </div>
      <div className="dpu-adm-stat">
        <span>{T.totaltokens}</span>
        <strong>{formatNumber(chatbotConfig.total_tokens)}</strong>
      </div>
      <button className="dpu-adm-stat is-link" onClick={() => go("reports")}>
        <span>{T.report}</span>
        <strong className={report.length ? "is-alert" : ""}>{report.length}</strong>
      </button>
    </div>
  )

  const ReportTable = (
    <div className="dpu-adm-panel">
      <header className="dpu-adm-panel-head">
        <h3>{T.report}</h3>
        <span className="dpu-adm-muted">{report.length} {T.count}</span>
      </header>
      {report.length == 0 ? (
        <p className="dpu-adm-empty">{T.noreport}</p>
      ) : (
        <div className="dpu-adm-table-wrap">
          <table className="dpu-adm-table">
            <thead>
              <tr>
                <th className="dpu-adm-num">#</th>
                <th>{T.title}</th>
                <th>{T.status}</th>
                <th className="dpu-adm-right">{T.detail}</th>
              </tr>
            </thead>
            <tbody>
              {report.map((item, idx) => (
                <tr key={idx}>
                  <td className="dpu-adm-num">{idx}</td>
                  <td className="dpu-adm-cut">{item.title}</td>
                  <td><span className="dpu-adm-chip">{item.status}</span></td>
                  <td className="dpu-adm-right">
                    <button className="dpu-btn dpu-btn-ghost dpu-btn-sm" onClick={() => view_one_report(idx)}>
                      {isTH ? "ดู" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const TemplatePanel = (
    <div className="dpu-adm-template">
      <div className="dpu-adm-panel dpu-adm-sessions">
        <header className="dpu-adm-panel-head">
          <h3>Session</h3>
          <button className="dpu-btn dpu-btn-ghost dpu-btn-sm" onClick={() => setStateNewSec(true)}>
            <FontAwesomeIcon icon={faPlus} />{isTH ? "ใหม่" : "New"}
          </button>
        </header>
        <div className="dpu-adm-list">
          {sectionTemplatem.length == 0 ? (
            <p className="dpu-adm-empty">{isTH ? "ยังไม่มี session — กด “ใหม่” เพื่อสร้าง" : "No sessions yet — press “New” to create one."}</p>
          ) : sectionTemplatem.map((item, idx) => (
            <div
              key={idx}
              className={`dpu-adm-list-item${cureent_section_tem_ls == item._id ? " is-on" : ""}`}
              onClick={() => select_section(item._id, idx)}
            >
              <span className="dpu-adm-cut">{item.name}</span>
              <button className="dpu-iconbtn dpu-iconbtn-sm" onClick={e => delete_section_template(item._id, e)} aria-label={T.exit}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="dpu-adm-panel dpu-adm-editor">
        <header className="dpu-adm-panel-head">
          <div className="dpu-adm-panel-title">
            <h3>Prompt template</h3>
            <p className="dpu-adm-muted">{current_sec_tem_name_ls || "—"} · {current_name_tem_ls || "—"}</p>
          </div>
          <div className="dpu-adm-panel-actions">
            <button className="dpu-btn dpu-btn-ghost dpu-btn-sm" onClick={() => setNewVersion(true)} disabled={!cureent_section_tem_ls}>
              <FontAwesomeIcon icon={faPlus} />{isTH ? "เวอร์ชันใหม่" : "New version"}
            </button>
            <button className="dpu-btn dpu-btn-light dpu-btn-sm" onClick={() => setStateSelc(true)} disabled={!current_version_ls}>
              <FontAwesomeIcon icon={faCircleCheck} />{isTH ? "ใช้งาน" : "Use"}
            </button>
          </div>
        </header>

        {versionTemplate.length == 0 ? (
          <form className="dpu-adm-form" onSubmit={create_history_template}>
            <p className="dpu-adm-empty">{isTH ? "ยังไม่มี template ใน session นี้" : "No template in this session yet."}</p>
            <label className="dpu-field">
              <span className="dpu-field-label">{isTH ? "ชื่อเวอร์ชัน" : "Version name"}</span>
              <span className="dpu-field-box">
                <input type="text" name="name" placeholder="v1" required onChange={handleChangeTemplate} />
              </span>
            </label>
            <label className="dpu-field dpu-field-grow">
              <span className="dpu-field-label">Prompt</span>
              <textarea name="template" placeholder="คุณคือผู้ช่วยดูแลสุขภาพใจ…" required onChange={handleChangeTemplate}></textarea>
            </label>
            <div className="dpu-adm-form-foot">
              <button type="submit" className="dpu-btn dpu-btn-primary">{isTH ? "สร้าง" : "Create"}</button>
            </div>
          </form>
        ) : (
          <>
            <div className="dpu-adm-version-row">
              <label className="dpu-adm-select">
                <span className="dpu-field-label">{isTH ? "เวอร์ชัน" : "Version"}</span>
                <select
                  name="version"
                  onChange={e => select_version(e.target.value, e.target.selectedIndex)}
                  defaultValue={current_version_ls}
                >
                  {versionTemplate.map((item, idx) => (
                    <option key={idx} value={item._id} style={THEMES[theme].background}>{item.name}</option>
                  ))}
                </select>
              </label>
              <button className="dpu-btn dpu-btn-ghost dpu-btn-sm" onClick={delete_history_template}>
                <FontAwesomeIcon icon={faTrash} />{isTH ? "ลบเวอร์ชัน" : "Delete version"}
              </button>
            </div>

            <form className="dpu-adm-form" onSubmit={handleUpdateTemplate} key={current_version_ls}>
              <label className="dpu-field dpu-field-grow">
                <span className="dpu-field-label">Prompt</span>
                <textarea name="template" defaultValue={currentHisTem} onChange={handleChangeTemplate}></textarea>
              </label>
              <div className="dpu-adm-form-foot">
                <button type="submit" className="dpu-btn dpu-btn-primary">{T.save}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )

  const ChatPanel = (
    <div className="dpu-adm-panel dpu-adm-chat">
      <header className="dpu-adm-panel-head">
        <div className="dpu-adm-panel-title">
          <h3>{isTH ? "ทดสอบแชท" : "Test chat"}</h3>
          <p className="dpu-adm-muted">{isTH ? "ทดสอบ prompt ที่ใช้งานอยู่จริง" : "Runs against the live prompt."}</p>
        </div>
        <div className="dpu-adm-panel-actions">
          <div className="dpu-segmented dpu-adm-modes">
            <button className={stateMode == "advice" ? "is-on" : ""} onClick={() => selectMode("advice")}>🌱 {T.advice}</button>
            <button className={stateMode == "just_venting" ? "is-on" : ""} onClick={() => selectMode("just_venting")}>🤍 {T.justventing}</button>
          </div>
          <button className="dpu-btn dpu-btn-ghost dpu-btn-sm" onClick={delete_section}>
            <FontAwesomeIcon icon={faTrash} />{isTH ? "ล้าง" : "Clear"}
          </button>
        </div>
      </header>

      <div className="dpu-scroll" ref={scrollRef}>
        <div className="dpu-thread">
          {stateMode == "advice" ? (
            <>
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
                    <div className="dpu-msg dpu-msg-me"><div className="dpu-bubble">{item.question}</div></div>
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
            </>
          ) : (
            messageMode.map((item, idx) => (
              <div key={idx} className="dpu-turn">
                {item.question == "" ? null : (
                  <div className="dpu-msg dpu-msg-me"><div className="dpu-bubble">{item.question}</div></div>
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
            ))
          )}
          <div ref={messageEndRef} />
        </div>
      </div>

      <div className="dpu-composer">
        <form onSubmit={handleChatbot} className={isActive ? "is-busy" : ""}>
          <input
            type="text"
            name="question"
            id={stateMode == "advice" ? "question" : "questionv2"}
            placeholder={stateMode == "advice" ? T.maininput : T.secondinput}
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
    </div>
  )

  /* ---------------------------------- view ---------------------------------- */

  return (
    <div className="dpu-adm" style={THEMES[theme].background}>
      <div className="dpu-veil"></div>

      <div className="dpu-adm-shell" style={FONT}>
        {isMobile ? null : Sidebar}

        <main className="dpu-adm-main">
          <header className="dpu-adm-top">
            {isMobile ? (
              <button className="dpu-iconbtn" onClick={() => setDrawerOpen(true)} aria-label={T.setting}>
                <FontAwesomeIcon icon={faBars} />
              </button>
            ) : null}
            <h1>{NAV.find(n => n.id == page)?.label}</h1>
          </header>

          <div className="dpu-adm-body">
            {page == "overview" ? (
              <>
                {StatCards}
                <div className="dpu-adm-grid">
                  {ReportTable}
                  <div className="dpu-adm-panel">
                    <header className="dpu-adm-panel-head">
                      <h3>Prompt {isTH ? "ที่ใช้งานอยู่" : "in use"}</h3>
                      <button className="dpu-btn dpu-btn-ghost dpu-btn-sm" onClick={() => go("template")}>
                        <FontAwesomeIcon icon={faPenToSquare} />{isTH ? "แก้ไข" : "Edit"}
                      </button>
                    </header>
                    <div className="dpu-adm-kv">
                      <div><span>Session</span><strong>{current_sec_tem_name_ls || "—"}</strong></div>
                      <div><span>{isTH ? "เวอร์ชัน" : "Version"}</span><strong>{current_name_tem_ls || "—"}</strong></div>
                    </div>
                    <pre className="dpu-adm-code">{currentHisTem || (isTH ? "ยังไม่มี template" : "No template yet")}</pre>
                  </div>
                </div>
              </>
            ) : null}

            {page == "reports" ? ReportTable : null}
            {page == "template" ? TemplatePanel : null}
            {page == "chat" ? ChatPanel : null}
          </div>
        </main>
      </div>

      {/* drawer */}
      {isMobile ? (
        <div className={`dpu-drawer${drawerOpen ? " is-open" : ""}`}>
          <div className="dpu-drawer-scrim" onClick={() => setDrawerOpen(false)}></div>
          <div className="dpu-drawer-panel">{Sidebar}</div>
        </div>
      ) : null}

      {/* report detail */}
      <div className={`dpu-modal${viewOneReport ? " is-open" : ""}`}>
        <div className="dpu-modal-scrim" onClick={() => setViewOneReport(null)}></div>
        <div className="dpu-modal-panel dpu-modal-sm" style={FONT}>
          <header className="dpu-modal-head">
            <div className="dpu-adm-panel-title">
              <button className="dpu-iconbtn" onClick={() => setViewOneReport(null)} aria-label={T.cancel}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h3>{T.report} #{viewOneReport?.index}</h3>
            </div>
            <button className="dpu-btn dpu-btn-primary dpu-btn-sm" onClick={() => delete_report(viewOneReport?._id)}>
              <FontAwesomeIcon icon={faCheck} />{isTH ? "แก้ไขแล้ว" : "Mark fixed"}
            </button>
          </header>
          <div className="dpu-modal-scroll">
            <div className="dpu-adm-kv dpu-adm-kv-col">
              <div><span>{T.title}</span><strong>{viewOneReport?.title}</strong></div>
              <div><span>{T.status}</span><strong>{viewOneReport?.status}</strong></div>
              <div><span>User ID</span><strong>{viewOneReport?.user_id}</strong></div>
              <div><span>Timestamp</span><strong>{viewOneReport?.timestamp}</strong></div>
            </div>
            <pre className="dpu-adm-code">{viewOneReport?.description}</pre>
          </div>
        </div>
      </div>

      {/* new session */}
      <div className={`dpu-modal${stateNewSec ? " is-open" : ""}`}>
        <div className="dpu-modal-scrim" onClick={() => setStateNewSec(false)}></div>
        <form className="dpu-modal-panel dpu-modal-xs" style={FONT} onSubmit={create_section_template}>
          <header className="dpu-modal-head"><h3>{isTH ? "สร้าง session ใหม่" : "New session"}</h3></header>
          <div className="dpu-modal-scroll">
            <label className="dpu-field">
              <span className="dpu-field-label">{isTH ? "ชื่อ session" : "Session name"}</span>
              <span className="dpu-field-box">
                <input type="text" name="name" placeholder="advisor-core" required onChange={e => setNameSec(e.target.value)} />
              </span>
            </label>
          </div>
          <footer className="dpu-modal-foot">
            <button type="reset" className="dpu-btn dpu-btn-ghost" onClick={() => setStateNewSec(false)}>{T.cancel}</button>
            <button type="submit" className="dpu-btn dpu-btn-primary">{isTH ? "สร้าง" : "Create"}</button>
          </footer>
        </form>
      </div>

      {/* new version */}
      <div className={`dpu-modal${newVersion ? " is-open" : ""}`}>
        <div className="dpu-modal-scrim" onClick={() => setNewVersion(false)}></div>
        <form className="dpu-modal-panel dpu-modal-sm" style={FONT} onSubmit={create_history_template}>
          <header className="dpu-modal-head"><h3>{isTH ? "เวอร์ชันใหม่" : "New version"}</h3></header>
          <div className="dpu-modal-scroll dpu-modal-scroll-flex">
            <label className="dpu-field">
              <span className="dpu-field-label">{isTH ? "ชื่อเวอร์ชัน" : "Version name"}</span>
              <span className="dpu-field-box">
                <input type="text" name="name" placeholder="v2" required onChange={handleChangeTemplate} />
              </span>
            </label>
            <label className="dpu-field dpu-field-grow">
              <span className="dpu-field-label">Prompt</span>
              <textarea name="template" placeholder="Empty" required onChange={handleChangeTemplate}></textarea>
            </label>
          </div>
          <footer className="dpu-modal-foot">
            <button type="button" className="dpu-btn dpu-btn-ghost" onClick={() => setNewVersion(false)}>{T.cancel}</button>
            <button type="submit" className="dpu-btn dpu-btn-primary">{T.confirm}</button>
          </footer>
        </form>
      </div>

      {/* apply template to a mode */}
      <div className={`dpu-modal${stateSelc ? " is-open" : ""}`}>
        <div className="dpu-modal-scrim" onClick={() => setStateSelc(false)}></div>
        <div className="dpu-modal-panel dpu-modal-xs" style={FONT}>
          <header className="dpu-modal-head">
            <div className="dpu-adm-panel-title">
              <h3>{isTH ? "ใช้ template นี้กับโหมดไหน" : "Apply this template to"}</h3>
              <p className="dpu-adm-muted">{current_sec_tem_name_ls} · {current_name_tem_ls}</p>
            </div>
          </header>
          <div className="dpu-modal-scroll">
            <div className="dpu-option-list">
              <button className="dpu-option" onClick={() => handleUpdateSelect("Intelligent_Advisor")}>
                <span>🌱 {T.advice}</span>
                {chatbotConfig.select_main == current_version_ls ? <FontAwesomeIcon icon={faCheck} /> : null}
              </button>
              <button className="dpu-option" onClick={() => handleUpdateSelect("Just_Venting")}>
                <span>🤍 {T.justventing}</span>
                {chatbotConfig.select_secondery == current_version_ls ? <FontAwesomeIcon icon={faCheck} /> : null}
              </button>
            </div>
          </div>
          <footer className="dpu-modal-foot">
            <button className="dpu-btn dpu-btn-ghost" onClick={() => setStateSelc(false)}>{T.cancel}</button>
          </footer>
        </div>
      </div>

      {/* settings */}
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
                    <button key={idx} className={`dpu-theme-card${theme == item.name ? " is-on" : ""}`} onClick={() => applyTheme(item.name)}>
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
                      <FontAwesomeIcon icon={statePlay ? faPause : faPlay} />{statePlay ? "Pause" : "Play"}
                    </button>
                    <button className="dpu-btn dpu-btn-ghost" onClick={changeMusic}>
                      <FontAwesomeIcon icon={faForwardStep} />{currentSongIndex + 1}/{songs.length}
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

export default Admin
