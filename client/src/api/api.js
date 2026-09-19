import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true
})

export const testConnect = async () => {
    return await apiClient.get("/test-connect", { withCredentials: false })
}

export const protected_ = async () => {
    return await apiClient.get("/protected")
}

export const googleAuth = async token => {
    return await apiClient.post("/auth-google", { token })
}

export const sendEmail = async email => {
    return await apiClient.get("/send-email/" + email)
}

export const register = async (vt, vc, data) => {
    await apiClient.post("/register/" + vt + "/" + vc, data)
}

export const login = async data => {
    await apiClient.post("/login", data)
}

export const logout = async () => {
    return await apiClient.get("/logout")
}

export const getUser = async () => {
    return await apiClient.get("/get-user")
}

export const forgotPass = async (vt, vc, data) => {
    await apiClient.put("/forgot-password/" + vt + "/" + vc, data)
}

export const createSection = async id => {
    await apiClient.post("/section/" + id, {})
}

export const getSection = async id => {
    return await apiClient.get("/section/" + id)
}

export const deleteSection = async id => {
    await apiClient.delete("/section/" + id)
}

export const deleteSectionNonUser = async id => {
    await apiClient.delete("/section-non-user/" + id, { withCredentials: false })
}

export const chatbot = async (id, data) => {
    return await apiClient.post("/main-chatbot/" + id, data)
}

export const chatbotV2 = async (id, data) => {
    return await apiClient.post("/just-venting-chatbot/" + id, data)
}

export const getHistory = async id => {
    return await apiClient.get("/history/" + id)
}

export const chatbotNonUser = async (id, data) => {
    return await apiClient.post("/test-chatbot/" + id, data, { withCredentials: false })
}

export const getChatbotConfig = async id => {
    return await apiClient.get("/chatbot-config/" + id)
}

export const getCountAllUser = async id => {
    return await apiClient.get("/get-count-all-user/" + id)
}

export const createRport = async data => {
    return await apiClient.post("/report", data, { withCredentials: false })
}

export const getReport = async id => {
    return await apiClient.get("/report/" + id)
}

export const deleteReport = async (id, report_id) => {
    await apiClient.delete("/report/" + id + "/" + report_id)
}

export const testChatbot = async (id, section_id, data) => {
    return await apiClient.post("/test-main-chatbot/" + id + "/" + section_id, data)
}

export const getSectionTemplate = async () => {
    return await apiClient.get("/section-template")
}

export const getVersion = async id => {
    return await apiClient.get("/history-template/" + id)
}

export const updateTemplate = async (id, data) => {
    await apiClient.put("/history-template/" + id, data)
}

export const createHistoryTemplate = async (id, data) => {
    await apiClient.post("/history-template/" + id, data)
}

export const createSectionTemplate = async data => {
    await apiClient.post("/section-template", data)
}

export const updateSelectMain = async (id, data) => {
    await apiClient.put("/select-main-template/" + id, data)
}

export const updateSelectSecondery = async (id, data) => {
    await apiClient.put("/select-secondry-template/" + id, data)
}

export const deleteHistoryTemplate = async id => {
    await apiClient.delete("/history-template/" + id)
}

export const deleteSectionTemplate = async id => {
    await apiClient.delete("/section-template/" + id)
}
