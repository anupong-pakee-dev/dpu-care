import React, { useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRepeat, faFlag, faGhost } from "@fortawesome/free-solid-svg-icons"
import { motion } from "framer-motion"

import { createRport } from "../api/api"

import LANGUAGES from "../Languages.json"

const Toast = (props) => {
    const [progress, setProgress] = useState(0)
    const [changeMessage, setChangeMessage] = useState(false)
    const [hidden, setHidden] = useState(false)

    const animationRef = useRef(null)

    const language_ls = localStorage.getItem("language")

    const [language, setLanguage] = useState(language_ls ? language_ls : "th")

    const { show, text, duration, status, showIcon, icon, flag, report } = props.data;

    const styleColor = {
        success: { backgroundColor: "#33ff00" },
        warn: { backgroundColor: "#ffd900" },
        error: { backgroundColor: "#ff0000" }
    }

    useEffect(() => {
        if (!show) return;

        setProgress(0);
        let start = null;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (newProgress < 100) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [duration, show]);

    const handleCheck = check => {
        if (check) {
            createRport(report)
            .then(res => {
                    setChangeMessage(true)
                    setHidden(true)
                    console.log(res)
                    return;
                })
                .catch(err => console.log(err))
        } else {
            window.location.reload()
        }
    }

    return (
        <div className='toast' style={show ? { display: "block" } : { display: "none" }}>
            <div className="header" style={LANGUAGES.fontFamily[language]}>
                <div className="text-status">
                    <div className="status" style={changeMessage ? styleColor["success"] : styleColor[status]}>
                        <FontAwesomeIcon icon={icon ? icon : faGhost} />
                    </div>
                    <h1>{changeMessage ? LANGUAGES.messages[language].warntoast : text}</h1>
                </div>
                {
                    hidden ? null : <FontAwesomeIcon style={showIcon ? { display: "block" } : { display: "none" }} icon={flag ? faFlag : faRepeat} className='fa-toast' onClick={() => handleCheck(flag)} />
                }
            </div>
            <motion.div className="loader" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }}></motion.div>
        </div>
    )
}

export default Toast