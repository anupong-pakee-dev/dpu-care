import React, { useEffect, useState } from 'react'
import { useGoogleLogin } from "@react-oauth/google"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUser, faEye, faEyeSlash, faLock, faEnvelope,
  faShieldHalved, faPaperPlane, faExclamation, faPlug,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons"
import { faGoogle } from "@fortawesome/free-brands-svg-icons"
import { useNavigate } from "react-router-dom"

import { sendEmail, register, login, getUser, forgotPass, testConnect, googleAuth } from "../../api/api"

import THEMES from "../../Themes.json"
import LANGUAGES from "../../Languages.json"
import Toast from '../Toast'
import { useErrorToast } from "../../hooks/useErrorToast"

import "./AuthNew.css"

import IMAGE from "/images/ai_gen_metaAI.jfif"

const Field = ({ icon, children, label, hint }) => (
  <label className="dpu-field">
    <span className="dpu-field-label">{label}</span>
    <span className="dpu-field-box">
      <FontAwesomeIcon icon={icon} className="dpu-field-ico" />
      {children}
    </span>
    {hint ? <small className="dpu-field-hint">{hint}</small> : null}
  </label>
)

function Authentication() {
  const [data, setData] = useState({})
  const [verify, setVerify] = useState({
    verify_tk: "",
    verification_code: ""
  })
  const [stateSwitchForm, setStateSwitchForm] = useState(0) // 0 = login, 1 = register
  const [stateForgotPass, setStateForgotPass] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
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

  const navigate = useNavigate()

  const theme_ls = localStorage.getItem("theme")
  const language_ls = localStorage.getItem("language")

  const [theme] = useState(theme_ls ? theme_ls : "default")
  const [language, setLanguage] = useState(language_ls ? language_ls : "th")
  const reportError = useErrorToast(setToast, language)

  const T = LANGUAGES.messages[language]
  const FONT = LANGUAGES.fontFamily[language]
  const isRegister = stateSwitchForm === 1

  useEffect(() => {
    const formStyle = localStorage.getItem("form")
    if (formStyle == "login") { setStateSwitchForm(0); return; }
    if (formStyle == "register") { setStateSwitchForm(1); return; }

    testConnect()
      .catch(err => {
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

  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    if (timeLeft === 0) setIsActive(false);
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const handleChange = e => setData({ ...data, [e.target.name]: e.target.value })

  const startCountdown = () => { setTimeLeft(30); setIsActive(true); }

  const handleTime = second => setTimeout(() => setToast({ show: false }), second)

  const togglePassword = () => setShowPass(prev => !prev)

  const switchForm = idx => {
    setStateSwitchForm(idx)
    localStorage.setItem("form", idx === 0 ? "login" : "register")
  }

  const toggleLanguage = () => {
    const next = language == "th" ? "en" : "th"
    setLanguage(next)
    localStorage.setItem("language", next)
  }

  const handleGoogleAuth = async res => {
    startCountdown()
    await googleAuth(res.access_token)
      .then(_ => { localStorage.setItem("status", "login"); navigate("/"); return; })
      .catch(err => { setIsActive(false); setTimeLeft(0); reportError(err, "view"); return; })
  }

  const googleLogin = useGoogleLogin({ onSuccess: res => handleGoogleAuth(res) });

  const handleSendEmail = e => {
    e.preventDefault()
    if (!data.email || !data.email.includes("@")) {
      setToast({
        show: true,
        text: T.error.emailformat,
        duration: 5000,
        status: "warn",
        icon: faEnvelope
      })
      handleTime(5500)
      return;
    }
    startCountdown()
    sendEmail(data.email)
      .then(res => {
        setVerify({
          verify_tk: res.data.verify_tk,
          verification_code: res.data.verification_code
        })
        setIsActive(false)
        setTimeLeft(0)
        return;
      })
      .catch(err => {
        console.log(err)
        setIsActive(false); setTimeLeft(0)
        reportError(err, "view")
        return
      })
  }

  const handleRegister = e => {
    e.preventDefault()
    startCountdown()
    register(verify.verify_tk, verify.verification_code, data)
      .then(_ => { localStorage.setItem("status", "login"); navigate("/"); return; })
      .catch(err => {
        console.log(err)
        setIsActive(false); setTimeLeft(0)
        if (err.response?.data?.detail == "user already exists") {
          setToast({ show: true, text: T.error.useralready, duration: 5000, status: "warn", icon: faExclamation })
          handleTime(5500); return
        }
        if (err.response?.data?.detail == "email already exists") {
          setToast({ show: true, text: T.error.emailalready, duration: 5000, status: "warn", icon: faEnvelope })
          handleTime(5500); return;
        }
        reportError(err, "view")
        return
      })
  }

  const handleLogin = e => {
    e.preventDefault()
    startCountdown()
    login(data)
      .then(_ => {
        localStorage.setItem("status", "login")
        getUser()
          .then(res => {
            if (res.data.role === "user") { navigate("/"); return; }
            if (res.data.role === "admin") { navigate("/admin"); return; }
          })
          .catch(err => { reportError(err, "view"); return })
      })
      .catch(err => {
        setIsActive(false); setTimeLeft(0)
        console.log(err)
        if (err.response?.data?.detail == "user or email not found") {
          setToast({ show: true, text: T.error.useroremail, duration: 5000, status: "warn", icon: faExclamation })
          handleTime(5500); return;
        }
        if (err.response?.data?.detail == "password is incorrect") {
          setToast({ show: true, text: T.error.passwordfail, duration: 5000, status: "error", icon: faShieldHalved })
          handleTime(5500); return;
        }
        reportError(err, "view")
        return;
      })
  }

  const handleForgotPassword = e => {
    e.preventDefault()
    startCountdown()
    forgotPass(verify.verify_tk, verify.verification_code, data)
      .then(_ => {
        setIsActive(false); setTimeLeft(0)
        setStateForgotPass(false);
        return;
      })
      .catch(err => {
        console.log(err)
        setIsActive(false); setTimeLeft(0)
        if (err.response?.data?.detail == "password is incorrect") {
          setToast({ show: true, text: T.error.emailfound, duration: 5000, status: "warn", icon: faExclamation })
          handleTime(5500)
        } else {
          reportError(err, "view")
          return;
        }
      })
  }

  /* -------------------------------- fragments ------------------------------- */

  const EmailSend = (
    <button
      type="button"
      className="dpu-inline-btn"
      onClick={handleSendEmail}
      disabled={isActive}
      title={T.verify}
    >
      {timeLeft > 0 ? <span className="dpu-count">{timeLeft}</span> : <FontAwesomeIcon icon={faPaperPlane} />}
      <span>{T.sendcode}</span>
    </button>
  )

  /* ---------------------------------- view ---------------------------------- */

  return (
    <div className="dpu-auth" style={THEMES[theme].background}>
      <img src={IMAGE} alt="" className="dpu-auth-photo" />
      <div className="dpu-auth-veil"></div>

      <button className="dpu-auth-lang" onClick={toggleLanguage} style={FONT} title={T.language}>
        {language == "th" ? "EN" : "TH"}
      </button>

      <div className="dpu-auth-stage" style={FONT}>
        <div className="dpu-auth-card">

          {stateForgotPass ? (
            <>
              <div className="dpu-auth-head">
                <button className="dpu-iconbtn" onClick={() => setStateForgotPass(false)} aria-label={T.cancel}>
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <h1>{T.forgotpass}</h1>
              </div>
              <p className="dpu-auth-sub">{T.forgotpasssub}</p>

              <form onSubmit={handleForgotPassword} className="dpu-auth-form">
                <Field icon={faEnvelope} label={T.email}>
                  <input type="email" name="email" placeholder="you@example.com" disabled={isActive} onChange={handleChange} required />
                  {EmailSend}
                </Field>

                <Field icon={faLock} label={T.newpass}>
                  <input type={showPass ? "text" : "password"} name="password" placeholder="••••••••" onChange={handleChange} required />
                  <button type="button" className="dpu-eye" onClick={togglePassword} aria-label={T.password}>
                    <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                  </button>
                </Field>

                <Field icon={faShieldHalved} label={T.verify} hint={T.warnsendmail}>
                  <input type="text" name="verify_code" inputMode="numeric" placeholder="000000" onChange={handleChange} required />
                </Field>

                <button type="submit" className="dpu-btn dpu-btn-primary dpu-auth-submit" disabled={isActive}>
                  {T.confirm}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="dpu-auth-brand">
                <span className="dpu-logo"><img src="/logo-icon/dpucare.ico" alt="" /></span>
                <strong>DPUCARE</strong>
              </div>

              <div className="dpu-segmented dpu-auth-tabs">
                <button type="button" className={!isRegister ? "is-on" : ""} onClick={() => switchForm(0)}>{T.signin}</button>
                <button type="button" className={isRegister ? "is-on" : ""} onClick={() => switchForm(1)}>{T.signup}</button>
              </div>

              {isRegister ? (
                <form onSubmit={handleRegister} className="dpu-auth-form" key="register">
                  <Field icon={faUser} label={T.username}>
                    <input type="text" name="username" placeholder={T.username} onChange={handleChange} required />
                  </Field>

                  <Field icon={faLock} label={T.password}>
                    <input type={showPass ? "text" : "password"} name="password" placeholder="••••••••" onChange={handleChange} required />
                    <button type="button" className="dpu-eye" onClick={togglePassword} aria-label={T.password}>
                      <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                    </button>
                  </Field>

                  <Field icon={faEnvelope} label={T.email}>
                    <input type="email" name="email" placeholder="you@example.com" disabled={isActive} onChange={handleChange} required />
                    {EmailSend}
                  </Field>

                  <Field icon={faShieldHalved} label={T.verify} hint={T.warnsendmail}>
                    <input type="text" name="verify_code" inputMode="numeric" placeholder="000000" onChange={handleChange} required />
                  </Field>

                  <button type="submit" className="dpu-btn dpu-btn-primary dpu-auth-submit" disabled={isActive}>
                    {T.createaccount}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="dpu-auth-form" key="login">
                  <Field icon={faUser} label={T.username}>
                    <input type="text" name="username" placeholder={T.username} onChange={handleChange} required />
                  </Field>

                  <Field icon={faLock} label={T.password}>
                    <input type={showPass ? "text" : "password"} name="password" placeholder="••••••••" onChange={handleChange} required />
                    <button type="button" className="dpu-eye" onClick={togglePassword} aria-label={T.password}>
                      <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                    </button>
                  </Field>

                  <div className="dpu-auth-row">
                    <button type="button" className="dpu-link" onClick={() => setStateForgotPass(true)}>{T.forgotpass}</button>
                  </div>

                  <button type="submit" className="dpu-btn dpu-btn-primary dpu-auth-submit" disabled={isActive}>
                    {T.signin}
                  </button>
                </form>
              )}

              <div className="dpu-auth-or"><span>{T.or}</span></div>

              <button
                type="button"
                className="dpu-btn dpu-btn-ghost dpu-auth-google"
                onClick={googleLogin}
                disabled={isActive}
              >
                <FontAwesomeIcon icon={faGoogle} />
                {isRegister ? T.signupwithgoogle : T.signinwithgoogle}
              </button>

              <p className="dpu-auth-foot">
                <button type="button" className="dpu-link" onClick={() => navigate("/")}>{T.trylimited}</button>
              </p>
            </>
          )}
        </div>
      </div>

      <Toast data={toast} />
    </div>
  )
}

export default Authentication
